-- ============================================================
-- Billing — Stripe webhook idempotency
-- Run in Supabase SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS "processed_stripe_events" (
  "id"          TEXT PRIMARY KEY,        -- the Stripe event id (evt_...)
  "type"        TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RLS on with no policy → only the service role (webhook handler) can
-- touch this table. End users never read or write it.
ALTER TABLE "processed_stripe_events" ENABLE ROW LEVEL SECURITY;
