import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function buildProfileContext(user: {
  firstName: string;
  onboarding: {
    situation: string | null;
    currentRole: string | null;
    currentSector: string | null;
    experienceYears: number | null;
    educationLevel: string | null;
    certifications: string[];
    hasDataTraining: boolean;
    targetRole: string | null;
    targetSector: string | null;
    topSkills: string[];
    skillLevels: unknown;
    motivation: string | null;
    keyAchievements: string | null;
    dreamScenario: string | null;
    blockers: string[];
    confidenceLevel: number | null;
    shortTermGoal: string | null;
    longTermGoal: string | null;
    preferredPace: string;
    availableHoursPerWeek: number | null;
    trainingBudget: string | null;
    location: string | null;
    remotePreference: string | null;
    learningStyle: string[];
    priorities: string[];
    aiSummary: string | null;
  } | null;
  profile: {
    careerScore: number;
    readinessScore: number;
    skillGaps: string[];
  } | null;
}): string {
  const o = user.onboarding;
  const p = user.profile;
  if (!o) return `L'utilisateur s'appelle ${user.firstName}. Il n'a pas encore complété son diagnostic.`;

  const motivationLabel =
    o.motivation === "attracted" ? "Attiré par la data/IA" :
    o.motivation === "fleeing" ? "Besoin de changement" :
    o.motivation === "both" ? "Changement + passion data" : "Non précisé";

  const skillLevelsStr = Array.isArray(o.skillLevels)
    ? (o.skillLevels as { name: string; level: string }[]).map(s => `${s.name} (${s.level})`).join(", ")
    : o.topSkills.join(", ");

  return `PROFIL COMPLET DE L'UTILISATEUR (utilise ces informations pour personnaliser TOUTES tes réponses) :

Prénom : ${user.firstName}
Situation : ${o.situation || "Non précisée"}
Rôle actuel : ${o.currentRole || "?"} dans le secteur ${o.currentSector || "?"}
Expérience : ${o.experienceYears || "?"} ans
Formation : ${o.educationLevel || "Non précisée"}
Certifications : ${o.certifications?.length ? o.certifications.join(", ") : "Aucune"}
Expérience data/IA : ${o.hasDataTraining ? "Oui" : "Non, part de zéro"}

OBJECTIF : Devenir ${o.targetRole || "?"} dans le secteur ${o.targetSector || "?"}
Motivation : ${motivationLabel}
Scénario idéal : ${o.dreamScenario || "Non précisé"}

Compétences : ${skillLevelsStr || "Aucune renseignée"}
Skill gaps à combler : ${p?.skillGaps?.length ? p.skillGaps.join(", ") : "Non identifiés"}

Freins identifiés : ${o.blockers?.length ? o.blockers.join(", ") : "Aucun"}
Confiance : ${o.confidenceLevel ?? "?"}/10
Objectif 3 mois : ${o.shortTermGoal || "Non précisé"}
Objectif 12 mois : ${o.longTermGoal || "Non précisé"}

Rythme : ${o.preferredPace === "INTENSIVE" ? "Intensif" : o.preferredPace === "RELAXED" ? "Relaxé" : "Modéré"}
Disponibilité : ${o.availableHoursPerWeek || "?"}h/semaine
Budget : ${o.trainingBudget || "Non précisé"}
Localisation : ${o.location || "Non précisée"}
Mode de travail : ${o.remotePreference || "Non précisé"}
Style d'apprentissage : ${o.learningStyle?.join(", ") || "Non précisé"}
Priorités : ${o.priorities?.join(", ") || "Non précisées"}

Career Score : ${p?.careerScore ?? 0}/1000
Readiness : ${p?.readinessScore ?? 0}%

${o.aiSummary ? `DIAGNOSTIC IA PRÉCÉDENT :\n${o.aiSummary}` : ""}`;
}

const COPILOT_SYSTEM = `${SYSTEM_PROMPT}

Tu es le Copilot IA personnel de l'utilisateur sur NextMove AI, une plateforme de transition de carrière vers la data/IA.

CONTEXTE : L'utilisateur a complété un diagnostic complet. Son profil est fourni ci-dessous. Tu dois TOUJOURS te baser sur ces données pour personnaliser tes réponses.

COMPORTEMENT :
- Réponds TOUJOURS en français
- Sois concis (max 200 mots sauf si on te demande un plan détaillé)
- Sois actionnable : chaque réponse doit contenir AU MOINS une action concrète
- Mentionne son rôle cible et son secteur quand c'est pertinent
- Adapte le niveau technique à son profil (débutant data → pas de jargon ML)
- Si la confiance est basse (≤4), sois encourageant et bienveillant
- Si la confiance est haute (≥8), challenge-le pour aller plus loin
- Utilise le tutoiement
- N'utilise AUCUN caractère chinois

TU PEUX :
- Recommander des formations spécifiques (avec noms de plateformes)
- Analyser un CV ou une lettre de motivation
- Préparer à un entretien pour le rôle cible
- Créer un plan d'action semaine par semaine
- Identifier des opportunités d'emploi à chercher
- Donner du feedback sur un projet portfolio
- Aider à networker dans le secteur cible`;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Non authentifié", { status: 401 });
  }

  if (!process.env.MOONSHOT_API_KEY) {
    return new Response("Service IA non configuré", { status: 503 });
  }

  try {
    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages?.length) {
      return new Response("Aucun message", { status: 400 });
    }

    // Load user profile from DB
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: {
        firstName: true,
        onboarding: true,
        profile: {
          select: {
            careerScore: true,
            readinessScore: true,
            skillGaps: true,
          },
        },
      },
    });

    const profileContext = dbUser
      ? buildProfileContext({
          firstName: dbUser.firstName,
          onboarding: dbUser.onboarding,
          profile: dbUser.profile,
        })
      : "Aucun profil disponible.";

    // Build messages array for the AI
    const aiMessages = [
      { role: "system" as const, content: `${COPILOT_SYSTEM}\n\n${profileContext}` },
      ...messages.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const stream = await ai.chat.completions.create({
      model: "moonshot-v1-32k",
      messages: aiMessages,
      max_tokens: 1024,
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Chat stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return new Response("Erreur du service IA", { status: 500 });
  }
}
