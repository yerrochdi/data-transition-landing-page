-- =============================================================================
-- Founding Members applications table
-- =============================================================================
-- Apply this once on production via the Supabase SQL editor.
-- After applying, also enable RLS on the new table (see end of file).

CREATE TYPE "FoundingMemberApplicationStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'REJECTED'
);

CREATE TABLE "founding_member_applications" (
  "id"             TEXT PRIMARY KEY,
  "name"           TEXT NOT NULL,
  "email"          TEXT NOT NULL,
  "linkedinUrl"    TEXT NOT NULL,
  "currentRole"    TEXT NOT NULL,
  "currentCompany" TEXT NOT NULL,
  "situation"      TEXT NOT NULL,
  "motivation"     TEXT NOT NULL,
  "status"         "FoundingMemberApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedAt"     TIMESTAMP(3),
  "reviewerNote"   TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL
);

CREATE INDEX "founding_member_applications_status_idx" ON "founding_member_applications" ("status");
CREATE INDEX "founding_member_applications_createdAt_idx" ON "founding_member_applications" ("createdAt");

-- Enable Row Level Security to match the rest of the schema. Prisma uses
-- BYPASSRLS via the service_role connection, so the app continues to work.
ALTER TABLE "founding_member_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "founding_member_applications" FORCE ROW LEVEL SECURITY;
