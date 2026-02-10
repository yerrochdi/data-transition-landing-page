import { NextResponse } from "next/server";
import { validateContactForm, isSpam } from "@/lib/contact-schema";

// Simple in-memory rate limiting (resets on server restart)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // Max 3 submissions per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "unknown";

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Trop de demandes. Veuillez réessayer dans une minute." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate with Zod schema
    const validation = validateContactForm(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, email, profile, goal, offer } = validation.data;

    // Check honeypot - silently ignore spam but return success
    if (isSpam(validation.data)) {
      // Log spam attempt but don't reveal honeypot
      console.log(`[SPAM] Honeypot triggered from ${ip}`);
      return NextResponse.json({
        success: true,
        message: "Votre demande a bien été envoyée.",
      });
    }

    // Send notification email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.NOTIFICATION_EMAIL || "yerrochdi.telecomparis@gmail.com";

    if (resendApiKey) {
      // Send notification to owner
      const notificationResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Data Transition <onboarding@resend.dev>",
          to: [notificationEmail],
          subject: `Nouvelle demande de ${name}${offer ? ` - ${offer}` : ""}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Nouvelle demande de contact</h2>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                <p><strong>Nom :</strong> ${name}</p>
                <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
                ${profile ? `<p><strong>Profil actuel :</strong> ${profile}</p>` : ""}
                ${goal ? `<p><strong>Objectif :</strong> ${goal}</p>` : ""}
                ${offer ? `<p><strong>Offre intéressée :</strong> ${offer}</p>` : ""}
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Envoyé depuis le formulaire de contact Data Transition
              </p>
            </div>
          `,
        }),
      });

      if (!notificationResponse.ok) {
        console.error("[EMAIL] Failed to send notification:", await notificationResponse.text());
      }

      // Send confirmation email to user
      const confirmationResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Data Transition <onboarding@resend.dev>",
          to: [email],
          subject: "Votre demande a bien été reçue - Data Transition",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a1a1a;">Merci ${name} !</h2>
              <p>Votre demande a bien été reçue. Nous revenons vers vous sous 48h pour planifier un échange de 15 minutes.</p>
              <p>En attendant, vous pouvez réserver directement un créneau :</p>
              <p style="margin: 24px 0;">
                <a href="https://calendly.com/yerrochdi/15min"
                   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 24px; display: inline-block;">
                  Réserver un créneau
                </a>
              </p>
              <p>À très vite,</p>
              <p><strong>Yassine</strong><br/>Data Transition</p>
            </div>
          `,
        }),
      });

      if (!confirmationResponse.ok) {
        console.error("[EMAIL] Failed to send confirmation:", await confirmationResponse.text());
      }
    } else {
      console.warn("[EMAIL] RESEND_API_KEY not configured - emails not sent");
    }

    return NextResponse.json({
      success: true,
      message: "Votre demande a bien été envoyée. Réponse sous 48h.",
    });
  } catch (error) {
    console.error("[CONTACT] Error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
