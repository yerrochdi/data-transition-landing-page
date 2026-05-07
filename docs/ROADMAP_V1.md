# Roadmap NextMove V1 — 4 mois (16 semaines)

> Démarrage : 2026-05-06
> Lancement cible : 2026-08-31 (semaine S16)

## Vue d'ensemble

| Sprint | Semaines | Thème | Livrables clés |
|--------|----------|-------|----------------|
| **Sprint 1** | S1-S2 | Foundation commerciale | Locks Pattern B + page /roadmap + repricing + verticalisation |
| **Sprint 2** | S3-S5 | Job matching réel | France Travail API + scraping + scoring IA + explication |
| **Sprint 3** | S6-S8 | Livrables concrets | Briefs templates + correction IA + portfolio export |
| **Sprint 4** | S9-S12 | Network leverage | Upload CSV LinkedIn + matching IA + génération messages + tracker |
| **Sprint 5** | S13-S14 | Copilot proactif | Notifications, relances, suggestions quotidiennes |
| **Sprint 6** | S15 | Polish + tests | Responsive, edge cases, smoke tests bout en bout |
| **Sprint 7** | S16 | Lancement | Communication LinkedIn + onboarding 30 Founding Members |

---

## SPRINT 1 — Foundation commerciale (S1-S2)

### Objectifs
Verrouiller les fondations pricing/produit pour que le code des sprints suivants ait du sens.

### Tâches

**S1**
- [ ] **Pattern B locks** — teaser flouté sur les features payantes (parcours phases 2-5, opportunités au-dessus de Top 3, Feed)
  - Helper `getQuotas(state)` côté serveur
  - Composants UI réutilisables `<PaidFeatureGate>` et `<TeaserOverlay>`
  - Lock sur Phase 2-5 du parcours pour user FREE
  - Lock sur Top 3+ opportunités pour FREE/BOOST
- [ ] **Quota tracker** — comptage des sessions IA et messages Copilot du jour
  - Table Prisma `DailyUsage` (userId, date, sessionsCount, copilotCount)
  - Server actions `incrementUsage()` + `checkQuota()`
  - Hard cap anti-abus pour Pro (200 msg/j)

**S2**
- [ ] **Page /roadmap publique** — montrer Phase 2 et 3 en "Bientôt disponible"
- [ ] **Verticalisation Finance + Tech** — 2 parcours sectoriels distincts dans Phase 1
  - Refonte de l'onboarding pour proposer un secteur prioritaire
  - 2 sets de tâches/livrables différenciés
- [ ] **Structure objectif user** — au signup, 3 dimensions (type / horizon / indicateur) → stockées en DB
- [ ] **Repricing prep** — code prêt pour ajouter "Career OS annuel 490€/an" (sans le push public encore)

### Livrables Sprint 1
- ✅ Tout user FREE voit clairement ce qu'il rate
- ✅ Tout user payant a un parcours sectoriel adapté
- ✅ /roadmap publique cohérente avec le pitch Career OS

---

## SPRINT 2 — Job matching réel (S3-S5)

### Objectifs
Remplacer les "opportunités" générées par IA (fakes) par du job matching avec **vraies offres**.

### Tâches

**S3**
- [ ] **Intégration France Travail API**
  - Inscription développeur sur https://francetravail.io
  - Authentification OAuth client_credentials
  - Endpoint de récupération des offres data/IA (codes ROME M1801, M1802, M1810, M1811)
  - Stockage des offres en DB (table `RealOpportunity`)
- [ ] **Pipeline scraping** (LinkedIn / Welcome to the Jungle / Glassdoor)
  - À discuter : scraping côté serveur (Puppeteer + rotation proxies) OU agrégateur tiers (TheirStack, Adzuna)
  - Décision dépend du budget + risque légal accepté

**S4**
- [ ] **Scoring IA** — pour chaque offre × profil utilisateur, calculer un match score
  - Prompt Kimi : extraction skills offre + comparaison skills user + score 0-100
  - Stockage du score (matérialisé pour rapidité)
- [ ] **Explication IA du gap** — "87% match, mais SQL manquant"
  - Génération à la demande quand l'utilisateur clique sur l'offre
  - Cache 7 jours

**S5**
- [ ] **UI offres réelles** — refonte de `/opportunities`
  - Cartes avec score, badge "Offre vérifiée", source
  - Lien direct vers l'offre originale
  - Bouton "Préparer entretien" → ouvre un brief IA personnalisé (offre + CV user)
- [ ] **Préparation entretien IA**
  - Génération des 10 questions probables pour l'offre
  - Réponses suggérées basées sur le profil
  - Conseils de négociation salariale (Glassdoor data si possible)

### Livrables Sprint 2
- ✅ Au moins 100 vraies offres data/IA en base (France Travail + 2 sources scrapées)
- ✅ Scoring IA opérationnel pour chaque user
- ✅ Page `/opportunities` avec offres vérifiées + prep entretien

⚠️ **Risque principal** : France Travail API peut avoir des limites de rate. Plan B : démarrer avec scraping seul si l'API met du temps à activer.

---

## SPRINT 3 — Livrables concrets (S6-S8)

### Objectifs
Permettre à l'utilisateur de **piocher un brief à tout moment** (pas couplé au parcours) et de bâtir un portfolio LinkedIn dès la 1ère semaine.

### Architecture clé (décision 2026-05-07)
- Livrables = **micro-projets indépendants** du parcours (3-7 jours chacun)
- Catalogue de 30-50 briefs piochables à n'importe quel moment
- Portfolio dispo **dès le 1er livrable validé** (pas à la fin des 6 mois)
- L'IA Copilot suggère le bon brief au bon moment, mais sans bloquer

### Tâches

**S6**
- [ ] **Modèle Prisma `DeliverableBrief`** — les briefs du catalogue
  - title, description, sector (finance / tech / generic), skillCategory, difficulty,
    estimatedDays (3-7), templateUrl, evaluationCriteria (text), suggestedAtPhase (1-5, optionnel)
- [ ] **Modèle Prisma `Deliverable`** — la soumission user
  - userId, briefId, status (DRAFT / SUBMITTED / REVIEWED / VALIDATED), startedAt,
    submittedAt, reviewedAt, content (markdown ou fileUrl)
  - aiReview JSON : score, strengths[3], improvements[3], suggestion
  - isPublic (pour le portfolio public), shareableSlug
- [ ] **Seed 30 briefs** (15 finance + 15 tech) au lieu de 20 prévus

**S7**
- [ ] **UI page `/deliverables`** : catalogue
  - Filtres : compétence, secteur, difficulté, durée
  - Cards "Démarrer ce brief" + recommandation IA "Suggéré pour toi"
- [ ] **Page brief individuel** : description + critères + template téléchargeable
- [ ] **Éditeur de soumission** : upload fichier (Vercel Blob) ou markdown intégré
- [ ] **Correction IA** :
  - Prompt structuré (critères du brief + contenu soumis)
  - Output : score 0-100, 3 forts, 3 axes, suggestion concrète

**S8**
- [ ] **Page `/portfolio`** : liste des livrables validés (statut VALIDATED)
- [ ] **Export PDF** (puppeteer + template HTML branded)
- [ ] **Lien public partageable** (`/p/{shareableSlug}`) avec toggle privacy
- [ ] **Bouton "Partager sur LinkedIn"** : pré-rempli un post avec le lien
- [ ] **Quotas par plan** :
  - Free : 1 brief découverte
  - Boost : 5 briefs/mois
  - Pro / Founding / Sprint : illimité

### Livrables Sprint 3
- ✅ 30 briefs catalogue (finance + tech)
- ✅ Workflow complet : pioche → soumets → corrige IA → ajoute au portfolio (en 3-7 jours)
- ✅ Portfolio public partageable LinkedIn dès le 1er livrable validé
- ✅ Quotas pricing branchés

---

## SPRINT 4 — Network leverage LinkedIn (S9-S12)

### Objectifs
Le truc unique au marché. Ce qui fait dire "OK ça c'est différent".

### Tâches

**S9**
- [ ] **Page /network** + onboarding upload CSV
  - Instructions étape par étape pour l'export LinkedIn ("Settings → Get a copy of your data")
  - Upload UI avec parsing du CSV (LinkedIn génère un format avec : First Name, Last Name, URL, Email, Company, Position, Connected On)
  - Stockage des connexions en DB (`UserConnection`, anonymisé pour respect RGPD)
- [ ] **Modèle Prisma**
  - `UserConnection` (userId, firstName, lastName, linkedinUrl, company, position, connectedAt, importedAt)
  - `ConnectionMatch` (userId, connectionId, score, reason, suggestedAt)
  - `OutreachConversation` (userId, connectionId, status, lastMessageAt, messagesCount)

**S10**
- [ ] **IA matching de contacts**
  - Pour chaque utilisateur × ses connexions, calculer un score de pertinence
  - Critères : entreprise (cible secteur ?) / poste (data ? AI ? même métier que cible user ?) / parcours similaire
  - Top 50 contacts ranked
- [ ] **Page "Tes contacts à activer"**
  - Liste des top 50 avec score + raison ("Travaille chez Capgemini sur des sujets data, similaire à ta cible AI PM")
  - CTA "Générer un message d'approche"

**S11**
- [ ] **Génération de messages personnalisés**
  - Prompt IA : profil user + profil contact + objectif user → message LinkedIn naturel
  - Variations de ton (formel, amical, concis)
  - Editeur intégré pour ajuster avant envoi
  - Bouton "Copier" + lien direct vers le profil LinkedIn du contact

**S12**
- [ ] **Tracker de conversations**
  - L'utilisateur marque "Message envoyé" / "Réponse reçue" / "Call programmé"
  - Relances IA automatiques après 7 jours sans réponse
  - Dashboard "Pipeline réseau" avec stats (taux de réponse, conversations actives)
- [ ] **Suggestions d'actions hebdo**
  - "Cette semaine : contacte 3 personnes" basé sur l'objectif user
  - Notification email + push (si PWA configurée)

### Livrables Sprint 4
- ✅ Workflow complet : import CSV → matching IA → messages → tracker
- ✅ Dashboard réseau avec pipeline visible
- ✅ Suggestions hebdo proactives

⚠️ **Risque principal** : la qualité du matching dépend des données du CSV LinkedIn (pas de bio, pas de skills). Le scoring se fait sur title + company. Documenter les limites pour éviter les mauvaises surprises user.

---

## SPRINT 5 — Copilot proactif (S13-S14)

### Objectifs
Transformer le copilot d'un chatbot réactif en coach qui prend l'initiative.

### Tâches

**S13**
- [ ] **Système de suggestions quotidiennes**
  - Cron job quotidien (Vercel Cron) qui analyse pour chaque user actif :
    - Progression parcours (pas de tâche complétée depuis 3 jours ?)
    - Livrables (un brief en cours non soumis depuis 7 jours ?)
    - Réseau (top contact pas encore approché ?)
    - Opportunités (nouveau match >85% depuis hier ?)
  - Génération de 1-3 suggestions personnalisées
  - Stockage dans une table `DailyNudge` (userId, type, message, createdAt, dismissed)
- [ ] **UI dashboard "Suggestions du jour"**
  - Carte visible en haut du dashboard
  - Boutons d'action contextuels par suggestion

**S14**
- [ ] **Notifications email proactives**
  - Email matinal "Tes 3 actions du jour" pour Pro et Founding (opt-in dans settings)
  - Email hebdo "Ton récap" pour Boost
- [ ] **Relances intelligentes**
  - "Tu n'as pas terminé ton dashboard, qu'est-ce qui t'a bloqué ?" (si livrable en retard)
  - "Ce poste chez X match à 92%, je te prépare le dossier ?" (si nouvelle opportunité top match)

### Livrables Sprint 5
- ✅ Cron quotidien opérationnel
- ✅ Notifications email + UI suggestions intégrées
- ✅ Le copilot ne reste plus passif

---

## SPRINT 6 — Polish + tests (S15)

- [ ] **Tests responsive** sur 375px et 414px (iPhone)
- [ ] **Tests bout en bout** : signup → onboarding → diagnostic → première tâche → premier livrable → premier message réseau
- [ ] **Optimisation performances**
  - Lighthouse score >90 sur la home + dashboard
  - Bundle size analysis et lazy loading des features lourdes
- [ ] **Sentry + monitoring final**
  - Vérification que toutes les erreurs critiques remontent
  - Alertes Slack/email pour erreurs prod
- [ ] **Email transactionnels finaux**
  - Welcome email enrichi (premiers pas, lien vers diagnostic)
  - Email de confirmation Founding Member activation
  - Email de notification "Nouvelle offre top match"

---

## SPRINT 7 — Lancement (S16)

### Communication LinkedIn

- [ ] **Post de lancement** sur ton LinkedIn (audience 1000+ cadres)
  - Histoire personnelle + pitch Career OS + lien /founding-members
  - Cible : 30 Founding Members en 7 jours
- [ ] **Pages de partage social** : OG image personnalisée par parcours type
- [ ] **Template d'email** pour personnes de ton réseau direct (50-100 contacts les plus pertinents)

### Onboarding Founding Members

- [ ] **Process de validation des candidatures**
  - 1h/jour pour les 7 premiers jours pour relire et accepter
  - Email d'acceptation + activation Stripe 9€/mois
- [ ] **Onboarding 1:1 en visio** (30 min/founding)
  - Calendly setup
  - Template de questionnaire post-call ("Qu'est-ce qui te manque ? Sur quoi je dois pousser en V2 ?")

### Suivi post-lancement

- [ ] **Tableau de bord journalier** (4 premières semaines)
  - Nouveaux signups
  - Taux de conversion FREE → payant
  - NPS quotidien (1 question)
  - Feedback qualitatif des Founding Members

---

## Critères de réussite à 4 mois (post-lancement = mois 5)

| Métrique | Cible |
|----------|-------|
| Founding Members actifs | 30/30 (100%) |
| Total users payants | 100+ |
| ARR mensuel | 3-5k€/mois |
| Taux complétion Phase 1 | 60%+ |
| NPS | 50+ |
| Coût IA / user / mois | < 5€ |

## Plan B — points de pivot

### Si à S6 (mi-Sprint 2) le job matching est bloqué
- Coupe le scraping LinkedIn (trop risqué légalement) → garde France Travail seul
- Ajoute un agrégateur tiers (TheirStack, Adzuna) en backup

### Si à S10 (mi-Sprint 4) le matching network est trop faible en pertinence
- Réduit le scope à "Top 10 contacts" (plus qualitatif que quantitatif)
- Ajoute manuel : l'utilisateur peut tagger lui-même ses contacts importants

### Si à S15 le scope est trop ambitieux
1. Coupe Copilot proactif → version réactive simple
2. Coupe Phase 3 features (career radar, salary intelligence)
3. **Garde absolument** : Job matching + Network + Livrables

---

## Cadence de check-in

- **Vendredi soir hebdo** : revue de la semaine (ce qui a été fait, ce qui dérive, ajustement scope)
- **Fin de chaque Sprint** : démo + décision go/no-go pour Sprint suivant

## Note importante

Cette roadmap suppose **20-25h/semaine de dev** (le fondateur a confirmé pouvoir dégager du temps). Si la cadence ralentit (semaine à 10h ou moins), prévoir un ajustement de scope dès la semaine 4.
