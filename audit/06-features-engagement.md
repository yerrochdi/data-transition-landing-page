# NextMove — Features d'engagement : audit, tendances, propositions (mission CPO)

> Mission : CPO senior B2C CareerTech · psychologie de l'engagement (Hooked) × marché francophone
> de la transition data/IA. Trois phases : audit de l'existant → tendances sourcées → propositions.
>
> **Correction de cadrage** : le brief mentionnait Django REST Framework. Le stack réel est
> **Next.js 15 full-stack** (App Router, Server Actions, Route Handlers) + Prisma/PostgreSQL
> (Supabase) + Stripe + LLM Moonshot/Kimi + Vercel (crons). Toutes les dépendances techniques
> ci-dessous référencent ce stack réel.

---

## PHASE 1 — Cartographie factuelle de l'existant

> Source : exploration systématique du codebase (audits `01`-`05`, juin 2026) + Sprint 1 de
> stabilisation mergé. Le funnel décrit est celui **du code**, pas celui du pitch.

### 1.1 Features implémentées

| Feature | État | Fichiers concernés |
|---|---|---|
| Landing + funnel Founding Members (candidature → acceptation admin → activation → paiement 9€) | **Fonctionnel** | `app/(marketing)/home/`, `lib/founding-members/actions.ts`, `app/(marketing)/founding-activate/` |
| Auth (email + Google OAuth) | **Fonctionnel** | `lib/auth/actions.ts`, `app/(auth)/`, `lib/supabase/middleware.ts` |
| Onboarding 16 steps (Ikigai) : situation, LinkedIn, métier, formation, profil technique, usage IA, ambitions, compétences, motivation, freins, confiance, 4 modules Ikigai, préférences, bilan | **Fonctionnel** | `app/(onboarding)/onboarding/_components/` (17 composants), `lib/onboarding/types.ts` |
| Analyse LinkedIn (PDF → extraction + diagnostic narratif senior) | **Fonctionnel** | `app/api/onboarding/parse-linkedin/route.ts` |
| Reformulations IA "écoute active" (bulles après chaque step) | **Fonctionnel** | `ai-reformulation.tsx`, `lib/ai/prompts.ts` (`REFORMULATION_SYSTEM_PROMPT`) |
| Module Marché : données France Travail réelles + estimation salaire IA en fallback | **Fonctionnel** | `lib/ikigai/market.ts`, `lib/opportunities/france-travail.ts` |
| Bilan final consultant (800-1200 mots) + diagramme Ikigai + dataviz readiness | **Fonctionnel** | `buildSummaryPrompt`, `components/career-os/` (bilan-renderer, ikigai-diagram, bilan-header-stats, bilan-plan-timeline) |
| Orchestrateur "Next Best Action" (9 règles, gates, 1 action active/user) | **Fonctionnel** | `lib/orchestrator/` (recommendations, gates, templates, actions) |
| Parcours 5 phases + tâches + sessions IA (leçon → quiz → feedback) | **Fonctionnel** | `lib/dashboard/actions.ts`, `app/api/task-session/route.ts`, models `JourneyPhase/Task/Progress`, `TaskSession` |
| Livrables / briefs portfolio (13 briefs, validation, quotas par plan) | **Fonctionnel** | models `Deliverable/DeliverableBrief`, `app/(platform)/deliverables/` |
| Opportunités matchées (sync France Travail hebdo + scoring) | **Fonctionnel** | `lib/opportunities/`, cron `sync-opportunities` |
| Copilot conversationnel (contexte profil + action prioritaire injectés) | **Partiel** — pas de persistance : historique perdu au refresh (tables `AgentConversation/AgentMessage` existent, jamais écrites) | `app/api/chat/route.ts` |
| Stripe (checkout, webhook signé + idempotent, downgrade, 4 plans) | **Fonctionnel** — `invoice.payment_failed` non géré | `app/api/billing/webhook/route.ts`, `lib/billing/` |
| Emails transactionnels (bienvenue + bilan, founding, upgrade) | **Fonctionnel** | `lib/email/templates.ts`, Resend |
| Check-in mensuel par email (cron) | **Partiel** — l'email part, **les réponses ne sont ni collectées ni stockées** | `app/api/cron/career-os-checkin/route.ts` |
| Bilan public partageable (slug + toggle) | **Fonctionnel** | `career-os-public/[slug]`, champs `bilanIsPublic/bilanShareableSlug` |
| RGPD : suppression compte, pages légales, cookie consent CNIL | **Fonctionnel** (export de données absent) | `lib/settings/actions.ts`, `components/cookie-consent.tsx` |
| Interview prep par offre (pitch + Q&A + conseil salaire) | **Fonctionnel** | `lib/opportunities/actions.ts` (`generateInterviewPrep`) |
| Modules Career OS V1.5 (inflexions, vision long terme, ancres) | **Squelette** — champs Prisma posés (`careerInflections`, `longTermVision`, `careerAnchors`), **aucune UI** | `prisma/schema.prisma` |
| Gamification (streaks/XP) | **Morte** — supprimée volontairement, résidu `streakDays` dans le schéma | `prisma/schema.prisma` |
| Notifications in-app | **Absent** | — |
| Digest / relance hebdomadaire | **Absent** | — |
| Carnet d'impact / journal de victoires | **Absent** | — |
| Graphe de compétences à preuves | **Absent** (radar de compétences statique existant côté dashboard) | — |

### 1.2 Le funnel tel qu'il existe dans le code

```
Landing → Candidature Founding OU signup direct
  → Onboarding 16 steps (~20-25 min)         ← friction : longueur ; wow : bilan final
    → Dashboard : Next Best Action (1 action)
      → Diagnostic (phase 1, bloquante)
        → 1er livrable → Opportunités (gate : 1 livrable validé)
          → Livrables ambitieux / phases 2-5 (payant)
            → [FIN DE BOUCLE — plus rien ne ramène l'utilisateur]
```

### 1.3 Points de friction / d'abandon probables (dans le code)

1. **Longueur de l'onboarding** (16 steps, ~20-25 min) : le wow (bilan) n'arrive qu'à la fin ;
   aucune récompense intermédiaire majeure avant le step 6 (ambitions).
2. **Après le bilan, chute de tension** : la Next Best Action est utile mais froide ; rien ne
   programme le retour (aucun déclencheur externe hors check-in mensuel générique).
3. **Copilot amnésique** : toute conversation est perdue → déceptif dès la 2ᵉ session.
4. **Check-in mensuel sans boucle de retour** : questions posées, réponses perdues → signal envoyé
   à l'utilisateur que sa parole ne compte pas.
5. **Le rythme produit implicite est hebdomadaire** (livrables, sync opportunités le lundi) mais
   **aucune mécanique n'exploite ce rythme**.

### 1.4 Mécaniques d'engagement existantes (même embryonnaires)

- **Next Best Action** (orchestrateur) : réduit la charge cognitive, focalise. ✔ solide.
- **Gates de progression** : créent une structure de déblocage (diagnostic → livrable → opportunités). ✔
- **Readiness Score** : calculé à l'onboarding, affiché au dashboard — **statique** (ne bouge jamais ensuite). ✖
- **Check-in mensuel** : cadence existante mais boucle ouverte (pas de réponse collectée). ✖
- **Emails transactionnels** : uniquement réactifs (bienvenue, paiement). Aucun proactif récurrent. ✖
- **Bilan partageable public** : embryon de boucle sociale/preuve. Sous-exploité. ~

> **Hypothèse signalée** : les taux d'abandon par step de l'onboarding ne sont pas mesurables
> aujourd'hui (aucun event tracking par step). Les frictions §1.3 sont déduites de la structure du
> code, pas de données d'usage.

---

## PHASE 2 — Synthèse des tendances (sourcée, juin-juillet 2026)

> Fiabilité : **[A]** source officielle/tierce vérifiée · **[B]** auto-déclaré crédible · **[C]** non confirmé.
> Liste complète des sources en annexe (fin de document).

### Ce que font les acteurs de référence

- **BetterUp / CoachHub** : la rétention repose sur une **cadence contractuelle de sessions récurrentes**
  (2-4/mois, coach attitré) + un **assessment initial re-mesuré** pour matérialiser le progrès [A, S1].
  Seul chiffre d'efficacité à méthodologie tierce : Forrester TEI CoachHub 2022, ROI 260 % [B, S3].
  Leurs churn/rétention réels ne sont **pas publics** — ne pas benchmarker dessus.
- **Cohortes vs self-paced** : MOOC self-paced = **3,13 % de complétion** (edX, *Science* 2019 [A, S8])
  vs cohort-based 40-75 % (auto-déclaré Section/Maven [B/C, S9]). Les bootcamps FR (Le Wagon,
  DataScientest, Jedha) créditent tous le trio **cohorte + encadrement humain + projet fil rouge** ;
  leurs vrais chiffres (fiches RNCP) sont 15-30 pts sous leur marketing [A, S15/S16].
- **Pivot IA généralisé 2024-2025** : tous ont ajouté un coach IA (LinkedIn AI Coaching, CoachHub AIMY
  2.0 — 84 % continuent après personnalisation du coach [B, S6], BetterUp Grow, ProfAI). Reforge a
  même **retiré sa plateforme de learning** (sept. 2025) — le contenu seul ne retient plus [A, S11].

### Mécaniques d'engagement B2C : ce qui se transpose (et pas)

- **Le fait le plus solide de la recherche** : les interventions digitales **guidées par un humain**
  (ou perçu tel) ont des effets ~×2 vs non guidées (méta-analyses, Mohr 2011 « Supportive
  Accountability », Frontiers 2021 [A, S28/S29]). L'accountability envers un tiers bienveillant est
  LE mécanisme — pas les points.
- **Whoop** : le **rapport hebdomadaire du lundi**, conditionné à un minimum d'input de la semaine
  (« earned insight ») [A, S30]. Le pattern le plus directement transposable au rythme hebdo de NextMove.
- **Strava** : audience adulte engagée via kudos (reconnaissance sans compétition), clubs (petits
  groupes), et récap annuel narratif partageable ; le paywall du récap 2025 a provoqué un backlash
  documenté [A, S31/S32]. Positionnement gagnant : « l'app au service de la vie réelle » (2 min
  d'app / 1 h d'action).
- **Duolingo** : streaks quotidiens puissants (10 M+ d'utilisateurs à streak ≥ 1 an [A, S33]) mais
  **anxiété du streak documentée** et pratiques listées sur deceptive.design [A/B, S34]. Le streak
  quotidien ne se transpose pas à un rythme hebdo ; les leagues encore moins.
- **Hooked / Investment** : la valeur stockée (données, historique, réputation) crée le coût de
  sortie légitime — LinkedIn documenté par Eyal lui-même [B, S35]. Levier n°1 pour des cadres, zéro
  gamification nécessaire.
- **Gamification × âge** : l'âge n'affecte PAS les bénéfices perçus (Koivisto & Hamari 2014 [A, S26]) ;
  ce qui nuit : **badges + leaderboards** (baisse de motivation intrinsèque sur 16 semaines, Hanus &
  Fox 2015 [A, S27]) et le **novelty effect** (l'effet s'érode à l'usage). Effets réels mais petits
  (g≈0,36-0,49, Sailer & Homner 2020 [A, S25]).

### Marché français (le contexte qui cadre le pricing et la certification)

- **CPF en déclin pour notre usage** : reste à charge porté à **150 € (avr. 2026)** [A, S19], entrées
  **informatique -48 %** [A, S20], cadres = ~11-12 % des utilisateurs seulement [A, S21]. La voie
  CPF/RNCP est coûteuse en conformité et déclinante → **le co-paiement direct B2C des cadres est déjà
  un comportement observé** (~10 % des cadres paient au-delà de leurs droits [A/B, S21]).
- **Appétence de la cible** : 31 % des cadres ont un projet de reconversion (8 % seulement passent à
  l'acte — c'est l'écart que NextMove comble) [A, S22] ; **72 % des cadres veulent une formation IA
  (+12 pts vs 2024)** [A, S24] ; intérêt VAE 59 % → forte appétence de reconnaissance **formelle mais
  pas forcément diplômante** [A, S23].
- **Trou assumé** : chiffres primaires WEF/Gartner/McKinsey sur le reskilling IA non vérifiés
  (sources inaccessibles) — non cités.

**Traduction produit en une phrase** : la rétention de NextMove doit venir d'un **rituel hebdomadaire
à jour fixe** (Whoop), d'une **accountability perçue** (méta-analyses ×2), d'une **valeur stockée qui
compose** (Hooked/LinkedIn), de **petits groupes de pairs** (Strava/CBC) et d'une **re-mesure visible
du progrès** (BetterUp) — et surtout PAS de streaks quotidiens, leagues ou badges (Hanus & Fox).

---

## PHASE 3 — Propositions de features

> Efforts calibrés pour un fondateur solo à 20-25 h/semaine assisté de Claude Code :
> **S** < 1 j · **M** 1-3 j · **L** 4-8 j · **XL** > 8 j. Stack réel : Prisma + Server Actions +
> Route Handlers + crons Vercel. 💰 = augmente la consommation LLM (garde-fou proposé).

### 3.1 Tableau des features

| # | Nom | Cat | Mécanisme psychologique | Description | Impact | Effort | Dépendances techniques (stack réel) | Prio |
|---|---|---|---|---|---|---|---|
| 1 | **Le Point du Lundi** (rapport hebdo gagné) | A | Rituel à jour fixe + récompense variable (Whoop "earned insight") | Chaque lundi 8h : email + page in-app "votre semaine" — delta readiness, impacts loggés, 1 next action, 1 opportunité matchée. Le rapport est **riche si la semaine a été active**, minimal sinon (earned). 💰 1 génération/user/sem — plafonner à 1, cache. | 5 | M | Cron `app/api/cron/weekly-digest/` (copier `career-os-checkin`), `lib/email/templates.ts`, page `app/(platform)/semaine/`, `vercel.json` | **P0** |
| 2 | **Carnet d'impact** | A+C | Investissement qui compose + progrès visible (Hooked Investment) | 1-3 "impacts" loggés/semaine en 2 min (quoi/pour qui/résultat). L'IA reformule chaque impact en bullet de CV quantifié. Alimente CV, graphe de compétences, dossier annuel. 💰 ~200 tokens/impact — négligeable, cap 10/sem. | 5 | L | Model Prisma `ImpactEntry`, Server Action, `app/(platform)/impact/`, prompt `buildImpactPolishPrompt`, réutilise `AiReformulation`/`AiThinkingLoader` | **P0** |
| 3 | **Mémoire longitudinale du coach** | C | Supportive accountability (Mohr 2011, effet ×2) + stored value | Persister les conversations Copilot (tables déjà en place, jamais écrites) ; le coach cite les décisions/objectifs passés. Prérequis des engagements (#4). 💰 contexte plus long — cap aux 10 derniers messages + résumé. | 5 | M | `app/api/chat/route.ts` (écrire `AgentConversation/AgentMessage`), hydratation page copilot, `buildOrchestratorContext()` | **P0** |
| 4 | **Suivi d'engagements** | A | Accountability + cohérence personnelle (commitment/consistency) | Quand l'utilisateur dit "je ferai X cette semaine" au coach, l'engagement est extrait (prompt post-conversation, pas de tool-calling) et relancé au Point du Lundi : "Vous vous étiez engagé à X — où en êtes-vous ?". | 4 | M | Event `COMMITMENT_MADE` (enum `ActivityType`), post-traitement `app/api/chat`, injection dans le digest #1 | **P0** |
| 5 | **Readiness vivante** | B | Progrès visible / maîtrise (assessment → re-mesure, pattern BetterUp) | Le Readiness Score bouge à chaque événement (livrable validé, impact loggé, phase complétée) : delta affiché ("+4 pts cette semaine") + sparkline. Aujourd'hui le score est figé après l'onboarding. | 5 | M | Recalcul dans `lib/orchestrator/actions.ts`, snapshots `AnalyticsSnapshot` (table existante sous-utilisée), sparkline dashboard | **P0** |
| 6 | **Semaine N de votre transition** | A | Identité de programme + structure temporelle (pas un streak) | Numérotation visible des semaines depuis le début ("Semaine 12") + "rythme tenu : 4 semaines actives sur 6" formulé sans culpabilisation. Renforce le cadre "programme de transformation", à l'opposé du dashboard. | 3 | S | Champ dérivé de `User.createdAt` + événements, affichage header dashboard + digest | P1 |
| 7 | **Jalons de transformation** | B | Goal gradient + identité ("je deviens quelqu'un de nouveau") | 6-8 jalons nommés professionnellement : "Diagnostic posé" → "Première preuve au portfolio" → "Profil calibré marché" → "Prêt à candidater". Célébration sobre (pas de confettis), datée, historisée. | 4 | M | Model léger `Milestone` ou événements typés + règles de déblocage dans l'orchestrateur, UI timeline | P1 |
| 8 | **Timeline de transition** (journal de bord) | C | Endowment — rendre visible le capital accumulé | Vue chronologique de tout : décisions, impacts, livrables, jalons, conversations clés. "Votre historique de transformation" — quitter = perdre ce fil. Simple vue sur le journal d'événements. | 3 | S | Vue sur `Activity` étendue (le "journal d'événements" du plan `audit/05`), page `app/(platform)/timeline/` | P1 |
| 9 | **Graphe de compétences à preuves** | B+C | Maîtrise prouvée + stored value | Chaque compétence adossée à des preuves cliquables ("SQL — 2 livrables + 3 impacts"). Export CV/LinkedIn en 1 clic. Remplace le radar statique actuel par un actif vivant. | 4 | L | Model `SkillProof`, agrégation depuis `Deliverable`+`ImpactEntry`, refonte `skills-radar`, règles d'inférence + prompt de synthèse 💰 faible | P1 |
| 10 | **Dossier d'entretien annuel** (moment payday) | C | Investment payoff + aversion à la perte | Génère l'argumentaire d'augmentation : rétrospective chiffrée des impacts, compétences prouvées, benchmark salarial France Travail réel, plan de négociation. LE moment qui rentabilise l'abonnement. 💰 gros doc — réserver aux plans payants, 2/an max. | 5 | L | Réutilise `generateInterviewPrep` + `CareerOsBilan` renderer + `lib/ikigai/market.ts` + `ImpactEntry`, page + export | P1 |
| 11 | **Cohorte de pairs (8-12 cadres)** | A+C | Appartenance + accountability sociale (Strava clubs, complétion CBC 40-75 % vs 3 %) | V1 **concierge** : groupe WhatsApp/Slack animé à la main avec les 5 bêta (0 dev). V2 produit : espace cohorte in-app avec fil de victoires. Le réseau devient un coût de sortie. | 4 | S (concierge) / XL (produit) | V1 : aucun. V2 : models `Cohort`, `CohortMembership`, fil d'activité — ne construire QUE si la V1 concierge prouve l'usage | P1 (V1) / P2 (V2) |
| 12 | **Encouragements entre pairs** ("bravo" professionnel) | A | Reconnaissance non compétitive (kudos Strava — 14 Mds en 2025) | Sur les victoires partagées en cohorte : un "👏" nominatif, jamais de classement. Uniquement si cohortes produit (#11 V2) existent. | 3 | M | Dépend de #11 V2 — model `Kudos`, notifications in-app | P2 |
| 13 | **Trimestre de transition** (récap narratif) | B | Fierté rétrospective + boucle sociale (Year in Sport / Wrapped) | Tous les 3 mois : récap narratif et visuel (readiness gagné, impacts, compétences prouvées, moments clés) partageable LinkedIn. **Gratuit** — leçon du backlash paywall Strava 2025. 💰 1 génération/trimestre. | 4 | M | Cron trimestriel, template dataviz (réutilise composants bilan), page publique type `career-os-public` | P2 |
| 14 | **Attestation de compétences NextMove** | B | Reconnaissance formelle (VAE 59 % d'intérêt, APEC) sans lourdeur RNCP | Attestation vérifiable (URL publique) adossée aux preuves du portfolio, partage LinkedIn. PAS de voie CPF/RNCP à ce stade (reste à charge 150 €, informatique -48 %, conformité XL). | 3 | M | Page publique de vérification, PDF généré, s'appuie sur `SkillProof` (#9) | P2 |
| 15 | **Relance d'inactifs douce** | A | Réactivation par la valeur (jamais par la culpabilité) | Si 10+ jours sans événement : 1 email max "une opportunité à 87 % de match vous attend" (donnée réelle) — jamais "vous nous manquez". Flag anti-spam `lastNudgedAt`. | 3 | S | Cron quotidien, requête sur le journal d'événements, template email | P1 |

### 3.2 Top 3 quick wins (avant / pendant la bêta concierge de 5 membres)

**QW-A — Readiness vivante (#5) · ~10-14 h**
Le meilleur ratio impact/effort du tableau : transforme le score figé en preuve de progrès.
1. Étendre l'enum `ActivityType` (Prisma) : `IMPACT_LOGGED`, `DELIVERABLE_VALIDATED`, `PHASE_COMPLETED`, `COMMITMENT_MADE` (~1 h, migration).
2. Fonction `recomputeReadiness(userId)` dans `lib/orchestrator/` : recalcule le score depuis les événements + écrit un `AnalyticsSnapshot` (~4 h).
3. Brancher le recalcul sur les 3 points d'écriture existants (validation livrable, complétion tâche, complétion phase) (~2 h).
4. UI dashboard : delta "+X pts cette semaine" + sparkline 8 semaines depuis les snapshots (composant type `bilan-header-stats`) (~4 h).

**QW-B — Mémoire du coach (#3) · ~8-10 h**
Les tables existent déjà — c'est le quick win le plus rageant à ne pas faire.
1. Dans `app/api/chat/route.ts` : upsert `AgentConversation` + create 2 `AgentMessage` par échange (~3 h).
2. Hydratation : la page copilot charge les 10 derniers messages depuis la DB au lieu du state client (~2 h).
3. Injection d'un résumé de la conversation précédente dans le system prompt (garde-fou coût : résumé ≤ 300 tokens, généré 1 fois par conversation clôturée) (~3 h).

**QW-C — Le Point du Lundi en mode concierge (#1) · ~10-12 h**
Avec 5 bêta-testeurs, la boucle hebdo peut démarrer **avant** d'être totalement automatisée.
1. Cron Vercel lundi 7h30 (`app/api/cron/weekly-digest/`, copier le pattern `career-os-checkin` + `CRON_SECRET`) (~2 h).
2. Génération du contenu : delta readiness (depuis QW-A), next action (l'orchestrateur la calcule déjà), 1 opportunité matchée (le matching existe) (~4 h).
3. Template email Resend + version page in-app minimale (~4 h).
4. **Mode concierge** : pendant la bêta, le digest part en copie au fondateur qui peut ajouter 1 ligne personnelle par membre — c'est l'accountability humaine (effet ×2, Mohr 2011) à coût nul de dev.

> Total quick wins : **~30-36 h ≈ 1,5 semaine de capacité solo.** À la fin : le score bouge, le coach
> se souvient, et chaque lundi il se passe quelque chose. La boucle Hook minimale tourne.

### 3.3 Roadmap 6 mois

| Période | Jalons produit | Features | Objectif mesurable |
|---|---|---|---|
| **M0 (2 sem)** — Bêta concierge 5 membres | Quick wins QW-A/B/C + cohorte concierge WhatsApp (#11 V1) + relance douce (#15) | P0 : #1, #3, #5 (+ #15) | Les 5 membres reçoivent un Point du Lundi utile ; baseline de rétention W1 |
| **M1-M2** — Vers 30 membres (Founding) | Carnet d'impact (#2) puis engagements (#4) ; Semaine N (#6) | P0 : #2, #4 · P1 : #6 | **KPI nord : % de membres avec ≥1 impact loggé en semaine 2** (cible > 40 %) |
| **M3** — Consolidation | Jalons (#7) + Timeline (#8) ; instrumentation rétention W1/W2/W4 | P1 : #7, #8 | Rétention W4 mesurée ; décision GO/NO-GO sur les amplificateurs |
| **M4-M5** — Preuve & payday | Graphe de compétences (#9) puis Dossier annuel (#10) | P1 : #9, #10 | 1er dossier d'augmentation généré par un membre réel (story marketing) |
| **M6** — Amplification | Trimestre de transition (#13) ; cohortes produit (#11 V2) **seulement si** la V1 concierge a prouvé l'usage | P2 : #13, (#11 V2) | Récaps partagés sur LinkedIn = boucle d'acquisition organique |

**Règle de gouvernance** (du plan `audit/05`) : si < 15 % des membres loggent un impact en semaine 2,
on **arrête de construire** et on diagnostique la friction avant tout investissement P1/P2.

### 3.4 Anti-recommandations (à NE PAS implémenter)

1. **Streaks quotidiens & notifications de culpabilisation** — le rythme naturel du produit est
   hebdomadaire ; le streak quotidien produit de l'anxiété documentée (Duolingo sur deceptive.design,
   "streak creep" [S34]) et un churn violent à la rupture. Si régularité affichée : hebdomadaire,
   avec pauses légitimes intégrées (#6).
2. **Leagues / leaderboards compétitifs** — la seule donnée longitudinale sur audience étudiante/pro
   montre une **baisse** de motivation intrinsèque et de résultats (Hanus & Fox 2015 [S27]). Des
   cadres en transition ne veulent pas être classés entre eux sur leur reconversion.
3. **Badges décoratifs sans signification professionnelle** — novelty effect garanti (Koivisto &
   Hamari [S26]) et image infantilisante. Toute reconnaissance doit être un **artefact de carrière
   réutilisable** (preuve, attestation, jalon daté), pas une pastille.
4. **Rareté artificielle & faux compteurs** ("3 personnes regardent cette offre") — la cible est
   sceptique et la landing revendique la confiance ; toute mécanique de rareté doit rester adossée à
   des données réelles (ex. les vraies places Founding restantes, déjà en place).
5. **Paywall des moments émotionnels** (récap trimestriel, bilan) — leçon du backlash Strava Year in
   Sport 2025 [S32] : les moments de fierté sont des canaux d'acquisition (partage LinkedIn), pas des
   features premium. Monétiser le **payday** (#10), pas la fierté.
6. **Voie certification RNCP/CPF à court terme** — reste à charge 150 € (avr. 2026), formations
   informatique -48 %, conformité XL pour un solo [S19/S20]. L'appétence de reconnaissance des cadres
   se sert mieux par l'attestation à preuves (#14) et le co-paiement direct — comportement déjà
   observé chez ~10 % des cadres [S21].

### 3.5 Garde-fous transversaux

- **Coûts LLM** : les features 💰 (#1, #2, #3, #10, #13) sont plafonnées par design (1 digest/sem,
  10 impacts/sem, résumé de conversation ≤ 300 tokens, dossier annuel réservé payant). Prérequis
  recommandé avant M1 : tracking du spend par user (item B9 de `audit/02`, ~1 j).
- **Programme, pas dashboard** : chaque feature est formulée comme un **moment du programme** (le
  Point du Lundi, la Semaine N, les jalons) et non comme un écran de consultation passive. Test
  systématique avant build : "cette feature demande-t-elle une action qui fait avancer la
  transformation ?" Si non → rejet.

---

## Annexe — Sources

S1 Support BetterUp 2024-25 · S3 Forrester TEI/CoachHub 2022 (resources.coachhub.com) · S6 PRNewswire
2025 AIMY 2.0 · S8 Reich & Ruipérez-Valiente, *Science* 2019 (pubmed 30630920) · S9 TechCrunch 2021
Section4 · S11 reforge.com + Reforge KB 2025 · S15 Fiches RNCP France Compétences (38616, 35288,
38777) · S16 Le Wagon Files 2023 (substack) · S19 service-public.gouv.fr 2026 + décret 2026-234 ·
S20 DARES, Dares Résultats n°39, 2025 · S21 Caisse des Dépôts, bilan CPF 2024 (oct. 2025) · S22 APEC
« Reconversion professionnelle des cadres » 2022 · S23 Baromètre Centre Inffo/CSA 2025 · S24 APEC
« Les cadres et l'IA » 2025 · S25 Sailer & Homner 2020 (Educ. Psych. Review) · S26 Koivisto & Hamari
2014 (Computers in Human Behavior) · S27 Hanus & Fox 2015 (Computers & Education) · S28 Mohr et al.,
JMIR 2011 (pubmed 21393123) · S29 Frontiers in Psychology 2021 (guided vs unguided, g=0,76 vs 0,27) ·
S30 Whoop Weekly Performance Assessment (whoop.com/thelocker) · S31 Strava Press, Year in Sport 2025 ·
S32 TechRadar 2025 (paywall YIS) · S33 Duolingo Shareholder Letters Q2/Q3 FY2025 (SEC) · S34 The
Decision Lab, « Streak Creep » + deceptive.design · S35 Nir Eyal, nirandfar.com (Investment phase).

**Trous assumés** : chiffres primaires WEF/Gartner/McKinsey non vérifiés (403 pendant la recherche) ;
rétention réelle BetterUp/CoachHub/Whoop/Oura non publique ; complétion Reforge/Section/LinkedIn
Learning non publiée ; RCT Noom coached-vs-uncoached : protocole publié, résultats pas encore.
