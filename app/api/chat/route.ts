import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { checkCopilotLimit, trackCopilotUsage } from "@/lib/billing/rate-limit";
import { getNextActionForCurrentUser } from "@/lib/orchestrator/actions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Sprint 2 (QW-B) : mémoire du coach ──────────────────────────────
// Les conversations sont désormais persistées dans AgentConversation/
// AgentMessage (tables qui existaient mais n'étaient jamais écrites).
// Le coach n'est plus amnésique : historique rechargeable + mémoire de
// la session précédente injectée dans le prompt (plafonnée en tokens).

const COPILOT_AGENT_SLUG = "copilot";

/** Garantit l'existence de l'AgentDefinition du Copilot (idempotent). */
async function ensureCopilotAgent(): Promise<string> {
  const agent = await prisma.agentDefinition.upsert({
    where: { slug: COPILOT_AGENT_SLUG },
    update: {},
    create: {
      slug: COPILOT_AGENT_SLUG,
      name: "Copilot NextMove",
      role: "Coach de transition",
      description:
        "Le coach IA central de NextMove : personnalisé, orienté action, aligné sur la priorité du moment.",
      icon: "Sparkles",
      color: "primary",
      capabilities: [],
      quickActions: [],
    },
    select: { id: true },
  });
  return agent.id;
}

/**
 * Mémoire de la session précédente : jusqu'à 6 messages de la dernière
 * conversation AUTRE que la conversation courante, tronqués à 220 chars
 * chacun (garde-fou coût : ~350 tokens max au total).
 */
async function buildMemoryContext(
  userId: string,
  currentConversationId: string | null
): Promise<string> {
  const previous = await prisma.agentConversation.findFirst({
    where: {
      userId,
      ...(currentConversationId ? { id: { not: currentConversationId } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      updatedAt: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { role: true, content: true },
      },
    },
  });

  if (!previous || previous.messages.length === 0) return "";

  const lines = [...previous.messages]
    .reverse()
    .map(
      (m) =>
        `${m.role === "USER" ? "Lui/Elle" : "Toi"} : ${m.content.slice(0, 220)}${m.content.length > 220 ? "…" : ""}`
    )
    .join("\n");

  const dateStr = previous.updatedAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  return `MÉMOIRE DE VOTRE DERNIÈRE SESSION ENSEMBLE (${dateStr}) — utilise-la pour assurer la continuité (rappelle ses objectifs/engagements passés quand c'est pertinent, sans réciter mécaniquement) :
${lines}`;
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
Appétence technique : ${(o as Record<string, unknown>).technicalAppetite === "no-code" ? "NO-CODE — ne veut pas coder, uniquement outils visuels" : (o as Record<string, unknown>).technicalAppetite === "low-code" ? "LOW-CODE — SQL basique et Excel OK, pas de Python" : (o as Record<string, unknown>).technicalAppetite === "code" ? "CODE — motivé technique" : "FLEXIBLE"}

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

type NextActionForPrompt = Awaited<ReturnType<typeof getNextActionForCurrentUser>>;

function buildOrchestratorContext(nextAction: NextActionForPrompt): string {
  if (!nextAction) {
    return `PRIORITÉ ACTUELLE DE L'UTILISATEUR : aucune (compte fraîchement créé ou état non chargé). Si on te demande "que faire ?", suggère d'abord de finir l'onboarding.`;
  }

  return `PRIORITÉ ACTUELLE DE L'UTILISATEUR (calculée par l'orchestrateur NextMove) :

→ ${nextAction.title}
  Raison : ${nextAction.why}
  Durée estimée : ~${nextAction.estimatedMinutes} min
  Page concernée : ${nextAction.href}
  Readiness score actuel : ${nextAction.readinessSnapshot}%

RÈGLE IMPORTANTE : tu es son coach. Quand l'user te demande "que faire ?", "je sais pas par où commencer", ou "aide-moi sur X" alors que X n'est PAS sa priorité actuelle, tu dois :
1. Reconnaître ce qu'il veut faire (validate)
2. Lui rappeler doucement sa priorité actuelle et POURQUOI elle compte
3. Lui dire qu'il peut continuer sa priorité d'abord, et que tu seras là après

Exemple : si la priorité est "Termine ton Diagnostic" et l'user demande "aide-moi pour mon CV", tu réponds : "Je peux t'aider sur ton CV, mais avant — ton diagnostic est encore à finir. C'est lui qui calibre tout ce qui suit. Tu veux qu'on termine ça d'abord (15 min), puis on attaque ton CV sereinement ?"

Ne sois pas dogmatique : si l'user insiste, aide-le. Mais le PREMIER réflexe doit toujours être de proposer la priorité.`;
}

const COPILOT_SYSTEM = `${SYSTEM_PROMPT}

Tu es le Copilot IA personnel de l'utilisateur sur NextMove AI, une plateforme de transition de carrière vers la data/IA. Tu es son coach, pas un chatbot générique. Tu connais où il en est dans son parcours et tu l'orientes vers la prochaine bonne étape.

CONTEXTE : L'utilisateur a complété un diagnostic complet. Son profil est fourni ci-dessous, ainsi que sa priorité du moment. Tu dois TOUJOURS te baser sur ces données pour personnaliser tes réponses.

COMPORTEMENT :
- Réponds TOUJOURS en français
- Sois concis (max 200 mots sauf si on te demande un plan détaillé)
- Sois actionnable : chaque réponse doit contenir AU MOINS une action concrète
- Mentionne son rôle cible et son secteur quand c'est pertinent
- Adapte le niveau technique à son APPÉTENCE TECHNIQUE déclarée : si "no-code", JAMAIS de Python/R/code, propose uniquement Tableau/Power BI/Looker/Make. Si "low-code", SQL + Excel avancé OK mais pas de Python avancé. Si "code", outils techniques OK.
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
    const { messages, conversationId: clientConversationId } = body as {
      messages: ChatMessage[];
      conversationId?: string | null;
    };

    if (!messages?.length) {
      return new Response("Aucun message", { status: 400 });
    }

    // Load user profile from DB
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: {
        id: true,
        plan: true,
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

    if (!dbUser) {
      return new Response("Utilisateur introuvable", { status: 404 });
    }

    // ── Server-side rate limit ──
    const limitCheck = await checkCopilotLimit(dbUser.id, dbUser.plan);
    if (!limitCheck.allowed) {
      return Response.json(
        { error: "Limite quotidienne atteinte", used: limitCheck.used, limit: limitCheck.limit },
        { status: 429 }
      );
    }

    const profileContext = buildProfileContext({
      firstName: dbUser.firstName,
      onboarding: dbUser.onboarding,
      profile: dbUser.profile,
    });

    // Fetch the current orchestrator priority so the Copilot can act as
    // a real coach (push back when the user asks for something off-track).
    const nextAction = await getNextActionForCurrentUser();
    const orchestratorContext = buildOrchestratorContext(nextAction);

    // ── Sprint 2 (QW-B) : résoudre/créer la conversation persistée ──
    // On vérifie que la conversation appartient bien à l'utilisateur
    // (sinon on en crée une nouvelle — jamais d'accès croisé).
    let conversationId: string | null = null;
    try {
      if (clientConversationId) {
        const existing = await prisma.agentConversation.findFirst({
          where: { id: clientConversationId, userId: dbUser.id },
          select: { id: true },
        });
        conversationId = existing?.id ?? null;
      }
      if (!conversationId) {
        const agentId = await ensureCopilotAgent();
        const created = await prisma.agentConversation.create({
          data: {
            userId: dbUser.id,
            agentId,
            title: messages[messages.length - 1]?.content.slice(0, 80) ?? null,
          },
          select: { id: true },
        });
        conversationId = created.id;
      }
    } catch (err) {
      // La persistance ne doit jamais bloquer le chat lui-même.
      console.error("[chat] conversation resolve failed:", err);
    }

    // Mémoire de la session précédente (plafonnée, cf. buildMemoryContext)
    const memoryContext = conversationId
      ? await buildMemoryContext(dbUser.id, conversationId).catch(() => "")
      : "";

    // Persiste le message utilisateur (le dernier du tableau client)
    const lastUserMessage = messages[messages.length - 1];
    if (conversationId && lastUserMessage?.role === "user") {
      prisma.agentMessage
        .create({
          data: {
            conversationId,
            role: "USER",
            content: lastUserMessage.content,
          },
        })
        .catch((err) => console.error("[chat] persist user msg failed:", err));
    }

    // Build messages array for the AI
    const aiMessages = [
      {
        role: "system" as const,
        content: `${COPILOT_SYSTEM}\n\n${profileContext}\n\n${orchestratorContext}${memoryContext ? `\n\n${memoryContext}` : ""}`,
      },
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
    // Accumule la réponse complète pour la persister à la fin du stream.
    let assistantFullText = "";
    const persistedConversationId = conversationId;
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              assistantFullText += content;
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
          // Persiste la réponse du coach une fois le stream terminé
          // (fire-and-forget : jamais bloquant).
          if (persistedConversationId && assistantFullText.trim()) {
            prisma.agentMessage
              .create({
                data: {
                  conversationId: persistedConversationId,
                  role: "AGENT",
                  content: assistantFullText,
                },
              })
              .then(() =>
                prisma.agentConversation.update({
                  where: { id: persistedConversationId },
                  data: { updatedAt: new Date() },
                })
              )
              .catch((err) =>
                console.error("[chat] persist agent msg failed:", err)
              );
          }
        } catch (error) {
          console.error("Chat stream error:", error);
          controller.error(error);
        }
      },
    });

    // Track usage after successful stream creation
    trackCopilotUsage(dbUser.id).catch(console.error);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        // Le client stocke cet id et le renvoie aux tours suivants —
        // c'est ce qui rattache la session au fil persistant.
        ...(conversationId ? { "X-Conversation-Id": conversationId } : {}),
      },
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return new Response("Erreur du service IA", { status: 500 });
  }
}
