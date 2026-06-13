# NextMove AI — Architecture technique

> Document de présentation technique du produit, avec un focus sur la partie **agentic / IA**.
> Rédigé pour un échange technique (entretien, due diligence, partenariat).
> Posture : **factuelle**. On distingue ce qui relève d'une vraie orchestration de ce qui
> relève de prompt engineering avancé — un interlocuteur technique le verra de toute façon.

---

## 1. Vue d'ensemble produit

**NextMove AI** est un SaaS B2C de transition de carrière : il accompagne des cadres
35–50 ans vers les métiers de la data/IA. Le produit n'est pas un générateur de contenu —
c'est un **"Career OS"** : un profil de carrière vivant + un coach IA qui pilote une
progression structurée (diagnostic → livrables → opportunités → montée en compétence).

Le différenciateur revendiqué : **ne pas être un wrapper ChatGPT**. Concrètement, cela se
traduit par trois choix d'architecture :
1. Un **onboarding profond façon Ikigai** qui collecte un contexte riche (pas un simple formulaire).
2. Une **orchestration déterministe** qui calcule, à tout moment, *la* prochaine action prioritaire.
3. Du **prompt engineering hyper-spécialisé** (12+ system prompts, contexte injecté, garde-fous anti-hallucination).

---

## 2. Stack technique

| Couche | Technologie | Notes |
|---|---|---|
| Framework | **Next.js 15.3.9** (App Router, React 19, TS 5.7) | Server Actions + Route Handlers |
| LLM | **Moonshot / Kimi** via SDK OpenAI | `moonshot-v1-8k` (standard) / `moonshot-v1-32k` (lourd) |
| Base de données | **Prisma 7 + PostgreSQL** (Supabase) | RLS, adapter `pg` |
| Auth | **Supabase Auth** (SSR) | Middleware sur toutes les routes protégées |
| Paiement | **Stripe** (abonnements + one-shot) | Webhooks idempotents |
| Emails | **Resend** | Transactionnels + relances |
| Données marché | **API France Travail** (OAuth2 client_credentials) | Offres réelles + agrégation |
| Streaming | **ReadableStream natif** (SSE) | Géré côté Route Handler |
| Hébergement | **Vercel** | Crons, `maxDuration`, `force-dynamic` |
| Observabilité | **Sentry** | Erreurs front + back |

**Point d'infra notable** : les routes IA portent `export const maxDuration = 60` car le
timeout Vercel par défaut (10 s) coupe le stream Kimi sur les générations longues (bilan
800–1200 mots = 15–30 s). C'est un piège classique, identifié et corrigé.

---

## 3. La partie agentic — l'honnêteté d'abord

Il faut être clair sur le vocabulaire, parce que "agentic" est galvaudé.

**NextMove n'est PAS** (à ce stade V1) :
- un agent qui choisit ses propres outils (pas de tool-calling / function-calling),
- une boucle de décision autonome (l'IA ne décide pas seule de l'étape suivante),
- du RAG / des embeddings / une mémoire vectorielle.

**NextMove EST** : un **orchestrateur déterministe** + un **système de prompt engineering
contextualisé**, avec du **streaming maîtrisé** et des **fallbacks gracieux**. C'est volontaire :
sur un produit de coaching où la confiance et la prévisibilité priment, une orchestration
déterministe est plus sûre et plus débuggable qu'une boucle d'agent autonome — et ça reste
extensible vers un vrai agent en V2.

Ce qui constitue la **vraie couche de décision** est détaillé en §4. Ce qui relève du
**prompt engineering** est en §5.

---

## 4. Couche d'orchestration — `lib/orchestrator/`

C'est ici que se joue la logique "agentic" du produit : à chaque instant, le système calcule
**une seule action prioritaire** par utilisateur (le *Next Best Action*), à partir de l'état
réel en base.

### 4.1 Moteur de décision — `recommendations.ts`

`computeNextAction(userId)` applique une **cascade de règles ordonnées** (l'ordre = la priorité).
La première règle qui matche gagne :

1. `COMPLETE_ONBOARDING` — onboarding non terminé
2. `RUN_DIAGNOSTIC` — phase diagnostic jamais ouverte
3. `ADVANCE_PHASE_1` — diagnostic en cours, non complété (phase **bloquante**)
4. `FIRST_QUICK_DELIVERABLE` — aucun livrable validé → propose le plus accessible
5. `EXPLORE_OPPORTUNITIES` — exactement 1 livrable validé → "calibrer le marché"
6. `AMBITIOUS_DELIVERABLE` — 1–2 livrables validés + quota dispo → livrable difficile
7. `UPGRADE_FOR_MORE` — quota mensuel atteint → conversion
8. `ADVANCE_LATER_PHASE` — (plans payants) phases antérieures complètes
9. `KEEP_MOMENTUM` — état de repos (sentinel)

Le calcul de quota lit les livrables démarrés depuis le début du mois et le compare aux
quotas du plan (`getQuotas(plan, sprintExpiresAt)`).

### 4.2 Gates — `gates.ts`

Deux fonctions bloquent l'accès à des pages **prématurément**, ce qui force une progression
saine :
- `gateOpportunities()` : exige diagnostic `COMPLETED` + ≥1 livrable `VALIDATED`.
- `gateBriefStart(difficulty)` : exige ≥1 livrable validé si difficulté ≥ 3.

### 4.3 Cycle de vie de l'action — `actions.ts`

- `getNextActionForCurrentUser()` : recalcule l'action, persiste la ligne `RecommendedAction`, la rend via un template.
- `completeCurrentAction()` / `skipCurrentAction()` : marquent l'état et **recalculent** la suivante.

> **Pourquoi c'est "agentic"** : le système maintient un état de progression par utilisateur,
> applique une politique de décision contextuelle, et réoriente dynamiquement le parcours selon
> les actions réalisées. Ce n'est pas une IA générative — c'est une **machine à états + policy
> engine**, ce qui est précisément ce qu'on veut pour de la fiabilité produit.

---

## 5. Couche IA générative — prompt engineering

Tout passe par un seul provider (Kimi) via le SDK OpenAI (`lib/ai/client.ts`). La sophistication
est dans **`lib/ai/prompts.ts`** (~1000 lignes) : 3 system prompts + 12 builders contextualisés.

### 5.1 System prompts

| Prompt | Rôle |
|---|---|
| `SYSTEM_PROMPT` | Persona "Copilot" coach transition. Contient les **règles de séniorité** (Junior→C-Level) et l'interdiction stricte de tout caractère non-latin. |
| `REFORMULATION_SYSTEM_PROMPT` | Reformulation "écoute active" : **1 phrase, 25 mots max**, vouvoiement, anti-sycophantisme (interdit "super !", "bravo !"). |
| `IKIGAI_SYSTEM_PROMPT` | Coach exécutif sur les 4 dimensions Ikigai, 200–280 mots, cite les mots exacts de l'utilisateur. |

### 5.2 Builders contextualisés

Une douzaine de fonctions `build*Prompt(data)` qui injectent le contexte utilisateur complet
et adaptent l'instruction. Exemples notables :

- **`buildAmbitionsPrompt`** : détecte la **séniorité par regex** sur le titre + années
  d'expérience, puis sélectionne un des 6 paliers (Junior / Confirmé / Senior / Expert /
  C-Level…) pour produire **4 rôles cibles échelonnés** (court / moyen / long terme) au format
  JSON. Garde-fou : un profil 6 ans ne se voit jamais proposer "Chief Officer".
- **`buildReformulationPrompt`** : 11 variantes step-spécifiques (situation, rôle, formation,
  usage IA, compétences, freins…). Chaque step a sa propre instruction de reformulation.
- **`buildIkigai*Prompt`** : 4 builders (passion / forces / marché / alignement).
- **`buildSummaryPrompt`** : le bilan final, 800–1200 mots, 6 sections imposées, + un bloc HTML
  commenté `<!--IKIGAI:{...}-->` en fin de texte qui alimente le **diagramme Ikigai** côté client.

### 5.3 Détection de séniorité (exemple de pattern)

```ts
const isAlreadyData = /data|analytics|bi|intelligence|ml|ia|ai|scientist/i.test(role);
const isManager   = /lead|head|director|manager|chief|vp|responsable|directeur/i.test(role);
const isCLevelEligible = years >= 15 && isManager;
```

Ce signal pilote tout le reste du prompt : vocabulaire, niveau des rôles proposés, ton. C'est du
**prompt routing** à base de règles — pas de l'IA, mais c'est ce qui rend les sorties pertinentes
au lieu de génériques.

---

## 6. Pipeline d'analyse LinkedIn — `/api/onboarding/parse-linkedin`

L'un des points les plus différenciants. Le flux :

1. Upload PDF (validation type + taille ≤ 5 Mo).
2. Extraction texte via `pdf-parse` (import dynamique pour éviter le chargement au build).
3. Troncature à 8000 caractères.
4. Appel `moonshot-v1-32k` avec un prompt qui produit **deux blocs JSON** :
   - **Factuel** : rôle, secteur, années, formation, compétences, expériences.
   - **Diagnostic narratif** (la valeur ajoutée) : synthèse senior, spécialité réelle déduite,
     compétences *déduites des missions* (pas auto-déclarées), patterns invisibles, angle de
     transition, questions de clarification.
5. **Garde-fous anti-hallucination explicites** dans le prompt :
   - "Ne lister QUE les certifications **explicitement** présentes dans le PDF" (sinon `[]`).
   - "Les compétences déduites doivent être **justifiables** par une mission concrète."
   - "Jamais de décimale pour l'expérience (pas de '4.7 ans')."
6. Purge serveur des caractères CJK (seconde barrière, même si le prompt l'interdit).

Le diagnostic produit est ensuite **réinjecté** dans `buildAmbitionsPrompt` : les rôles proposés
"capitalisent sur la spécialité réelle" plutôt que de proposer du data analyst générique. C'est
ce qui fait dire à l'utilisateur "le produit a vraiment lu mon CV".

---

## 7. Module Marché Ikigai — donnée réelle + fallback IA — `lib/ikigai/market.ts`

Exemple de **dégradation gracieuse**, un pattern important pour la robustesse :

1. `getMarketSnapshotForRole(role)` interroge l'**API France Travail** (offres réelles).
2. Agrège : nombre d'offres, top compétences, top régions, salaire médian.
3. **Si < 3 offres ont un salaire exploitable** (cas fréquent pour les titres anglais) →
   `estimateSalaryForRole()` appelle Kimi pour produire une fourchette réaliste France 2026.
4. Le résultat porte un flag `estimated: true` → l'UI affiche un badge "estimation" honnête.

Donc : **vraie donnée quand elle existe, estimation IA transparente sinon**. L'écran n'est jamais vide.

---

## 8. Les 3 routes IA et leurs modes — `/api/onboarding/ai`

Une route, **trois modes** mutuellement exclusifs, tous streamés en SSE :

| Mode | Usage | Sortie | Tokens |
|---|---|---|---|
| `insight` | ambitions / skills / motivation / confidence / summary | JSON (ambitions) ou texte streamé | jusqu'à 3000 (summary) |
| `reformulation` | les 11 steps "écoute active" | 1 phrase | 120 |
| `ikigai` | passion / forces / marché / alignement | 200–280 mots | 700 |

**Sécurité & robustesse de la route** :
- Auth Supabase obligatoire.
- **Rate limit** : 20 appels IA / jour / utilisateur (compté via la table `Activity`).
- Validation JSON stricte sur le mode ambitions + purge CJK post-parse.
- Streaming via `ReadableStream` + `TextEncoder`, gestion d'erreur dans le `controller`.

---

## 9. Flux de données IA

- **Pas de RAG, pas d'embeddings, pas de mémoire vectorielle.** Le contexte utilisateur complet
  (`OnboardingFormData` + `linkedinAnalysis` + `ikigai`) est **réinjecté à chaque appel**.
- Les sorties IA des étapes (reformulations, insights Ikigai) sont **persistées** dans
  `OnboardingResponse` et réutilisées par le bilan final, qui les **croise** pour identifier le
  *sweet spot* Ikigai.
- Le Copilot conversationnel (`/api/chat`) est un **chatbot contextualisé** : il injecte le profil
  + l'action prioritaire courante dans le system prompt, garde les 10 derniers messages, mais ne
  fait **pas** de tool-calling. À qualifier honnêtement de "coach conversationnel", pas d'agent.

---

## 10. Patterns techniques à retenir

1. **Orchestration déterministe** (policy engine 9 règles) plutôt que boucle d'agent — fiabilité & debug.
2. **Prompt routing par regex de séniorité** — pertinence des sorties sans coût IA additionnel.
3. **Reformulation "écoute active"** — appel asynchrone debouncé après chaque step, cache par signature, 1 phrase.
4. **Anti-hallucination multi-couche** — prompt explicite + validation JSON + purge CJK serveur + retry.
5. **Dégradation gracieuse** — France Travail muet → estimation IA ; parsing PDF partiel → extraction factuelle seule.
6. **Streaming SSE maîtrisé** — `maxDuration` Vercel ajusté, gestion d'erreur de stream, rendu progressif.
7. **Métadonnées dans le texte** — bloc HTML commenté `<!--IKIGAI:{...}-->` extrait côté client pour piloter une dataviz, masqué pendant le streaming.

---

## 11. Limites assumées & roadmap V2

**Limites V1 (assumées) :**
- Mono-provider (Kimi) — pas d'abstraction multi-LLM encore.
- Pas de tool-calling : l'IA génère, l'humain et l'orchestrateur décident.
- Contexte ré-injecté en entier à chaque appel (coût tokens, pas de cache de contexte).
- Pas de tests automatisés sur les sorties IA (évaluation manuelle).

**Pistes V2 (vraie montée agentic) :**
- **Tool-calling** : donner à l'IA l'accès à des outils (recherche d'offres, calcul de readiness,
  génération de livrable) et la laisser composer.
- **Boucle d'évaluation** : un agent qui juge si l'utilisateur est prêt à passer à l'étape suivante.
- **Mémoire** : RAG sur l'historique de progression pour un coaching qui se souvient.
- **Évaluations automatisées** des prompts (régression de qualité).
- **Abstraction multi-LLM** + prompt caching pour réduire les coûts.

---

## 12. Synthèse en une phrase

> NextMove V1 est un **orchestrateur de progression déterministe** (machine à états + policy engine)
> couplé à du **prompt engineering hyper-spécialisé et contextualisé**, avec streaming SSE et
> dégradation gracieuse. La couche "vraiment agentic" est l'orchestrateur Next Best Action ;
> la couche générative est un système de coaching par prompts injectés, conçu pour rester
> prévisible et extensible vers un agent à tool-calling en V2.
