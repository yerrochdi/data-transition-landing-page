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

export function upgradeEmail(firstName: string): string {
  return layout(`
    <h1 style="color:#fff;font-size:22px;margin:0 0 16px">Bienvenue dans le plan Pro ✨</h1>
    <p>Merci ${firstName} ! Votre abonnement Pro est maintenant actif.</p>
    <p>Vous avez désormais accès à :</p>
    <ul style="padding-left:20px;margin:16px 0">
      <li><strong>Parcours complet en 5 phases</strong> — toutes les leçons débloquées</li>
      <li><strong>Copilot IA illimité</strong> — plus de limite de messages</li>
      <li><strong>Sessions IA immersives</strong> — quiz et feedback personnalisés</li>
      <li><strong>Toutes les opportunités</strong> — suggestions sans restriction</li>
    </ul>
    <div style="text-align:center;margin:24px 0">
      <a href="${SITE_URL}/journey" style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);color:#000;font-weight:bold;font-size:14px;padding:12px 28px;border-radius:12px;text-decoration:none">
        Commencer mon parcours Pro
      </a>
    </div>
    <p style="color:#888;font-size:12px">Vous pouvez gérer votre abonnement dans les <a href="${SITE_URL}/settings" style="color:#4be277">paramètres</a>.</p>
  `);
}
