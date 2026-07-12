"use server";

import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";
import { DeliverableStatus } from "@/lib/generated/prisma/enums";

const MODEL = "moonshot-v1-32k";

export type AiReview = {
  score: number; // 0-100
  strengths: string[]; // exactly 3
  improvements: string[]; // exactly 3
  suggestion: string; // 1-2 lines, next concrete step
  verdict: "validated" | "needs_work";
};

const SYSTEM_PROMPT = `Tu es un mentor exigeant mais bienveillant qui évalue des livrables de cadres français en transition data/IA (35-50 ans, managers/directors).

Tu reçois :
- Le brief original (titre, contexte, livrable attendu, critères d'évaluation)
- Le profil de l'utilisateur (poste actuel, cible, XP)
- Le livrable soumis (texte markdown et/ou lien externe vers Notion/GitHub/Figma)

Ta mission :
- Évaluer le livrable strictement selon les **critères du brief** (et seulement eux — n'invente pas de critère)
- Donner un score 0-100 calibré : 50 = livré mais brouillon, 70 = solide, 85 = portfolio-worthy, 95+ = remarquable
- Lister **exactement 3 points forts** (concrets, pas génériques)
- Lister **exactement 3 axes d'amélioration** (actionnables — "ajoute X", pas "améliore la qualité")
- Donner **1 suggestion** (1-2 phrases) : la prochaine action à faire pour passer au niveau supérieur
- Verdict "validated" si score ≥ 70, sinon "needs_work"

Règles dures :
- Si le livrable est juste un lien sans description (< 100 caractères) ou un brouillon vide, score < 40 et verdict needs_work
- Pas de flagornerie : si c'est moyen, dis-le. Le user paye pour avoir un retour honnête, pas un coach LinkedIn
- Adresse-toi au user à la 2e personne du singulier ("tu as bien...")
- Ton de pair sénior, pas de prof condescendant

Réponds UNIQUEMENT avec un JSON valide :
{
  "score": <number 0-100>,
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "suggestion": "...",
  "verdict": "validated" | "needs_work"
}`;

export async function reviewDeliverable(
  deliverableId: string
): Promise<AiReview | null> {
  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
    include: {
      brief: true,
      user: { include: { profile: true, onboarding: true } },
    },
  });
  if (!deliverable) return null;

  const { brief, user } = deliverable;

  const userPrompt = `# Brief
**Titre :** ${brief.title}
**Secteur :** ${brief.sector}
**Difficulté :** ${brief.difficulty}/5 — Estimé : ${brief.estimatedDays} jours

## Énoncé
${brief.fullBrief}

## Critères d'évaluation officiels
${brief.evaluationCriteria}

# Profil de l'utilisateur
- Poste actuel : ${user.profile?.currentRole ?? user.onboarding?.currentRole ?? "non précisé"}
- Poste cible : ${user.profile?.targetRole ?? user.onboarding?.targetRole ?? "non précisé"}
- Années d'XP : ${user.profile?.experienceYears ?? user.onboarding?.experienceYears ?? "non précisé"}
- Compétences déclarées : ${(user.profile?.topSkills ?? user.onboarding?.topSkills ?? []).join(", ") || "(aucune)"}

# Livrable soumis
${deliverable.externalUrl ? `**Lien externe :** ${deliverable.externalUrl}\n\n` : ""}${
    deliverable.content
      ? `**Description / contenu :**\n\n${deliverable.content}`
      : "(aucune description fournie)"
  }

Évalue ce livrable et réponds en JSON.`;

  try {
    const completion = await ai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("[ai-review] empty response from Kimi");
      return null;
    }

    const parsed = JSON.parse(content) as AiReview;

    // Sanity checks
    const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    const strengths = (parsed.strengths ?? []).slice(0, 3);
    const improvements = (parsed.improvements ?? []).slice(0, 3);
    const verdict = score >= 70 ? "validated" : "needs_work";

    const review: AiReview = {
      score,
      strengths,
      improvements,
      suggestion: parsed.suggestion ?? "",
      verdict,
    };

    // Persist
    await prisma.deliverable.update({
      where: { id: deliverableId },
      data: {
        aiReview: review,
        aiReviewAt: new Date(),
        status: verdict === "validated"
          ? DeliverableStatus.VALIDATED
          : DeliverableStatus.REVIEWED,
        validatedAt: verdict === "validated" ? new Date() : null,
      },
    });

    // Recompute the user's next recommended action — the orchestrator
    // needs to know that a deliverable just got validated so it can
    // pivot to the next priority (e.g. ambitious deliverable, opportunities).
    if (verdict === "validated") {
      const { refreshNextAction } = await import("@/lib/orchestrator/actions");
      await refreshNextAction(deliverable.userId).catch((err) => {
        console.error("[orchestrator] refresh after deliverable failed:", err);
      });

      // Sprint 2 — journal d'événements + readiness vivante.
      // L'événement alimente le Point du Lundi ; le recalcul fait bouger
      // le score visiblement ("+4 pts"). Jamais bloquant pour la validation.
      await prisma.activity
        .create({
          data: {
            userId: deliverable.userId,
            type: "DELIVERABLE_VALIDATED",
            title: "Livrable validé",
            description: `Livrable validé avec un score IA de ${score}/100`,
            icon: "CheckCircle2",
          },
        })
        .catch((err) => console.error("[activity] log failed:", err));
      const { recomputeReadiness } = await import("@/lib/dashboard/readiness");
      await recomputeReadiness(deliverable.userId);
    }

    return review;
  } catch (err) {
    console.error("[ai-review] generation failed:", err);
    // Reset to DRAFT so the user can resubmit
    await prisma.deliverable.update({
      where: { id: deliverableId },
      data: { status: DeliverableStatus.DRAFT },
    });
    return null;
  }
}
