-- =============================================================================
-- Multi-plan support: BOOST, FOUNDING + Sprint one-time pass
-- =============================================================================
-- Apply once on production via the Supabase SQL editor.
-- Safe: ADD VALUE on existing enum + ADD COLUMN nullable. No data loss.

-- 1. Extend the Plan enum with the new tiers (Postgres requires one ALTER per value).
ALTER TYPE "Plan" ADD VALUE IF NOT EXISTS 'BOOST';
ALTER TYPE "Plan" ADD VALUE IF NOT EXISTS 'FOUNDING';

-- 2. Track the expiry of one-time Sprint passes (30-day Pro access).
--    NULL = no Sprint active. Past timestamp = Sprint expired (auto-falls back to FREE/BOOST/etc).
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "sprintExpiresAt" TIMESTAMP(3);
