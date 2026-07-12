"use server";

/**
 * Sprint 2 — READINESS VIVANTE.
 *
 * Avant : le readinessScore était calculé une fois à l'onboarding puis figé
 * à vie — un compteur mort. Maintenant :
 *
 *   score courant = baseline (déclaratif onboarding) + bonus de progression prouvée
 *
 * Le bonus vient d'actions RÉELLES (pas de déclaratif) :
 *   - livrable validé   : +4 pts (cap 20)  — la preuve la plus forte
 *   - phase complétée   : +3 pts (cap 12)
 *   - tâche complétée   : +0,5 pt (cap 8)
 *
 * Total plafonné à 100. Le recalcul est idempotent (la baseline est stockée
 * séparément — pas de double comptage).
 *
 * À appeler après chaque événement de progression (validation livrable,
 * complétion tâche/phase). Écrit aussi un AnalyticsSnapshot (1/jour max,
 * upsert) qui alimente le delta hebdo + la sparkline du dashboard et,
 * plus tard, le Point du Lundi.
 */

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const BONUS = {
  deliverableValidated: { points: 4, cap: 20 },
  phaseCompleted: { points: 3, cap: 12 },
  taskCompleted: { points: 0.5, cap: 8 },
} as const;

export type ReadinessResult = {
  score: number;
  baseline: number;
  bonus: number;
  delta: number; // vs score précédent
};

/**
 * Recalcule le readiness d'un utilisateur à partir de sa progression réelle,
 * met à jour son profil et écrit le snapshot du jour.
 *
 * Silencieux en cas d'erreur (retourne null) : le recalcul ne doit JAMAIS
 * faire échouer l'action métier qui l'a déclenché (validation de livrable…).
 */
export async function recomputeReadiness(
  userId: string
): Promise<ReadinessResult | null> {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { readinessScore: true, readinessBaseline: true, careerScore: true },
    });
    if (!profile) return null;

    // Backfill auto-réparant : les profils créés avant le Sprint 2 ont
    // baseline=0 mais un readinessScore d'onboarding — on l'adopte comme
    // baseline (une seule fois, persisté ensuite).
    let baseline = profile.readinessBaseline;
    if (baseline === 0 && profile.readinessScore > 0) {
      baseline = profile.readinessScore;
      await prisma.userProfile.update({
        where: { userId },
        data: { readinessBaseline: baseline },
      });
    }

    // ── Progression réelle ──
    const [validatedDeliverables, completedPhases, completedTasks] =
      await Promise.all([
        prisma.deliverable.count({
          where: { userId, status: "VALIDATED" },
        }),
        prisma.journeyProgress.count({
          where: { userId, status: "COMPLETED" },
        }),
        prisma.journeyTaskProgress.count({
          where: {
            journeyProgress: { userId },
            status: "DONE",
          },
        }),
      ]);

    const bonus =
      Math.min(validatedDeliverables * BONUS.deliverableValidated.points, BONUS.deliverableValidated.cap) +
      Math.min(completedPhases * BONUS.phaseCompleted.points, BONUS.phaseCompleted.cap) +
      Math.min(Math.round(completedTasks * BONUS.taskCompleted.points), BONUS.taskCompleted.cap);

    const newScore = Math.min(100, baseline + bonus);
    const delta = newScore - profile.readinessScore;

    if (delta !== 0) {
      await prisma.userProfile.update({
        where: { userId },
        data: { readinessScore: newScore },
      });
    }

    // ── Snapshot quotidien (upsert : 1 max par jour) ──
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existing = await prisma.analyticsSnapshot.findFirst({
      where: { userId, snapshotDate: { gte: todayStart } },
      select: { id: true },
    });

    const snapshotData = {
      careerScore: profile.careerScore,
      readinessScore: newScore,
      overallProgress: Math.min(100, Math.round((completedPhases / 5) * 100)),
      completedPhases,
      totalTasksCompleted: completedTasks,
      streakDays: 0, // résidu de schéma — plus de streaks (anti-reco audit/06)
      skillProgress: [] as { name: string }[],
    };

    if (existing) {
      await prisma.analyticsSnapshot.update({
        where: { id: existing.id },
        data: snapshotData,
      });
    } else {
      await prisma.analyticsSnapshot.create({
        data: { userId, ...snapshotData },
      });
    }

    return { score: newScore, baseline, bonus, delta };
  } catch (err) {
    console.error("[readiness] recompute failed:", err);
    return null;
  }
}

export type ReadinessTrend = {
  /** Delta du score sur les 7 derniers jours (0 si pas d'historique). */
  weeklyDelta: number;
  /** Points (date + score) des ~8 dernières semaines pour la sparkline. */
  history: { date: string; score: number }[];
};

/**
 * Variante "current user" pour les Server Components (pattern
 * getNextActionForCurrentUser) : résout l'utilisateur depuis la session
 * Supabase puis délègue à getReadinessTrend.
 */
export async function getReadinessTrendForCurrentUser(): Promise<ReadinessTrend | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true },
    });
    if (!dbUser) return null;
    return getReadinessTrend(dbUser.id);
  } catch {
    return null;
  }
}

/**
 * Tendance du readiness pour le dashboard : delta hebdo + historique
 * (jusqu'à 56 jours de snapshots, échantillonnés tels quels — la sparkline
 * lisse visuellement).
 */
export async function getReadinessTrend(
  userId: string
): Promise<ReadinessTrend> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 56);

    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: { userId, snapshotDate: { gte: since } },
      orderBy: { snapshotDate: "asc" },
      select: { snapshotDate: true, readinessScore: true },
    });

    if (snapshots.length === 0) {
      return { weeklyDelta: 0, history: [] };
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const latest = snapshots[snapshots.length - 1];
    // Le point de référence : le dernier snapshot AVANT les 7 derniers jours,
    // sinon le plus ancien disponible.
    const before = [...snapshots].reverse().find((s) => s.snapshotDate < weekAgo);
    const reference = before ?? snapshots[0];
    const weeklyDelta = latest.readinessScore - reference.readinessScore;

    return {
      weeklyDelta,
      history: snapshots.map((s) => ({
        date: s.snapshotDate.toISOString().slice(0, 10),
        score: s.readinessScore,
      })),
    };
  } catch (err) {
    console.error("[readiness] trend failed:", err);
    return { weeklyDelta: 0, history: [] };
  }
}
