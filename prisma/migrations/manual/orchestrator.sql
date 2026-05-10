-- ============================================================
-- Phase A — Orchestrator: RecommendedAction
-- Run in Supabase SQL editor
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "ActionTemplate" AS ENUM (
    'COMPLETE_ONBOARDING','RUN_DIAGNOSTIC','FIRST_QUICK_DELIVERABLE',
    'ADVANCE_PHASE_1','EXPLORE_OPPORTUNITIES','AMBITIOUS_DELIVERABLE',
    'ADVANCE_LATER_PHASE','KEEP_MOMENTUM'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ActionStatus" AS ENUM ('ACTIVE','COMPLETED','SKIPPED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "recommended_actions" (
  "id"                TEXT PRIMARY KEY,
  "userId"            TEXT NOT NULL UNIQUE,
  "templateKey"       "ActionTemplate" NOT NULL,
  "metadata"          JSONB,
  "status"            "ActionStatus" NOT NULL DEFAULT 'ACTIVE',
  "generatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"       TIMESTAMP(3),
  "readinessSnapshot" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "recommended_actions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "recommended_actions_userId_status_idx"
  ON "recommended_actions" ("userId", "status");

ALTER TABLE "recommended_actions" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recommended_actions_owner_all" ON "recommended_actions";
CREATE POLICY "recommended_actions_owner_all" ON "recommended_actions"
  FOR ALL
  USING (
    "userId" IN (SELECT id FROM "users" WHERE "supabaseId" = auth.uid()::text)
  );
