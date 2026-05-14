/**
 * Seed the 8 additional DeliverableBriefs (catalogue 5 → 13).
 *
 * Run with:  npx tsx prisma/seed-briefs-extra.ts
 *
 * Mix: 4 Finance/Assurance + 4 Tech/Conseil, spread across difficulty
 * 2-4 and both submission modes. Idempotent (upsert by slug) — safe to
 * re-run.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const briefs = [
  // ───────────────────── FINANCE × 4 ─────────────────────
  {
    slug: "finance-insurance-kpi-dashboard",
    title: "Tableau de bord KPIs assurance",
    sector: "finance",
    skillCategory: "data-viz",
    difficulty: 3,
    estimatedDays: 5,
    suggestedAtPhase: 3,
    isPremium: false,
    useFromProfile: false,
    submissionMode: "LINK_REQUIRED" as const,
    tools: ["Power BI ou Looker Studio", "Excel / Google Sheets"],
    templateUrl: "https://github.com/nextmove-ai/templates-insurance-dashboard",
    shortDescription:
      "Construire un dashboard de pilotage assurance : sinistralité, ratio combiné, évolution du portefeuille.",
    fullBrief: `## Contexte

Tu es manager dans une compagnie d'assurance. Le COMEX te demande un dashboard unique qui montre la santé technique du portefeuille : est-ce qu'on gagne de l'argent sur nos contrats ?

## Dataset

Le template fournit un CSV synthétique : \`police_id, branche, prime_acquise, sinistres_payes, frais_gestion, date_souscription, statut\`.

## Livrable attendu

Un **dashboard interactif** (Power BI .pbix ou Looker Studio public) avec :

### Page 1 — Vue COMEX
- Ratio combiné global (sinistres + frais / primes) — le KPI roi
- Ratio S/P (sinistres / primes) et ratio de frais séparés
- Prime acquise totale vs N-1
- Code couleur : ratio combiné < 100% = rentable (vert), > 100% = perte (rouge)

### Page 2 — Par branche
- Ratio combiné par branche (auto, habitation, santé, RC pro…)
- Identifier la branche la plus déficitaire
- Évolution mensuelle de la sinistralité

### Page 3 — Portefeuille
- Nombre de polices actives / résiliées
- Taux de résiliation (churn)
- Ancienneté moyenne du portefeuille

### Onglet Insights
- 1 texte : quelle branche redresser en priorité et 1 levier (repricing, sélection des risques, maîtrise des frais)

## Format

- Fichier .pbix OU lien Looker Studio public
- 1 screenshot hero (PNG)
- README 10 lignes : sources, calculs des ratios, hypothèses`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Pertinence métier** — Le ratio combiné est-il bien calculé et mis en avant ? Tu mesures la vraie rentabilité technique ?
2. **Lisibilité COMEX** — Un dirigeant comprend la santé du portefeuille en 30 secondes ?
3. **Granularité** — La vue par branche permet-elle d'identifier où agir ?
4. **Insight final** — La reco est-elle chiffrée et liée à un levier actionnable ?
5. **Présentation portfolio** — README clair, visuel hero, calculs documentés.

**Bonus :** projection du ratio combiné à fin d'année, ou analyse de la saisonnalité des sinistres.`,
  },
  {
    slug: "finance-datawarehouse-scoping-note",
    title: "Note de cadrage : migration vers un data warehouse",
    sector: "finance",
    skillCategory: "analysis",
    difficulty: 3,
    estimatedDays: 4,
    suggestedAtPhase: 2,
    isPremium: false,
    useFromProfile: true,
    submissionMode: "TEXT_ONLY" as const,
    tools: ["Notion ou Google Docs", "Excalidraw (schéma)"],
    templateUrl: "https://www.notion.so/templates/nextmove-datawarehouse-scoping",
    shortDescription:
      "Rédiger une note de cadrage de 2 pages pour convaincre ta direction d'investir dans un data warehouse.",
    fullBrief: `## Contexte

Dans ta boîte (banque, assurance, asset manager), les données sont éparpillées : Excel partout, des exports manuels, pas de source de vérité. Tu dois écrire **une note de cadrage de 2 pages max** pour convaincre ton COMEX d'investir dans un data warehouse moderne.

## Livrable attendu

**Une note structurée** (2 pages A4 max) :

### 1. Le problème actuel (½ page)
- 3 douleurs concrètes du quotidien (ex : "le reporting réglementaire prend 5 jours/mois en manuel")
- Le coût caché : temps perdu, erreurs, décisions retardées
- Pourquoi ça ne tient plus à l'échelle

### 2. La cible proposée (½ page)
- Qu'est-ce qu'un data warehouse, en 3 phrases pour un non-technique
- Architecture cible simplifiée : sources → ingestion → DWH → BI
- Choix d'outils plausibles (Snowflake / BigQuery, dbt, un outil BI)

### 3. Bénéfices attendus (¼ page)
- 3 bénéfices chiffrables ou observables
- Lien direct avec un enjeu métier (conformité, time-to-decision, fiabilité)

### 4. Plan & budget (½ page)
- Phasage en 3 étapes (POC → MVP → généralisation)
- Ordre de grandeur budget + équipe nécessaire
- Risques principaux + mitigation

### 5. Recommandation (¼ page)
- Ta reco claire : on lance le POC sur tel périmètre, tel budget, tel délai

## Règles dures

- 2 pages MAX — un COMEX ne lit pas plus
- Ton de cadre, pas de jargon IT gratuit
- Chiffres vraisemblables et sourcés quand possible
- Tu écris LE document final, pas un plan de document`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Cadrage du problème** — Les douleurs sont-elles concrètes, quantifiées, crédibles ?
2. **Clarté de la cible** — Un non-technique comprend ce qu'on propose et pourquoi ?
3. **Business case** — Les bénéfices sont-ils liés à de vrais enjeux métier ?
4. **Réalisme du plan** — Phasage, budget, risques : est-ce que ça tient la route ?
5. **Forme & concision** — 2 pages, ton COMEX, structure limpide.

**Bonus :** un comparatif rapide de 2 options d'architecture, ou un quick-win identifié pour la phase POC.`,
  },
  {
    slug: "finance-client-churn-analysis",
    title: "Analyse de churn : portefeuille clients",
    sector: "finance",
    skillCategory: "analysis",
    difficulty: 3,
    estimatedDays: 6,
    suggestedAtPhase: 3,
    isPremium: false,
    useFromProfile: false,
    submissionMode: "LINK_REQUIRED" as const,
    tools: ["Python (Pandas)", "Jupyter Notebook", "Matplotlib / Seaborn"],
    templateUrl: "https://github.com/nextmove-ai/templates-churn-analysis",
    shortDescription:
      "Identifier les segments clients à risque de départ sur un portefeuille banque/assurance et proposer un plan de rétention.",
    fullBrief: `## Contexte

Tu travailles dans une banque retail ou une assurance. La direction commerciale perd des clients sans comprendre pourquoi. On te demande une analyse de churn : **qui part, et que faire ?**

## Dataset

Le template fournit un CSV de ~20k clients : \`client_id, anciennete_mois, nb_produits, solde_moyen, nb_contacts_sav, derniere_interaction_jours, a_churn (0/1)\`.

## Livrable attendu

Un **notebook Jupyter commenté en français** :

### 1. Cadrage
- Définition du churn retenue
- Taux de churn global du portefeuille
- Avertissement sur les biais éventuels du dataset

### 2. Analyse exploratoire
- Taux de churn croisé avec chaque variable (ancienneté, nb produits, solde, contacts SAV…)
- 1 graphique propre par variable explicative
- Identification des 3 variables les plus corrélées au départ

### 3. Segmentation à risque
- Construire 3-4 segments clients (ex : "nouveaux mono-produit", "anciens multi-produits insatisfaits")
- Pour chaque segment : taille, taux de churn, valeur

### 4. Plan de rétention
- Pour les 2 segments les plus critiques : 1 action de rétention concrète chacun
- Estimation de l'impact (combien de clients sauvés, quelle valeur)

## Format

- Notebook .ipynb propre (pas de cellules mortes)
- Export PDF
- README 5 lignes`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Rigueur méthodo** — Définition du churn claire, pas de data leak, biais mentionnés.
2. **Qualité de l'exploration** — Les croisements sont-ils pertinents ? Les graphiques lisibles ?
3. **Segmentation** — Les segments sont-ils actionnables et bien caractérisés ?
4. **Plan de rétention** — Les actions sont-elles concrètes, chiffrées, réalistes ?
5. **Reproductibilité & forme** — Notebook qui tourne end-to-end, README clair.

**Bonus :** un modèle prédictif simple (régression logistique) avec interprétation des coefficients, ou une matrice valeur/risque des segments.`,
  },
  {
    slug: "finance-ai-codir-pitch-deck",
    title: "Pitch deck : projet IA pour le CODIR",
    sector: "finance",
    skillCategory: "ai-usecase",
    difficulty: 2,
    estimatedDays: 3,
    suggestedAtPhase: 2,
    isPremium: false,
    useFromProfile: true,
    submissionMode: "TEXT_ONLY" as const,
    tools: ["Notion / Google Slides / Canva"],
    templateUrl: "https://www.notion.so/templates/nextmove-ai-pitch-deck",
    shortDescription:
      "Construire un pitch deck de 6 slides pour vendre un projet IA à ton CODIR — basé sur ton secteur réel.",
    fullBrief: `## Contexte

Ton CODIR t'a donné 10 minutes pour pitcher un projet IA. Tu dois produire **un deck de 6 slides** maximum, percutant, qui donne envie de financer.

Le sujet du projet IA est **libre** mais doit être ancré dans TON secteur et TON expérience (réutilise ce que NextMove sait de ton profil).

## Livrable attendu

**6 slides** (le contenu texte de chaque slide, format markdown) :

### Slide 1 — Le problème
- 1 phrase choc + 1 chiffre qui pique
- Pourquoi c'est urgent maintenant

### Slide 2 — La solution IA
- Ce qu'on construit, en 1 phrase non-technique
- Comment ça marche, en 3 bullets max

### Slide 3 — La valeur
- 3 bénéfices, dont au moins 1 chiffré (€ ou temps gagné)
- À qui ça profite (clients, équipes, direction)

### Slide 4 — La preuve / le précédent
- 1 exemple d'une boîte comparable qui l'a fait
- Ou 1 mini-POC / quick win réalisable en 1 mois

### Slide 5 — Le plan
- 3 jalons sur 6 mois
- Équipe + budget (ordre de grandeur)
- 1 risque + sa mitigation

### Slide 6 — L'ask
- Ce que tu demandes concrètement au CODIR (budget, GO/NO-GO, sponsor)
- 1 phrase de conclusion qui claque

## Règles dures

- 6 slides MAX, le contenu de chaque slide tient en ½ écran
- Pas de slide "agenda", pas de slide "merci"
- Chaque slide a UN message, pas trois
- Ton de cadre qui sait vendre, pas de hype IA creuse`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Accroche** — Le problème est-il urgent, chiffré, ancré dans ton secteur ?
2. **Clarté de la solution** — Un dirigeant comprend ce que tu proposes sans jargon ?
3. **Business case** — La valeur est-elle crédible et au moins partiellement chiffrée ?
4. **Crédibilité du plan** — Jalons, budget, risque : est-ce exécutable ?
5. **Force de l'ask** — La demande finale est-elle claire et donne-t-elle envie de dire oui ?

**Bonus :** un slide d'annexe avec le calcul du ROI, ou une objection anticipée et sa réponse.`,
  },

  // ───────────────────── TECH × 4 ─────────────────────
  {
    slug: "tech-data-maturity-audit",
    title: "Audit data d'une équipe produit",
    sector: "tech",
    skillCategory: "analysis",
    difficulty: 2,
    estimatedDays: 4,
    suggestedAtPhase: 2,
    isPremium: false,
    useFromProfile: true,
    submissionMode: "TEXT_ONLY" as const,
    tools: ["Notion ou Google Docs"],
    templateUrl: "https://www.notion.so/templates/nextmove-data-maturity-audit",
    shortDescription:
      "Réaliser un audit de maturité data d'une équipe produit et livrer un diagnostic + 3 recommandations priorisées.",
    fullBrief: `## Contexte

Tu es Product Manager ou consultant. On te demande d'auditer la maturité data d'une équipe produit (la tienne, ou une équipe fictive plausible) et de livrer un diagnostic actionnable.

## Livrable attendu

**Un document d'audit** (2-3 pages) structuré :

### 1. Périmètre & méthode
- Quelle équipe, quel produit
- Comment tu as évalué (entretiens, observation, revue d'outils)

### 2. Grille de maturité — 5 dimensions notées /5
- **Collecte** : les bons events sont-ils trackés ?
- **Accès** : qui peut requêter la donnée, avec quels outils ?
- **Culture** : les décisions sont-elles vraiment data-driven ?
- **Qualité** : la donnée est-elle fiable, documentée ?
- **Impact** : la data change-t-elle vraiment les décisions produit ?

Pour chaque dimension : note /5 + 2-3 lignes de justification

### 3. Diagnostic global
- Score moyen + niveau de maturité (débutant / en construction / avancé)
- La force principale et la faiblesse principale

### 4. 3 recommandations priorisées
- Chacune : quoi faire, pourquoi, effort estimé, impact attendu
- Classées par ratio impact/effort

## Format

- 2-3 pages, structure claire
- La grille de maturité en tableau visuel
- Ton de consultant : factuel, pas complaisant`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Méthode** — L'approche d'audit est-elle structurée et crédible ?
2. **Grille de maturité** — Les 5 dimensions sont-elles bien évaluées, justifiées ?
3. **Diagnostic** — La synthèse est-elle honnête, claire, sans complaisance ?
4. **Recommandations** — Sont-elles concrètes, priorisées par impact/effort ?
5. **Forme** — Document lisible, grille visuelle, ton de consultant.

**Bonus :** une roadmap à 6 mois découlant des recos, ou un benchmark vs une équipe "data-mature" type.`,
  },
  {
    slug: "tech-etl-pipeline-documented",
    title: "Pipeline ETL documenté",
    sector: "tech",
    skillCategory: "data-engineering",
    difficulty: 4,
    estimatedDays: 7,
    suggestedAtPhase: 4,
    isPremium: true,
    useFromProfile: false,
    submissionMode: "LINK_REQUIRED" as const,
    tools: ["Python", "pandas / SQL", "un scheduler (cron, Airflow light, ou Make)", "GitHub"],
    templateUrl: "https://github.com/nextmove-ai/templates-etl-pipeline",
    shortDescription:
      "Construire un pipeline ETL fonctionnel et documenté : extraction d'une source, transformation, chargement, planification.",
    fullBrief: `## Contexte

Tu veux prouver que tu sais construire un pipeline de données de bout en bout — la compétence socle d'un profil data-augmenté côté technique.

## Livrable attendu

**Un repo GitHub public** avec :

### 1. Extraction
- Récupération de données depuis au moins 1 source réelle : une API publique, un CSV distant, ou un scraping léger légal
- Gestion des erreurs (source indisponible, format inattendu)

### 2. Transformation
- Nettoyage, normalisation, jointures, agrégations
- Au moins 3 transformations métier documentées (pourquoi, pas juste comment)

### 3. Chargement
- Écriture dans une destination : SQLite, Postgres, ou un fichier Parquet propre
- Idempotence : relancer le pipeline ne duplique pas les données

### 4. Planification
- Le pipeline peut tourner de façon planifiée (cron, Airflow light, ou Make)
- 1 log clair de chaque run

### 5. Documentation
- README : schéma du pipeline (sources → transfo → destination), comment lancer, dépendances
- 1 schéma visuel (Excalidraw, draw.io)

## Format

- Repo GitHub public, README soigné
- requirements.txt fonctionnel
- 1 schéma d'architecture dans le README
- Mention claire des limites (pas production-grade, c'est un POC)`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Extraction** — Source réelle, gestion d'erreurs présente ?
2. **Transformation** — Les transfos sont-elles documentées et justifiées métier ?
3. **Chargement & idempotence** — Le pipeline est-il rejouable sans dupliquer ?
4. **Planification** — Le scheduling fonctionne, les logs sont exploitables ?
5. **Documentation** — Un dev clone et lance en <15 min ? Schéma clair ?

**Bonus :** tests automatisés sur les transformations, ou data quality checks (Great Expectations, assertions).`,
  },
  {
    slug: "tech-ab-test-design-analysis",
    title: "A/B test : design + analyse",
    sector: "tech",
    skillCategory: "analysis",
    difficulty: 3,
    estimatedDays: 5,
    suggestedAtPhase: 3,
    isPremium: false,
    useFromProfile: false,
    submissionMode: "LINK_REQUIRED" as const,
    tools: ["Python (pandas, scipy/statsmodels)", "Jupyter Notebook"],
    templateUrl: "https://github.com/nextmove-ai/templates-ab-test",
    shortDescription:
      "Concevoir un protocole d'A/B test rigoureux et analyser un jeu de résultats : significativité, recommandation produit.",
    fullBrief: `## Contexte

Tu es PM ou analyste dans une boîte tech. L'équipe veut tester une nouvelle feature mais ne sait pas concevoir ni lire un A/B test proprement. Tu produis le protocole ET l'analyse.

## Dataset

Le template fournit un CSV de résultats d'expérience : \`user_id, variant (control/treatment), converted (0/1), revenue, session_duration\`.

## Livrable attendu

Un **notebook Jupyter commenté** en 2 parties :

### Partie 1 — Le protocole (avant l'expérience)
- Hypothèse formulée clairement (H0 / H1)
- Métrique primaire choisie + métriques secondaires (guardrails)
- Calcul de la taille d'échantillon nécessaire (puissance, MDE)
- Durée d'expérience estimée
- Risques : effet de nouveauté, contamination, etc.

### Partie 2 — L'analyse (sur le dataset fourni)
- Vérification de l'équilibre des groupes (sanity check)
- Test statistique adapté sur la métrique primaire (avec p-value, intervalle de confiance)
- Analyse des métriques secondaires (pas de dégradation cachée ?)
- Taille d'effet, pas juste significativité

### Conclusion
- Recommandation claire : on déploie / on ne déploie pas / on itère
- Justification chiffrée
- Limites de l'analyse

## Format

- Notebook .ipynb propre
- Export PDF
- README 5 lignes`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Rigueur du protocole** — Hypothèse, métriques, taille d'échantillon : tout est-il cadré avant ?
2. **Justesse statistique** — Le bon test, p-value ET intervalle de confiance, pas juste "c'est significatif".
3. **Guardrails** — Les métriques secondaires sont-elles vérifiées (pas de dégradation cachée) ?
4. **Recommandation** — La conclusion est-elle claire, chiffrée, et assume-t-elle les limites ?
5. **Reproductibilité & forme** — Notebook propre, README clair.

**Bonus :** analyse de segments (l'effet varie-t-il selon le type d'user ?), ou discussion sur le risque de p-hacking.`,
  },
  {
    slug: "tech-data-roadmap-scaleup",
    title: "Roadmap data 6 mois pour une scale-up",
    sector: "tech",
    skillCategory: "analysis",
    difficulty: 3,
    estimatedDays: 4,
    suggestedAtPhase: 4,
    isPremium: false,
    useFromProfile: true,
    submissionMode: "TEXT_ONLY" as const,
    tools: ["Notion ou Google Docs", "Excalidraw (timeline)"],
    templateUrl: "https://www.notion.so/templates/nextmove-data-roadmap",
    shortDescription:
      "Construire une roadmap data sur 6 mois pour une scale-up : priorités, jalons, équipe, quick wins.",
    fullBrief: `## Contexte

Tu viens d'être nommé(e) responsable data (ou tu candidates à ce rôle) dans une scale-up de 50-150 personnes. La direction te demande TA vision : que fait-on de la data sur les 6 prochains mois ?

## Livrable attendu

**Un document de roadmap** (2-3 pages) :

### 1. État des lieux (½ page)
- Le contexte de la scale-up : stade, enjeux business
- 3 constats sur la maturité data actuelle (factuel, pas de blabla)

### 2. Vision & priorités (½ page)
- En 1 phrase : à quoi sert la data dans cette boîte d'ici 6 mois
- 3 priorités stratégiques, justifiées par un enjeu business

### 3. Roadmap 6 mois (1 page)
- Timeline en 3 phases de 2 mois
- Pour chaque phase : objectif, livrables concrets, qui fait quoi
- Identifier 2 quick wins réalisables dès le 1er mois (pour créer la confiance)

### 4. Équipe & moyens (¼ page)
- Quels profils recruter ou monter en compétence, dans quel ordre
- Outils à mettre en place
- Ordre de grandeur budget

### 5. Risques & métriques de succès (¼ page)
- 2 risques majeurs + mitigation
- Comment on mesure que la roadmap a réussi (2-3 indicateurs)

## Règles dures

- 2-3 pages MAX
- La roadmap doit être réaliste pour une scale-up (pas un plan de DSI grand groupe)
- Quick wins obligatoires : une roadmap qui ne montre rien avant 6 mois ne sera jamais financée
- Ton de responsable data qui sait prioriser, pas une liste de souhaits`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Lucidité de l'état des lieux** — Les constats sont-ils factuels et pertinents pour une scale-up ?
2. **Clarté de la vision** — Les priorités sont-elles justifiées par le business, pas juste "techniques" ?
3. **Réalisme de la roadmap** — Le phasage tient-il ? Les quick wins sont-ils crédibles ?
4. **Dimension équipe & moyens** — Le plan RH/budget est-il cohérent avec une scale-up ?
5. **Pilotage** — Risques identifiés, métriques de succès définies, forme claire.

**Bonus :** un arbitrage explicite (ce qu'on NE fait PAS et pourquoi), ou un schéma de la cible d'architecture data.`,
  },
];

async function main() {
  console.log(`🌱 Seeding ${briefs.length} additional deliverable briefs...`);

  for (const b of briefs) {
    await prisma.deliverableBrief.upsert({
      where: { slug: b.slug },
      create: b,
      update: b,
    });
    console.log(`  ✓ ${b.slug} (${b.sector}, niveau ${b.difficulty})`);
  }

  const total = await prisma.deliverableBrief.count();
  console.log(`\n✅ Total briefs in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
