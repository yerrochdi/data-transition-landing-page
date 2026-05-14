const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nextmove.sh";

const layout = (content: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);width:40px;height:40px;border-radius:10px;line-height:40px;color:#fff;font-weight:bold;font-size:18px">N</div>
      <p style="margin:8px 0 0;color:#4be277;font-weight:800;font-size:20px;letter-spacing:-0.5px">NextMove AI</p>
    </div>
    <div style="background:#141414;border:1px solid #222;border-radius:16px;padding:32px;color:#e0e0e0;font-size:14px;line-height:1.7">
      ${content}
    </div>
    <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
      © ${new Date().getFullYear()} NextMove AI · <a href="${SITE_URL}" style="color:#4be277;text-decoration:none">nextmove.sh</a>
    </p>
  </div>
</body>
</html>`;

export function welcomeEmail(firstName: string, targetRole: string | null): string {
  return layout(`
    <h1 style="color:#fff;font-size:22px;margin:0 0 16px">Bienvenue ${firstName} 🎯</h1>
    <p>Votre diagnostic NextMove AI est terminé${targetRole ? ` et votre objectif <strong style="color:#4be277">${targetRole}</strong> est enregistré` : ""}.</p>
    <p>Voici ce qui vous attend :</p>
    <ul style="padding-left:20px;margin:16px 0">
      <li><strong>Parcours personnalisé</strong> — des micro-leçons IA adaptées à votre profil</li>
      <li><strong>Copilot IA</strong> — posez vos questions carrière à tout moment</li>
      <li><strong>Opportunités</strong> — suggestions ciblées basées sur vos compétences</li>
    </ul>
    <div style="text-align:center;margin:24px 0">
      <a href="${SITE_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);color:#000;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:12px;text-decoration:none">
        Accéder à mon dashboard
      </a>
    </div>
    <p style="color:#888;font-size:12px">À bientôt sur NextMove !</p>
  `);
}

export function foundingMemberConfirmation(firstName: string): string {
  return layout(`
    <h1 style="color:#fff;font-size:22px;margin:0 0 16px">Candidature reçue ${firstName} ✨</h1>
    <p>Merci pour ta candidature au programme <strong style="color:#4be277">Founding Members</strong> de NextMove.</p>
    <p>Voici la suite :</p>
    <ul style="padding-left:20px;margin:16px 0">
      <li><strong>Sélection sous 48h</strong> — je relis chaque candidature personnellement</li>
      <li><strong>Si retenu</strong> — tu reçois un email avec un lien d'activation au tarif Founding Member (9€/mois à vie)</li>
      <li><strong>Onboarding personnalisé</strong> — un call de 30 min en visio pour démarrer dans les meilleures conditions</li>
    </ul>
    <p>En attendant, n'hésite pas à me contacter directement : <a href="mailto:contact@nextmove.sh" style="color:#4be277">contact@nextmove.sh</a></p>
    <p style="color:#888;font-size:12px;margin-top:24px">À très vite,<br/>Yassine — Fondateur de NextMove</p>
  `);
}

export function foundingMemberAdminNotification(application: {
  name: string;
  email: string;
  linkedinUrl: string;
  currentRole: string;
  currentCompany: string;
  situation: string;
  motivation: string;
}): string {
  return layout(`
    <h1 style="color:#fff;font-size:22px;margin:0 0 16px">Nouvelle candidature Founding Member 🚀</h1>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:6px 0;color:#888;width:140px">Nom</td><td style="padding:6px 0;color:#fff"><strong>${application.name}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#888">Email</td><td style="padding:6px 0;color:#fff"><a href="mailto:${application.email}" style="color:#4be277">${application.email}</a></td></tr>
      <tr><td style="padding:6px 0;color:#888">LinkedIn</td><td style="padding:6px 0;color:#fff"><a href="${application.linkedinUrl}" style="color:#4be277" target="_blank">${application.linkedinUrl}</a></td></tr>
      <tr><td style="padding:6px 0;color:#888">Poste</td><td style="padding:6px 0;color:#fff">${application.currentRole}</td></tr>
      <tr><td style="padding:6px 0;color:#888">Entreprise</td><td style="padding:6px 0;color:#fff">${application.currentCompany}</td></tr>
    </table>
    <div style="margin-top:20px">
      <p style="color:#888;font-size:12px;margin:0 0 4px">Situation actuelle</p>
      <p style="color:#e0e0e0;background:#0a0a0a;border-radius:8px;padding:12px;margin:0;white-space:pre-wrap">${escapeHtml(application.situation)}</p>
    </div>
    <div style="margin-top:16px">
      <p style="color:#888;font-size:12px;margin:0 0 4px">Motivation</p>
      <p style="color:#e0e0e0;background:#0a0a0a;border-radius:8px;padding:12px;margin:0;white-space:pre-wrap">${escapeHtml(application.motivation)}</p>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="${SITE_URL}/admin/founding-members" style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);color:#000;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:12px;text-decoration:none">
        Gérer les candidatures
      </a>
    </div>
  `);
}

export function foundingMemberAcceptedEmail(
  firstName: string,
  activationUrl: string
): string {
  return layout(`
    <h1 style="color:#fff;font-size:22px;margin:0 0 16px">🎉 Bienvenue ${firstName}, tu es accepté</h1>
    <p>Félicitations, tu fais partie des <strong style="color:#4be277">Founding Members</strong> de NextMove. Sur les centaines de candidatures, j'ai retenu la tienne — merci pour la qualité de ton dossier.</p>

    <p style="margin-top:20px"><strong>Ton tarif Founding Member : 9€/mois à vie.</strong></p>
    <p>Soit -53% par rapport au plan Boost et -82% par rapport au plan Pro. Ce tarif te reste acquis tant que tu restes actif sur NextMove.</p>

    <div style="text-align:center;margin:28px 0">
      <a href="${activationUrl}" style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);color:#000;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none">
        Activer mon accès Founding Member →
      </a>
    </div>

    <p style="color:#888;font-size:12px;margin-top:24px"><strong style="color:#e0e0e0">Important</strong> : ce lien est unique et personnel. Tu seras invité à payer 9€ pour activer ton accès, puis tu accèderas au parcours complet immédiatement.</p>

    <p style="margin-top:24px">En contrepartie de ce tarif privilégié, je te demande :</p>
    <ul style="padding-left:20px;margin:8px 0 16px">
      <li>1 retour structuré par semaine pendant 3 mois</li>
      <li>1 call de 30 min/mois avec moi</li>
      <li>Honnêteté brute sur ce qui marche et ce qui cloche</li>
    </ul>

    <p>Une fois activé, je te recontacte pour caler notre call d'onboarding.</p>

    <p style="color:#888;font-size:12px;margin-top:24px">À très vite,<br/>Yassine — Fondateur de NextMove</p>
  `);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Plan-specific upgrade confirmation email. Each plan gets its own
 * title, feature list and CTA so a Boost user isn't told "Bienvenue
 * dans le plan Pro". `plan` accepts the 4 purchasable tiers.
 */
type UpgradeEmailPlan = "BOOST" | "PREMIUM" | "FOUNDING" | "SPRINT";

const UPGRADE_CONTENT: Record<
  UpgradeEmailPlan,
  { title: string; intro: string; features: string[]; cta: string; ctaHref: string }
> = {
  BOOST: {
    title: "Bienvenue dans le plan Boost ⚡",
    intro: "Ton abonnement Boost est maintenant actif.",
    features: [
      "<strong>Parcours complet en 5 phases</strong> — toutes les leçons débloquées",
      "<strong>30 messages Copilot / jour</strong> — ton coach IA disponible quand tu en as besoin",
      "<strong>10 opportunités matchées</strong> — des offres ciblées sur ton profil",
      "<strong>5 livrables / mois</strong> — construis ton portfolio data",
      "<strong>Feed communautaire</strong> — apprends des autres cadres en transition",
    ],
    cta: "Reprendre mon parcours",
    ctaHref: "/dashboard",
  },
  PREMIUM: {
    title: "Bienvenue dans le plan Pro ✨",
    intro: "Ton abonnement Pro est maintenant actif.",
    features: [
      "<strong>Copilot IA illimité</strong> — plus aucune limite de messages",
      "<strong>Toutes les opportunités</strong> — accès complet aux offres matchées",
      "<strong>Livrables illimités</strong> — y compris les briefs Pro avancés",
      "<strong>Parcours complet en 5 phases</strong> + support prioritaire",
    ],
    cta: "Reprendre mon parcours",
    ctaHref: "/dashboard",
  },
  FOUNDING: {
    title: "Bienvenue parmi les Founding Members 🎉",
    intro:
      "Ton accès Founding Member est activé — accès Pro complet, au tarif fondateur, à vie.",
    features: [
      "<strong>Tout le plan Pro</strong> — Copilot illimité, livrables illimités, toutes les opportunités",
      "<strong>Tarif 9€/mois à vie</strong> — acquis tant que tu restes actif",
      "<strong>Ligne directe avec le fondateur</strong> — ton retour façonne le produit",
    ],
    cta: "Accéder à mon parcours",
    ctaHref: "/dashboard",
  },
  SPRINT: {
    title: "Sprint NextMove activé ⚡",
    intro:
      "Ton Sprint est lancé : 30 jours d'accès Pro complet pour avancer vite.",
    features: [
      "<strong>Accès Pro pendant 30 jours</strong> — tout est débloqué",
      "<strong>Copilot illimité + tous les livrables</strong>",
      "<strong>Toutes les opportunités matchées</strong>",
      "<strong>Idéal pour une phase intense</strong> — pas d'engagement, retour en Free à la fin",
    ],
    cta: "Démarrer mon Sprint",
    ctaHref: "/dashboard",
  },
};

export function upgradeEmail(firstName: string, plan: string = "PREMIUM"): string {
  // Fall back to PREMIUM content for any plan we don't have a specific
  // template for (FREE/ENTERPRISE never reach the upgrade email path,
  // but this keeps the function total and type-safe).
  const key: UpgradeEmailPlan =
    plan === "BOOST" || plan === "FOUNDING" || plan === "SPRINT"
      ? plan
      : "PREMIUM";
  const c = UPGRADE_CONTENT[key];
  return layout(`
    <h1 style="color:#fff;font-size:22px;margin:0 0 16px">${c.title}</h1>
    <p>Merci ${firstName} ! ${c.intro}</p>
    <p>Voici ce que tu débloques :</p>
    <ul style="padding-left:20px;margin:16px 0">
      ${c.features.map((f) => `<li>${f}</li>`).join("\n      ")}
    </ul>
    <div style="text-align:center;margin:24px 0">
      <a href="${SITE_URL}${c.ctaHref}" style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);color:#000;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:12px;text-decoration:none">
        ${c.cta}
      </a>
    </div>
    <p style="color:#888;font-size:12px">Tu peux gérer ton abonnement dans les <a href="${SITE_URL}/settings" style="color:#4be277">paramètres</a>.</p>
  `);
}
