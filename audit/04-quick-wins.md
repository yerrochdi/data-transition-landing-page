# Audit NextMove.sh — 04 · Quick wins (< 1 journée chacun)

> 10 améliorations à fort impact, réalisables en moins d'une journée chacune.
> Triées par impact bêta-testeur décroissant. Les bloquants (rate limits, Stripe, RGPD) sont dans
> `02-bloquants-beta.md` et ne sont pas répétés ici.

---

### QW1 — Sauvegarder les réponses Ikigai en cours d'onboarding
**Impact : évite la perte de 10 min de réflexion personnelle.**
L'onboarding fait 16 steps mais `getSaveStepIndex()` retourne `null` pour les steps Ikigai 10-13
(`onboarding-flow.tsx`) : un refresh en plein module Passion/Forces **perd les textes saisis** — les
réponses les plus coûteuses émotionnellement. Fix minimal : persister `formData.ikigai` dans
`localStorage` (debounce 1 s) + réhydrater au mount. ~2 h.

### QW2 — Standardiser le vouvoiement partout
**Impact : crédibilité premium immédiate (cible cadres 35-50).**
Mélanges relevés : `app/(marketing)/about/page.tsx:103-107` (tutoiement intégral),
`lib/email/templates.ts` (vous + tu dans le même email Founding, lignes 74-94), `SYSTEM_PROMPT` du
Copilot ("Tutoie l'utilisateur") alors que l'onboarding et le bilan vouvoient. Une passe globale :
about, 5 templates email, system prompt Copilot, écran final onboarding. ~½ journée.

### QW3 — Supprimer les 12 composants morts de `/components/`
**Impact : -2000 lignes de code mort, clarté du repo.**
`hero-section, testimonials-section, pricing-section, mentor-section, trust-section, sticky-cta,
contact-section, cta-banner, not-for-section, approach-section, problem-section, method-section` —
legacy de la landing v1, jamais importés. `git rm` + vérif build. ~1 h.

### QW4 — `loading.tsx` + `error.tsx` sur le groupe (platform)
**Impact : plus jamais d'écran blanc ou de stack trace devant un testeur.**
Aucune route de `app/(platform)/` n'a de boundary. Un `loading.tsx` (skeleton simple) et un
`error.tsx` ("Quelque chose s'est mal passé" + bouton réessayer + report Sentry) au niveau du groupe
couvrent tout d'un coup. ~2 h.

### QW5 — Empty states sur Opportunités, Journey et Portfolio
**Impact : un nouvel inscrit ne voit jamais une page vide muette.**
Trois écrans affichent des listes potentiellement vides sans message. Pattern à copier : celui de
`ai-summary.tsx` (icône + phrase + CTA vers l'action recommandée). ~3 h pour les trois.

### QW6 — Confirmation avant suppression de compte
**Impact : évite la perte irréversible accidentelle.**
`deleteAccount()` (`lib/settings/actions.ts:213-235`) supprime tout en cascade sans confirmation
forte. Ajouter un modal "tapez SUPPRIMER" (pattern GitHub). ~1 h. (L'export RGPD, plus gros, est en
bloquants.)

### QW7 — Corriger le N+1 du dashboard journey
**Impact : dashboard plus rapide, le premier écran vu à chaque session.**
`lib/dashboard/actions.ts:142` : boucle `for (const phase of phases)` avec `journeyProgress.findFirst()`
par phase = N requêtes séquentielles. Remplacer par un seul `findMany({ where: { userId } })` + Map en
mémoire. ~1 h.

### QW8 — Afficher le quota IA restant dans l'onboarding
**Impact : transforme une erreur opaque en info maîtrisée.**
Avec le rate limit journalier (même relevé, cf. B3), l'utilisateur doit voir où il en est : retourner
`X-RateLimit-Remaining` depuis `/api/onboarding/ai` et afficher discrètement "analyses IA restantes
aujourd'hui : N" près du composant `AiErrorState` quand N < 5. ~2 h.

### QW9 — Réparer l'erreur TypeScript Sentry connue
**Impact : `tsc --noEmit` redevient un signal fiable.**
`instrumentation.ts:10` : `Module '"@sentry/nextjs"' has no exported member 'onRequestError'` —
erreur ignorée par grep depuis des semaines, elle masque les vraies erreurs dans la CI mentale.
Mettre à jour l'API Sentry (export `onRequestError` → nouvelle signature) ou épingler la version. ~1 h.

### QW10 — Honorer le paramètre `?plan=` après onboarding
**Impact : un futur payant n'est pas perdu en route.**
Vérifier le chemin complet : signup avec `chosenPlan` boost/pro/sprint → onboarding → à la fin,
`completeOnboarding` redirige bien vers Stripe (`onboarding-flow.tsx`, `PAID_CHOSEN_PLANS`), mais si
l'utilisateur quitte et revient via `/onboarding` sans query param, le plan choisi est perdu (il est
dans `user_metadata.chosen_plan` Supabase — le relire côté page serveur). ~2 h.

---

## Ordre suggéré sur une semaine

| Jour | Quick wins |
|---|---|
| J1 | QW1 (sauvegarde Ikigai) + QW9 (Sentry TS) |
| J2 | QW2 (vouvoiement global) |
| J3 | QW4 (boundaries) + QW5 (empty states) |
| J4 | QW3 (code mort) + QW7 (N+1) + QW6 (confirmation suppression) |
| J5 | QW8 (quota visible) + QW10 (plan persisté) |
