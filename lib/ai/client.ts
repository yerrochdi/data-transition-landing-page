import OpenAI from "openai";

const globalForAi = globalThis as unknown as {
  ai: OpenAI | undefined;
};

function createAiClient() {
  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) {
    throw new Error("Missing MOONSHOT_API_KEY environment variable");
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
