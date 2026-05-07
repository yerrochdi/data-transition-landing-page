"use server";

import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";

const MODEL = "moonshot-v1-32k"; // long context, cheap, good enough for scoring

// ─── Types ──────────────────────────────────────────────────────────

type UserContext = {
  userId: string;
  currentRole: string | null;
  currentSector: string | null;
  currentCompany: string | null;
  targetRole: string | null;
  targetSector: string | null;
  experienceYears: number | null;
  educationLevel: string | null;
  topSkills: string[];
  hasDataTraining: boolean;
  // Career goal — Sprint 1 imposed dimensions
  vertical: string | null; // FINANCE / TECH / OTHER
  transitionType: string | null; // PIVOT / UPSKILL / INTERNAL_EVOLUTION
  successIndicator: string | null; // NEW_JOB / DATA_PROJECTS / SALARY_INCREASE
  // Practical preferences
  remotePreference: string | null;
  location: string | null;
};

type OfferContext = {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  romeCode: string | null;
  location: string | null;
  contractType: string | null;
  salary: string | null;
  experienceText: string | null;
  remote: boolean;
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

  const profile = user.profile;
  const onboarding = user.onboarding;

  return {
    userId: user.id,
    currentRole: profile?.currentRole ?? onboarding?.currentRole ?? null,
    currentSector: profile?.currentSector ?? onboarding?.currentSector ?? null,
    currentCompany: profile?.currentCompany ?? null,
    targetRole: profile?.targetRole ?? onboarding?.targetRole ?? null,
    targetSector: profile?.targetSector ?? onboarding?.targetSector ?? null,
    experienceYears: profile?.experienceYears ?? onboarding?.experienceYears ?? null,
    educationLevel: onboarding?.educationLevel ?? null,
    topSkills: profile?.topSkills ?? onboarding?.topSkills ?? [],
    hasDataTraining: onboarding?.hasDataTraining ?? false,
    vertical: profile?.vertical ?? null,
    transitionType: profile?.transitionType ?? null,
    successIndicator: profile?.successIndicator ?? null,
    remotePreference: onboarding?.remotePreference ?? null,
    location: onboarding?.location ?? null,
  };
}

// ─── Prompt builder ─────────────────────────────────────────────────

const SCORING_SYSTEM_PROMPT = `Tu es un expert en matching offre/profil pour des cadres français seniors (35-50 ans, managers ou directors) qui veulent intégrer la data/IA dans leur carrière.

Tu reçois :
- Un profil utilisateur enrichi (poste actuel, cible, XP, secteur, vertical FINANCE/TECH/OTHER, type de transition, indicateur de succès, géographie, télétravail)
- Une liste d'offres (titre, entreprise, description, skills, contractType, salaire)

Pour chaque offre, tu calcules :
1. matchScore (0-100)
2. matchedSkills : compétences user qui matchent l'offre
3. missingSkills : compétences clés de l'offre que le user n'a pas
4. reason : 1 phrase claire ("Match fort sur Power BI et finance" ou "Trop junior pour ton profil senior")
5. gapExplanation : 2-3 phrases concrètes (à apprendre OU pourquoi l'offre ne convient pas)

═══ RÈGLES DE PÉNALISATION CRITIQUES ═══

⚠️ MISMATCH DE SÉNIORITÉ (le plus important — ce sont des cadres seniors)
- Si l'offre est junior/technicien/débutant ET user a >5 ans XP → score MAX 25
- Si l'offre est senior/lead/director ET user a <3 ans XP → score MAX 35
- Toujours indiquer "Niveau de séniorité incompatible" dans reason si applicable

⚠️ ADAPTATION SELON L'INDICATEUR DE SUCCÈS DU USER
- Si successIndicator = "DATA_PROJECTS" (upskill dans poste actuel) :
  → Pénalise les offres d'emploi externes (max 50)
  → Privilégie les rôles avec dimension projet/internal-mobility
- Si successIndicator = "SALARY_INCREASE" :
  → Pénalise les offres avec un salaire < estimation user actuel (max 40)
  → Privilégie les rôles avec salaire visible et compétitif
- Si successIndicator = "NEW_JOB" :
  → Pas de pénalité, privilégie les vrais matches role/sector

⚠️ MISMATCH DE VERTICAL
- Si vertical user = FINANCE et offre clairement TECH (et inversement) → pénalité -15 sauf si la cible explicite couvre les deux

⚠️ MISMATCH GÉOGRAPHIQUE
- Si user a une location précise et l'offre est dans une ville très éloignée ET user n'est pas remote-only → pénalité -10
- Si user est remote-only et offre est onsite uniquement → pénalité -20

═══ ÉCHELLE DE SCORE FINALE ═══
- 90-100 : match parfait (séniorité + rôle + secteur + skills + géo alignés)
- 70-89 : bon match avec 1-2 gaps comblables
- 50-69 : match correct mais gap notable
- 30-49 : match faible (mismatch séniorité ou vertical ou succès)
- 0-29 : pas adapté du tout (à ne pas afficher en priorité)

Sois SÉVÈRE. Mieux vaut 10 offres pertinentes qu'30 offres avec du bruit.

Réponds UNIQUEMENT avec un JSON valide au format :
{ "results": [ { "opportunityId": "...", "matchScore": 87, "matchedSkills": [...], "missingSkills": [...], "reason": "...", "gapExplanation": "..." } ] }
`;

function buildUserPrompt(user: UserContext, offers: OfferContext[]): string {
  const seniorityHint =
    user.experienceYears !== null
      ? user.experienceYears >= 8
        ? "(profil senior/director)"
        : user.experienceYears >= 4
        ? "(profil confirmé/manager)"
        : "(profil junior/intermédiaire)"
      : "";

  return `# Profil utilisateur ${seniorityHint}
- Poste actuel : ${user.currentRole ?? "non précisé"}${user.currentCompany ? ` chez ${user.currentCompany}` : ""}
- Secteur actuel : ${user.currentSector ?? "non précisé"}
- Cible : ${user.targetRole ?? "non précisé"} (${user.targetSector ?? "secteur libre"})
- Années d'XP : ${user.experienceYears ?? "non précisé"}
- Niveau d'études : ${user.educationLevel ?? "non précisé"}
- Compétences : ${user.topSkills.join(", ") || "aucune renseignée"}
- Formation data/IA déjà suivie : ${user.hasDataTraining ? "oui" : "non"}

## Objectif structuré (V1 dimensions)
- Vertical prioritaire : ${user.vertical ?? "non précisé"}
- Type de transition : ${user.transitionType ?? "non précisé"}
- Indicateur de succès : ${user.successIndicator ?? "non précisé"}

## Préférences pratiques
- Géographie : ${user.location ?? "non précisée"}
- Télétravail : ${user.remotePreference ?? "non précisé"}

# Offres à scorer (${offers.length})
${offers
  .map(
    (o, i) => `
## Offre ${i + 1} (id: ${o.id})
- Titre : ${o.title}
- Entreprise : ${o.company}
- Localisation : ${o.location ?? "non précisée"}
- Type de contrat : ${o.contractType ?? "non précisé"}
- Salaire : ${o.salary ?? "non précisé"}
- Expérience requise : ${o.experienceText ?? "non précisée"}
- Skills extraites : ${o.skills.join(", ") || "(aucune)"}
- Remote : ${o.remote ? "oui" : "non/non précisé"}
- Description : ${o.description.slice(0, 1500)}
`
  )
  .join("\n")}

Score les ${offers.length} offres en appliquant TOUTES les règles de pénalisation et renvoie le JSON.`;
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
      location: o.location,
      contractType: o.contractType,
      salary: o.salary,
      experienceText: o.experienceText,
      remote: o.remote,
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
