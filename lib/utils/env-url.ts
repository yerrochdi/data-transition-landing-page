/**
 * env-url.ts — résout l'URL absolue du déploiement courant.
 *
 * Pourquoi pas juste `NEXT_PUBLIC_SITE_URL` ?
 *   - `NEXT_PUBLIC_SITE_URL` est l'URL canonique du produit (toujours
 *     https://nextmove.sh) qu'on utilise pour les meta tags SEO, l'OG
 *     image, le footer, les liens "canonical", etc.
 *   - MAIS pour les liens dans les emails, les OAuth callbacks, les
 *     Stripe success/cancel URLs, on a besoin de l'URL du déploiement
 *     EN COURS — pour qu'un test sur Preview ne te renvoie pas en prod.
 *
 * Cette fonction renvoie la bonne URL selon l'environnement Vercel :
 *   - Production       → https://nextmove.sh (NEXT_PUBLIC_SITE_URL)
 *   - Preview          → https://[deployment-hash].vercel.app (VERCEL_URL)
 *   - Dev local        → http://localhost:3000
 *
 * Usage typique côté serveur (Server Action, route handler) :
 *
 *   import { getCurrentEnvUrl } from "@/lib/utils/env-url";
 *   const url = `${getCurrentEnvUrl()}/founding-activate?token=${token}`;
 *
 * NOTE : ne pas utiliser côté client (process.env.VERCEL_URL n'est pas
 * disponible dans le bundle). Pour des liens client, passe l'URL en prop.
 */
export function getCurrentEnvUrl(): string {
  // 1. Production Vercel → URL canonique (configurée explicitement)
  if (process.env.VERCEL_ENV === "production") {
    return (
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "https://nextmove.sh"
    );
  }

  // 2. Preview Vercel → URL du déploiement courant
  //    VERCEL_URL est exposée automatiquement par Vercel (sans le https://)
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Dev local — fallback localhost (ou NEXT_PUBLIC_SITE_URL si surchargée)
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/**
 * Variante : URL canonique TOUJOURS (jamais Preview). À utiliser pour
 * les meta tags SEO, le sitemap, l'OG image, les liens du footer —
 * tout ce qui doit pointer vers la prod même si le code tourne sur Preview.
 */
export function getCanonicalUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://nextmove.sh"
  );
}
