import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, profile, goal, offer } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nom et email sont requis." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide." },
        { status: 400 }
      );
    }

    // Send notification email via Resend if API key is available
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.NOTIFICATION_EMAIL || "contact@datatransition.fr";

    if (resendApiKey) {
      await fetch("https://api.resend.com/emails", {
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
            <h2>Nouvelle demande de contact</h2>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
            ${profile ? `<p><strong>Profil actuel :</strong> ${profile}</p>` : ""}
            ${goal ? `<p><strong>Objectif :</strong> ${goal}</p>` : ""}
            ${offer ? `<p><strong>Offre int&eacute;ress&eacute;e :</strong> ${offer}</p>` : ""}
          `,
        }),
      });
    }

    // Also send a confirmation email to the user
    if (resendApiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Data Transition <onboarding@resend.dev>",
          to: [email],
          subject: "Votre demande a bien \u00e9t\u00e9 re\u00e7ue - Data Transition",
          html: `
            <h2>Merci ${name} !</h2>
            <p>Votre demande a bien \u00e9t\u00e9 re\u00e7ue. Nous revenons vers vous sous 48h pour planifier un \u00e9change de 15 minutes.</p>
            <p>En attendant, n'h\u00e9sitez pas \u00e0 r\u00e9server directement un cr\u00e9neau via notre calendrier en ligne.</p>
            <br/>
            <p>\u00c0 tr\u00e8s vite,</p>
            <p><strong>L'\u00e9quipe Data Transition</strong></p>
          `,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Votre demande a bien \u00e9t\u00e9 envoy\u00e9e. R\u00e9ponse sous 48h.",
    });
  } catch {
    return NextResponse.json(
      { error: "Une erreur est survenue. Veuillez r\u00e9essayer." },
      { status: 500 }
    );
  }
}
