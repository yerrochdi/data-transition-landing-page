"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────

export type ResourceType = "article" | "guide" | "video" | "template" | "case_study";

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  readTime?: string;
  platform?: string;
  isFree: boolean;
  isRecommended: boolean;
  url: string;
}

export interface ResourcesData {
  resources: Resource[];
  recommendation: string;
  targetRole: string | null;
  skillGaps: string[];
  currentPhase: string | null;
}

// ─── Resource catalog builder ─────────────────────────────────────

function buildResources(opts: {
  targetRole: string | null;
  targetSector: string | null;
  currentRole: string | null;
  currentSector: string | null;
  skillGaps: string[];
  topSkills: string[];
  hasDataTraining: boolean;
  trainingBudget: string | null;
  educationLevel: string | null;
  currentPhase: string | null;
}): Resource[] {
  const resources: Resource[] = [];
  const target = opts.targetRole || "Data Analyst";
  const sector = opts.targetSector || opts.currentSector || "votre secteur";
  const isLowBudget = !opts.trainingBudget || opts.trainingBudget === "none" || opts.trainingBudget === "low";
  const gapSet = new Set(opts.skillGaps.map(g => g.toLowerCase()));

  let id = 0;
  const add = (r: Omit<Resource, "id">) => {
    resources.push({ ...r, id: `res-${++id}` });
  };

  // ─── SQL ──────────────────────────────────────────────────────
  if (gapSet.has("sql") || !opts.hasDataTraining) {
    add({
      title: "Mode Analytics — SQL Tutorial",
      description: "Cours interactif SQL de zéro à avancé. Gratuit et basé sur des vrais datasets.",
      type: "guide",
      category: "SQL",
      readTime: "10h",
      platform: "Mode Analytics",
      isFree: true,
      isRecommended: gapSet.has("sql"),
      url: "https://mode.com/sql-tutorial",
    });
    add({
      title: "SQLBolt — Apprendre SQL interactif",
      description: "Exercices progressifs directement dans le navigateur. Parfait pour débuter.",
      type: "guide",
      category: "SQL",
      readTime: "4h",
      platform: "SQLBolt",
      isFree: true,
      isRecommended: false,
      url: "https://sqlbolt.com",
    });
  }

  // ─── Python ───────────────────────────────────────────────────
  if (gapSet.has("python") || !opts.hasDataTraining) {
    add({
      title: "Kaggle Learn — Python",
      description: "Micro-cours Python orienté data science. Notebooks interactifs.",
      type: "guide",
      category: "Python",
      readTime: "5h",
      platform: "Kaggle",
      isFree: true,
      isRecommended: gapSet.has("python"),
      url: "https://www.kaggle.com/learn/python",
    });
    if (!isLowBudget) {
      add({
        title: "DataCamp — Introduction to Python",
        description: "Cours structuré avec exercices pratiques et projets guidés.",
        type: "guide",
        category: "Python",
        readTime: "4h",
        platform: "DataCamp",
        isFree: false,
        isRecommended: false,
        url: "https://www.datacamp.com/courses/intro-to-python-for-data-science",
      });
    }
  }

  // ─── Data Visualization ───────────────────────────────────────
  if (gapSet.has("data visualization") || gapSet.has("power bi ou tableau")) {
    add({
      title: "Tableau Public — Tutoriels gratuits",
      description: "Apprenez la data viz avec Tableau. Galerie d'exemples et tutoriels officiels.",
      type: "video",
      category: "Data Visualization",
      readTime: "6h",
      platform: "Tableau",
      isFree: true,
      isRecommended: true,
      url: "https://public.tableau.com/app/resources/learn",
    });
    add({
      title: "Power BI — Learning Path Microsoft",
      description: "Parcours officiel Microsoft pour maîtriser Power BI de A à Z.",
      type: "guide",
      category: "Data Visualization",
      readTime: "12h",
      platform: "Microsoft Learn",
      isFree: true,
      isRecommended: false,
      url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi",
    });
  }

  // ─── Statistics ───────────────────────────────────────────────
  if (gapSet.has("statistiques")) {
    add({
      title: "Khan Academy — Statistiques et probabilités",
      description: "Cours complet et gratuit. Moyenne, médiane, écart-type, distributions.",
      type: "video",
      category: "Statistiques",
      readTime: "8h",
      platform: "Khan Academy",
      isFree: true,
      isRecommended: true,
      url: "https://fr.khanacademy.org/math/statistics-probability",
    });
  }

  // ─── Excel avancé ─────────────────────────────────────────────
  if (gapSet.has("excel avancé")) {
    add({
      title: "Excel Skills for Business — Coursera",
      description: "De débutant à avancé. Formules, tableaux croisés, macros.",
      type: "guide",
      category: "Excel",
      readTime: "20h",
      platform: "Coursera",
      isFree: true,
      isRecommended: true,
      url: "https://www.coursera.org/specializations/excel",
    });
  }

  // ─── Machine Learning ─────────────────────────────────────────
  if (gapSet.has("machine learning")) {
    add({
      title: "Kaggle Learn — Intro to Machine Learning",
      description: "Construisez votre premier modèle ML. Cours pratique en notebooks.",
      type: "guide",
      category: "Machine Learning",
      readTime: "3h",
      platform: "Kaggle",
      isFree: true,
      isRecommended: true,
      url: "https://www.kaggle.com/learn/intro-to-machine-learning",
    });
  }

  // ─── Certifications ──────────────────────────────────────────
  add({
    title: "Google Data Analytics Professional Certificate",
    description: `Certification reconnue mondialement. Parfait pour une transition vers ${target}. Gratuit en audit.`,
    type: "guide",
    category: "Certification",
    readTime: "6 mois (~10h/sem)",
    platform: "Coursera",
    isFree: true,
    isRecommended: target.toLowerCase().includes("analyst"),
    url: "https://www.coursera.org/professional-certificates/google-data-analytics",
  });
  add({
    title: "IBM Data Science Professional Certificate",
    description: "9 cours couvrant Python, SQL, ML et data viz. Gratuit en audit sur Coursera.",
    type: "guide",
    category: "Certification",
    readTime: "5 mois (~8h/sem)",
    platform: "Coursera",
    isFree: true,
    isRecommended: target.toLowerCase().includes("scientist"),
    url: "https://www.coursera.org/professional-certificates/ibm-data-science",
  });

  // ─── Transition carrière ──────────────────────────────────────
  add({
    title: `Réussir sa transition vers ${target}`,
    description: `Guide complet pour passer de ${opts.currentRole || "votre rôle"} à ${target} dans le secteur ${sector}.`,
    type: "article",
    category: "Transition carrière",
    readTime: "15 min",
    isFree: true,
    isRecommended: true,
    url: "#",
  });

  // ─── Portfolio ────────────────────────────────────────────────
  add({
    title: `Template portfolio data — secteur ${sector}`,
    description: `Structure de projet portfolio combinant votre expertise ${sector} et la data. Prêt à adapter.`,
    type: "template",
    category: "Portfolio",
    readTime: "5 min",
    isFree: true,
    isRecommended: opts.currentPhase === "Spécialisation" || opts.currentPhase === "Positionnement",
    url: "#",
  });

  // ─── Interview prep ───────────────────────────────────────────
  add({
    title: `Préparer un entretien ${target}`,
    description: `Les 20 questions techniques et comportementales les plus fréquentes pour ${target}. Avec réponses modèles.`,
    type: "article",
    category: "Entretien",
    readTime: "20 min",
    isFree: true,
    isRecommended: opts.currentPhase === "Positionnement" || opts.currentPhase === "Lancement",
    url: "#",
  });

  // ─── LinkedIn ─────────────────────────────────────────────────
  add({
    title: "Optimiser son LinkedIn pour la data",
    description: `Comment présenter sa transition ${opts.currentRole || "métier"} → ${target}. Titre, résumé, mots-clés.`,
    type: "guide",
    category: "Personal Branding",
    readTime: "10 min",
    isFree: true,
    isRecommended: opts.currentPhase === "Positionnement",
    url: "#",
  });

  // ─── Success stories ──────────────────────────────────────────
  add({
    title: `De ${opts.currentRole || "non-tech"} à ${target} : témoignages`,
    description: `3 parcours de reconversion réussis vers ${target}. Leurs erreurs, leurs conseils, leurs timelines.`,
    type: "case_study",
    category: "Inspiration",
    readTime: "8 min",
    isFree: true,
    isRecommended: false,
    url: "#",
  });

  add({
    title: `La data dans ${sector} : opportunités 2025`,
    description: `État du marché data/IA dans le secteur ${sector}. Salaires, postes, tendances.`,
    type: "article",
    category: "Marché",
    readTime: "12 min",
    isFree: true,
    isRecommended: false,
    url: "#",
  });

  // Sort: recommended first, then by category
  resources.sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    return a.category.localeCompare(b.category);
  });

  return resources;
}

// ─── Main Action ──────────────────────────────────────────────────

export async function getResourcesData(): Promise<ResourcesData | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    include: {
      profile: true,
      onboarding: true,
    },
  });

  if (!dbUser) return null;

  const profile = dbUser.profile;
  const onboarding = dbUser.onboarding;

  // Get current active phase name
  let currentPhase: string | null = null;
  const activeProgress = await prisma.journeyProgress.findFirst({
    where: { userId: dbUser.id, status: "ACTIVE" },
    include: { phase: true },
  });
  if (activeProgress) {
    currentPhase = activeProgress.phase.title;
  }

  const skillGaps = profile?.skillGaps ?? [];
  const targetRole = profile?.targetRole ?? onboarding?.targetRole ?? null;

  const resources = buildResources({
    targetRole,
    targetSector: profile?.targetSector ?? onboarding?.targetSector ?? null,
    currentRole: profile?.currentRole ?? onboarding?.currentRole ?? null,
    currentSector: profile?.currentSector ?? onboarding?.currentSector ?? null,
    skillGaps,
    topSkills: profile?.topSkills ?? onboarding?.topSkills ?? [],
    hasDataTraining: onboarding?.hasDataTraining ?? false,
    trainingBudget: onboarding?.trainingBudget ?? null,
    educationLevel: onboarding?.educationLevel ?? null,
    currentPhase,
  });

  // Build recommendation text
  const gapText = skillGaps.length > 0
    ? `Vos gaps prioritaires sont : ${skillGaps.slice(0, 3).join(", ")}.`
    : "Votre profil couvre les compétences essentielles.";
  const phaseText = currentPhase
    ? `Vous êtes en phase "${currentPhase}".`
    : "";
  const recommendation = `${phaseText} ${gapText} Les ressources recommandées sont adaptées à votre profil de transition vers ${targetRole || "la data/IA"}.`;

  return {
    resources,
    recommendation: recommendation.trim(),
    targetRole,
    skillGaps,
    currentPhase,
  };
}
