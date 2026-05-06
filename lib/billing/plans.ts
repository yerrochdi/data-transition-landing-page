// ─── Plan Configuration ─────────────────────────────────────────
// Centralized plan limits and feature gates.
//
// NOTE: this file is the legacy quota source used across rate-limit.ts
// and a few server pages. The new structured source is `getQuotas()`
// in `./plan.ts`. Both must stay in sync until the migration is complete.

type PlanLimits = {
  copilotMessagesPerDay: number;
  sessionsPerDay: number;
  journeyPhases: number;
  opportunitiesVisible: number;
  hasFeedAccess: boolean;
  canAccessAllResources: boolean;
};

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    copilotMessagesPerDay: 5,
    sessionsPerDay: 3,
    journeyPhases: 1, // Only Phase 1
    opportunitiesVisible: 3,
    hasFeedAccess: false,
    canAccessAllResources: true,
  },
  BOOST: {
    copilotMessagesPerDay: 30,
    sessionsPerDay: 20,
    journeyPhases: Infinity,
    opportunitiesVisible: 10,
    hasFeedAccess: true,
    canAccessAllResources: true,
  },
  PREMIUM: {
    copilotMessagesPerDay: Infinity,
    sessionsPerDay: Infinity,
    journeyPhases: Infinity, // All phases
    opportunitiesVisible: Infinity,
    hasFeedAccess: true,
    canAccessAllResources: true,
  },
  FOUNDING: {
    copilotMessagesPerDay: Infinity,
    sessionsPerDay: Infinity,
    journeyPhases: Infinity,
    opportunitiesVisible: Infinity,
    hasFeedAccess: true,
    canAccessAllResources: true,
  },
  ENTERPRISE: {
    copilotMessagesPerDay: Infinity,
    sessionsPerDay: Infinity,
    journeyPhases: Infinity,
    opportunitiesVisible: Infinity,
    hasFeedAccess: true,
    canAccessAllResources: true,
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
}

// ─── Usage Checking ─────────────────────────────────────────────

export function isFeatureLocked(
  plan: string,
  feature: "journey_phase" | "copilot" | "sessions" | "opportunities",
  usage?: { count?: number; phaseOrder?: number }
): boolean {
  const limits = getPlanLimits(plan);

  switch (feature) {
    case "journey_phase":
      return (usage?.phaseOrder ?? 0) >= limits.journeyPhases;
    case "copilot":
      return (usage?.count ?? 0) >= limits.copilotMessagesPerDay;
    case "sessions":
      return (usage?.count ?? 0) >= limits.sessionsPerDay;
    case "opportunities":
      return (usage?.count ?? 0) >= limits.opportunitiesVisible;
    default:
      return false;
  }
}
