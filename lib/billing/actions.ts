"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getStripe } from "./stripe";
import { isPaidPlan, hasActiveSprint } from "./plan";
import { getCurrentEnvUrl } from "@/lib/utils/env-url";

// ─── Helpers ────────────────────────────────────────────────────

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      plan: true,
      sprintExpiresAt: true,
    },
  });
}

// ─── Plan → Stripe price ID resolution ──────────────────────────

export type CheckoutPlan = "boost" | "pro" | "sprint" | "founding";

function getPriceIdForPlan(plan: CheckoutPlan): string | null {
  switch (plan) {
    case "boost":
      return process.env.STRIPE_BOOST_PRICE_ID ?? null;
    case "pro":
      return process.env.STRIPE_PRO_PRICE_ID ?? null;
    case "sprint":
      return process.env.STRIPE_SPRINT_PRICE_ID ?? null;
    case "founding":
      return process.env.STRIPE_FOUNDING_PRICE_ID ?? null;
  }
}

function isOneTimePlan(plan: CheckoutPlan): boolean {
  return plan === "sprint";
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
    // Source of truth = Activity AGENT_INTERACTION (created by trackCopilotUsage
    // in /api/chat after each successful response). agentMessage is not currently
    // persisted, so counting it would always return 0.
    return prisma.activity.count({
      where: {
        userId: user.id,
        type: "AGENT_INTERACTION",
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

export async function createCheckoutSession(
  plan: CheckoutPlan = "pro"
): Promise<{
  url: string | null;
  error?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { url: null, error: "Non authentifié" };

  // Block re-purchase for users who already have higher-tier access
  // (except Sprint, which is always allowed as a one-time top-up).
  if (plan !== "sprint" && isPaidPlan({ plan: user.plan, sprintExpiresAt: user.sprintExpiresAt })) {
    return { url: null, error: "Vous avez déjà un abonnement actif" };
  }

  // Founding Member is invite-only — only allow checkout if user already
  // has plan === FOUNDING (set by admin acceptance flow). Public access
  // to ?plan=founding is rejected.
  if (plan === "founding" && user.plan !== "FOUNDING") {
    return { url: null, error: "Programme Founding Member sur invitation uniquement" };
  }

  const priceId = getPriceIdForPlan(plan);
  if (!priceId) {
    return { url: null, error: "Configuration prix manquante" };
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: isOneTimePlan(plan) ? "payment" : "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: { userId: user.id, plan },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${getCurrentEnvUrl()}/dashboard?upgraded=${plan}`,
      cancel_url: `${getCurrentEnvUrl()}/upgrade`,
      allow_promotion_codes: true,
    });

    return { url: session.url };
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return { url: null, error: "Erreur de paiement" };
  }
}

// ─── Verify payment & activate Premium (called after Stripe redirect) ──

export async function verifyAndActivatePremium(): Promise<{
  activated: boolean;
  plan: string;
}> {
  const user = await getCurrentUser();
  if (!user) return { activated: false, plan: "FREE" };

  // Already premium
  if (user.plan === "PREMIUM") return { activated: false, plan: "PREMIUM" };

  try {
    // Check if user has an active subscription in Stripe
    const customers = await getStripe().customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      const subscriptions = await getStripe().subscriptions.list({
        customer: customers.data[0].id,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: "PREMIUM" },
        });

        // Log activity
        await prisma.activity.create({
          data: {
            userId: user.id,
            type: "MILESTONE",
            title: "Passage au plan Premium",
            description: "Abonnement Premium activé — accès illimité débloqué !",
            icon: "Crown",
          },
        });

        return { activated: true, plan: "PREMIUM" };
      }
    }

    return { activated: false, plan: "FREE" };
  } catch (e) {
    console.error("Verify premium error:", e);
    return { activated: false, plan: user.plan };
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
      return_url: `${getCurrentEnvUrl()}/settings`,
    });

    return { url: session.url };
  } catch (e) {
    console.error("Stripe portal error:", e);
    return { url: null, error: "Erreur de gestion d'abonnement" };
  }
}
