-- =============================================================================
-- Real opportunities — Sprint 2
-- =============================================================================
-- Extends the existing `opportunities` table to support real job offers
-- pulled from France Travail (and later LinkedIn / Welcome to the Jungle).
-- Existing template-based opportunities continue to work via source = MANUAL.

CREATE TYPE "OpportunitySource" AS ENUM (
  'MANUAL',
  'FRANCE_TRAVAIL',
  'LINKEDIN_SCRAPE',
  'WTTJ_SCRAPE'
);

ALTER TABLE "opportunities"
  ADD COLUMN IF NOT EXISTS "source"         "OpportunitySource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN IF NOT EXISTS "externalId"     TEXT,
  ADD COLUMN IF NOT EXISTS "contractType"   TEXT,
  ADD COLUMN IF NOT EXISTS "experienceText" TEXT,
  ADD COLUMN IF NOT EXISTS "romeCode"       TEXT,
  ADD COLUMN IF NOT EXISTS "skills"         TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE UNIQUE INDEX IF NOT EXISTS "opportunities_externalId_key"
  ON "opportunities" ("externalId");

CREATE INDEX IF NOT EXISTS "opportunities_source_isActive_idx"
  ON "opportunities" ("source", "isActive");

CREATE INDEX IF NOT EXISTS "opportunities_postedAt_idx"
  ON "opportunities" ("postedAt");

-- Extend OpportunityMatch with gap explanation + last computed timestamp.
ALTER TABLE "opportunity_matches"
  ADD COLUMN IF NOT EXISTS "gapExplanation" TEXT,
  ADD COLUMN IF NOT EXISTS "matchedSkills"  TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "missingSkills"  TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "lastComputedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "opportunity_matches_userId_matchScore_idx"
  ON "opportunity_matches" ("userId", "matchScore");
