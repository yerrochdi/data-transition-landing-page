-- ============================================================
-- Sprint 3 — Livrables concrets / Portfolio
-- Run in Supabase SQL editor (or via prisma db push)
-- ============================================================

-- Enum: DeliverableStatus
DO $$ BEGIN
  CREATE TYPE "DeliverableStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED', 'VALIDATED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum: SubmissionMode
DO $$ BEGIN
  CREATE TYPE "SubmissionMode" AS ENUM ('TEXT_ONLY', 'LINK_REQUIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table: deliverable_briefs
CREATE TABLE IF NOT EXISTS "deliverable_briefs" (
  "id"                  TEXT PRIMARY KEY,
  "slug"                TEXT NOT NULL UNIQUE,
  "title"               TEXT NOT NULL,
  "shortDescription"    TEXT NOT NULL,
  "fullBrief"           TEXT NOT NULL,
  "sector"              TEXT NOT NULL,
  "skillCategory"       TEXT NOT NULL,
  "difficulty"          INTEGER NOT NULL,
  "estimatedDays"       INTEGER NOT NULL,
  "templateUrl"         TEXT,
  "tools"               TEXT[] NOT NULL DEFAULT '{}',
  "evaluationCriteria"  TEXT NOT NULL,
  "suggestedAtPhase"    INTEGER,
  "useFromProfile"      BOOLEAN NOT NULL DEFAULT false,
  "submissionMode"      "SubmissionMode" NOT NULL DEFAULT 'LINK_REQUIRED',
  "isPublished"         BOOLEAN NOT NULL DEFAULT true,
  "isPremium"           BOOLEAN NOT NULL DEFAULT false,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "deliverable_briefs_sector_isPublished_idx"
  ON "deliverable_briefs" ("sector", "isPublished");

-- Table: deliverables
CREATE TABLE IF NOT EXISTS "deliverables" (
  "id"            TEXT PRIMARY KEY,
  "userId"        TEXT NOT NULL,
  "briefId"       TEXT NOT NULL,
  "status"        "DeliverableStatus" NOT NULL DEFAULT 'DRAFT',
  "content"       TEXT,
  "fileUrl"       TEXT,
  "externalUrl"   TEXT,
  "aiReview"      JSONB,
  "aiReviewAt"    TIMESTAMP(3),
  "isPublic"      BOOLEAN NOT NULL DEFAULT false,
  "shareableSlug" TEXT UNIQUE,
  "startedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedAt"   TIMESTAMP(3),
  "validatedAt"   TIMESTAMP(3),
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "deliverables_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "deliverables_briefId_fkey"
    FOREIGN KEY ("briefId") REFERENCES "deliverable_briefs"("id") ON DELETE RESTRICT,
  CONSTRAINT "deliverables_userId_briefId_unique"
    UNIQUE ("userId", "briefId")
);

CREATE INDEX IF NOT EXISTS "deliverables_userId_status_idx"
  ON "deliverables" ("userId", "status");

-- RLS — same pattern as other user-scoped tables
ALTER TABLE "deliverable_briefs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deliverables" ENABLE ROW LEVEL SECURITY;

-- Briefs are public-readable for any authenticated user
DROP POLICY IF EXISTS "deliverable_briefs_read" ON "deliverable_briefs";
CREATE POLICY "deliverable_briefs_read" ON "deliverable_briefs"
  FOR SELECT
  USING (true);

-- Deliverables: only the owning user, or any user if isPublic=true
DROP POLICY IF EXISTS "deliverables_owner_all" ON "deliverables";
CREATE POLICY "deliverables_owner_all" ON "deliverables"
  FOR ALL
  USING (
    "userId" IN (
      SELECT id FROM "users" WHERE "supabaseId" = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "deliverables_public_read" ON "deliverables";
CREATE POLICY "deliverables_public_read" ON "deliverables"
  FOR SELECT
  USING ("isPublic" = true);
