import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const stream = await ai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: step === "summary" ? 1024 : 512,
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
