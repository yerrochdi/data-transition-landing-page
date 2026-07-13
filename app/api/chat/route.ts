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
 * ── Engagements (feature #4 roadmap — le chat impacte l'application) ──
 *
 * Après chaque échange, un appel léger (v1-8k, 80 tokens max, 2 messages
 * de contexte) détecte si l'utilisateur a pris un engagement concret.
 * Si oui → événement COMMITMENT_MADE dans le journal, qui alimente :
 *   - le contexte du coach aux prochains tours ("où en êtes-vous ?")
 *   - le Point du Lundi (bloc "vos engagements")
 * Fire-and-forget : n'impacte jamais la latence du chat.
 */
async function extractAndLogCommitment(
  userId: string,
  conversationId: string,
  userMsg: string,
  assistantMsg: string
): Promise<void> {
  try {
    const completion = await ai.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [
        {
          role: "user",
          content: `Analyse cet échange coach/utilisateur. L'utilisateur a-t-il pris (ou confirmé) un ENGAGEMENT CONCRET à faire quelque chose ? (ex: "oui je m'y mets cette semaine", "je vais refaire mon CV d'ici lundi", "ok je m'engage à…")

Utilisateur : """${userMsg.slice(0, 500)}"""
Coach : """${assistantMsg.slice(0, 500)}"""

Réponds UNIQUEMENT avec ce JSON (aucun texte autour, aucun caractère asiatique) :
{"commitment": "<l'engagement reformulé en action courte, 12 mots max, ou null si aucun engagement clair>"}

ATTENTION : une simple question ou réflexion n'est PAS un engagement. Il faut une intention d'action affirmée par l'UTILISATEUR (pas par le coach).`,
        },
      ],
      max_tokens: 80,
      temperature: 0.2,
    });

    let text = (completion.choices[0]?.message?.content || "").trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return;
    const parsed = JSON.parse(match[0]) as { commitment?: string | null };
    const commitment = parsed.commitment?.trim();
    if (!commitment || commitment.toLowerCase() === "null" || commitment.length < 5) return;

    // Dédup : pas deux fois le même engagement ouvert en 14 jours.
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const existing = await prisma.activity.count({
      where: {
        userId,
        type: "COMMITMENT_MADE",
        title: commitment,
        createdAt: { gte: since },
      },
    });
    if (existing > 0) return;

    await prisma.activity.create({
      data: {
        userId,
        type: "COMMITMENT_MADE",
        title: commitment,
        description: "Engagement pris auprès du coach",
        icon: "Handshake",
        metadata: { source: "copilot", conversationId },
      },
    });
  } catch (err) {
    console.error("[chat] commitment extraction failed:", err);
  }
}

/**
 * Engagements ouverts des 14 derniers jours (3 max) injectés dans le
 * contexte du coach — c'est ce qui lui permet de relancer.
 */
async function buildCommitmentsContext(userId: string): Promise<string> {
  const since = new Date();
  since.setDate(since.getDate() - 14);
  const commitments = await prisma.activity.findMany({
    where: { userId, type: "COMMITMENT_MADE", createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { title: true, createdAt: true },
  });
  if (commitments.length === 0) return "";

  const lines = commitments
    .map(
      (c) =>
        `- "${c.title}" (pris le ${c.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })})`
    )
    .join("\n");

  return `ENGAGEMENTS EN COURS DE L'UTILISATEUR (pris auprès de vous lors de sessions précédentes) :
${lines}

Si la conversation s'y prête, demandez où en est l'engagement le plus récent — UNE seule relance par conversation, jamais sur un ton de reproche.`;
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
    /** Matériel personnel Ikigai persisté à l'onboarding (Json). */
    ikigai?: unknown;
    /** Diagnostic LinkedIn persisté à l'onboarding (Json). */
    linkedinAnalysis?: unknown;
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
${buildPersonalMaterialBlock(o.ikigai, o.linkedinAnalysis)}
${o.aiSummary ? `DIAGNOSTIC IA PRÉCÉDENT :\n${o.aiSummary}` : ""}`;
}

/**
 * Le matériel le plus PERSONNEL de l'onboarding : les mots exacts de
 * l'utilisateur sur ce qui l'anime et ses forces (Ikigai), ses
 * non-négociables, et la lecture senior de son CV LinkedIn. C'est ce qui
 * fait la différence entre un coach qui récite un profil et un coach qui
 * CONNAÎT la personne — citez ses propres mots quand c'est pertinent.
 * Chaque champ est tronqué (garde-fou tokens : ~400 max au total).
 */
function buildPersonalMaterialBlock(
  ikigaiRaw: unknown,
  linkedinRaw: unknown
): string {
  const parts: string[] = [];

  const ikigai = ikigaiRaw as {
    passion?: { userText?: string };
    forces?: { userText?: string };
    alignment?: { salaryExpectation?: string; nonNegotiables?: string[] };
  } | null;

  if (ikigai) {
    if (ikigai.passion?.userText) {
      parts.push(
        `Ce qui l'anime (ses mots exacts) : "${ikigai.passion.userText.slice(0, 280)}"`
      );
    }
    if (ikigai.forces?.userText) {
      parts.push(
        `Ses forces vues par les autres (ses mots) : "${ikigai.forces.userText.slice(0, 280)}"`
      );
    }
    if (ikigai.alignment?.nonNegotiables?.length) {
      parts.push(
        `Ses non-négociables : ${ikigai.alignment.nonNegotiables.slice(0, 6).join(", ")}`
      );
    }
    if (ikigai.alignment?.salaryExpectation) {
      parts.push(`Attente salariale : ${ikigai.alignment.salaryExpectation}`);
    }
  }

  const li = linkedinRaw as {
    deduced_specialty?: string;
    hidden_patterns?: string[];
    transition_angle?: string;
  } | null;

  if (li) {
    if (li.deduced_specialty) {
      parts.push(`Spécialité réelle (lecture de son CV) : ${li.deduced_specialty.slice(0, 160)}`);
    }
    if (li.hidden_patterns?.length) {
      parts.push(`Patterns de carrière : ${li.hidden_patterns.slice(0, 4).join(" · ")}`);
    }
    if (li.transition_angle) {
      parts.push(`Angle de transition naturel : ${li.transition_angle.slice(0, 220)}`);
    }
  }

  if (parts.length === 0) return "";

  return `
MATÉRIEL PERSONNEL (recueilli en profondeur à l'onboarding — c'est ce qui rend votre coaching personnel, utilisez-le) :
${parts.map((p) => `- ${p}`).join("\n")}
`;
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

Vous êtes le coach IA personnel de l'utilisateur sur NextMove AI, une plateforme de transition de carrière vers la data/IA. Vous êtes un COACH, pas un chatbot : un coach écoute, réagit court, et fait AGIR.

CONTEXTE : L'utilisateur a complété un diagnostic complet. Son profil est fourni ci-dessous, ainsi que sa priorité du moment et ses engagements en cours. Basez TOUTES vos réponses sur ces données.

FORMAT DE RÉPONSE — RÈGLES DURES :
- 80 à 120 mots MAXIMUM. Jamais plus, sauf si on vous demande explicitement un plan détaillé ou une analyse de document.
- Structure implicite de chaque réponse : (1) une réaction courte et personnalisée, (2) UNE action concrète et datée ("cette semaine", "d'ici lundi"), (3) une question qui appelle un engagement ("Vous vous y mettez cette semaine ?", "On se fixe ça comme objectif ?").
- Une seule action à la fois. Un coach ne noie pas — il focalise.
- Pas de listes à puces sauf si un plan est explicitement demandé. Du texte direct.
- Vouvoiement systématique (cohérent avec tout NextMove).
- Français uniquement, AUCUN caractère asiatique.

ENGAGEMENTS — VOTRE MÉCANIQUE CENTRALE :
- Quand l'utilisateur exprime une intention ("je vais…", "je veux…", "il faudrait que je…"), transformez-la en engagement concret : reformulez-la en action précise + échéance, et demandez confirmation.
- Quand des ENGAGEMENTS EN COURS figurent dans le contexte : si la conversation s'y prête, demandez où ça en est — sans harceler (une seule relance par conversation).
- Célébrez sobrement les engagements tenus (pas de "bravo !!!" — un "C'est fait, et c'est ce qui fait bouger votre readiness." suffit).

COMPORTEMENT :
- Adaptez le niveau technique à son APPÉTENCE TECHNIQUE : "no-code" → JAMAIS de Python/R/code, uniquement Tableau/Power BI/Looker/Make. "low-code" → SQL + Excel avancé OK, pas de Python avancé. "code" → outils techniques OK.
- Confiance basse (≤4) : encourageant et bienveillant. Confiance haute (≥8) : challengez.
- Quand la demande s'éloigne de sa priorité du moment, ramenez-y doucement (cf. règle priorité).

VOUS POUVEZ : recommander des formations précises, analyser un CV, préparer un entretien, bâtir un plan semaine par semaine, identifier des opportunités, donner du feedback portfolio, aider à networker.`;

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

    // Engagements ouverts — le coach relance dessus (1 fois max par conv.)
    const commitmentsContext = await buildCommitmentsContext(dbUser.id).catch(
      () => ""
    );

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
        content: `${COPILOT_SYSTEM}\n\n${profileContext}\n\n${orchestratorContext}${commitmentsContext ? `\n\n${commitmentsContext}` : ""}${memoryContext ? `\n\n${memoryContext}` : ""}`,
      },
      ...messages.slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const stream = await ai.chat.completions.create({
      model: "moonshot-v1-32k",
      messages: aiMessages,
      // 700 (vs 1024 avant) : borne structurelle contre la verbosité.
      // Le prompt vise 80-120 mots ; 700 tokens laissent la place aux
      // plans détaillés explicitement demandés, pas aux dissertations.
      max_tokens: 700,
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

            // Détection d'engagement — le chat impacte enfin le journal
            // d'événements (et donc le dashboard + le Point du Lundi).
            if (lastUserMessage?.role === "user") {
              extractAndLogCommitment(
                dbUser.id,
                persistedConversationId,
                lastUserMessage.content,
                assistantFullText
              ).catch(() => {});
            }
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
