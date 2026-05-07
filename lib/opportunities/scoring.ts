"use server";

import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";

const MODEL = "moonshot-v1-32k"; // long context, cheap, good enough for scoring

// ─── Types ──────────────────────────────────────────────────────────

type UserContext = {
  userId: string;
  currentRole: string | null;
  targetRole: string | null;
  targetSector: string | null;
  experienceYears: number | null;
  topSkills: string[];
  hasDataTraining: boolean;
};

type OfferContext = {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  romeCode: string | null;
};

type ScoringResult = {
  opportunityId: string;
  matchScore: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  reason: string; // 1-line summary, used as aiReason
  gapExplanation: string; // 2-3 lines, what to learn to bridge the gap
};

// ─── Loader: fetch user + opportunities for scoring ────────────────

async function loadUserContext(userId: string): Promise<UserContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      onboarding: true,
    },
  });
  if (!user) return null;

  return {
    userId: user.id,
    currentRole: user.profile?.currentRole ?? user.onboarding?.currentRole ?? null,
    targetRole: user.profile?.targetRole ?? user.onboarding?.targetRole ?? null,
    targetSector: user.profile?.targetSector ?? user.onboarding?.targetSector ?? null,
    experienceYears: user.profile?.experienceYears ?? user.onboarding?.experienceYears ?? null,
    topSkills: user.profile?.topSkills ?? user.onboarding?.topSkills ?? [],
    hasDataTraining: user.onboarding?.hasDataTraining ?? false,
  };
}

// ─── Prompt builder ─────────────────────────────────────────────────

const SCORING_SYSTEM_PROMPT = `Tu es un expert en matching offre/profil pour des cadres français en transition vers la data/IA.

Tu reçois :
- Un profil utilisateur (poste actuel, cible, années d'XP, compétences)
- Une liste d'offres (titre, entreprise, description, skills extraites)

Pour chaque offre, tu calcules :
1. matchScore (0-100) : pertinence offre vs profil et cible
2. matchedSkills : compétences user qui matchent l'offre
3. missingSkills : compétences clés de l'offre que le user n'a pas
4. reason : 1 phrase claire ("Match fort sur Power BI et finance")
5. gapExplanation : 2-3 phrases concrètes sur ce qu'il faut apprendre

Critères de scoring :
- 90-100 : match parfait (rôle + secteur + skills alignés)
- 70-89 : bon match avec 1-2 gaps comblables en quelques mois
- 50-69 : match potentiel mais gap important
- 30-49 : match faible (changement de carrière nécessaire)
- 0-29 : pas adapté

Réponds UNIQUEMENT avec un JSON valide au format :
{ "results": [ { "opportunityId": "...", "matchScore": 87, "matchedSkills": [...], "missingSkills": [...], "reason": "...", "gapExplanation": "..." } ] }
`;

function buildUserPrompt(user: UserContext, offers: OfferContext[]): string {
  return `# Profil utilisateur
- Poste actuel : ${user.currentRole ?? "non précisé"}
- Cible : ${user.targetRole ?? "non précisé"} (${user.targetSector ?? "secteur libre"})
- Années d'XP : ${user.experienceYears ?? "non précisé"}
- Compétences : ${user.topSkills.join(", ") || "aucune renseignée"}
- Formation data/IA : ${user.hasDataTraining ? "oui" : "non"}

# Offres à scorer (${offers.length})
${offers
  .map(
    (o, i) => `
## Offre ${i + 1} (id: ${o.id})
- Titre : ${o.title}
- Entreprise : ${o.company}
- Skills extraites : ${o.skills.join(", ") || "(aucune)"}
- Description : ${o.description.slice(0, 1500)}
`
  )
  .join("\n")}

Score les ${offers.length} offres et renvoie le JSON.`;
}

// ─── Core: score N offers in a single AI call ──────────────────────

async function scoreOffersBatch(
  user: UserContext,
  offers: OfferContext[]
): Promise<ScoringResult[]> {
  if (offers.length === 0) return [];

  const completion = await ai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SCORING_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(user, offers) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return [];

  try {
    const parsed = JSON.parse(content) as { results?: ScoringResult[] };
    return parsed.results ?? [];
  } catch (err) {
    console.error("[scoring] failed to parse JSON:", err, content.slice(0, 500));
    return [];
  }
}

// ─── Public: score all active opportunities for a single user ──────

const BATCH_SIZE = 8; // small enough to keep prompts under context limit

/**
 * Computes (or refreshes) match scores for all active opportunities
 * against a given user. Persists in OpportunityMatch with upsert.
 *
 * Strategy:
 *   - Pulls active opportunities (preferring real ones)
 *   - Scores them in batches via Kimi
 *   - Upserts results with lastComputedAt = now
 *
 * Returns the count of opportunities successfully scored.
 */
export async function computeMatchesForUser(userId: string): Promise<{
  scored: number;
  failed: number;
}> {
  const user = await loadUserContext(userId);
  if (!user) return { scored: 0, failed: 0 };

  const opportunities = await prisma.opportunity.findMany({
    where: { isActive: true },
    orderBy: { postedAt: "desc" },
    take: 50, // hard cap for V1 — France Travail returns plenty
  });

  let scored = 0;
  let failed = 0;

  for (let i = 0; i < opportunities.length; i += BATCH_SIZE) {
    const batch = opportunities.slice(i, i + BATCH_SIZE);
    const offerContexts: OfferContext[] = batch.map((o) => ({
      id: o.id,
      title: o.title,
      company: o.company,
      description: o.description,
      skills: o.skills,
      romeCode: o.romeCode,
    }));

    try {
      const results = await scoreOffersBatch(user, offerContexts);

      // Map results by ID for safe upserts (model can shuffle order).
      const byId = new Map(results.map((r) => [r.opportunityId, r]));

      for (const offer of batch) {
        const result = byId.get(offer.id);
        if (!result) {
          failed++;
          continue;
        }
        await prisma.opportunityMatch.upsert({
          where: {
            opportunityId_userId: { opportunityId: offer.id, userId },
          },
          create: {
            opportunityId: offer.id,
            userId,
            matchScore: clampScore(result.matchScore),
            aiReason: result.reason.slice(0, 500),
            gapExplanation: result.gapExplanation.slice(0, 1000),
            matchedSkills: (result.matchedSkills ?? []).slice(0, 20),
            missingSkills: (result.missingSkills ?? []).slice(0, 20),
            lastComputedAt: new Date(),
          },
          update: {
            matchScore: clampScore(result.matchScore),
            aiReason: result.reason.slice(0, 500),
            gapExplanation: result.gapExplanation.slice(0, 1000),
            matchedSkills: (result.matchedSkills ?? []).slice(0, 20),
            missingSkills: (result.missingSkills ?? []).slice(0, 20),
            lastComputedAt: new Date(),
          },
        });
        scored++;
      }
    } catch (err) {
      console.error("[scoring] batch failed:", err);
      failed += batch.length;
    }
  }

  return { scored, failed };
}

function clampScore(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}
