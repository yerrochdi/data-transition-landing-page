"use server";

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

/**
 * Progressive unlocks — these rules decide whether a feature page is
 * available to the user or should show a locked teaser explaining what
 * to do first. They mirror the orchestrator's recommendations order so
 * the user can't accidentally skip a step that the agent considers
 * prerequisite.
 *
 * Rules (Phase A step 3):
 * - /opportunities : requires diagnostic COMPLETED + at least 1 VALIDATED deliverable
 * - briefs with difficulty >= 3 : require at least 1 VALIDATED deliverable
 *
 * Each gate returns a `Gate` object with `ok: true` (allowed) or
 * `ok: false` with a reason + suggested action (template for the
 * <LockedPage> component to render).
 */

export type GateResult =
  | { ok: true }
  | {
      ok: false;
      reason: string;
      requirement: string;
      suggestedHref: string;
      suggestedCta: string;
    };

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
 * Can the current user access /opportunities ?
 * Requires diagnostic COMPLETED AND ≥1 deliverable VALIDATED.
 */
export async function gateOpportunities(): Promise<GateResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: true }; // middleware redirects unauth users

  const [diagnostic, validatedCount] = await Promise.all([
    prisma.journeyProgress.findFirst({
      where: { userId, phase: { slug: "diagnostic" } },
      select: { status: true },
    }),
    prisma.deliverable.count({
      where: { userId, status: "VALIDATED" },
    }),
  ]);

  if (!diagnostic || diagnostic.status !== "COMPLETED") {
    return {
      ok: false,
      reason: "Tu débloques les opportunités matchées dès que ton diagnostic est terminé.",
      requirement: "Diagnostic IA à 100%",
      suggestedHref: "/journey",
      suggestedCta: "Reprendre le diagnostic",
    };
  }

  if (validatedCount === 0) {
    return {
      ok: false,
      reason: "Sans au moins un livrable validé, postuler n'a pas de sens — tu n'as pas encore de preuve à montrer. Commence par un quick win.",
      requirement: "1 livrable validé minimum",
      suggestedHref: "/deliverables",
      suggestedCta: "Choisir un livrable",
    };
  }

  return { ok: true };
}

/**
 * Can the current user start a brief of given difficulty ?
 * Difficulty 1-2 = quick wins, always allowed.
 * Difficulty ≥ 3 = ambitious, requires ≥1 VALIDATED deliverable.
 */
export async function gateBriefStart(briefDifficulty: number): Promise<GateResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: true };

  if (briefDifficulty <= 2) return { ok: true };

  const validatedCount = await prisma.deliverable.count({
    where: { userId, status: "VALIDATED" },
  });

  if (validatedCount === 0) {
    return {
      ok: false,
      reason: "Ce brief est ambitieux (3+ jours, niveau intermédiaire). Commence par un quick win pour prendre tes marques avant.",
      requirement: "1 livrable validé minimum",
      suggestedHref: "/deliverables",
      suggestedCta: "Voir les quick wins",
    };
  }

  return { ok: true };
}
