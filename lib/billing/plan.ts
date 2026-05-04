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
