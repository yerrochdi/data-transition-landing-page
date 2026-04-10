"use server";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "./plans";

// ─── Get authenticated user with plan ───────────────────────────

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, email: true, plan: true },
  });
}

// ─── Check daily usage against plan limits ──────────────────────

export async function checkCopilotLimit(userId: string, plan: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const limits = getPlanLimits(plan);
  const max = limits.copilotMessagesPerDay;

  if (max === Infinity) {
    return { allowed: true, used: 0, limit: max };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const used = await prisma.activity.count({
    where: {
      userId,
      type: "AGENT_INTERACTION",
      createdAt: { gte: today },
    },
  });

  return { allowed: used < max, used, limit: max };
}

export async function checkSessionLimit(userId: string, plan: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  const limits = getPlanLimits(plan);
  const max = limits.sessionsPerDay;

  if (max === Infinity) {
    return { allowed: true, used: 0, limit: max };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const used = await prisma.taskSession.count({
    where: {
      userId,
      createdAt: { gte: today },
    },
  });

  return { allowed: used < max, used, limit: max };
}

export async function checkPhaseAccess(
  userId: string,
  plan: string,
  taskId: string
): Promise<{ allowed: boolean }> {
  const limits = getPlanLimits(plan);

  if (limits.journeyPhases === Infinity) {
    return { allowed: true };
  }

  const task = await prisma.journeyTask.findUnique({
    where: { id: taskId },
    include: { phase: { select: { order: true } } },
  });

  if (!task) return { allowed: false };

  // Phase order is 0-indexed, maxPhases is count (1 = Phase 1 only = order 0)
  return { allowed: task.phase.order < limits.journeyPhases };
}

// ─── Track usage (call AFTER successful AI response) ────────────

export async function trackCopilotUsage(userId: string): Promise<void> {
  await prisma.activity.create({
    data: {
      userId,
      type: "AGENT_INTERACTION",
      title: "Message Copilot",
    },
  });
}
