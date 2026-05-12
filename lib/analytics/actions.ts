"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────

export interface SkillProgressItem {
  name: string;
  level: string;
  current: number; // 0-100
  target: number;  // always 100
}

export interface JourneyPhaseOverview {
  id: string;
  title: string;
  status: "LOCKED" | "ACTIVE" | "COMPLETED";
  progress: number;
  doneTasks: number;
  totalTasks: number;
}

export interface AnalyticsData {
  // KPIs
  careerScore: number;
  readinessScore: number;
  confidenceLevel: number;
  validatedDeliverablesCount: number;
  blockerCount: number;
  skillGaps: string[];
  topSkills: string[];

  // Skill progress
  skillProgress: SkillProgressItem[];

  // Journey overview
  journeyPhases: JourneyPhaseOverview[];
  totalTasks: number;
  completedTasks: number;
  journeyProgress: number;

  // Profile context
  currentRole: string | null;
  targetRole: string | null;
  currentSector: string | null;
  targetSector: string | null;
  experienceYears: number | null;
  availableHoursPerWeek: number | null;
  preferredPace: string;
  educationLevel: string | null;
  hasDataTraining: boolean;
  certifications: string[];

  // AI summary
  aiSummary: string | null;
  aiRecommendation: string | null;

  // Dates
  memberSince: Date;
  onboardingCompletedAt: Date | null;
}

// ─── Helpers ──────────────────────────────────────────────────────

const LEVEL_PERCENT: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

// ─── Main Action ──────────────────────────────────────────────────

export async function getAnalyticsData(): Promise<AnalyticsData | null> {
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

  // ── Skill Progress ──
  const skillLevels = (onboarding?.skillLevels as { name: string; level: string }[] | null) ?? [];
  const skillProgress: SkillProgressItem[] = skillLevels.map((sl) => ({
    name: sl.name,
    level: sl.level,
    current: LEVEL_PERCENT[sl.level] || 25,
    target: 100,
  }));

  // If no skill levels but has topSkills, show them as intermediate
  if (skillProgress.length === 0 && onboarding?.topSkills?.length) {
    for (const skill of onboarding.topSkills.slice(0, 8)) {
      skillProgress.push({ name: skill, level: "intermediate", current: 50, target: 100 });
    }
  }

  // ── Journey Overview ──
  const journeyProgressRecords = await prisma.journeyProgress.findMany({
    where: { userId: dbUser.id },
    include: {
      phase: true,
      tasks: true,
    },
    orderBy: { phase: { order: "asc" } },
  });

  let totalTasks = 0;
  let completedTasks = 0;

  const journeyPhases: JourneyPhaseOverview[] = journeyProgressRecords.map((jp) => {
    const doneTasks = jp.tasks.filter((t) => t.status === "DONE").length;
    const total = jp.tasks.length;
    totalTasks += total;
    completedTasks += doneTasks;

    return {
      id: jp.phase.id,
      title: jp.phase.title,
      status: jp.status,
      progress: jp.progress,
      doneTasks,
      totalTasks: total,
    };
  });

  const journeyProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Validated deliverables — the real progress signal (replaces streak).
  const validatedDeliverablesCount = await prisma.deliverable.count({
    where: { userId: dbUser.id, status: "VALIDATED" },
  });

  return {
    careerScore: profile?.careerScore ?? 0,
    readinessScore: profile?.readinessScore ?? 0,
    confidenceLevel: profile?.confidenceLevel ?? onboarding?.confidenceLevel ?? 5,
    validatedDeliverablesCount,
    blockerCount: onboarding?.blockers?.length ?? 0,
    skillGaps: profile?.skillGaps ?? [],
    topSkills: profile?.topSkills ?? onboarding?.topSkills ?? [],

    skillProgress,

    journeyPhases,
    totalTasks,
    completedTasks,
    journeyProgress,

    currentRole: profile?.currentRole ?? onboarding?.currentRole ?? null,
    targetRole: profile?.targetRole ?? onboarding?.targetRole ?? null,
    currentSector: profile?.currentSector ?? onboarding?.currentSector ?? null,
    targetSector: profile?.targetSector ?? onboarding?.targetSector ?? null,
    experienceYears: profile?.experienceYears ?? onboarding?.experienceYears ?? null,
    availableHoursPerWeek: onboarding?.availableHoursPerWeek ?? null,
    preferredPace: onboarding?.preferredPace ?? "MODERATE",
    educationLevel: onboarding?.educationLevel ?? null,
    hasDataTraining: onboarding?.hasDataTraining ?? false,
    certifications: onboarding?.certifications ?? [],

    aiSummary: onboarding?.aiSummary ?? null,
    aiRecommendation: onboarding?.aiRecommendation ?? null,

    memberSince: dbUser.createdAt,
    onboardingCompletedAt: onboarding?.completedAt ?? null,
  };
}
