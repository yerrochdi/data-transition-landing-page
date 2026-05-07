"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/billing/plans";
import { computeMatchesForUser } from "./scoring";

// ─── Types ────────────────────────────────────────────────────────

export type OpportunityType = "job" | "freelance" | "formation" | "transition";

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  type: OpportunityType;
  description: string;
  tags: string[];
  matchScore: number;
  aiReason: string;
  salary?: string;
  searchUrl: string;
}

export interface OpportunitiesData {
  opportunities: Opportunity[];
  targetRole: string | null;
  targetSector: string | null;
  currentRole: string | null;
  readinessScore: number;
  topSkills: string[];
  skillGaps: string[];
  // Plan-based gating: how many of the listed opportunities are visible
  // (the rest are returned but should be blurred + teased in the UI).
  visibleLimit: number; // Infinity for paid tiers
  plan: string;
}

// ─── Opportunity Builder ──────────────────────────────────────────

function buildOpportunities(opts: {
  targetRole: string | null;
  targetSector: string | null;
  currentRole: string | null;
  currentSector: string | null;
  topSkills: string[];
  skillGaps: string[];
  readinessScore: number;
  hasDataTraining: boolean;
  experienceYears: number | null;
  remotePreference: string | null;
  location: string | null;
}): Opportunity[] {
  const opportunities: Opportunity[] = [];
  const target = opts.targetRole || "Data Analyst";
  const sector = opts.targetSector || opts.currentSector || "Tech";
  const currentRole = opts.currentRole || "professionnel";
  const location = opts.location || "France";
  const isRemote = opts.remotePreference === "remote" || opts.remotePreference === "flexible";
  const years = opts.experienceYears ?? 3;
  const readiness = opts.readinessScore;

  let id = 0;
  const buildSearchUrl = (title: string, loc: string, type: OpportunityType): string => {
    if (type === "formation") {
      return `https://www.coursera.org/search?query=${encodeURIComponent(title)}`;
    }
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}&location=${encodeURIComponent(loc)}&f_WT=${loc.toLowerCase().includes("remote") ? "2" : ""}`;
  };
  const add = (o: Omit<Opportunity, "id" | "searchUrl">) => {
    opportunities.push({
      ...o,
      id: `opp-${++id}`,
      searchUrl: buildSearchUrl(o.title, o.location, o.type),
    });
  };

  // ─── CDI / Postes cibles ──────────────────────────────────────
  add({
    title: `${target} Junior`,
    company: `Entreprises du secteur ${sector}`,
    location: isRemote ? `${location} (Remote)` : location,
    remote: isRemote,
    type: "job",
    description: `Poste ${target} junior dans le secteur ${sector}. Profil en transition accepté. Formation interne assurée.`,
    tags: [target, sector, "Junior", "Formation interne"],
    matchScore: readiness >= 60 ? 92 : readiness >= 40 ? 78 : 65,
    aiReason: `Votre expérience de ${years} ans en ${currentRole} + vos compétences ${opts.topSkills.slice(0, 2).join(" et ")} correspondent au profil recherché. ${readiness >= 60 ? "Votre readiness score élevé vous place en bonne position." : "Quelques compétences à renforcer mais le profil hybride est un atout."}`,
    salary: years >= 5 ? "40-50K€" : "32-42K€",
  });

  add({
    title: `${target} — ${sector}`,
    company: `Cabinets de conseil Data`,
    location: `Paris ${isRemote ? "(Hybride)" : ""}`,
    remote: isRemote,
    type: "job",
    description: `Missions variées en tant que ${target} pour des clients ${sector}. Montée en compétences rapide garantie.`,
    tags: [target, "Conseil", sector, "Missions variées"],
    matchScore: readiness >= 50 ? 85 : 70,
    aiReason: `Le conseil data valorise les profils en reconversion avec expertise métier. Votre background ${currentRole} en ${opts.currentSector || sector} est un différenciateur.`,
    salary: years >= 5 ? "45-55K€" : "35-45K€",
  });

  add({
    title: `${target} Confirmé`,
    company: `Scale-ups du secteur ${sector}`,
    location: isRemote ? `Full Remote` : `Lyon`,
    remote: true,
    type: "job",
    description: `Rejoignez une équipe data de 5 personnes. Stack : Python, SQL, dbt, Looker. Participation aux décisions produit.`,
    tags: ["Python", "SQL", "dbt", "Looker", sector],
    matchScore: readiness >= 70 ? 88 : readiness >= 50 ? 72 : 58,
    aiReason: readiness >= 70
      ? "Votre profil technique et métier correspond bien. La double compétence est recherchée."
      : `Ce poste requiert un niveau intermédiaire en ${opts.skillGaps[0] || "SQL"}. Cible à moyen terme après formation.`,
    salary: "42-55K€",
  });

  // ─── Freelance ────────────────────────────────────────────────
  add({
    title: `Mission freelance : Dashboard ${sector}`,
    company: "Clients directs",
    location: "Full Remote",
    remote: true,
    type: "freelance",
    description: `Création d'un dashboard de pilotage pour une entreprise ${sector}. 2-3 mois. Power BI ou Tableau.`,
    tags: ["Dashboard", "Power BI", "Tableau", sector, "Freelance"],
    matchScore: opts.topSkills.some(s => s.toLowerCase().includes("tableau") || s.toLowerCase().includes("power bi")) ? 90 : 68,
    aiReason: `Mission idéale pour construire votre portfolio. ${opts.topSkills.some(s => s.toLowerCase().includes("tableau") || s.toLowerCase().includes("power bi")) ? "Vos compétences BI matchent parfaitement." : "Opportunité d'apprendre un outil BI en situation réelle."}`,
    salary: "350-500€/j",
  });

  add({
    title: `Analyse de données ${sector} — Projet court`,
    company: "Startups Data",
    location: "Remote / Paris",
    remote: true,
    type: "freelance",
    description: `Mission de 4-6 semaines. Nettoyage et analyse d'un dataset ${sector}. Livrable : rapport + recommandations.`,
    tags: ["Python", "Pandas", "Data Analysis", sector],
    matchScore: opts.hasDataTraining ? 82 : 65,
    aiReason: `Projet formateur à portée de main. Votre connaissance du ${sector} donne un avantage sur les profils purement techniques.`,
    salary: "300-400€/j",
  });

  // ─── Formations ───────────────────────────────────────────────
  add({
    title: `Bootcamp ${target} — 3 mois`,
    company: "Le Wagon / Jedha / DataScientest",
    location: "Paris / Remote",
    remote: true,
    type: "formation",
    description: `Formation intensive de 3 mois pour devenir ${target}. Projets réels, coaching carrière, certification.`,
    tags: [target, "Bootcamp", "Certification", "3 mois"],
    matchScore: readiness < 50 ? 95 : 75,
    aiReason: readiness < 50
      ? "Votre readiness score indique qu'un bootcamp structuré serait le chemin le plus rapide."
      : "Formation complémentaire possible, mais votre profil pourrait aussi viser directement le marché.",
    salary: "4 000 - 8 000€ (CPF éligible)",
  });

  add({
    title: `Certification Google ${target}`,
    company: "Coursera / Google",
    location: "100% en ligne",
    remote: true,
    type: "formation",
    description: "Certification reconnue, ~6 mois à temps partiel. Projets portfolio inclus. Gratuit en audit.",
    tags: ["Google", "Certification", "6 mois", "Gratuit"],
    matchScore: 88,
    aiReason: "Certification la plus reconnue du marché. Parfaite pour valider vos compétences et renforcer votre CV.",
  });

  // ─── Transition interne ───────────────────────────────────────
  add({
    title: `Mobilité interne vers ${target}`,
    company: "Votre entreprise actuelle",
    location: location,
    remote: isRemote,
    type: "transition",
    description: `Proposer une transition vers un rôle data au sein de votre entreprise. Moins de risque, double compétence valorisée.`,
    tags: ["Mobilité interne", "Transition douce", sector, target],
    matchScore: years >= 3 ? 93 : 78,
    aiReason: `Avec ${years} ans d'ancienneté, une transition interne est une voie à fort ROI. Votre connaissance du métier ${sector} est irremplaçable.`,
  });

  add({
    title: `Intrapreneuriat : Projet Data dans votre équipe`,
    company: "Votre entreprise actuelle",
    location: location,
    remote: isRemote,
    type: "transition",
    description: `Lancez un projet data au sein de votre équipe actuelle. Montrez la valeur de la data sans changer d'emploi.`,
    tags: ["Side project", "Data", sector, "Intrapreneuriat"],
    matchScore: 86,
    aiReason: "Démarrer un projet data interne prouve vos compétences sans risque. Excellent tremplin vers un rôle dédié.",
  });

  // Sort by matchScore descending
  opportunities.sort((a, b) => b.matchScore - a.matchScore);

  return opportunities;
}

// ─── Real opportunities loader (Sprint 2) ──────────────────────────

const MATCH_FRESHNESS_DAYS = 7;

/**
 * Loads real opportunities from the database (France Travail synced)
 * with the user's match scores. Recomputes matches if they're stale
 * or missing. Returns null if there are no real opportunities yet
 * (the caller falls back to template opportunities).
 */
async function loadRealOpportunities(userId: string): Promise<Opportunity[] | null> {
  const realCount = await prisma.opportunity.count({
    where: { isActive: true, source: { not: "MANUAL" } },
  });
  if (realCount === 0) return null;

  // Check freshness of existing matches for this user.
  const cutoff = new Date(Date.now() - MATCH_FRESHNESS_DAYS * 24 * 60 * 60 * 1000);
  const freshMatchCount = await prisma.opportunityMatch.count({
    where: { userId, lastComputedAt: { gte: cutoff } },
  });

  // If we have very few fresh matches, recompute. We don't await this for
  // every page load — only when the user has no matches yet (first visit).
  if (freshMatchCount === 0) {
    try {
      await computeMatchesForUser(userId);
    } catch (err) {
      console.error("[opportunities] match computation failed:", err);
    }
  }

  // Now load opportunities + matches in one go.
  const rows = await prisma.opportunity.findMany({
    where: { isActive: true, source: { not: "MANUAL" } },
    include: {
      matches: { where: { userId } },
    },
    orderBy: { postedAt: "desc" },
    take: 50,
  });

  const opportunities: Opportunity[] = rows.map((row) => {
    const match = row.matches[0];
    return {
      id: row.id,
      title: row.title,
      company: row.company,
      location: row.location,
      type: typeFromPrisma(row.type),
      tags: row.tags,
      description: row.description,
      remote: row.remote,
      matchScore: match?.matchScore ?? 0,
      aiReason: match?.aiReason ?? "Score en cours de calcul…",
      salary: row.salary ?? undefined,
      // Real offers link to the original posting (France Travail / LinkedIn).
      searchUrl: row.sourceUrl ?? "https://candidat.francetravail.fr/offres/recherche",
    };
  });

  // Sort by matchScore desc — best matches first, untreated ones at bottom.
  opportunities.sort((a, b) => b.matchScore - a.matchScore);
  return opportunities;
}

function typeFromPrisma(t: string): OpportunityType {
  // Prisma enum is uppercase, our shared type is lowercase. We treat all
  // real offers as "job" — the v2 API doesn't distinguish freelance reliably.
  switch (t) {
    case "JOB":
      return "job";
    case "FREELANCE":
      return "freelance";
    case "FORMATION":
      return "formation";
    case "TRANSITION":
      return "transition";
    default:
      return "job";
  }
}

// ─── Main Action ──────────────────────────────────────────────────

export async function getOpportunitiesData(): Promise<OpportunitiesData | null> {
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

  // Try real opportunities first (Sprint 2). Fall back to AI-generated
  // templates when the database is still empty (cron hasn't run yet).
  const realOpportunities = await loadRealOpportunities(dbUser.id);
  const opportunities =
    realOpportunities ??
    buildOpportunities({
      targetRole: profile?.targetRole ?? onboarding?.targetRole ?? null,
      targetSector: profile?.targetSector ?? onboarding?.targetSector ?? null,
      currentRole: profile?.currentRole ?? onboarding?.currentRole ?? null,
      currentSector: profile?.currentSector ?? onboarding?.currentSector ?? null,
      topSkills: profile?.topSkills ?? onboarding?.topSkills ?? [],
      skillGaps: profile?.skillGaps ?? [],
      readinessScore: profile?.readinessScore ?? 0,
      hasDataTraining: onboarding?.hasDataTraining ?? false,
      experienceYears: profile?.experienceYears ?? onboarding?.experienceYears ?? null,
      remotePreference: onboarding?.remotePreference ?? null,
      location: onboarding?.location ?? null,
    });

  const limits = getPlanLimits(dbUser.plan);
  const visibleLimit = limits.opportunitiesVisible;

  return {
    opportunities,
    targetRole: profile?.targetRole ?? onboarding?.targetRole ?? null,
    targetSector: profile?.targetSector ?? onboarding?.targetSector ?? null,
    currentRole: profile?.currentRole ?? onboarding?.currentRole ?? null,
    readinessScore: profile?.readinessScore ?? 0,
    topSkills: profile?.topSkills ?? onboarding?.topSkills ?? [],
    skillGaps: profile?.skillGaps ?? [],
    visibleLimit,
    plan: dbUser.plan,
  };
}
