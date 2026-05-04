"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/send";
import {
  foundingMemberConfirmation,
  foundingMemberAdminNotification,
} from "@/lib/email/templates";

const ADMIN_EMAIL = "contact@nextmove.sh";

// Total seats available in the Founding Members program.
// Update this value to change the cap; the counter on /founding-members
// computes "remaining" as TOTAL_SEATS - count(ACCEPTED).
export const TOTAL_SEATS = 30;

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

  // Best-effort notifications — never block the user response on email failures.
  void sendEmail(
    data.email,
    "Candidature Founding Member reçue ✨",
    foundingMemberConfirmation(firstName)
  );

  void sendEmail(
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
  );

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

export async function updateFoundingMemberStatus(
  applicationId: string,
  status: "PENDING" | "ACCEPTED" | "REJECTED",
  note?: string
): Promise<{ ok: boolean; error?: string }> {
  if (status === "ACCEPTED") {
    const accepted = await prisma.foundingMemberApplication.count({
      where: { status: "ACCEPTED" },
    });
    const target = await prisma.foundingMemberApplication.findUnique({
      where: { id: applicationId },
    });
    if (!target) return { ok: false, error: "Candidature introuvable" };
    if (target.status !== "ACCEPTED" && accepted >= TOTAL_SEATS) {
      return { ok: false, error: "Toutes les places sont attribuées" };
    }
  }

  await prisma.foundingMemberApplication.update({
    where: { id: applicationId },
    data: {
      status,
      reviewedAt: status === "PENDING" ? null : new Date(),
      reviewerNote: note ?? undefined,
    },
  });

  return { ok: true };
}
