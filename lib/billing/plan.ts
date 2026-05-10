import type { Plan } from "@/lib/generated/prisma/enums";

/**
 * Compact view of a user's billing state used by feature gates.
 * - `plan` is the persisted Plan enum (FREE / BOOST / PREMIUM / FOUNDING / ENTERPRISE)
 * - `sprintExpiresAt` is set when a user purchased a one-time Sprint
 */
export type BillingState = {
  plan: Plan;
  sprintExpiresAt: Date | null;
};

const PAID_PLANS: ReadonlyArray<Plan> = [
  "BOOST",
  "PREMIUM",
  "FOUNDING",
  "ENTERPRISE",
];

const PRO_TIER_PLANS: ReadonlyArray<Plan> = [
  "PREMIUM",
  "FOUNDING",
  "ENTERPRISE",
];

export function hasActiveSprint(state: BillingState): boolean {
  if (!state.sprintExpiresAt) return false;
  return state.sprintExpiresAt.getTime() > Date.now();
}

/**
 * True if the user has any paid access (subscription or active Sprint).
 * Use this for "is this a paying customer at all" checks.
 */
export function isPaidPlan(state: BillingState): boolean {
  return PAID_PLANS.includes(state.plan) || hasActiveSprint(state);
}

/**
 * True if the user has Pro-tier access (full features). This is what
 * unlocks unlimited AI sessions, full journey, all opportunities, etc.
 *
 * BOOST users have a more limited Pro experience, so they don't qualify
 * here — only PREMIUM, FOUNDING, ENTERPRISE, or an active Sprint do.
 */
export function hasProAccess(state: BillingState): boolean {
  return PRO_TIER_PLANS.includes(state.plan) || hasActiveSprint(state);
}

/**
 * True if the user has at least Boost-tier access (full journey unlocked,
 * higher AI limits than free).
 */
export function hasBoostAccess(state: BillingState): boolean {
  return isPaidPlan(state);
}

/**
 * Stable label for UI badges. Sprint takes precedence when active.
 */
export function planLabel(state: BillingState): string {
  if (hasActiveSprint(state)) return "Sprint";
  switch (state.plan) {
    case "FREE":
      return "Free";
    case "BOOST":
      return "Boost";
    case "PREMIUM":
      return "Pro";
    case "FOUNDING":
      return "Founding Member";
    case "ENTERPRISE":
      return "Enterprise";
  }
}

// ─── Quotas per plan ────────────────────────────────────────────────

/**
 * Concrete feature limits for a given billing state. Quotas are consumed
 * daily (UTC midnight reset) and tracked in the DailyUsage table.
 *
 * Conventions:
 * - `null` means unlimited.
 * - `journeyPhasesUnlocked` is the highest phase index (1-5) that the user
 *   can access. FREE only sees Phase 1 ("Diagnostic").
 * - `opportunitiesLimit` is the number of opportunities visible in the
 *   feed. Anything beyond is teased (Pattern B blur overlay).
 */
export type Quotas = {
  // AI usage (per day)
  copilotMessagesPerDay: number | null;
  aiSessionsPerDay: number | null;

  // Content gates
  journeyPhasesUnlocked: number; // 1-5
  opportunitiesLimit: number | null; // visible cards in /opportunities
  deliverablesPerMonth: number | null; // briefs that can be started per 30-day window
  hasFeedAccess: boolean; // /feed locked behind paid plans
  hasPrioritySupport: boolean;

  // Hard ceiling for paid tiers to prevent abuse (Pro/Founding/Sprint).
  // null on FREE/BOOST since their dailyLimit is the actual cap.
  hardDailyCeiling: number | null;
};

const QUOTAS_BY_PLAN: Record<Plan, Quotas> = {
  FREE: {
    copilotMessagesPerDay: 5,
    aiSessionsPerDay: 3,
    journeyPhasesUnlocked: 1,
    opportunitiesLimit: 3,
    deliverablesPerMonth: 1,
    hasFeedAccess: false,
    hasPrioritySupport: false,
    hardDailyCeiling: null,
  },
  BOOST: {
    copilotMessagesPerDay: 30,
    aiSessionsPerDay: 20,
    journeyPhasesUnlocked: 5,
    opportunitiesLimit: 10,
    deliverablesPerMonth: 5,
    hasFeedAccess: true,
    hasPrioritySupport: false,
    hardDailyCeiling: null,
  },
  PREMIUM: {
    copilotMessagesPerDay: null, // unlimited
    aiSessionsPerDay: null,
    journeyPhasesUnlocked: 5,
    opportunitiesLimit: null,
    deliverablesPerMonth: null,
    hasFeedAccess: true,
    hasPrioritySupport: true,
    hardDailyCeiling: 200,
  },
  FOUNDING: {
    copilotMessagesPerDay: null,
    aiSessionsPerDay: null,
    journeyPhasesUnlocked: 5,
    opportunitiesLimit: null,
    deliverablesPerMonth: null,
    hasFeedAccess: true,
    hasPrioritySupport: true,
    hardDailyCeiling: 200,
  },
  ENTERPRISE: {
    copilotMessagesPerDay: null,
    aiSessionsPerDay: null,
    journeyPhasesUnlocked: 5,
    opportunitiesLimit: null,
    deliverablesPerMonth: null,
    hasFeedAccess: true,
    hasPrioritySupport: true,
    hardDailyCeiling: 500,
  },
};

/**
 * Returns the effective quotas for a user. An active Sprint pass
 * temporarily upgrades the user to PREMIUM-tier quotas regardless of
 * their persisted plan.
 */
export function getQuotas(state: BillingState): Quotas {
  if (hasActiveSprint(state)) {
    return QUOTAS_BY_PLAN.PREMIUM;
  }
  return QUOTAS_BY_PLAN[state.plan];
}

/**
 * Helper for UI: returns true if the user has used up their daily quota
 * for a given resource. `used` is the count from DailyUsage for today.
 */
export function isQuotaExceeded(
  used: number,
  limit: number | null
): boolean {
  if (limit === null) return false;
  return used >= limit;
}

/**
 * Compute remaining quota for display ("3 messages restants aujourd'hui").
 * Returns null when the resource is unlimited.
 */
export function quotaRemaining(
  used: number,
  limit: number | null
): number | null {
  if (limit === null) return null;
  return Math.max(0, limit - used);
}
