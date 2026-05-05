import { NextRequest } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";
import type { Plan } from "@/lib/generated/prisma/enums";

const SPRINT_DURATION_DAYS = 30;

/**
 * Maps a Stripe price ID to its corresponding Plan enum value (or
 * `"SPRINT"` as a marker for the one-time pass).
 */
function planFromPriceId(priceId: string | null | undefined): Plan | "SPRINT" | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_BOOST_PRICE_ID) return "BOOST";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PREMIUM";
  if (priceId === process.env.STRIPE_FOUNDING_PRICE_ID) return "FOUNDING";
  if (priceId === process.env.STRIPE_SPRINT_PRICE_ID) return "SPRINT";
  return null;
}

async function activateSprint(userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SPRINT_DURATION_DAYS);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { sprintExpiresAt: expiresAt },
    select: { email: true, firstName: true },
  });

  await prisma.activity.create({
    data: {
      userId,
      type: "MILESTONE",
      title: "Sprint 30 jours activé",
      description: `Accès Pro illimité pendant 30 jours, jusqu'au ${expiresAt.toLocaleDateString("fr-FR")}.`,
      icon: "Zap",
    },
  });

  return user;
}

async function activatePlan(userId: string, plan: Plan) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan },
    select: { email: true, firstName: true },
  });

  const labels: Record<Plan, string> = {
    FREE: "Free",
    BOOST: "Boost",
    PREMIUM: "Pro",
    FOUNDING: "Founding Member",
    ENTERPRISE: "Enterprise",
  };

  await prisma.activity.create({
    data: {
      userId,
      type: "MILESTONE",
      title: `Passage au plan ${labels[plan]}`,
      description: `Abonnement ${labels[plan]} activé.`,
      icon: "Crown",
    },
  });

  return user;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Configuration manquante", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Signature invalide", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        // Determine which plan was purchased by inspecting the line item.
        const lineItems = await getStripe().checkout.sessions.listLineItems(
          session.id,
          { limit: 1 }
        );
        const priceId = lineItems.data[0]?.price?.id;
        const target = planFromPriceId(priceId);

        if (!target) {
          console.warn("[webhook] checkout.session.completed with unknown priceId", priceId);
          break;
        }

        if (target === "SPRINT") {
          const user = await activateSprint(userId);
          import("@/lib/email/send").then(({ sendEmail }) =>
            import("@/lib/email/templates").then(({ upgradeEmail }) =>
              sendEmail(
                user.email,
                "Sprint NextMove activé — 30 jours d'accès Pro ⚡",
                upgradeEmail(user.firstName)
              )
            )
          ).catch(console.error);
        } else {
          const user = await activatePlan(userId, target);

          // If this is a Founding activation, consume the token so the
          // link can't be reused by anyone else.
          const foundingToken = session.metadata?.foundingToken;
          if (target === "FOUNDING" && foundingToken) {
            await prisma.foundingMemberApplication.updateMany({
              where: { activationToken: foundingToken },
              data: { activatedAt: new Date() },
            });
          }

          import("@/lib/email/send").then(({ sendEmail }) =>
            import("@/lib/email/templates").then(({ upgradeEmail }) =>
              sendEmail(
                user.email,
                "Bienvenue sur NextMove ✨",
                upgradeEmail(user.firstName)
              )
            )
          ).catch(console.error);
        }
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerEmail =
          typeof subscription.customer === "string"
            ? (await getStripe().customers.retrieve(subscription.customer) as Stripe.Customer).email
            : null;
        if (!customerEmail) break;

        const isActive =
          subscription.status === "active" || subscription.status === "trialing";

        // Identify the plan from the subscription's price ID so we don't
        // wrongly downgrade Founding to PREMIUM or vice versa on update.
        const priceId = subscription.items.data[0]?.price?.id;
        const target = planFromPriceId(priceId);

        if (isActive && target && target !== "SPRINT") {
          await prisma.user.updateMany({
            where: { email: customerEmail },
            data: { plan: target },
          });
        } else if (!isActive) {
          await prisma.user.updateMany({
            where: { email: customerEmail },
            data: { plan: "FREE" },
          });
        }
        break;
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Erreur interne", { status: 500 });
  }
}
