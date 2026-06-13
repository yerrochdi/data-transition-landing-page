# Audit NextMove.sh — 01 · État des lieux

> Audit CTO pré-bêta. Stack réel : **Next.js 15 App Router full-stack** (Server Actions + Route
> Handlers), Prisma 7 + Supabase Postgres, Supabase Auth, Stripe LIVE, Resend, LLM Moonshot/Kimi,
> Vercel. *(Le brief mentionnait Django REST — c'est inexact, l'audit porte sur le code réel.)*

---

## Notes par section

| Section | Note | Résumé en une phrase |
|---|---|---|
| A1. Architecture & code | **6.5/10** | Séparation propre (lib/ par domaine), TS strict, mais zéro test et états UI incomplets |
| B1. Sécurité / auth | **8/10** | Toutes les routes API authentifiées, admin fail-closed ; un endpoint de test dangereux subsiste |
| B2. Protection coûts LLM | **5/10** | Rate limits présents sauf sur `/parse-linkedin` (DoS de coûts possible) ; aucun tracking de spend |
| B3. Stripe | **9/10** | Signature + idempotence + cancel gérés ; `invoice.payment_failed` non géré |
| B4. RGPD | **6/10** | Suppression de compte ✓, pages légales ✓ ; export de données ✗, cookie consent ✗ |
| B5. Observabilité | **6/10** | Sentry configuré ; logging non structuré, coûts LLM non suivis |
| B6. Tests | **0/10** | **Aucun test. Aucun framework de test installé.** |
| B7. Performance | **7/10** | Opportunités bien optimisées ; N+1 sur le dashboard (journey phases), cron non borné |
| C1. Boucle de rétention | **3/10** | Orchestrateur linéaire solide, mais rien ne fait revenir l'utilisateur chaque semaine |
| C2. Proactivité | **2/10** | Un email mensuel générique ; pas de digest hebdo, pas de relance d'inactifs, réponses au check-in non stockées |
| C3. Mémoire du coach | **4/10** | Tables `AgentConversation/AgentMessage` existent mais **les conversations ne sont jamais persistées** |
| C4. Time-to-wow | **4/10** | Le bilan + diagramme Ikigai en fin d'onboarding est un vrai wow, mais il arrive après 16 steps (~20-25 min) ; le wow *suivant* est à 5-10 jours |
| D1. Design system | **6/10** | Tokens cohérents (palette réelle : `#4be277` vert + fond `#101419` — pas le `#0A0E27/#00D4AA` du brief), classes custom utilisées partout |
| D2. Copywriting tu/vous | **3/10** | Mélange grave : vouvoiement sur landing/onboarding récent, tutoiement sur /about, emails, copilot, anciens steps |
| D3. Claims & témoignages | **5/10** | Personas Karim/Sophie/Marc non labellisés "illustratifs" ; "1 000 cadres en 3 ans" invérifiable |
| D4. États UI | **4/10** | Pas de `loading.tsx`/`error.tsx` dans (platform), empty states manquants (opportunités, journey vierge) |

**Score global : 5.2/10** — produit fonctionnel de bout en bout, mais pré-bêta sur la robustesse et la rétention.

---

## Ce qui est bien (à préserver)

1. **L'orchestrateur Next Best Action** (`lib/orchestrator/recommendations.ts`) : 9 règles ordonnées,
   gates de progression, une seule action active par user. C'est le squelette du Career OS — solide,
   déterministe, débuggable.
2. **Le pipeline LinkedIn** (`/api/onboarding/parse-linkedin`) : extraction + diagnostic narratif avec
   garde-fous anti-hallucination explicites. Différenciateur réel.
3. **Stripe** : webhook signé, idempotent (`processedStripeEvent`), downgrade géré. Au-dessus de la
   moyenne des MVP.
4. **L'onboarding Ikigai** (16 steps, reformulations live, données France Travail réelles, diagramme
   final) : c'est la pièce maîtresse de la proposition de valeur. Profond, pas gadget.
5. **Prompt engineering** : détection de séniorité, purge CJK multi-couche, anti-sycophantisme,
   réalisme des rôles par palier d'expérience.

## Ce qui est fragile

1. **Zéro test** sur un produit qui encaisse de l'argent réel et appelle un LLM payant.
2. **`/api/onboarding/parse-linkedin` sans rate limit** : un testeur malveillant peut uploader des PDF
   en boucle → coûts Kimi non bornés.
3. **Le rate limit global de 20 appels IA/jour** (`/api/onboarding/ai`) est devenu **trop bas** : un
   onboarding complet consomme désormais ~12-15 appels (6 reformulations + 4 Ikigai + ambitions +
   summary + retries). Un utilisateur qui recommence ou régénère **se fait bloquer en plein
   onboarding** — bug de bêta garanti.
4. **Conversations Copilot jamais sauvegardées** : la table existe, le code ne l'écrit jamais. Le coach
   a une amnésie totale entre sessions — à l'opposé de la vision "mémoire longitudinale".
5. **Réponses au check-in mensuel perdues** : l'email pose 3 questions, rien ne stocke ni n'exploite
   les réponses.
6. **Stripe : solde du compte négatif** (-0,74 €) au moment de l'audit → paiements entrants suspendus
   tant que le virement SEPA n'est pas passé. **Bloquant absolu avant toute invitation.**

## Ce qui est mort (à supprimer)

- **12 composants legacy** dans `/components/` racine jamais importés (hero-section, testimonials-section,
  pricing-section, mentor-section, trust-section, sticky-cta, contact-section, cta-banner,
  not-for-section, approach-section, problem-section, method-section) — restes de la landing v1.
- **3 champs Prisma jamais lus** : `careerInflections`, `longTermVision`, `careerAnchors`
  (schema posé pour le V1.5 Career OS, UI jamais branchée). Garder le schéma, mais assumer qu'ils sont
  inactifs ou les brancher (cf. roadmap).
- `streakDays` : résidu de l'ancienne gamification supprimée — à retirer du schéma à la prochaine migration.

---

## Verdict : prêt pour la bêta ?

**OUI pour une bêta fermée (les 30 Founding Members connus), À CONDITION de corriger les 6 bloquants
du document `02-bloquants-beta.md`** (≈ 3-5 jours de travail). Le parcours cœur — signup → onboarding
Ikigai → bilan → livrables → opportunités — fonctionne de bout en bout et la proposition de valeur est
réelle.

**NON pour une bêta publique / ouverte** : sans tests, sans plafond de coûts LLM global, sans cookie
consent, et avec une boucle de rétention quasi inexistante, ouvrir au-delà d'un cercle de confiance
serait prématuré. La rétention hebdomadaire — le cœur de la vision Career OS — reste à construire
(voir `03-roadmap-career-os.md`).
