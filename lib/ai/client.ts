import OpenAI from "openai";

const globalForAi = globalThis as unknown as {
  ai: OpenAI | undefined;
};

function createAiClient() {
  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) {
    // Return a placeholder — routes check for the key before calling
    return new OpenAI({
      apiKey: "placeholder",
      baseURL: "https://api.moonshot.ai/v1",
    });
  }
  return new OpenAI({
    apiKey,
    baseURL: "https://api.moonshot.ai/v1",
  });
}

export const ai = globalForAi.ai ?? createAiClient();

if (process.env.NODE_ENV !== "production") {
  globalForAi.ai = ai;
}
