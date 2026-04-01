"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────

export interface SettingsData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    plan: string;
    createdAt: Date;
  };
  profile: {
    currentRole: string | null;
    targetRole: string | null;
    currentSector: string | null;
    targetSector: string | null;
    experienceYears: number | null;
    confidenceLevel: number;
    careerScore: number;
    readinessScore: number;
  } | null;
  onboarding: {
    preferredPace: string;
    availableHoursPerWeek: number | null;
    trainingBudget: string | null;
    location: string | null;
    remotePreference: string | null;
    completedAt: Date | null;
  } | null;
}

// ─── Get Settings ─────────────────────────────────────────────────

export async function getSettingsData(): Promise<SettingsData | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    include: { profile: true, onboarding: true },
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
          targetRole: dbUser.profile.targetRole,
          currentSector: dbUser.profile.currentSector,
          targetSector: dbUser.profile.targetSector,
          experienceYears: dbUser.profile.experienceYears,
          confidenceLevel: dbUser.profile.confidenceLevel,
          careerScore: dbUser.profile.careerScore,
          readinessScore: dbUser.profile.readinessScore,
        }
      : null,
    onboarding: dbUser.onboarding
      ? {
          preferredPace: dbUser.onboarding.preferredPace,
          availableHoursPerWeek: dbUser.onboarding.availableHoursPerWeek,
          trainingBudget: dbUser.onboarding.trainingBudget,
          location: dbUser.onboarding.location,
          remotePreference: dbUser.onboarding.remotePreference,
          completedAt: dbUser.onboarding.completedAt,
        }
      : null,
  };
}

// ─── Update Profile ───────────────────────────────────────────────

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
  targetRole?: string;
  targetSector?: string;
  preferredPace?: string;
  availableHoursPerWeek?: number;
  trainingBudget?: string;
  location?: string;
  remotePreference?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return { success: false, error: "Non authentifié" };

  try {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });

    if (!dbUser) return { success: false, error: "Utilisateur introuvable" };

    // Update user name
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Update profile if exists
    if (data.targetRole || data.targetSector) {
      await prisma.userProfile.updateMany({
        where: { userId: dbUser.id },
        data: {
          ...(data.targetRole && { targetRole: data.targetRole }),
          ...(data.targetSector && { targetSector: data.targetSector }),
        },
      });
    }

    // Update onboarding preferences
    const onboardingUpdate: Record<string, unknown> = {};
    if (data.preferredPace) onboardingUpdate.preferredPace = data.preferredPace.toUpperCase();
    if (data.availableHoursPerWeek !== undefined) onboardingUpdate.availableHoursPerWeek = data.availableHoursPerWeek;
    if (data.trainingBudget) onboardingUpdate.trainingBudget = data.trainingBudget;
    if (data.location) onboardingUpdate.location = data.location;
    if (data.remotePreference) onboardingUpdate.remotePreference = data.remotePreference;

    if (Object.keys(onboardingUpdate).length > 0) {
      await prisma.onboardingResponse.updateMany({
        where: { userId: dbUser.id },
        data: onboardingUpdate,
      });
    }

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (e) {
    console.error("Update profile error:", e);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// ─── Reset Onboarding ─────────────────────────────────────────────

export async function resetOnboarding(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return { success: false, error: "Non authentifié" };

  try {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
    });

    if (!dbUser) return { success: false, error: "Utilisateur introuvable" };

    // Delete onboarding response
    await prisma.onboardingResponse.deleteMany({ where: { userId: dbUser.id } });

    // Delete user profile
    await prisma.userProfile.deleteMany({ where: { userId: dbUser.id } });

    // Delete journey progress (cascade deletes task progress)
    await prisma.journeyProgress.deleteMany({ where: { userId: dbUser.id } });

    // Delete seeded journey phases/tasks if no other users have progress on them
    const otherProgress = await prisma.journeyProgress.count();
    if (otherProgress === 0) {
      await prisma.journeyTask.deleteMany();
      await prisma.journeyPhase.deleteMany();
    }

    // Reset onboarding flag
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { onboardingCompleted: false },
    });

    return { success: true };
  } catch (e) {
    console.error("Reset onboarding error:", e);
    return { success: false, error: "Erreur lors du reset" };
  }
}

// ─── Delete Account ───────────────────────────────────────────────

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return { success: false, error: "Non authentifié" };

  try {
    // Delete from our DB (cascade will remove all related records)
    await prisma.user.deleteMany({
      where: { supabaseId: authUser.id },
    });

    // Sign out
    await supabase.auth.signOut();

    return { success: true };
  } catch (e) {
    console.error("Delete account error:", e);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}
