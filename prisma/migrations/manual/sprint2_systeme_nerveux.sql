-- Sprint 2 — Système nerveux (readiness vivante + journal d'événements)
--
-- 1. Nouveaux types d'événements de carrière sur l'enum ActivityType.
--    (Postgres : ADD VALUE est append-only et sans danger.)
-- 2. Baseline de readiness sur user_profiles : le score courant devient
--    baseline (déclaratif onboarding) + bonus de progression prouvée.
--    Backfill : la baseline = le score actuel (calculé à l'onboarding).

ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'DELIVERABLE_VALIDATED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'IMPACT_LOGGED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'COMMITMENT_MADE';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'WIN_DECLARED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'CHECKIN_ANSWERED';

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "readinessBaseline" INTEGER NOT NULL DEFAULT 0;

-- Backfill : pour les profils existants, la baseline = le score actuel
-- (qui n'a jamais bougé depuis l'onboarding — c'était le bug produit).
UPDATE "user_profiles"
SET "readinessBaseline" = "readinessScore"
WHERE "readinessBaseline" = 0 AND "readinessScore" > 0;
