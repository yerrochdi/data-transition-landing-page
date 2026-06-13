# Audit NextMove.sh — 02 · Bloquants avant le premier bêta-testeur

> Liste exhaustive des correctifs **OBLIGATOIRES** avant d'inviter le premier bêta-testeur.
> Effort : **S** < ½ journée · **M** = ½ à 2 jours · **L** > 2 jours.
> Ordre = ordre d'exécution recommandé.

---

## 🔴 Bloquants absolus (sans eux, ne pas inviter)

### B1 — Régulariser le solde Stripe négatif — **S** (action humaine)
- **Constat** : solde -0,74 € → **tous les paiements entrants sont suspendus**. Le flow Founding 9€
  échoue silencieusement au checkout.
- **Action** : virement SEPA 10 € vers l'IBAN Stripe (référence obligatoire), délai 1-2 j ouvrés.
  Vérifier ensuite un paiement test réel de bout en bout.
- **Fichiers** : aucun — configuration compte Stripe.

### B2 — Rate limit sur `/api/onboarding/parse-linkedin` — **S**
- **Constat** : seule route LLM **sans aucune limite**. Un testeur peut boucler des uploads PDF →
  appels `moonshot-v1-32k` (2500 tokens) non bornés. C'est LE vecteur "500 € d'API en une nuit".
- **Action** : réutiliser le pattern de `/api/onboarding/ai` (compteur `Activity` journalier),
  limite 5 analyses LinkedIn/jour/user.
- **Fichiers** : `app/api/onboarding/parse-linkedin/route.ts` (ajouter le bloc rate-limit après l'auth).

### B3 — Relever le quota 20 appels IA/jour qui casse l'onboarding — **S**
- **Constat** : un onboarding complet consomme ~12-15 appels (6 reformulations + 4 Ikigai + ambitions
  + summary + retries automatiques ×3 sur ambitions). Un utilisateur qui se reprend à deux fois ou
  régénère des insights **reçoit un 429 en plein onboarding** → bilan impossible, première impression
  ruinée.
- **Action** : passer à 60/jour OU exclure le mode `reformulation` du compteur (coût marginal, 120
  tokens). Ajouter un message UI propre si 429 (le composant `AiErrorState` existe déjà).
- **Fichiers** : `app/api/onboarding/ai/route.ts` (constante du seuil + condition sur le mode).

### B4 — Supprimer ou neutraliser `/api/admin/set-my-plan` — **S**
- **Constat** : endpoint de test qui modifie le plan d'un utilisateur. Protégé par `isAdmin()` mais
  c'est une surface d'attaque inutile en prod et un risque d'accident.
- **Action** : supprimer la route, ou la gater derrière `NODE_ENV !== "production"`.
- **Fichiers** : `app/api/admin/set-my-plan/route.ts`.

### B5 — Cookie consent (CNIL) — **M**
- **Constat** : cookies Supabase + Vercel Analytics déposés sans bannière de consentement. Pages
  légales présentes mais pas d'UI de consentement → non-conformité RGPD/CNIL sur un produit français
  payant qui collecte des données de carrière sensibles.
- **Action** : bannière de consentement minimale (accepter / refuser analytics), les cookies d'auth
  Supabase sont exemptés (strictement nécessaires) mais doivent être documentés. La page
  `/legal/cookies` existe déjà — la lier.
- **Fichiers** : nouveau `components/cookie-consent.tsx` + montage dans `app/layout.tsx`.

### B6 — Gérer `invoice.payment_failed` Stripe — **M**
- **Constat** : si la CB d'un abonné Founding/Boost/Pro échoue au renouvellement, rien ne se passe
  côté produit : pas d'email, pas de grace period, pas de downgrade contrôlé.
- **Action** : handler webhook `invoice.payment_failed` → email "mise à jour de votre moyen de
  paiement" (template Resend) + flag `paymentFailedAt` sur User ; downgrade après 7 jours via le cron
  existant.
- **Fichiers** : `app/api/billing/webhook/route.ts`, `lib/email/templates.ts`, `prisma/schema.prisma`
  (1 champ), cron `career-os-checkin` ou nouveau cron.

---

## 🟠 Fortement recommandés avant bêta (acceptables en semaine 1 de bêta)

### B7 — Smoke tests des chemins critiques — **L**
- **Constat** : zéro test, zéro framework. Les 3 chemins qui ne doivent JAMAIS casser : auth/signup,
  webhook Stripe (plan upgrade/downgrade), génération du bilan.
- **Action** : installer Vitest + 1 suite par chemin critique. Pas de couverture exhaustive — 10-15
  tests qui protègent l'argent et la première impression. Playwright e2e = post-bêta.
- **Fichiers** : `vitest.config.ts`, `lib/billing/__tests__/webhook.test.ts` (logique `planFromPriceId`,
  idempotence), `lib/orchestrator/__tests__/recommendations.test.ts` (les 9 règles sont pures et
  faciles à tester), `lib/ikigai/__tests__/market.test.ts` (parseSalary, computeMedianRange).

### B8 — Persister les conversations Copilot — **M**
- **Constat** : `AgentConversation`/`AgentMessage` existent dans le schéma mais `/api/chat` n'écrit
  jamais dedans. Les bêta-testeurs vont parler au coach, perdre leur historique au refresh, et le
  signaler comme bug. C'est aussi le prérequis de toute la vision "mémoire longitudinale".
- **Action** : à chaque échange, upsert conversation + create 2 messages (user, assistant). Recharger
  les 10 derniers messages depuis la DB au lieu du state client.
- **Fichiers** : `app/api/chat/route.ts` (persistence), page copilot (hydratation initiale).

### B9 — Tracking des coûts LLM — **M**
- **Constat** : aucun suivi du spend. En bêta tu dois savoir combien coûte un utilisateur.
- **Action** : logger `usage.total_tokens` (présent dans chaque réponse Kimi) dans la table `Activity`
  (metadata JSON) ou une table `LlmUsage` dédiée. Un agrégat hebdo suffit (pas de dashboard).
- **Fichiers** : `lib/ai/client.ts` (wrapper) ou les 3 routes IA.

### B10 — Labelliser les personas fictifs de la landing — **S**
- **Constat** : Karim/Sophie/Marc (`profile-carousel.tsx`) présentés sans mention "persona illustratif" ;
  un visiteur peut les prendre pour des cas réels → risque confiance/juridique (pratiques commerciales
  trompeuses).
- **Action** : ajouter une mention discrète "Profils illustratifs" sur le carousel + remplacer
  "Accompagner 1 000 cadres en 3 ans" (`about/page.tsx:96`) par une formulation d'ambition non chiffrée
  ou explicitement marquée comme objectif.
- **Fichiers** : `app/(marketing)/home/_components/profile-carousel.tsx`, `app/(marketing)/about/page.tsx`.

---

## Récapitulatif effort

| ID | Bloquant | Effort | Type |
|---|---|---|---|
| B1 | Solde Stripe négatif | S (humain) | Paiement |
| B2 | Rate limit parse-linkedin | S | Coûts LLM |
| B3 | Quota 20/jour casse l'onboarding | S | Bug UX critique |
| B4 | Supprimer set-my-plan | S | Sécurité |
| B5 | Cookie consent | M | RGPD |
| B6 | invoice.payment_failed | M | Paiement |
| B7 | Smoke tests chemins critiques | L | Robustesse |
| B8 | Persistance Copilot | M | Produit + vision |
| B9 | Tracking coûts LLM | M | Coûts |
| B10 | Labelliser personas | S | Légal/confiance |

**Total estimé : 4 × S (~1 j) + 4 × M (~4 j) + 1 × L (~2 j) ≈ 7 jours de travail**, dont les 6
premiers (B1-B6) ≈ **3 jours** pour pouvoir inviter les premiers Founding Members en confiance.
