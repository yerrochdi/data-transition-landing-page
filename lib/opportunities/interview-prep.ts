"use server";

import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";

const MODEL = "moonshot-v1-32k";

export type InterviewPrep = {
  opportunityId: string;
  questions: Array<{
    question: string;
    why: string; // why this question for this offer
    suggestedAnswer: string; // tailored to the user's profile
  }>;
  salaryAdvice: string; // negotiation tips
  pitchOpening: string; // 30-second elevator pitch tailored to the offer
};

const SYSTEM_PROMPT = `Tu es un coach carrière expert qui prépare des cadres français à des entretiens d'embauche pour des postes data/IA.

Tu reçois :
- Une offre (titre, entreprise, description, skills clés, salaire si dispo)
- Le profil du candidat (poste actuel, cible, XP, compétences)

Tu génères :
- 10 questions probables que le recruteur va poser, classées du général au technique
- Pour chaque question : pourquoi elle est probable, et une suggestion de réponse adaptée au profil
- Un conseil de négociation salariale concret (range de salaire à viser, comment justifier)
- Un pitch d'ouverture de 30 secondes que le candidat peut utiliser

Critères :
- Adapte au niveau du candidat (senior cadre 35-50, pas junior)
- Si le candidat a un gap technique, anticipe les questions piège dessus
- Sois concret, pas générique ("parle moi de toi" → mauvais ; "comment ton XP marketing peut servir cette mission AI PM ?" → bon)

Réponds UNIQUEMENT avec un JSON valide au format :
{
  "questions": [{ "question": "...", "why": "...", "suggestedAnswer": "..." }, ...],
  "salaryAdvice": "...",
  "pitchOpening": "..."
}
`;

export async function generateInterviewPrep(
  userId: string,
  opportunityId: string
): Promise<InterviewPrep | null> {
  const [user, opportunity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, onboarding: true },
    }),
    prisma.opportunity.findUnique({
      where: { id: opportunityId },
    }),
  ]);

  if (!user || !opportunity) return null;

  const userPrompt = `# Offre
- Titre : ${opportunity.title}
- Entreprise : ${opportunity.company}
- Localisation : ${opportunity.location}
- Type : ${opportunity.contractType ?? "non précisé"}
- Salaire : ${opportunity.salary ?? "non précisé"}
- Skills clés : ${opportunity.skills.join(", ") || "aucune extraite"}
- Description : ${opportunity.description.slice(0, 2000)}

# Profil candidat
- Poste actuel : ${user.profile?.currentRole ?? user.onboarding?.currentRole ?? "non précisé"}
- Cible : ${user.profile?.targetRole ?? user.onboarding?.targetRole ?? "non précisé"}
- Années d'XP : ${user.profile?.experienceYears ?? user.onboarding?.experienceYears ?? "non précisé"}
- Compétences : ${(user.profile?.topSkills ?? user.onboarding?.topSkills ?? []).join(", ") || "(aucune)"}
- Réussites clés : ${user.onboarding?.keyAchievements ?? "non précisé"}

Génère la prep d'entretien en JSON.`;

  try {
    const completion = await ai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as Omit<InterviewPrep, "opportunityId">;
    return { opportunityId, ...parsed };
  } catch (err) {
    console.error("[interview-prep] generation failed:", err);
    return null;
  }
}
