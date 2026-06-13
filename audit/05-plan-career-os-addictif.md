# NextMove — Plan : corriger + rendre le Career OS ultra-addictif

> Suite logique de l'audit (`01` à `04`). Ce document est le **plan d'exécution** :
> d'abord stabiliser, puis construire le moteur de rétention.
>
> **Thèse centrale** : pour des cadres 35-50 ans, l'addiction ne vient PAS de la gamification
> (badges, streaks, points — ça ferait cheap et les ferait fuir). Elle vient de **trois leviers
> profonds** :
> 1. **Le progrès visible** — voir sa readiness/ses preuves monter quand on agit (dopamine de maîtrise).
> 2. **L'investissement qui compose** — chaque donnée ajoutée rend SON bilan, SON CV, SON dossier
>    d'augmentation meilleurs. Plus tu mets, plus tu as à perdre en partant. C'est le moat ET l'addiction.
> 3. **Le soulagement de l'anxiété** — "est-ce que je progresse ou je stagne ?" est l'angoisse #1 de
>    la cible. Un coach qui se souvient et qui relance transforme cette angoisse en rituel rassurant.

---

## La boucle (modèle Hook appliqué à un Career OS)

```
  DÉCLENCHEUR              ACTION              RÉCOMPENSE VARIABLE         INVESTISSEMENT
  (externe → interne)      (< 2 min)           (3 types)                   (qui compose)
  ─────────────────        ─────────           ──────────────────          ──────────────
  Digest hebdo lundi   →   Logger 1 impact  →  • Maîtrise : readiness  →   Le CV/bilan/dossier
  puis : "ai-je          + voir la next         monte, skill prouvé        annuel s'enrichit.
  progressé cette          action            • Chasse : nouvelle         Partir = tout perdre.
  semaine ?"             + parler au coach     opportunité matchée
                                              • Tribu : vs pairs anon.
```

Le génie d'un Career OS : **l'investissement est naturel**. Chaque impact loggé = un bullet de CV
quantifié de plus, une preuve de compétence de plus, une ligne de l'argumentaire d'augmentation de
l'année. L'utilisateur ne "joue" pas — il **capitalise**. C'est ça qui crée le retour hebdomadaire
sans manipulation.

---

## PARTIE 1 — Stabiliser (semaine 1, ~3 jours) — prérequis non négociable

On ne construit pas l'addiction sur du sable. Les bloquants critiques de `02-bloquants-beta.md` :

| # | Quoi | Effort | Pourquoi c'est prioritaire |
|---|---|---|---|
| B1 | Virement SEPA Stripe (solde négatif) | S (humain) | Aucun paiement ne passe sinon |
| B3 | Quota 20 IA/jour → 60 + exclure reformulations | S | **Casse l'onboarding** en plein milieu |
| B2 | Rate limit `/parse-linkedin` | S | Seul endpoint LLM sans plafond = risque coûts |
| B4 | Supprimer `/api/admin/set-my-plan` | S | Surface d'attaque inutile |
| QW1 | Sauvegarde locale des réponses Ikigai | S | Un refresh perd 10 min de réflexion intime |
| B5 | Cookie consent CNIL | M | Conformité légale produit FR payant |

**Sortie de la Partie 1** : tu peux inviter les Founding Members sans honte ni risque.

---

## PARTIE 2 — Le système nerveux (la fondation qui débloque tout)

> **L'investissement le plus rentable du projet.** ~2-3 jours. Sans lui, toutes les features de
> rétention re-collectent la même donnée. Avec lui, elles deviennent des **vues** sur un même flux.

### 2.1 — Le journal d'événements de carrière
Généraliser la table `Activity` en flux typé. Chaque action significative devient un événement :
`IMPACT_LOGGED`, `COMMITMENT_MADE`, `WIN_DECLARED`, `CHECKIN_ANSWERED`, `DELIVERABLE_VALIDATED`,
`PHASE_COMPLETED`, `OPPORTUNITY_SAVED`.

- **Modèle** : enum `ActivityType` étendu + `metadata` JSON. Pas de nouvelle table.
- **Fichiers** : `prisma/schema.prisma`, `lib/orchestrator/actions.ts`, `app/api/chat/route.ts`.

### 2.2 — La readiness devient vivante
Aujourd'hui le `readinessScore` est calculé une fois et figé. Il doit **bouger visiblement** à chaque
événement. C'est le cœur du levier "progrès visible".

- Recalcul à chaque événement + stockage d'un `AnalyticsSnapshot` (la table existe déjà, sous-utilisée).
- Le dashboard affiche **la variation** : "+4 points cette semaine" avec une micro-courbe.
- **Fichiers** : `lib/dashboard/`, composant readiness existant, `AnalyticsSnapshot`.

### 2.3 — Mémoire du coach (persistance Copilot)
Les tables `AgentConversation`/`AgentMessage` existent mais ne sont jamais écrites. Le coach est
amnésique. On persiste + on réinjecte l'historique + les engagements ouverts.

- **Fichiers** : `app/api/chat/route.ts` (persistance + hydratation), `buildOrchestratorContext()`.

---

## PARTIE 3 — Les 3 mécaniques addictives (dans l'ordre d'impact)

### 3.1 — LE CARNET D'IMPACT (la mécanique #1) — L, ~4-5 j
**C'est LA feature qui crée le retour hebdomadaire.**

- **Le geste** : chaque semaine, logger 1-3 "impacts" en 2 min (quoi / pour qui / résultat).
- **La magie** : le coach IA reformule chaque impact en **bullet de CV quantifié**
  (réutilise le pattern reformulation déjà construit). *"J'ai aidé l'équipe sur le reporting"* devient
  *"Industrialisé le reporting mensuel de l'équipe finance (-40% de temps de production)"*.
- **L'addiction** : l'utilisateur voit son CV se construire tout seul, semaine après semaine. Il
  **revient pour ne pas perdre le fil**. Chaque impact = une preuve dans le graphe de compétences +
  une ligne du futur dossier d'augmentation. L'investissement compose.
- **Modèle** : table `ImpactEntry` (userId, date, rawText, aiPolished, skillTags[], proofUrl?).
- **UI** : section sidebar "Carnet d'impact" → timeline verticale + bouton "+ Ajouter".
- **Pourquoi ça marche sur des cadres** : ce n'est pas un jeu, c'est une **assurance carrière**. Ils
  notent déjà leurs réussites quelque part (ou les oublient et galèrent à l'entretien annuel). On
  capture ce besoin réel.

### 3.2 — LE DIGEST HEBDO + COACH PROACTIF (le déclencheur) — M, ~3 j
**Sans déclencheur externe, la boucle ne démarre jamais.** Le digest crée l'habitude, puis devient un
déclencheur interne ("on est lundi, où j'en suis ?").

- **Cron lundi 8h** : "Votre semaine NextMove" = impacts loggés + variation de readiness + 1 next
  action (l'orchestrateur la calcule déjà) + 1 opportunité matchée.
- **Variable reward** : le contenu change chaque semaine (nouvelle opportunité, score qui bouge) → on
  ouvre par curiosité, pas par devoir.
- **Relance douce si 0 impact** : *"2 minutes pour noter une victoire de la semaine ?"*.
- **Engagements** : quand l'utilisateur dit au coach *"je ferai X"*, on l'enregistre. Le digest et le
  coach relancent : *"Vous vous étiez engagé à X — où en êtes-vous ?"* → accountability = rétention.
- **Infra** : pattern cron existant (`vercel.json` + `CRON_SECRET`), copier `career-os-checkin`.

### 3.3 — LE MOMENT PAYDAY (la justification de l'abonnement) — L, ~4-5 j
**Le gros shoot de récompense qui rentabilise visiblement l'abonnement.**

- **Le dossier d'entretien annuel / argumentaire d'augmentation** : génère un document à partir de
  6-12 mois d'`ImpactEntry` : rétrospective chiffrée de l'année + compétences prouvées + benchmark
  salarial marché (France Travail, déjà intégré) + argumentaire de négociation structuré.
- **Réutilise** : `generateInterviewPrep()` (existe pour une offre), le `CareerOsBilan` renderer, les
  données marché. C'est de l'assemblage, pas du neuf.
- **L'addiction rétroactive** : ce moment justifie tous les impacts loggés pendant l'année. La première
  fois qu'un utilisateur génère son dossier et obtient son augmentation → ambassadeur à vie. C'est
  l'histoire qu'on raconte dans le pricing.

---

## PARTIE 4 — Amplificateurs (après que la boucle tourne)

À ne faire QUE quand 3.1-3.3 sont en place et que la boucle hebdo est mesurée :

- **Graphe de compétences à preuves** (`SkillProof`) — la collection mechanic : chaque skill avec ses
  preuves cliquables ("SQL — prouvé par 2 livrables + 3 impacts"). Export CV/LinkedIn en 1 clic.
- **Comparaison aux pairs anonymisés** (reward of the tribe) — "les cadres avec votre profil ont en
  moyenne loggé 8 impacts ce trimestre". Attention : honnête, jamais culpabilisant.
- **Notifications in-app** (table `Notification` + badge sidebar) — opportunité >85% match, palier de
  readiness franchi, engagement arrivé à échéance.
- **Onboarding : raccourcir le time-to-wow** — aujourd'hui le bilan arrive après 16 steps (~20 min).
  Tester un "pré-bilan" partiel dès le step 6 (après LinkedIn + ambitions) pour donner un premier shoot
  plus tôt, le bilan complet restant la récompense de fin.

---

## Séquencement recommandé (6-8 semaines)

| Sprint | Durée | Contenu | Objectif mesurable |
|---|---|---|---|
| **S1 — Stabiliser** | 3-4 j | Partie 1 (bloquants B1-B5 + QW1) | Inviter les Founding Members sans risque |
| **S2 — Système nerveux** | 3 j | Partie 2 (journal + readiness vivante + mémoire coach) | Chaque action produit un événement tracé |
| **S3 — Carnet d'impact** | 5 j | 3.1 | Un utilisateur peut logger et voir son CV se construire |
| **S4 — Boucle hebdo** | 3 j | 3.2 (digest + engagements) | Le déclencheur hebdomadaire tourne |
| **S5 — Mesure & itération** | 1 sem | Observer la bêta : % qui reviennent S2, S3, S4 | **Rétention W1/W2/W4** = le KPI nord |
| **S6 — Payday** | 5 j | 3.3 (dossier annuel) | Premier dossier d'augmentation généré |
| **S7+ — Amplificateurs** | continu | Partie 4 selon les données de rétention | — |

---

## Le KPI qui compte

Tout ce plan vise **une seule métrique** : la **rétention hebdomadaire** (% d'utilisateurs actifs qui
reviennent semaine N+1, N+2, N+4). Si après la bêta, 40%+ des Founding Members loggent un impact en
semaine 2, la boucle fonctionne et on amplifie. Si c'est <15%, on ne construit pas plus — on
diagnostique pourquoi le geste hebdo ne prend pas (friction ? valeur pas assez visible ? mauvais
déclencheur ?) avant d'investir dans la Partie 4.

**Ne pas confondre activité et addiction** : 50 features ne retiennent pas. UNE boucle qui tourne, oui.

---

## Anti-patterns à refuser explicitement

- ❌ Streaks de connexion / "ne brisez pas votre série" → culpabilisant, cheap, fait fuir les cadres.
- ❌ Points/badges/niveaux décoratifs sans valeur réelle.
- ❌ Notifications de rétention manipulatrices ("3 personnes ont vu votre profil !").
- ❌ Fausse urgence / FOMO artificiel.
- ✅ À la place : progrès réel visible, données qui composent, coach qui se souvient, soulagement de
  l'anxiété de carrière. L'addiction par la **valeur**, pas par la **manipulation**. Sur cette cible,
  c'est aussi le seul qui tient dans la durée.
```
