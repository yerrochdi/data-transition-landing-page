"use server";

import { prisma } from "@/lib/db";
import type { ActionTemplate } from "@/lib/generated/prisma/enums";
import { hasBoostAccess } from "@/lib/billing/plan";

/**
 * The orchestrator. Given a userId, computes which single canonical
 * action they should do next. Strict ordering — see Sprint Phase A docs.
 *
 * Returns the picked template + any metadata it needs to render
 * (e.g. which brief to suggest), and a snapshot of the user's readiness
 * score at decision time.
 */

export type OrchestratorOutput = {
  template: ActionTemplate;
  metadata: Record<string, string> | null;
  readinessSnapshot: number;
};

export async function computeNextAction(
  userId: string
): Promise<OrchestratorOutput> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      plan: true,
      sprintExpiresAt: true,
      onboardingCompleted: true,
      profile: {
        select: { readinessScore: true },
      },
      onboarding: {
        select: { completedAt: true },
      },
      journeyProgress: {
        select: {
          status: true,
          progress: true,
          phase: { select: { order: true, slug: true, title: true } },
        },
      },
      deliverables: {
        select: {
          status: true,
          brief: {
            select: {
              slug: true,
              title: true,
              difficulty: true,
              isPremium: true,
              useFromProfile: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!user) {
    // Should never happen, but cover the case so the dashboard doesn't crash
    return {
      template: "COMPLETE_ONBOARDING",
      metadata: null,
      readinessSnapshot: 0,
    };
  }

  const readiness = user.profile?.readinessScore ?? 0;

  // ─── Rule 1: onboarding not complete ─────────────────────────
  if (!user.onboardingCompleted) {
    return {
      template: "COMPLETE_ONBOARDING",
      metadata: null,
      readinessSnapshot: readiness,
    };
  }

  // ─── Rule 2: diagnostic phase not even started ───────────────
  // The diagnostic phase is identified by slug (stable) — its `order`
  // varies by deployment (0 in some seeds, 1 in others). LOCKED means
  // the user has never opened it.
  const diagnostic = user.journeyProgress.find(
    (p) => p.phase.slug === "diagnostic"
  );
  if (!diagnostic || diagnostic.status === "LOCKED") {
    return {
      template: "RUN_DIAGNOSTIC",
      metadata: null,
      readinessSnapshot: readiness,
    };
  }

  // ─── Rule 3: no validated deliverable yet ────────────────────
  const validatedDeliverables = user.deliverables.filter(
    (d) => d.status === "VALIDATED"
  );
  const inProgressDeliverable = user.deliverables.find(
    (d) => d.status === "DRAFT" || d.status === "REVIEWED"
  );

  if (validatedDeliverables.length === 0) {
    // If a quick-win brief is already started, point them back to it
    if (inProgressDeliverable) {
      return {
        template: "FIRST_QUICK_DELIVERABLE",
        metadata: {
          briefSlug: inProgressDeliverable.brief.slug,
          briefTitle: inProgressDeliverable.brief.title,
        },
        readinessSnapshot: readiness,
      };
    }
    // Pick the easiest available quick-win (TEXT_ONLY + useFromProfile)
    // We hardcode the slug priority for V1: CV first, then 1-pager
    const candidate = await prisma.deliverableBrief.findFirst({
      where: {
        useFromProfile: true,
        isPremium: false,
        isPublished: true,
      },
      orderBy: { difficulty: "asc" },
      select: { slug: true, title: true },
    });
    if (candidate) {
      return {
        template: "FIRST_QUICK_DELIVERABLE",
        metadata: { briefSlug: candidate.slug, briefTitle: candidate.title },
        readinessSnapshot: readiness,
      };
    }
  }

  // ─── Rule 4: diagnostic phase not yet completed ──────────────
  // Only push this when the user has NO validated deliverable yet.
  // If they're already producing concrete work, momentum wins — keep
  // them on the deliverable track rather than dragging them back.
  if (
    diagnostic.status !== "COMPLETED" &&
    validatedDeliverables.length === 0
  ) {
    return {
      template: "ADVANCE_PHASE_1",
      metadata: null,
      readinessSnapshot: readiness,
    };
  }

  // ─── Rule 5: Phase 1 done + first deliverable done → opportunities ──
  // Show this once, then move on to the more ambitious deliverable.
  // Heuristic: if the user has just 1 validated deliverable, surface
  // opportunities so they calibrate the market before going deeper.
  if (validatedDeliverables.length === 1) {
    return {
      template: "EXPLORE_OPPORTUNITIES",
      metadata: null,
      readinessSnapshot: readiness,
    };
  }

  // ─── Rule 6: time for a more ambitious deliverable ───────────
  if (validatedDeliverables.length >= 1 && validatedDeliverables.length < 3) {
    const completedSlugs = new Set(
      user.deliverables.map((d) => d.brief.slug)
    );
    // Pick a level 3+ brief the user hasn't started yet, respecting plan
    const isPaid = hasBoostAccess({
      plan: user.plan,
      sprintExpiresAt: user.sprintExpiresAt,
    });
    const candidate = await prisma.deliverableBrief.findFirst({
      where: {
        difficulty: { gte: 3 },
        isPublished: true,
        slug: { notIn: Array.from(completedSlugs) },
        ...(isPaid ? {} : { isPremium: false }),
      },
      orderBy: [{ difficulty: "asc" }, { estimatedDays: "asc" }],
      select: { slug: true, title: true },
    });
    if (candidate) {
      return {
        template: "AMBITIOUS_DELIVERABLE",
        metadata: { briefSlug: candidate.slug, briefTitle: candidate.title },
        readinessSnapshot: readiness,
      };
    }
  }

  // ─── Rule 7: paid plans only — push them on later phases ─────
  const isPaid = hasBoostAccess({
    plan: user.plan,
    sprintExpiresAt: user.sprintExpiresAt,
  });
  if (isPaid) {
    const nextPhase = user.journeyProgress
      .filter((p) => p.phase.order > 1)
      .sort((a, b) => a.phase.order - b.phase.order)
      .find((p) => p.status !== "COMPLETED");
    if (nextPhase) {
      return {
        template: "ADVANCE_LATER_PHASE",
        metadata: { phaseLabel: nextPhase.phase.title },
        readinessSnapshot: readiness,
      };
    }
  }

  // ─── Sentinel ────────────────────────────────────────────────
  return {
    template: "KEEP_MOMENTUM",
    metadata: null,
    readinessSnapshot: readiness,
  };
}
