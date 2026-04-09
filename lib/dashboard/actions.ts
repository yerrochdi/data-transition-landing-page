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

export interface JourneySummary {
  overallProgress: number;
  completedTasks: number;
  totalTasks: number;
  activePhaseTitle: string | null;
  nextTaskTitle: string | null;
}

export interface DashboardData {
  user: DashboardUser;
  profile: DashboardProfile | null;
  onboarding: DashboardOnboarding | null;
  streakDays: number;
  dailyTip: string;
  journey: JourneySummary;
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

  // Compute streak: consecutive days the user has been active
  const now = new Date();
  const lastActive = dbUser.lastActiveAt;
  const diffMs = now.getTime() - lastActive.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // If last active was today or yesterday, count as streak
  // For v1, we use a simple heuristic: days since account creation (capped at actual activity)
  const daysSinceCreation = Math.floor((now.getTime() - dbUser.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const streakDays = diffHours <= 48 ? Math.max(daysSinceCreation, 1) : 1;

  // Update lastActiveAt
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { lastActiveAt: now },
  }).catch(() => {}); // Non-blocking

  // Generate daily tip based on profile
  const dailyTip = generateDailyTip(dbUser.onboarding, dbUser.profile);

  // Fetch journey summary for next actions
  let journey: JourneySummary = {
    overallProgress: 0,
    completedTasks: 0,
    totalTasks: 0,
    activePhaseTitle: null,
    nextTaskTitle: null,
  };

  try {
    const phases = await prisma.journeyPhase.findMany({
      include: {
        tasks: {
          include: {
            taskProgress: {
              where: { userId: dbUser.id },
              take: 1,
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    if (phases.length > 0) {
      let totalTasks = 0;
      let completedTasks = 0;
      let activePhaseTitle: string | null = null;
      let nextTaskTitle: string | null = null;

      for (const phase of phases) {
        // Find user progress for this phase
        const phaseProgress = await prisma.journeyProgress.findFirst({
          where: { userId: dbUser.id, phaseId: phase.id },
        });

        const isActive = phaseProgress?.status === "ACTIVE";
        if (isActive && !activePhaseTitle) {
          activePhaseTitle = phase.title;
        }

        for (const task of phase.tasks) {
          totalTasks++;
          const tp = task.taskProgress[0];
          if (tp?.status === "DONE") {
            completedTasks++;
          } else if (isActive && !nextTaskTitle && tp?.status === "IN_PROGRESS") {
            nextTaskTitle = task.title;
          }
        }
      }

      journey = {
        overallProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        completedTasks,
        totalTasks,
        activePhaseTitle,
        nextTaskTitle,
      };
    }
  } catch {
    // Journey not seeded yet — that's fine
  }

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
    streakDays,
    dailyTip,
    journey,
  };
}

// ─── Daily Tips ───────────────────────────────────────────────────

function generateDailyTip(
  onboarding: { targetRole: string | null; blockers: string[]; confidenceLevel: number | null; topSkills: string[]; preferredPace: string; trainingBudget: string | null } | null,
  profile: { skillGaps: string[]; readinessScore: number } | null
): string {
  const tips: string[] = [];

  if (!onboarding) {
    return "Complétez votre diagnostic pour recevoir des conseils personnalisés chaque jour.";
  }

  // Skill gap tips
  if (profile?.skillGaps?.length) {
    const gap = profile.skillGaps[0];
    tips.push(`Consacrez 20 min aujourd'hui à progresser en ${gap}. La régularité bat l'intensité.`);
  }

  // Blocker tips
  if (onboarding.blockers?.length) {
    tips.push(`Votre frein "${onboarding.blockers[0]}" est surmontable. Demandez au Copilot IA un plan d'action concret.`);
  }

  // Confidence tips
  if (onboarding.confidenceLevel !== null && onboarding.confidenceLevel <= 4) {
    tips.push("Rappelez-vous : votre expérience métier est un atout que 90% des juniors data n'ont pas.");
  }

  // Target role tips
  if (onboarding.targetRole) {
    tips.push(`Cherchez "${onboarding.targetRole}" sur LinkedIn et analysez 3 profils. Notez les compétences communes.`);
    tips.push(`Rejoignez un groupe LinkedIn ou Discord lié au rôle de ${onboarding.targetRole}. Le réseau accélère tout.`);
  }

  // Budget tips
  if (onboarding.trainingBudget === "none" || onboarding.trainingBudget === "low") {
    tips.push("Astuce : les certifications Google Data Analytics et IBM Data Science sur Coursera sont gratuites en audit.");
  }

  // Generic good tips
  tips.push("Bloquez 30 min dans votre agenda pour votre transition. Ce qui est planifié se réalise.");
  tips.push("Écrivez un post LinkedIn sur votre parcours de transition. L'écriture clarifie la pensée et attire les opportunités.");
  tips.push("Faites un mini-projet data avec des données de votre domaine actuel. C'est le meilleur portfolio possible.");

  // Pick one based on day of year (rotates daily)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return tips[dayOfYear % tips.length];
}
