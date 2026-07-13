-- Coach actionnable (2b) — persistance du matériel personnel de l'onboarding.
-- Les réponses Ikigai et le diagnostic LinkedIn étaient perdus après la
-- génération du bilan : le coach ne pouvait jamais s'y référer.

ALTER TABLE "onboarding_responses"
  ADD COLUMN IF NOT EXISTS "ikigai" JSONB,
  ADD COLUMN IF NOT EXISTS "linkedinAnalysis" JSONB;
