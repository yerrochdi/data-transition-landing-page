"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  plan: string;
  createdAt: Date;
}

export interface DashboardProfile {
  currentRole: string | null;
  currentSector: string | null;
  targetRole: string | null;
  targetSector: string | null;
  experienceYears: number | null;
  topSkills: string[];
  skillGaps: string[];
  confidenceLevel: number;
  careerScore: number;
  readinessScore: number;
}

export interface SkillLevel {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface DashboardOnboarding {
  situation: string | null;
  currentRole: string | null;
  currentSector: string | null;
  experienceYears: number | null;
  educationLevel: string | null;
  certifications: string[];
  hasDataTraining: boolean;
  targetRole: string | null;
  targetSector: string | null;
  topSkills: string[];
  skillLevels: SkillLevel[];
  motivation: string | null;
  keyAchievements: string | null;
  dreamScenario: string | null;
  blockers: string[];
  confidenceLevel: number | null;
  shortTermGoal: string | null;
  longTermGoal: string | null;
  preferredPace: string;
  availableHoursPerWeek: number | null;
  trainingBudget: string | null;
  location: string | null;
  remotePreference: string | null;
  learningStyle: string[];
  priorities: string[];
  aiSummary: string | null;
  aiRecommendation: string | null;
  completedAt: Date | null;
}

export interface DashboardData {
  user: DashboardUser;
  profile: DashboardProfile | null;
  onboarding: DashboardOnboarding | null;
}

export async function getDashboardData(): Promise<DashboardData | null> {
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

  return {
    user: {
      id: dbUser.id,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      avatarUrl: dbUser.avatarUrl,
      plan: dbUser.plan,
      createdAt: dbUser.createdAt,
    },
    profile: dbUser.profile
      ? {
          currentRole: dbUser.profile.currentRole,
          currentSector: dbUser.profile.currentSector,
          targetRole: dbUser.profile.targetRole,
          targetSector: dbUser.profile.targetSector,
          experienceYears: dbUser.profile.experienceYears,
          topSkills: dbUser.profile.topSkills,
          skillGaps: dbUser.profile.skillGaps,
          confidenceLevel: dbUser.profile.confidenceLevel,
          careerScore: dbUser.profile.careerScore,
          readinessScore: dbUser.profile.readinessScore,
        }
      : null,
    onboarding: dbUser.onboarding
      ? {
          situation: dbUser.onboarding.situation,
          currentRole: dbUser.onboarding.currentRole,
          currentSector: dbUser.onboarding.currentSector,
          experienceYears: dbUser.onboarding.experienceYears,
          educationLevel: dbUser.onboarding.educationLevel,
          certifications: dbUser.onboarding.certifications,
          hasDataTraining: dbUser.onboarding.hasDataTraining,
          targetRole: dbUser.onboarding.targetRole,
          targetSector: dbUser.onboarding.targetSector,
          topSkills: dbUser.onboarding.topSkills,
          skillLevels: (dbUser.onboarding.skillLevels as SkillLevel[] | null) ?? [],
          motivation: dbUser.onboarding.motivation,
          keyAchievements: dbUser.onboarding.keyAchievements,
          dreamScenario: dbUser.onboarding.dreamScenario,
          blockers: dbUser.onboarding.blockers,
          confidenceLevel: dbUser.onboarding.confidenceLevel,
          shortTermGoal: dbUser.onboarding.shortTermGoal,
          longTermGoal: dbUser.onboarding.longTermGoal,
          preferredPace: dbUser.onboarding.preferredPace,
          availableHoursPerWeek: dbUser.onboarding.availableHoursPerWeek,
          trainingBudget: dbUser.onboarding.trainingBudget,
          location: dbUser.onboarding.location,
          remotePreference: dbUser.onboarding.remotePreference,
          learningStyle: dbUser.onboarding.learningStyle,
          priorities: dbUser.onboarding.priorities,
          aiSummary: dbUser.onboarding.aiSummary,
          aiRecommendation: dbUser.onboarding.aiRecommendation,
          completedAt: dbUser.onboarding.completedAt,
        }
      : null,
  };
}
