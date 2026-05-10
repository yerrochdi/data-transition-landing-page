"use server";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { computeNextAction } from "./recommendations";
import { renderAction, type RenderedAction } from "./templates";
import type { RecommendedAction } from "@/lib/generated/prisma/client";
import type { ActionTemplate } from "@/lib/generated/prisma/enums";

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    select: { id: true },
  });
  return dbUser?.id ?? null;
}

/**
 * Returns the user's currently-recommended action, recomputing if there
 * is no active row. Used by the dashboard to render the hero card.
 */
export async function getNextActionForCurrentUser(): Promise<
  | (RenderedAction & {
      readinessSnapshot: number;
      generatedAt: Date;
    })
  | null
> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  // Look for an existing active recommendation
  let row = await prisma.recommendedAction.findUnique({
    where: { userId },
  });

  // If none, or stale (>24h or COMPLETED), recompute
  const stale =
    !row ||
    row.status !== "ACTIVE" ||
    Date.now() - row.generatedAt.getTime() > 24 * 60 * 60 * 1000;

  if (stale) {
    row = await refreshNextAction(userId);
  }

  if (!row) return null;
  const rendered = renderAction(
    row.templateKey,
    (row.metadata as Record<string, string> | null) ?? null
  );
  return {
    ...rendered,
    readinessSnapshot: row.readinessSnapshot,
    generatedAt: row.generatedAt,
  };
}

/**
 * Force-recompute the user's next action and persist it. Called when:
 *  - the user completes a deliverable
 *  - finishes a journey task
 *  - the daily refresh is stale
 */
export async function refreshNextAction(
  userId: string
): Promise<RecommendedAction> {
  const result = await computeNextAction(userId);

  return prisma.recommendedAction.upsert({
    where: { userId },
    create: {
      userId,
      templateKey: result.template,
      metadata: result.metadata ?? undefined,
      readinessSnapshot: result.readinessSnapshot,
      status: "ACTIVE",
    },
    update: {
      templateKey: result.template,
      metadata: result.metadata ?? undefined,
      readinessSnapshot: result.readinessSnapshot,
      status: "ACTIVE",
      generatedAt: new Date(),
      completedAt: null,
    },
  });
}

/**
 * Mark the current action as completed and immediately compute the next
 * one. Returns the new rendered action so the UI can update without a
 * full page reload.
 */
export async function completeCurrentAction(): Promise<{
  ok: boolean;
  next?: RenderedAction & { readinessSnapshot: number };
  error?: string;
}> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  await prisma.recommendedAction.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  const fresh = await refreshNextAction(userId);
  const rendered = renderAction(
    fresh.templateKey,
    (fresh.metadata as Record<string, string> | null) ?? null
  );

  revalidatePath("/dashboard");
  return {
    ok: true,
    next: { ...rendered, readinessSnapshot: fresh.readinessSnapshot },
  };
}

/**
 * Skip the current action (the user wants something else). Re-runs the
 * orchestrator while marking the skipped template so we don't suggest
 * the same one immediately. For V1 we just recompute — if the rules
 * still pick the same template, that's acceptable.
 */
export async function skipCurrentAction(): Promise<{
  ok: boolean;
  next?: RenderedAction & { readinessSnapshot: number };
}> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false };

  await prisma.recommendedAction.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "SKIPPED", completedAt: new Date() },
  });
  const fresh = await refreshNextAction(userId);
  const rendered = renderAction(
    fresh.templateKey,
    (fresh.metadata as Record<string, string> | null) ?? null
  );
  revalidatePath("/dashboard");
  return {
    ok: true,
    next: { ...rendered, readinessSnapshot: fresh.readinessSnapshot },
  };
}

/**
 * Helper to pull just the template key — used by the Copilot system
 * prompt enrichment in Phase A step 2.
 */
export async function getActiveTemplateKey(
  userId: string
): Promise<ActionTemplate | null> {
  const row = await prisma.recommendedAction.findUnique({
    where: { userId },
    select: { templateKey: true, status: true },
  });
  if (!row || row.status !== "ACTIVE") return null;
  return row.templateKey;
}
