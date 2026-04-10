"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getStripe } from "./stripe";

// ─── Helpers ────────────────────────────────────────────────────

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, email: true, firstName: true, plan: true },
  });
}

// ─── Daily Usage Counter ────────────────────────────────────────

export async function getDailyUsage(
  type: "copilot" | "session"
): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (type === "copilot") {
    return prisma.agentMessage.count({
      where: {
        conversation: { userId: user.id },
        role: "USER",
        createdAt: { gte: today },
      },
    });
  }

  if (type === "session") {
    return prisma.taskSession.count({
      where: {
        userId: user.id,
        createdAt: { gte: today },
      },
    });
  }

  return 0;
}

// ─── Create Checkout Session ────────────────────────────────────

export async function createCheckoutSession(): Promise<{
  url: string | null;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { url: null, error: "Non authentifié" };

  if (user.plan === "PREMIUM") {
    return { url: null, error: "Vous êtes déjà Premium" };
  }

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    return { url: null, error: "Configuration prix manquante" };
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: { userId: user.id },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade`,
      allow_promotion_codes: true,
    });

    return { url: session.url };
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return { url: null, error: "Erreur de paiement" };
  }
}

// ─── Manage Subscription (Customer Portal) ──────────────────────

export async function createPortalSession(): Promise<{
  url: string | null;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { url: null, error: "Non authentifié" };

  try {
    // Find Stripe customer by email
    const customers = await getStripe().customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return { url: null, error: "Aucun abonnement trouvé" };
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
    });

    return { url: session.url };
  } catch (e) {
    console.error("Stripe portal error:", e);
    return { url: null, error: "Erreur de gestion d'abonnement" };
  }
}
