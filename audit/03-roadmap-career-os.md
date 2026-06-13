# Audit NextMove.sh — 03 · Roadmap vers le Career OS premium

> Plan en 3 vagues, évalué à l'aune de la vision : (a) Carnet d'impact hebdo + graphe de compétences
> à preuves, (b) coach IA proactif avec mémoire longitudinale, (c) moments "payday".
> État de départ mesuré : carnet d'impact **0%**, graphe de compétences **~20%**, mémoire coach **~5%**,
> dossier entretien **~30%** (l'interview-prep par offre existe).

---

## Vague 1 — Pré-bêta (2-3 semaines) : bloquants + fondations

### 1.1 Les 10 bloquants de `02-bloquants-beta.md` — **~7 j**
Non répété ici. B8 (persistance Copilot) est aussi la première brique de la mémoire longitudinale.

### 1.2 Quick wins UX de `04-quick-wins.md` — **~3 j**
Tu/vous, états vides, suppression du code mort, loading/error boundaries.

### 1.3 Fondation "événements de carrière" — **M (2 j)** ← investissement clé de la vague
- **Quoi** : généraliser la table `Activity` en **journal d'événements de carrière** : chaque action
  significative (livrable validé, phase complétée, réponse au check-in, engagement pris auprès du
  coach, victoire déclarée) devient une ligne typée + metadata JSON.
- **Pourquoi maintenant** : le Carnet d'impact (vague 2) et le dossier d'entretien annuel (vague 3)
  sont des **vues sur ce journal**. Sans ce flux d'événements, chaque feature devra re-collecter.
- **Modèles** : étendre l'enum `ActivityType` (`IMPACT_LOGGED`, `COMMITMENT_MADE`, `WIN_DECLARED`,
  `CHECKIN_ANSWERED`) ; pas de nouvelle table.
- **Fichiers** : `prisma/schema.prisma` (enum), `lib/orchestrator/actions.ts`, `app/api/chat/route.ts`,
  cron check-in.

### 1.4 Check-in mensuel → réponses stockées — **M (1 j)**
- L'email mensuel pose 3 questions dont les réponses partent dans le vide. Créer une page
  `/checkin?token=...` qui enregistre les réponses comme événements (`CHECKIN_ANSWERED`,
  `WIN_DECLARED`). Premier flux de données longitudinales réel.
- **Fichiers** : nouvelle route `app/(platform)/checkin/`, template email (lien vers la page),
  `lib/email/templates.ts`.

---

## Vague 2 — Pendant la bêta (4-6 semaines) : la boucle hebdomadaire

> Objectif unique de la vague : **donner une raison de revenir chaque semaine**. Tout le reste passe après.

### 2.1 Carnet d'impact V1 — **L (4-5 j)** ← la feature de rétention
- **Quoi** : chaque semaine, l'utilisateur loggue 1-3 "impacts" (réalisation, décision, feedback reçu)
  en 2 minutes. Le coach IA reformule chaque impact en **bullet point de CV quantifié** (réutilise le
  pattern reformulation existant — le prompt et le composant `AiReformulation` sont déjà là).
- **UI** : nouvelle section sidebar "Carnet d'impact" : timeline verticale des impacts + bouton
  "Ajouter un impact" (modal 3 champs : quoi / pour qui / résultat).
- **Modèles** : table `ImpactEntry` (userId, date, rawText, aiPolished, skillTags[], proofUrl?) —
  liée aux événements 1.3.
- **Fichiers** : `prisma/schema.prisma`, `app/(platform)/impact/`, `lib/ai/prompts.ts`
  (buildImpactPolishPrompt), réutilisation `AiThinkingLoader`/`AiErrorState`.

### 2.2 Digest hebdo par email — **M (2 j)**
- **Quoi** : cron hebdomadaire (lundi 8h) : "Votre semaine NextMove" = impacts loggés + prochaine
  action recommandée (l'orchestrateur la calcule déjà) + 1 opportunité matchée (le matching existe).
  Si 0 impact loggé : relance douce "2 minutes pour noter une victoire de la semaine ?".
- **Infra** : pattern cron existant (`vercel.json` + `CRON_SECRET`) — copier `career-os-checkin`.
- **Fichiers** : `app/api/cron/weekly-digest/route.ts`, `lib/email/templates.ts`, `vercel.json`.

### 2.3 Suivi d'engagements du coach — **M (2 j)**
- **Quoi** : quand l'utilisateur dit au Copilot "je ferai X cette semaine", le coach enregistre un
  engagement (`COMMITMENT_MADE`) — V1 : extraction par prompt en fin de conversation, pas de
  tool-calling. Le digest hebdo et le Copilot relisent les engagements ouverts ("Vous vous étiez
  engagé à X — où en êtes-vous ?").
- **Prérequis** : B8 (persistance conversations) fait en vague 1.
- **Fichiers** : `app/api/chat/route.ts` (post-traitement), `buildOrchestratorContext()` (injection
  des engagements ouverts).

### 2.4 Relance d'inactifs — **S (1 j)**
- Cron quotidien : users sans événement depuis 10 jours → 1 email de réactivation max (flag
  `lastNudgedAt` pour ne jamais spammer). Réutilise le journal d'événements 1.3.

---

## Vague 3 — Post-bêta : compétences prouvées & moments payday

### 3.1 Graphe de compétences à preuves — **L (5-7 j)**
- **Existant réutilisable** : `UserProfile.topSkills/skillGaps`, `DeliverableBrief.skillCategory`,
  livrables validés, `ImpactEntry.skillTags` (vague 2), le composant `skills-radar` du dashboard.
- **Quoi** : modèle `SkillProof` (skill, source : livrable | impact | quiz, força du signal). Une vue
  "Compétences" montre chaque skill avec ses **preuves cliquables** ("SQL — prouvé par 2 livrables +
  3 impacts"). Export LinkedIn/CV en un clic.
- **L'IA infère** : "3 briefs SQL validés niveau 2-3 → SQL confirmé" (règles + prompt de synthèse).

### 3.2 Dossier d'entretien annuel / argumentaire d'augmentation — **L (4-5 j)** ← le "payday"
- **Existant réutilisable** : `generateInterviewPrep()` (pitch + Q&A + conseil salaire pour UNE offre),
  le bilan consultant (format livrable), les données marché France Travail (fourchettes réelles), et
  désormais 6-12 mois d'`ImpactEntry`.
- **Quoi** : génération d'un document : rétrospective des impacts de l'année (chiffrés), compétences
  prouvées, benchmark salarial marché, argumentaire de négociation structuré. Rendu avec le
  `CareerOsBilan` renderer existant + export PDF.
- **C'est le moment** où l'abonnement se rentabilise visiblement → à mettre en avant dans le pricing.

### 3.3 Coach événementiel — **M (2-3 j)**
- Le coach réagit aux événements du journal : livrable validé → message de capitalisation ; 3 semaines
  sans impact → question ouverte ; nouvelle opportunité >85% match → alerte. Infrastructure : le
  journal (1.3) + le digest (2.2) + notifications in-app simples (table `Notification`, badge sidebar).

### 3.4 Dette technique différée
- Suite de tests élargie (Playwright e2e signup→paiement), logging structuré, abstraction multi-LLM +
  prompt caching, pagination dashboard (N+1 journey), suppression champ `streakDays`,
  brancher ou supprimer `careerInflections`/`longTermVision`/`careerAnchors`.

---

## Lecture stratégique

La V1 a un **excellent moteur d'acquisition** (onboarding Ikigai + bilan, vrai différenciateur) et un
**bon squelette de progression** (orchestrateur + gates). Ce qui manque est un **système nerveux** :
un flux d'événements de carrière qui alimente la boucle hebdomadaire, la mémoire du coach et les
moments payday. C'est l'investissement 1.3 (2 jours) qui débloque toute la suite — le faire en
pré-bêta, même si ses fruits arrivent en vague 2-3.
