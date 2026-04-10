import { NextRequest } from "next/server";
import { stripe } from "@/lib/billing/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Configuration manquante", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
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

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { plan: "PREMIUM" },
          });

          // Log activity
          await prisma.activity.create({
            data: {
              userId,
              type: "MILESTONE",
              title: "Passage au plan Premium",
              description: "Abonnement Premium activé — accès illimité débloqué !",
              icon: "Crown",
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerEmail =
          typeof subscription.customer === "string"
            ? (await stripe.customers.retrieve(subscription.customer) as Stripe.Customer).email
            : null;

        if (customerEmail) {
          const isActive =
            subscription.status === "active" ||
            subscription.status === "trialing";

          await prisma.user.updateMany({
            where: { email: customerEmail },
            data: { plan: isActive ? "PREMIUM" : "FREE" },
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
