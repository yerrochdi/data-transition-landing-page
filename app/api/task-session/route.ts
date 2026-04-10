import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";
import {
  buildLessonPrompt,
  buildQuizPrompt,
  buildFeedbackPrompt,
} from "@/lib/ai/prompts";
import { checkSessionLimit, checkPhaseAccess } from "@/lib/billing/rate-limit";

// ─── Profile loader ─────────────────────────────────────────────

async function getSessionProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { onboarding: true, profile: true },
  });

  if (!user?.onboarding) return null;

  const o = user.onboarding;
  return {
    currentRole: o.currentRole || "professionnel en reconversion",
    targetRole: o.targetRole || "Data Analyst",
    currentSector: o.currentSector || "votre secteur",
    targetSector: o.targetSector || o.currentSector || "la data",
    technicalAppetite: o.technicalAppetite || "flexible",
    confidenceLevel: o.confidenceLevel ?? 5,
    experienceYears: o.experienceYears,
  };
}

// ─── Auth helper ─────────────────────────────────────────────────

async function getDbUser(): Promise<{ id: string; plan: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, plan: true },
  });
  return dbUser ?? null;
}

// ─── POST handler ────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const dbUser = await getDbUser();
  if (!dbUser) {
    return new Response("Non authentifié", { status: 401 });
  }

  if (!process.env.MOONSHOT_API_KEY) {
    return new Response("Service IA non configuré", { status: 503 });
  }

  try {
    const body = await request.json();
    const { step, taskId, lessonContent, score, totalQuestions, wrongAnswers } =
      body as {
        step: "lesson" | "quiz" | "feedback";
        taskId: string;
        lessonContent?: string;
        score?: number;
        totalQuestions?: number;
        wrongAnswers?: {
          question: string;
          userAnswer: string;
          correctAnswer: string;
          explanation: string;
        }[];
      };

    if (!step || !taskId) {
      return new Response("Paramètres manquants", { status: 400 });
    }

    // ── Server-side rate limits ──
    // Check daily session limit (only on lesson start = new session)
    if (step === "lesson") {
      const sessionCheck = await checkSessionLimit(dbUser.id, dbUser.plan);
      if (!sessionCheck.allowed) {
        return Response.json(
          { error: "Limite de sessions atteinte", used: sessionCheck.used, limit: sessionCheck.limit },
          { status: 429 }
        );
      }
    }

    // Load task with phase context
    const task = await prisma.journeyTask.findUnique({
      where: { id: taskId },
      include: { phase: true },
    });

    if (!task) {
      return new Response("Tâche introuvable", { status: 404 });
    }

    // Check phase access (free users can only access Phase 1)
    const phaseCheck = await checkPhaseAccess(dbUser.id, dbUser.plan, taskId);
    if (!phaseCheck.allowed) {
      return Response.json(
        { error: "Phase réservée aux membres Pro" },
        { status: 403 }
      );
    }

    const profile = await getSessionProfile(dbUser.id);
    if (!profile) {
      return new Response("Profil non trouvé", { status: 404 });
    }

    // Build the prompt based on step
    let systemPrompt: string;
    let model = "moonshot-v1-8k";
    let maxTokens = 1024;

    switch (step) {
      case "lesson":
        systemPrompt = buildLessonPrompt(
          task.title,
          task.description,
          task.phase.title,
          profile
        );
        model = "moonshot-v1-32k";
        maxTokens = 1500;
        break;

      case "quiz":
        if (!lessonContent) {
          return new Response("Contenu de leçon requis", { status: 400 });
        }
        systemPrompt = buildQuizPrompt(task.title, lessonContent, profile);
        maxTokens = 1024;
        break;

      case "feedback":
        if (score === undefined || !totalQuestions) {
          return new Response("Score requis", { status: 400 });
        }
        systemPrompt = buildFeedbackPrompt(
          task.title,
          score,
          totalQuestions,
          wrongAnswers || [],
          profile
        );
        maxTokens = 512;
        break;

      default:
        return new Response("Étape invalide", { status: 400 });
    }

    // For quiz, we need non-streaming JSON
    if (step === "quiz") {
      const completion = await ai.chat.completions.create({
        model,
        messages: [{ role: "user", content: systemPrompt }],
        max_tokens: maxTokens,
        temperature: 0.5,
      });

      const content = completion.choices[0]?.message?.content || "[]";
      return new Response(content, {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Stream lesson and feedback
    const stream = await ai.chat.completions.create({
      model,
      messages: [{ role: "user", content: systemPrompt }],
      max_tokens: maxTokens,
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
          console.error("Task session stream error:", error);
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
    console.error("Task session route error:", error);
    return new Response("Erreur du service IA", { status: 500 });
  }
}
