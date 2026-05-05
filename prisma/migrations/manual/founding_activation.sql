-- =============================================================================
-- Founding Members activation flow
-- =============================================================================
-- Adds an activation token + activatedAt timestamp on each application,
-- generated when an admin accepts the candidate. The token is sent by
-- email and consumed when the candidate completes Stripe checkout.

ALTER TABLE "founding_member_applications"
  ADD COLUMN IF NOT EXISTS "activationToken" TEXT,
  ADD COLUMN IF NOT EXISTS "activatedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "founding_member_applications_activationToken_key"
  ON "founding_member_applications" ("activationToken");
