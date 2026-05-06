-- =============================================================================
-- Career goal structure : 3 dimensions imposées au user (Sprint 1)
-- =============================================================================
-- Adds Vertical / TransitionType / Horizon / SuccessIndicator enums
-- and the 4 nullable columns on user_profiles.
--
-- All NULL by default — old users will have no goal until they revisit
-- their profile or do a new onboarding.

CREATE TYPE "Vertical" AS ENUM ('FINANCE', 'TECH', 'OTHER');

CREATE TYPE "TransitionType" AS ENUM ('PIVOT', 'UPSKILL', 'INTERNAL_EVOLUTION');

CREATE TYPE "Horizon" AS ENUM ('THREE_MONTHS', 'SIX_MONTHS', 'TWELVE_MONTHS');

CREATE TYPE "SuccessIndicator" AS ENUM ('NEW_JOB', 'DATA_PROJECTS', 'SALARY_INCREASE');

ALTER TABLE "user_profiles"
  ADD COLUMN IF NOT EXISTS "vertical"         "Vertical",
  ADD COLUMN IF NOT EXISTS "transitionType"   "TransitionType",
  ADD COLUMN IF NOT EXISTS "horizon"          "Horizon",
  ADD COLUMN IF NOT EXISTS "successIndicator" "SuccessIndicator";
