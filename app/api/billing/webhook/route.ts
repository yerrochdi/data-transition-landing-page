import { NextRequest } from "next/server";
import { getStripe } from "@/lib/billing/stripe";
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

        if (userId) {
          const user = await prisma.user.update({
            where: { id: userId },
            data: { plan: "PREMIUM" },
            select: { email: true, firstName: true },
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

          // Send upgrade confirmation email (non-blocking)
          import("@/lib/email/send").then(({ sendEmail }) =>
            import("@/lib/email/templates").then(({ upgradeEmail }) =>
              sendEmail(user.email, "Bienvenue dans le plan Pro NextMove ✨", upgradeEmail(user.firstName))
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
