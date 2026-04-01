"use server";

import { prisma } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  avgReadiness: number;
  newUsersThisWeek: number;
  completedOnboarding: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  onboardingCompleted: boolean;
  readinessScore: number;
  careerScore: number;
  targetRole: string | null;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface AdminData {
  stats: AdminStats;
  users: AdminUser[];
}

// ─── Main Action ──────────────────────────────────────────────────

export async function getAdminData(): Promise<AdminData> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    include: { profile: true },
    orderBy: { lastActiveAt: "desc" },
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.lastActiveAt >= twoDaysAgo).length;
  const premiumUsers = users.filter((u) => u.plan === "PREMIUM" || u.plan === "ENTERPRISE").length;
  const completedOnboarding = users.filter((u) => u.onboardingCompleted).length;
  const newUsersThisWeek = users.filter((u) => u.createdAt >= weekAgo).length;

  const readinessScores = users
    .map((u) => u.profile?.readinessScore ?? 0)
    .filter((s) => s > 0);
  const avgReadiness = readinessScores.length > 0
    ? Math.round(readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length)
    : 0;

  const adminUsers: AdminUser[] = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    plan: u.plan,
    onboardingCompleted: u.onboardingCompleted,
    readinessScore: u.profile?.readinessScore ?? 0,
    careerScore: u.profile?.careerScore ?? 0,
    targetRole: u.profile?.targetRole ?? null,
    lastActiveAt: u.lastActiveAt,
    createdAt: u.createdAt,
  }));

  return {
    stats: {
      totalUsers,
      activeUsers,
      premiumUsers,
      avgReadiness,
      newUsersThisWeek,
      completedOnboarding,
    },
    users: adminUsers,
  };
}
