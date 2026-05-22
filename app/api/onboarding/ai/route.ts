import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai/client";
import {
  SYSTEM_PROMPT,
  buildAmbitionsPrompt,
  buildSkillsPrompt,
  buildMotivationPrompt,
  buildConfidencePrompt,
  buildSummaryPrompt,
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
    const { step, data } = body as {
      step: string;
      data: Partial<OnboardingFormData>;
    };

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
