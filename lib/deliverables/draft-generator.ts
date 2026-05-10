"use server";

import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";

const MODEL = "moonshot-v1-32k";

const SYSTEM_PROMPT = `Tu es un assistant qui rédige un PREMIER JET de livrable pour un cadre français en transition data/IA (35-50 ans, manager/director).

Tu reçois :
- Le brief (titre, énoncé, critères)
- Le profil de l'utilisateur (poste actuel, cible, compétences, réalisations clés, secteur)

Ta mission :
- Produire un draft DIRECTEMENT UTILISABLE comme point de départ — pas un plan, pas un sommaire
- Réutiliser MAXIMUM les vraies infos du profil (poste, secteur, réalisations, outils déclarés)
- Si une info manque (chiffre, contexte précis), mets un placeholder TRÈS visible : "[À COMPLÉTER : ...]"
- Format markdown propre, prêt à coller dans Notion / Google Docs / un éditeur
- Adapte le ton : c'est un cadre senior qui se vend, pas un junior

Règles dures :
- Pas d'introduction du genre "Voici un draft de votre…" — tu écris LE livrable directement
- Pas de méta-commentaire sur ce que tu fais
- Si le profil est trop pauvre pour générer du concret, génère quand même un squelette structuré avec [À COMPLÉTER] partout

Réponds UNIQUEMENT avec le contenu markdown du draft, sans préambule ni JSON wrapper.`;

export async function generateDraftFromProfile(
  userId: string,
  briefId: string
): Promise<{ ok: boolean; draft?: string; error?: string }> {
  const [user, brief] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, onboarding: true },
    }),
    prisma.deliverableBrief.findUnique({
      where: { id: briefId },
    }),
  ]);

  if (!user) return { ok: false, error: "Utilisateur introuvable" };
  if (!brief) return { ok: false, error: "Brief introuvable" };
  if (!brief.useFromProfile) {
    return {
      ok: false,
      error: "Ce brief ne supporte pas la génération automatique.",
    };
  }

  // Build a compact profile summary
  const profile = user.profile;
  const onboarding = user.onboarding;

  const profileSummary = `
- Prénom : ${user.firstName}
- Poste actuel : ${profile?.currentRole ?? onboarding?.currentRole ?? "non précisé"}
- Entreprise actuelle : ${profile?.currentCompany ?? "non précisée"}
- Secteur actuel : ${profile?.currentSector ?? onboarding?.currentSector ?? "non précisé"}
- Poste cible : ${profile?.targetRole ?? onboarding?.targetRole ?? "non précisé"}
- Secteur cible : ${profile?.targetSector ?? onboarding?.targetSector ?? "non précisé"}
- Années d'XP : ${profile?.experienceYears ?? onboarding?.experienceYears ?? "non précisé"}
- Compétences clés : ${(profile?.topSkills ?? onboarding?.topSkills ?? []).join(", ") || "aucune déclarée"}
- Skill gaps identifiés : ${(profile?.skillGaps ?? onboarding?.skillGaps ?? []).join(", ") || "aucun"}
- Niveau formation : ${onboarding?.educationLevel ?? "non précisé"}
- Certifications : ${(onboarding?.certifications ?? []).join(", ") || "aucune"}
- Réalisations clés : ${onboarding?.keyAchievements ?? "(non remplies)"}
- Scénario rêvé : ${onboarding?.dreamScenario ?? "(non précisé)"}
- Appétence technique : ${onboarding?.technicalAppetite ?? "non précisée"}
`.trim();

  const userPrompt = `# Brief à drafter
**Titre :** ${brief.title}
**Secteur :** ${brief.sector}

## Énoncé du brief
${brief.fullBrief}

## Critères d'évaluation (à anticiper dans le draft)
${brief.evaluationCriteria}

# Profil de l'utilisateur (à réutiliser MAX)
${profileSummary}

Écris maintenant le premier jet du livrable, en réutilisant toutes les infos pertinentes du profil et en marquant clairement les [À COMPLÉTER : ...] pour ce qui manque.`;

  try {
    const completion = await ai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
    });

    const draft = completion.choices[0]?.message?.content?.trim();
    if (!draft) {
      return { ok: false, error: "L'IA n'a rien généré, réessaie." };
    }
    return { ok: true, draft };
  } catch (err) {
    console.error("[draft-generator] failed:", err);
    return { ok: false, error: "Erreur lors de la génération du draft." };
  }
}
