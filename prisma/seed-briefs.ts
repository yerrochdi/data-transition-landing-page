/**
 * Seed initial DeliverableBriefs (Sprint 3 — Option A: 5 briefs).
 *
 * Run with:  npx tsx prisma/seed-briefs.ts
 *
 * Mix: 3 Finance/Assurance + 2 Tech/Conseil + 1 generic to validate the catalogue.
 * Each brief is designed to be completable in 3-7 days and produce a portfolio-worthy
 * artefact that the user can share on LinkedIn immediately.
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
  // ───────────────────── FINANCE × 2 ─────────────────────
  {
    slug: "finance-cohort-credit-default",
    title: "Analyse de cohorte : taux de défaut crédit",
    sector: "finance",
    skillCategory: "analysis",
    difficulty: 3,
    estimatedDays: 5,
    suggestedAtPhase: 2,
    isPremium: false,
    tools: ["Python (Pandas)", "Jupyter Notebook", "Matplotlib / Seaborn"],
    templateUrl: "https://github.com/nextmove-ai/templates-cohort-analysis",
    shortDescription:
      "Construire une analyse de cohorte mensuelle du taux de défaut crédit sur un dataset public et identifier les segments à risque.",
    fullBrief: `## Contexte

Tu es analyste data dans un département risque crédit d'une banque retail. La direction te demande de comprendre comment évolue le taux de défaut selon la cohorte d'origination (mois de signature du crédit) et d'identifier les segments les plus risqués.

## Dataset

Utilise le dataset public **"Lending Club Loan Data"** (Kaggle) — ou tout dataset crédit équivalent. Si tu n'as pas accès, le template fournit un échantillon de 50k lignes prétraité.

## Livrable attendu

Un notebook Jupyter (.ipynb) **commenté en français** contenant :

1. **Préparation des données** (5 min de lecture max)
   - Définition du défaut (≥ 90 jours impayés)
   - Construction de la cohorte d'origination (mois de signature)
   - Filtres business documentés

2. **Analyse de cohorte mensuelle**
   - Taux de défaut à 12 mois par cohorte
   - Heatmap cohorte × ancienneté (bonus : visualiser les vagues de stress)

3. **Segmentation à risque**
   - Top 3 variables qui expliquent le défaut (par ex : DTI, durée du prêt, motif)
   - 1 graphique propre par variable

4. **Recommandation business** (½ page)
   - 1 segment à surveiller
   - 1 piste d'action (resserrement scoring, repricing, etc.)

## Format

- Notebook .ipynb propre (pas de cellules d'exploration mortes)
- Export PDF (option : nbconvert)
- 1 README.md de 5 lignes pour le portfolio

## Critères de réussite

- L'analyse est **reproductible** (data → graphiques sans intervention manuelle)
- Les graphiques ont un **titre, des axes nommés, une source**
- La recommandation est **chiffrée** (ex : "le segment X représente 12% du book et 28% des défauts")`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Rigueur méthodo** — Définition du défaut claire, cohorte bien construite, pas de leak temporel.
2. **Clarté visuelle** — Graphiques lisibles (titres, axes, légendes), heatmap interprétable.
3. **Insight business** — La recommandation est-elle actionnable ? Chiffrée ? Liée à une décision métier ?
4. **Reproductibilité** — Notebook qui tourne end-to-end sans manipulation manuelle, dépendances listées.
5. **Présentation portfolio** — README clair, 1 visuel hero, taille raisonnable.

**Bonus (+5 pts max) :** SHAP values pour expliquer le modèle, ou comparaison cohorte pré/post-COVID.`,
  },
  {
    slug: "finance-fraud-detection-1pager",
    title: "1-pager : cas d'usage IA détection fraude",
    sector: "finance",
    skillCategory: "ai-usecase",
    difficulty: 2,
    estimatedDays: 3,
    suggestedAtPhase: 1,
    isPremium: false,
    useFromProfile: true,
    submissionMode: "TEXT_ONLY" as const,
    tools: ["Notion / Google Docs", "Excalidraw (schéma archi)"],
    templateUrl: "https://www.notion.so/templates/nextmove-ai-usecase-1pager",
    shortDescription:
      "Cadrer un cas d'usage IA de détection de fraude carte bancaire en 1 page : business case, archi technique, KPIs, risques.",
    fullBrief: `## Contexte

Tu es manager dans une banque et ton CODIR te demande de cadrer un cas d'usage IA en 1 page max. Sujet imposé : **détection de fraude sur transactions cartes bancaires**.

## Livrable attendu

**1 page A4 PDF** structurée comme suit :

### 1. Problème métier (3-4 lignes)
- Volume de fraude actuel (chiffre vraisemblable, source citée)
- Coût direct (chargebacks) et indirect (NPS, rétention)
- Pourquoi les règles statiques ne suffisent plus

### 2. Solution IA proposée (4-6 lignes)
- Type de modèle (anomaly detection / classif binaire / hybride)
- Données d'entrée (5-7 features clés)
- Sortie : score 0-100 + raison principale (top SHAP feature)

### 3. Schéma d'architecture (1 dessin)
- Sources → ingestion → feature store → modèle → décision (block/review/pass)
- Outils typiques : Kafka, Feast, MLflow, etc.

### 4. KPIs (3 max)
- 1 KPI métier (ex : taux de fraude détectée à TCO constant)
- 1 KPI modèle (ex : précision @ 1% de faux positifs)
- 1 KPI ops (ex : latence p99 < 200ms)

### 5. Risques + mitigations (3 lignes)
- Bias modèle, drift, faux positifs irritants client

## Format

- 1 page A4 PDF (pas plus)
- Charte sobre, lisible, pas de stock photo
- Ton de cadre, pas de jargon "vibe ML"`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Cadrage métier** — Le problème est-il quantifié ? Le ROI est-il vraisemblable ?
2. **Architecture** — Le schéma est-il cohérent (sources → features → modèle → décision) ?
3. **KPIs** — Sont-ils mesurables, équilibrés (métier + modèle + ops) ?
4. **Risques** — As-tu identifié les vrais risques (bias, drift, FP) avec mitigation ?
5. **Forme** — Tient en 1 page, lisible, ton pro. Pas de jargon vide.

**Bonus :** un benchmark comparable cité (ex : Stripe Radar, Featurespace), ou une estimation budget MVP.`,
  },

  // ───────────────────── TECH × 2 ─────────────────────
  {
    slug: "tech-product-metrics-dashboard",
    title: "Dashboard produit : funnel d'activation SaaS",
    sector: "tech",
    skillCategory: "data-viz",
    difficulty: 3,
    estimatedDays: 5,
    suggestedAtPhase: 3,
    isPremium: false,
    tools: ["Power BI ou Looker Studio", "Google Sheets (data source)"],
    templateUrl: "https://github.com/nextmove-ai/templates-saas-dashboard",
    shortDescription:
      "Construire un dashboard produit SaaS qui montre le funnel d'activation (signup → onboarded → active) et identifie le drop-off principal.",
    fullBrief: `## Contexte

Tu es Product Manager dans une startup SaaS B2B. Ton CEO veut **un dashboard unique** qui montre la santé du funnel d'activation et où on perd les users.

## Dataset

Le template fournit un CSV synthétique de 10k events : \`user_id, event, timestamp, plan\`. Events possibles : \`signup, email_verified, onboarding_started, onboarding_completed, first_action, day7_active\`.

## Livrable attendu

**Un dashboard interactif** (Power BI .pbix ou Looker Studio public) avec :

### Page 1 — Vue d'ensemble (KPIs hero)
- Signups totaux ce mois
- Activation rate (signup → first_action)
- Day-7 retention rate
- Comparaison vs mois N-1 (avec couleur)

### Page 2 — Funnel
- Visuel funnel : signup → email_verified → onboarding_completed → first_action → day7_active
- % de drop par étape
- Filtrable par plan (Free / Pro)

### Page 3 — Cohortes
- Heatmap : cohorte mensuelle × jour de rétention (J0, J7, J30)
- Au moins 3 cohortes affichées

### Recommandation
- 1 onglet "Insights" texte : où est le drop principal et 1 hypothèse produit pour le réduire

## Format

- Fichier .pbix OU lien Looker Studio public
- 1 screenshot hero (PNG) pour le portfolio
- 1 README de 10 lignes : data sources, calculs, hypothèses`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Pertinence des KPIs** — Activation, rétention, drop-off : tu mesures ce qui compte pour un SaaS ?
2. **Lisibilité** — Le CEO comprend en 30 secondes ? Hiérarchie visuelle claire ?
3. **Funnel** — Bien construit (events ordonnés, taux de conversion par étape), filtrable ?
4. **Cohortes** — Heatmap correctement faite (axes, couleur monotone, legend) ?
5. **Insight final** — La reco est-elle actionnable et liée à un drop précis ?

**Bonus :** segmentation par feature flag, ou test A/B intégré au dashboard.`,
  },
  {
    slug: "tech-rag-poc-internal-docs",
    title: "POC RAG : assistant IA sur documentation interne",
    sector: "tech",
    skillCategory: "ml",
    difficulty: 4,
    estimatedDays: 7,
    suggestedAtPhase: 4,
    isPremium: true,
    tools: ["Python", "LangChain ou LlamaIndex", "ChromaDB / FAISS", "OpenAI ou Mistral API"],
    templateUrl: "https://github.com/nextmove-ai/templates-rag-poc",
    shortDescription:
      "Construire un POC RAG fonctionnel : indexer 20-50 docs internes, répondre à 5 questions tests avec citation des sources.",
    fullBrief: `## Contexte

Ta boîte (cabinet de conseil, ESN, scale-up) a 50 documents internes (procédures, comptes-rendus, FAQ). Tu dois prouver qu'on peut faire un assistant IA qui répond aux questions des collègues **avec citation des sources**.

## Livrable attendu

**Un repo GitHub public** avec :

### 1. Pipeline d'indexation (script Python)
- Lecture de 20-50 documents (PDF, MD, TXT — le template fournit un dataset démo)
- Chunking propre (token-based, overlap maîtrisé)
- Embeddings + persistence dans ChromaDB ou FAISS

### 2. Pipeline de retrieval + génération
- Query → retrieval top-k → reranking optionnel → prompt LLM → réponse + sources
- 1 fonction \`answer(question: str) -> {answer, sources: List[chunk]}\`

### 3. Évaluation
- 5 questions tests (3 répondables, 1 partiellement, 1 hors scope)
- Score manuel pour chaque : pertinence (0-2), source correcte (0-1), pas d'hallucination (0-1)
- Tableau Markdown des résultats

### 4. UI minimale
- Soit Streamlit (simple), soit notebook avec widgets
- Champ question → réponse + sources cliquables

## Format

- Repo GitHub public, README clair
- 1 GIF/screenshot de l'UI dans le README
- requirements.txt fonctionnel
- Mention claire : "POC, pas production-ready"`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Pipeline RAG** — Indexation correcte (chunking, embeddings), retrieval fonctionnel.
2. **Citation des sources** — Les sources sont-elles **fiables** (chunk ID, page) et affichées à l'user ?
3. **Évaluation** — As-tu vraiment testé 5 questions avec un score honnête (y compris quand ça rate) ?
4. **Code** — Lisible, modulaire, 1 fonction \`answer()\` clé clairement isolée.
5. **README** — Un dev peut cloner et lancer en < 10 min ? Limitations annoncées ?

**Bonus :** reranking (CrossEncoder), guardrails contre les hallucinations, métriques RAGAS.`,
  },

  // ───────────────────── GENERIC × 1 (quick win Free) ─────────────────────
  {
    slug: "generic-data-augmented-cv",
    title: "CV data-augmenté : refonte 1 page",
    sector: "generic",
    skillCategory: "career",
    difficulty: 1,
    estimatedDays: 3,
    suggestedAtPhase: 1,
    isPremium: false,
    useFromProfile: true,
    submissionMode: "TEXT_ONLY" as const,
    tools: ["Notion ou Canva", "ChatGPT / Claude (assistance rédaction)"],
    templateUrl: "https://www.notion.so/templates/nextmove-cv-data-augmente",
    shortDescription:
      "Refondre ton CV en mettant en avant l'angle data/IA : 1 page, 3 réalisations chiffrées avec mots-clés data.",
    fullBrief: `## Contexte

Ton CV actuel ne reflète pas ton angle "cadre data-augmenté". Tu dois le refondre pour qu'un recruteur (ou ton manager) capte en 30 secondes que **tu sais croiser ton métier avec la data**.

## Livrable attendu

**1 CV PDF** + **1 résumé LinkedIn** :

### CV (1 page A4)
- En-tête : nom, titre **data-augmenté** (ex : "Manager Finance × Data-Driven Decisions")
- Résumé 3 lignes max
- 3 expériences max avec **3 réalisations chiffrées** chacune (impact business + outils data utilisés)
- Section "Compétences data" séparée : 5-8 outils max (ex : SQL, Power BI, Python (Pandas), Looker, dbt)
- Formation + langues (compact)

### Résumé LinkedIn (max 200 mots)
- Hook 1 ligne (qui tu es + angle data)
- 3-4 lignes : ce que tu fais concrètement
- 1 ligne : ce que tu cherches
- 3-5 hashtags pertinents

## Règles dures

- **1 page max** pour le CV (pas de triche typographique)
- **Réalisations chiffrées** : "+15% de marge", "réduction de 4h/semaine", pas "amélioration significative"
- **Pas de buzzwords vides** : pas de "synergies", "transformation digitale" sans contexte
- **Outils data réels** : ne mens pas sur Tableau si tu as fait 2 dashboards`,
    evaluationCriteria: `**L'IA évalue ton livrable sur 5 axes (chacun /20) :**

1. **Angle data-augmenté** — Est-ce qu'un recruteur capte ton angle data en 10 secondes ?
2. **Réalisations chiffrées** — Au moins 3 chiffres concrets avec contexte ? Pas de bullshit ?
3. **Compétences data** — Liste honnête, pas de skill que tu maîtrises pas ?
4. **Format** — 1 page max, lisible, hiérarchie typo claire ?
5. **Résumé LinkedIn** — Hook punchy, scannable, hashtags pertinents ?

**Bonus :** version EN du CV, ou 1 case study détaillé en annexe (1 réalisation = 1 page).`,
  },
];

async function main() {
  console.log(`🌱 Seeding ${briefs.length} initial deliverable briefs...`);

  for (const b of briefs) {
    await prisma.deliverableBrief.upsert({
      where: { slug: b.slug },
      create: b,
      update: b,
    });
    console.log(`  ✓ ${b.slug} (${b.sector})`);
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
