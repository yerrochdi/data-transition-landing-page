// ─── Plan Configuration ─────────────────────────────────────────
// Centralized plan limits and feature gates

export const PLAN_LIMITS = {
  FREE: {
    copilotMessagesPerDay: 5,
    sessionsPerDay: 3,
    journeyPhases: 1, // Only Phase 1
    opportunitiesVisible: 3,
    canAccessAllResources: true,
  },
  PREMIUM: {
    copilotMessagesPerDay: Infinity,
    sessionsPerDay: Infinity,
    journeyPhases: Infinity, // All phases
    opportunitiesVisible: Infinity,
    canAccessAllResources: true,
  },
  ENTERPRISE: {
    copilotMessagesPerDay: Infinity,
    sessionsPerDay: Infinity,
    journeyPhases: Infinity,
    opportunitiesVisible: Infinity,
    canAccessAllResources: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[(plan as PlanType) || "FREE"] ?? PLAN_LIMITS.FREE;
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
