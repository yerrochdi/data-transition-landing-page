"use server";

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/send";
import {
  foundingMemberConfirmation,
  foundingMemberAdminNotification,
  foundingMemberAcceptedEmail,
} from "@/lib/email/templates";
import { isAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/billing/stripe";
import { getCurrentEnvUrl } from "@/lib/utils/env-url";
import { TOTAL_SEATS } from "./constants";

const ADMIN_EMAIL = "contact@nextmove.sh";

const ApplicationSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(120),
  email: z.string().trim().email("Email invalide").max(180),
  linkedinUrl: z
    .string()
    .trim()
    .url("URL LinkedIn invalide")
    .max(300)
    .refine((u) => /linkedin\.com/i.test(u), "URL LinkedIn invalide"),
  currentRole: z.string().trim().min(2, "Poste requis").max(160),
  currentCompany: z.string().trim().min(1, "Entreprise requise").max(160),
  situation: z.string().trim().min(20, "Décris ta situation (min. 20 caractères)").max(2000),
  motivation: z.string().trim().min(20, "Décris ta motivation (min. 20 caractères)").max(2000),
});

export type FoundingMemberFormResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function submitFoundingMemberApplication(
  formData: FormData
): Promise<FoundingMemberFormResult> {
  const raw = {
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    linkedinUrl: formData.get("linkedinUrl")?.toString() ?? "",
    currentRole: formData.get("currentRole")?.toString() ?? "",
    currentCompany: formData.get("currentCompany")?.toString() ?? "",
    situation: formData.get("situation")?.toString() ?? "",
    motivation: formData.get("motivation")?.toString() ?? "",
  };

  const parsed = ApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Formulaire invalide", fieldErrors };
  }

  const data = parsed.data;

  const existing = await prisma.foundingMemberApplication.findFirst({
    where: { email: data.email.toLowerCase() },
  });
  if (existing) {
    return {
      ok: false,
      error: "Une candidature avec cet email a déjà été soumise.",
    };
  }

  const application = await prisma.foundingMemberApplication.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      linkedinUrl: data.linkedinUrl,
      currentRole: data.currentRole,
      currentCompany: data.currentCompany,
      situation: data.situation,
      motivation: data.motivation,
    },
  });

  const firstName = data.name.split(" ")[0] ?? data.name;

  // Await emails so the serverless function doesn't get killed mid-flight,
  // but never throw on failure — the application is already saved.
  await Promise.allSettled([
    sendEmail(
      data.email,
      "Candidature Founding Member reçue ✨",
      foundingMemberConfirmation(firstName)
    ),
    sendEmail(
      ADMIN_EMAIL,
      `Nouvelle candidature Founding Member — ${data.name}`,
      foundingMemberAdminNotification({
        name: application.name,
        email: application.email,
        linkedinUrl: application.linkedinUrl,
        currentRole: application.currentRole,
        currentCompany: application.currentCompany,
        situation: application.situation,
        motivation: application.motivation,
      })
    ),
  ]);

  return { ok: true };
}

export async function getFoundingMembersSeatStatus(): Promise<{
  total: number;
  accepted: number;
  remaining: number;
}> {
  const accepted = await prisma.foundingMemberApplication.count({
    where: { status: "ACCEPTED" },
  });
  return {
    total: TOTAL_SEATS,
    accepted,
    remaining: Math.max(0, TOTAL_SEATS - accepted),
  };
}

// Note: on utilise getCurrentEnvUrl() (résolu au runtime) au lieu d'une
// constante module — sinon les liens d'activation envoyés depuis un Preview
// Vercel pointent vers la prod (cf. lib/utils/env-url.ts).

export async function updateFoundingMemberStatus(
  applicationId: string,
  status: "PENDING" | "ACCEPTED" | "REJECTED",
  note?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Accès refusé" };
  }

  const target = await prisma.foundingMemberApplication.findUnique({
    where: { id: applicationId },
  });
  if (!target) return { ok: false, error: "Candidature introuvable" };

  if (status === "ACCEPTED") {
    const accepted = await prisma.foundingMemberApplication.count({
      where: { status: "ACCEPTED" },
    });
    if (target.status !== "ACCEPTED" && accepted >= TOTAL_SEATS) {
      return { ok: false, error: "Toutes les places sont attribuées" };
    }
  }

  // When transitioning to ACCEPTED for the first time, generate an
  // activation token (32 bytes, URL-safe) so the candidate can claim
  // their Founding seat at 9€/mo via /founding-activate?token=...
  const isNewlyAccepted = status === "ACCEPTED" && target.status !== "ACCEPTED";
  const activationToken = isNewlyAccepted
    ? randomBytes(32).toString("base64url")
    : undefined;

  const updated = await prisma.foundingMemberApplication.update({
    where: { id: applicationId },
    data: {
      status,
      reviewedAt: status === "PENDING" ? null : new Date(),
      reviewerNote: note ?? undefined,
      ...(activationToken ? { activationToken } : {}),
    },
  });

  if (isNewlyAccepted && updated.activationToken) {
    const firstName = updated.name.split(" ")[0] ?? updated.name;
    const activationUrl = `${getCurrentEnvUrl()}/founding-activate?token=${updated.activationToken}`;
    await sendEmail(
      updated.email,
      "🎉 Tu es accepté Founding Member NextMove",
      foundingMemberAcceptedEmail(firstName, activationUrl)
    );
  }

  return { ok: true };
}

// ─── Pending activation lookup (dashboard banner) ───────────────────

/**
 * Pour l'user courant : récupère sa candidature Founding ACCEPTED qui
 * n'a pas encore été activée (paiement non finalisé). Utilisé par la
 * bannière du dashboard pour rappeler à la candidate de finaliser son
 * paiement 9€/mois — sans ça elle reste en plan FREE et son siège peut
 * être réattribué.
 *
 * Retourne null si :
 *   - L'user n'est pas authentifié
 *   - L'user n'a pas de candidature Founding ACCEPTED non activée
 *   - L'user a déjà le plan FOUNDING (paiement passé)
 */
export async function getPendingFoundingActivation(): Promise<{
  activationToken: string;
  firstName: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  // Si l'user est déjà FOUNDING, pas besoin de bannière
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    select: { plan: true },
  });
  if (dbUser?.plan === "FOUNDING") return null;

  const application = await prisma.foundingMemberApplication.findFirst({
    where: {
      email: authUser.email.toLowerCase(),
      status: "ACCEPTED",
      activatedAt: null,
      activationToken: { not: null },
    },
    select: {
      activationToken: true,
      name: true,
    },
  });

  if (!application?.activationToken) return null;

  return {
    activationToken: application.activationToken,
    firstName: application.name.split(" ")[0] ?? application.name,
  };
}

// ─── Activation flow (candidate clicks email link) ──────────────────

type ActivationLookupResult =
  | { ok: true; application: { id: string; email: string; name: string }; alreadyActivated: boolean }
  | { ok: false; error: string };

export async function lookupFoundingActivation(
  token: string
): Promise<ActivationLookupResult> {
  if (!token) return { ok: false, error: "Lien invalide" };

  const application = await prisma.foundingMemberApplication.findUnique({
    where: { activationToken: token },
    select: { id: true, email: true, name: true, status: true, activatedAt: true },
  });

  if (!application) {
    return { ok: false, error: "Lien d'activation invalide ou expiré" };
  }
  if (application.status !== "ACCEPTED") {
    return { ok: false, error: "Cette candidature n'est plus active" };
  }

  return {
    ok: true,
    application: { id: application.id, email: application.email, name: application.name },
    alreadyActivated: application.activatedAt !== null,
  };
}

export async function markFoundingActivated(token: string): Promise<{ ok: boolean }> {
  await prisma.foundingMemberApplication.update({
    where: { activationToken: token },
    data: { activatedAt: new Date() },
  });
  return { ok: true };
}

/**
 * Creates a Stripe checkout session for the Founding tier (9€/mo) using
 * the activation token as authorization. The currently logged-in user
 * must match the application's email — otherwise the request is rejected.
 *
 * On `checkout.session.completed`, the standard webhook will set
 * `plan = FOUNDING` based on the priceId. We mark `activatedAt` here too
 * so the link can't be reused.
 */
export async function createFoundingCheckout(
  token: string
): Promise<{ url: string | null; error?: string }> {
  const lookup = await lookupFoundingActivation(token);
  if (!lookup.ok) return { url: null, error: lookup.error };

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return { url: null, error: "Connecte-toi avec l'email de ta candidature" };
  }
  if (authUser.email.toLowerCase() !== lookup.application.email.toLowerCase()) {
    return {
      url: null,
      error: "L'email connecté ne correspond pas à celui de ta candidature",
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    select: { id: true, email: true },
  });
  if (!dbUser) return { url: null, error: "Utilisateur introuvable" };

  const priceId = process.env.STRIPE_FOUNDING_PRICE_ID;
  if (!priceId) return { url: null, error: "Configuration prix manquante" };

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: dbUser.email,
      metadata: { userId: dbUser.id, plan: "founding", foundingToken: token },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${getCurrentEnvUrl()}/dashboard?upgraded=founding`,
      cancel_url: `${getCurrentEnvUrl()}/founding-activate?token=${token}`,
    });
    return { url: session.url };
  } catch (e) {
    console.error("Founding checkout error:", e);
    return { url: null, error: "Erreur de paiement" };
  }
}
