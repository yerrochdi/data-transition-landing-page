-- ============================================================
-- Career OS — Enrichment fields on OnboardingResponse
-- Run in Supabase SQL editor
-- ============================================================
-- These 3 optional fields are populated by mini-onboarding flows
-- the user can complete after their first bilan, to enrich the
-- product's understanding of their career as a long-term Career OS.

ALTER TABLE onboarding_responses
  ADD COLUMN IF NOT EXISTS "careerInflections"   JSONB,
  ADD COLUMN IF NOT EXISTS "careerInflectionsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "longTermVision"      JSONB,
  ADD COLUMN IF NOT EXISTS "longTermVisionAt"    TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "careerAnchors"       JSONB,
  ADD COLUMN IF NOT EXISTS "careerAnchorsAt"     TIMESTAMP(3);

-- Bilan public sharing (opt-in by user from dashboard).
ALTER TABLE onboarding_responses
  ADD COLUMN IF NOT EXISTS "bilanIsPublic"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "bilanShareableSlug" TEXT UNIQUE;
