"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import type { OnboardingFormData, SkillWithLevel } from "./types";
import { computeReadinessScore, computeCareerScore, computeSkillGaps } from "@/lib/dashboard/scoring";

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  });
  return dbUser?.id ?? null;
}

export async function saveOnboardingStep(
  stepIndex: number,
  data: Partial<OnboardingFormData>
) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Non authentifié" };

  try {
    const updateData: Record<string, unknown> = {};

    switch (stepIndex) {
      case 0: // Situation
        if (data.situation !== undefined) updateData.situation = data.situation;
        break;
      case 1: // Role
        if (data.currentRole !== undefined) updateData.currentRole = data.currentRole;
        if (data.currentSector !== undefined) updateData.currentSector = data.currentSector;
        if (data.experienceYears !== undefined) updateData.experienceYears = data.experienceYears;
        break;
      case 2: // Education
        if (data.educationLevel !== undefined) updateData.educationLevel = data.educationLevel;
        if (data.certifications !== undefined) updateData.certifications = data.certifications;
        if (data.hasDataTraining !== undefined) updateData.hasDataTraining = data.hasDataTraining;
        break;
      case 3: // Technical appetite
        if (data.technicalAppetite !== undefined) updateData.technicalAppetite = data.technicalAppetite;
        break;
      case 4: // Ambitions
        if (data.targetRole !== undefined) updateData.targetRole = data.targetRole;
        if (data.targetSector !== undefined) updateData.targetSector = data.targetSector;
        break;
      case 5: // Skills
        if (data.topSkills !== undefined) updateData.topSkills = data.topSkills;
        if (data.skillLevels !== undefined) updateData.skillLevels = data.skillLevels;
        break;
      case 6: // Motivation
        if (data.motivation !== undefined) updateData.motivation = data.motivation;
        if (data.keyAchievements !== undefined) updateData.keyAchievements = data.keyAchievements;
        if (data.dreamScenario !== undefined) updateData.dreamScenario = data.dreamScenario;
        break;
      case 7: // Blockers
        if (data.blockers !== undefined) updateData.blockers = data.blockers;
        break;
      case 8: // Confidence
        if (data.confidenceLevel !== undefined) updateData.confidenceLevel = data.confidenceLevel;
        break;
      case 9: // Availability & Goals
        if (data.shortTermGoal !== undefined) updateData.shortTermGoal = data.shortTermGoal;
        if (data.longTermGoal !== undefined) updateData.longTermGoal = data.longTermGoal;
        if (data.preferredPace !== undefined) updateData.preferredPace = data.preferredPace.toUpperCase();
        if (data.availableHoursPerWeek !== undefined) updateData.availableHoursPerWeek = data.availableHoursPerWeek;
        if (data.trainingBudget !== undefined) updateData.trainingBudget = data.trainingBudget;
        if (data.location !== undefined) updateData.location = data.location;
        if (data.remotePreference !== undefined) updateData.remotePreference = data.remotePreference;
        if (data.learningStyle !== undefined) updateData.learningStyle = data.learningStyle;
        if (data.priorities !== undefined) updateData.priorities = data.priorities;
        break;
    }

    await prisma.onboardingResponse.upsert({
      where: { userId },
      create: { userId, ...updateData },
      update: updateData,
    });

    return { success: true };
  } catch (e) {
    console.error("Failed to save onboarding step:", e);
    return { error: "Erreur de sauvegarde" };
  }
}

export async function completeOnboarding(
  data: OnboardingFormData,
  aiSummary: string | null,
  aiRecommendation: string | null
) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Non authentifié" };

  try {
    const fullData = {
      situation: data.situation,
      currentRole: data.currentRole,
      currentSector: data.currentSector,
      experienceYears: data.experienceYears,
      educationLevel: data.educationLevel,
      certifications: data.certifications,
      hasDataTraining: data.hasDataTraining,
      technicalAppetite: data.technicalAppetite,
      targetRole: data.targetRole,
      targetSector: data.targetSector,
      topSkills: data.topSkills,
      skillLevels: JSON.parse(JSON.stringify(data.skillLevels ?? [])),
      motivation: data.motivation,
      keyAchievements: data.keyAchievements,
      dreamScenario: data.dreamScenario,
      blockers: data.blockers,
      confidenceLevel: data.confidenceLevel,
      shortTermGoal: data.shortTermGoal,
      longTermGoal: data.longTermGoal,
      preferredPace: data.preferredPace.toUpperCase() as "RELAXED" | "MODERATE" | "INTENSIVE",
      availableHoursPerWeek: data.availableHoursPerWeek,
      trainingBudget: data.trainingBudget,
      location: data.location,
      remotePreference: data.remotePreference,
      learningStyle: data.learningStyle,
      priorities: data.priorities,
      aiSummary,
      aiRecommendation,
      completedAt: new Date(),
    };

    await prisma.onboardingResponse.upsert({
      where: { userId },
      create: { userId, ...fullData },
      update: fullData,
    });

    // Compute scores from onboarding data
    const readinessScore = computeReadinessScore(data);
    const careerScore = computeCareerScore(data, readinessScore);
    const skillGaps = computeSkillGaps(data);

    // Create/update user profile with computed scores
    const goalFields = {
      vertical: data.vertical || null,
      transitionType: data.transitionType || null,
      horizon: data.horizon || null,
      successIndicator: data.successIndicator || null,
    } as const;

    await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        currentRole: data.currentRole || null,
        currentSector: data.currentSector || null,
        targetRole: data.targetRole || null,
        targetSector: data.targetSector || null,
        experienceYears: data.experienceYears,
        topSkills: data.topSkills,
        skillGaps,
        confidenceLevel: data.confidenceLevel,
        readinessScore,
        careerScore,
        ...goalFields,
      },
      update: {
        currentRole: data.currentRole || null,
        currentSector: data.currentSector || null,
        targetRole: data.targetRole || null,
        targetSector: data.targetSector || null,
        experienceYears: data.experienceYears,
        topSkills: data.topSkills,
        skillGaps,
        confidenceLevel: data.confidenceLevel,
        readinessScore,
        careerScore,
        ...goalFields,
      },
    });

    // Mark onboarding as completed
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
      select: { email: true, firstName: true },
    });

    // Send welcome email (non-blocking)
    import("@/lib/email/send").then(({ sendEmail }) =>
      import("@/lib/email/templates").then(({ welcomeEmail }) =>
        sendEmail(updatedUser.email, "Bienvenue sur NextMove AI 🎯", welcomeEmail(updatedUser.firstName, data.targetRole || null))
      )
    ).catch(console.error);

    return { success: true };
  } catch (e) {
    console.error("Failed to complete onboarding:", e);
    return { error: "Erreur lors de la finalisation" };
  }
}

export async function loadOnboardingProgress(): Promise<{
  data: Partial<OnboardingFormData> | null;
  error?: string;
}> {
  const userId = await getCurrentUserId();
  if (!userId) return { data: null, error: "Non authentifié" };

  try {
    const r = await prisma.onboardingResponse.findUnique({
      where: { userId },
    });

    if (!r) return { data: null };

    return {
      data: {
        situation: r.situation || "",
        currentRole: r.currentRole || "",
        currentSector: r.currentSector || "",
        experienceYears: r.experienceYears,
        educationLevel: r.educationLevel || "",
        certifications: r.certifications || [],
        hasDataTraining: r.hasDataTraining,
        technicalAppetite: (r.technicalAppetite as "no-code" | "low-code" | "code" | "flexible") || "flexible",
        targetRole: r.targetRole || "",
        targetSector: r.targetSector || "",
        topSkills: r.topSkills,
        skillLevels: (r.skillLevels as SkillWithLevel[] | null) || [],
        motivation: r.motivation || "",
        keyAchievements: r.keyAchievements || "",
        dreamScenario: r.dreamScenario || "",
        blockers: r.blockers,
        confidenceLevel: r.confidenceLevel ?? 5,
        shortTermGoal: r.shortTermGoal || "",
        longTermGoal: r.longTermGoal || "",
        preferredPace: (r.preferredPace?.toLowerCase() as "relaxed" | "moderate" | "intensive") || "moderate",
        availableHoursPerWeek: r.availableHoursPerWeek ?? 5,
        trainingBudget: r.trainingBudget || "low",
        location: r.location || "",
        remotePreference: (r.remotePreference as "remote" | "hybrid" | "onsite" | "flexible") || "flexible",
        learningStyle: r.learningStyle || [],
        priorities: r.priorities || [],
      },
    };
  } catch (e) {
    console.error("Failed to load onboarding progress:", e);
    return { data: null, error: "Erreur de chargement" };
  }
}
