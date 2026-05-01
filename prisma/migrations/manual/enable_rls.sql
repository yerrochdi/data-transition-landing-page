-- ============================================================
-- Enable Row Level Security on all public tables
-- ============================================================
-- Context: NextMove AI accesses the DB exclusively through Prisma
-- using the `service_role` / direct Postgres connection string,
-- which bypasses RLS. We enable RLS + a "deny all" default policy
-- to block any access via PostgREST (anon / authenticated roles)
-- exposed by Supabase.
--
-- HOW TO APPLY:
--   Open Supabase Dashboard → SQL Editor → paste → Run.
--
-- SAFE TO RE-RUN: uses IF NOT EXISTS guards where possible.
-- ============================================================

-- Enable RLS on every public table
ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_responses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_phases         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_modules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_task_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_definitions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_matches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_bookmarks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources              ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (defense in depth).
-- service_role bypasses RLS regardless (BYPASSRLS attribute),
-- so Prisma keeps working. This just ensures no superuser leak
-- via ownership on the `postgres` role.
ALTER TABLE public.users                  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_responses   FORCE ROW LEVEL SECURITY;
ALTER TABLE public.journey_phases         FORCE ROW LEVEL SECURITY;
ALTER TABLE public.journey_modules        FORCE ROW LEVEL SECURITY;
ALTER TABLE public.journey_tasks          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.journey_progress       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.journey_task_progress  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.task_sessions          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.agent_definitions      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages         FORCE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_matches    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_bookmarks  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activities             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.resources              FORCE ROW LEVEL SECURITY;

-- No policies are created. With RLS enabled and no policy,
-- Postgres denies all access to anon/authenticated roles.
-- Prisma (service_role) continues to work via BYPASSRLS.
