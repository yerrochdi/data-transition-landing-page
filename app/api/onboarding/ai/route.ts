import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";
import {
  SYSTEM_PROMPT,
  REFORMULATION_SYSTEM_PROMPT,
  IKIGAI_SYSTEM_PROMPT,
  buildAmbitionsPrompt,
  buildSkillsPrompt,
  buildMotivationPrompt,
  buildConfidencePrompt,
  buildSummaryPrompt,
  buildReformulationPrompt,
  buildIkigaiPassionPrompt,
  buildIkigaiForcesPrompt,
  buildIkigaiMarketPrompt,
  buildIkigaiAlignmentPrompt,
} from "@/lib/ai/prompts";
import type { OnboardingFormData } from "@/lib/onboarding/types";

// Le step "summary" génère un bilan consultant de 800-1200 mots
// (max_tokens 3000). Kimi met 15-30s — sans ce maxDuration, Vercel
// coupe le stream au timeout par défaut (10s) → "analyse indisponible".
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const stepPromptBuilders: Record<
  string,
  (data: Partial<OnboardingFormData>) => string
> = {
  ambitions: buildAmbitionsPrompt,
  skills: buildSkillsPrompt,
  motivation: buildMotivationPrompt,
  confidence: buildConfidencePrompt,
  summary: (data) => buildSummaryPrompt(data as OnboardingFormData),
};

// Steps qui acceptent une "reformulation" live (bulle "J'entends que…").
// Tous utilisent le même builder mais avec un focus différent.
const REFORMULATION_STEPS = new Set([
  "situation",
  "role",
  "education",
  "technical",
  "skills",
  "blockers",
  "motivation",
  "confidence",
  "ambitions",
  "availability",
]);

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Non authentifié", { status: 401 });
  }

  // ── Server-side rate limit: max 20 onboarding AI calls per day ──
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  });

  if (dbUser) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const onboardingCallsToday = await prisma.activity.count({
      where: {
        userId: dbUser.id,
        type: "AGENT_INTERACTION",
        title: "Onboarding AI",
        createdAt: { gte: today },
      },
    });
    if (onboardingCallsToday >= 20) {
      return Response.json(
        { error: "Trop de requêtes IA aujourd'hui" },
        { status: 429 }
      );
    }
    // Track usage
    await prisma.activity.create({
      data: { userId: dbUser.id, type: "AGENT_INTERACTION", title: "Onboarding AI" },
    });
  }

  // Check API key
  if (!process.env.MOONSHOT_API_KEY) {
    return new Response("Service IA non configuré", { status: 503 });
  }

  try {
    const body = await request.json();
    const { step, data, mode } = body as {
      step: string;
      data: Partial<OnboardingFormData>;
      mode?: "insight" | "reformulation" | "ikigai";
    };

    // ── Ikigai mode (Sprint 3 : coach senior sur les 4 dimensions) ──
    // Le step est de la forme "ikigai-passion" / "ikigai-forces" / etc.
    // On stream 200-280 mots, system prompt dédié.
    if (mode === "ikigai") {
      const ikigaiBuilders: Record<
        string,
        (data: Partial<OnboardingFormData>) => string
      > = {
        "ikigai-passion": buildIkigaiPassionPrompt,
        "ikigai-forces": buildIkigaiForcesPrompt,
        "ikigai-market": buildIkigaiMarketPrompt,
        "ikigai-alignment": buildIkigaiAlignmentPrompt,
      };
      const builder = ikigaiBuilders[step];
      if (!builder) {
        return new Response("Étape Ikigai invalide", { status: 400 });
      }
      const userPrompt = builder(data);
      const stream = await ai.chat.completions.create({
        model: "moonshot-v1-8k",
        messages: [
          { role: "system", content: IKIGAI_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        // 200-280 mots ≈ 400-560 tokens. On laisse 700 de marge.
        max_tokens: 700,
        temperature: 0.7,
        stream: true,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) controller.enqueue(encoder.encode(content));
            }
            controller.close();
          } catch (error) {
            console.error("Ikigai stream error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    // ── Reformulation mode (bulle "J'entends que…") ──
    // Court, vouvoiement, system prompt dédié. On stream comme un
    // insight standard pour le même rendu côté client.
    if (mode === "reformulation") {
      if (!REFORMULATION_STEPS.has(step)) {
        return new Response("Étape non reformulable", { status: 400 });
      }

      const userPrompt = buildReformulationPrompt(step, data);
      const stream = await ai.chat.completions.create({
        model: "moonshot-v1-8k",
        messages: [
          { role: "system", content: REFORMULATION_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        // 1 phrase max 25 mots ≈ 50-70 tokens. On laisse 120 de marge
        // pour la marge de manœuvre stylistique, sans inviter à la verbosité.
        max_tokens: 120,
        temperature: 0.55,
        stream: true,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) controller.enqueue(encoder.encode(content));
            }
            controller.close();
          } catch (error) {
            console.error("Reformulation stream error:", error);
            controller.error(error);
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    // ── Insight mode (mode historique : ambitions, skills, summary…) ──
    const promptBuilder = stepPromptBuilders[step];
    if (!promptBuilder) {
      return new Response("Étape invalide", { status: 400 });
    }

    const userPrompt = promptBuilder(data);
    const model = step === "summary" ? "moonshot-v1-32k" : "moonshot-v1-8k";

    // Ambitions step needs valid JSON — use non-streaming mode
    if (step === "ambitions") {
      const completion = await ai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 512,
        temperature: 0.7,
        stream: false,
      });

      let text = completion.choices[0]?.message?.content || "";
      // Strip markdown code blocks
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
      // Extract JSON array
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        text = arrayMatch[0];
      }
      // Purge any CJK characters that Kimi might leak despite the system prompt.
      // Sans ça on a vu des "解决数据" ou "数据-driven" apparaître dans le rendu.
      text = text
        .replace(/[　-〿]/g, "")
        .replace(/[぀-ゟ]/g, "")
        .replace(/[゠-ヿ]/g, "")
        .replace(/[一-鿿]/g, "")
        .replace(/[豈-﫿]/g, "")
        .replace(/[＀-￯]/g, "");
      // Validate JSON
      try {
        JSON.parse(text);
      } catch {
        console.error("AI returned invalid JSON for ambitions:", text.slice(0, 500));
        return new Response("Réponse IA invalide", { status: 502 });
      }

      return new Response(text, {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    // Other steps: stream the response
    const stream = await ai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      // Summary needs room for a 800-1200 word consultant-style bilan.
      // 3000 tokens gives a comfortable margin in French.
      max_tokens: step === "summary" ? 3000 : 512,
      temperature: 0.7,
      stream: true,
    });

    // Convert to ReadableStream
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
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("AI route error:", error);
    return new Response("Erreur du service IA", { status: 500 });
  }
}
