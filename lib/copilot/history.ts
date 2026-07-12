"use server";

/**
 * Sprint 2 (QW-B) — Mémoire du coach : chargement de l'historique persisté.
 *
 * Récupère la conversation la plus récente de l'utilisateur (si elle date
 * de moins de 30 jours) pour hydrater le Copilot au chargement de la page.
 * Le coach n'est plus amnésique : on reprend le fil là où il s'était arrêté.
 */

import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type CopilotHistory = {
  conversationId: string;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }[];
} | null;

const MAX_HYDRATED_MESSAGES = 20;
const MAX_AGE_DAYS = 30;

export async function getLastConversationForCurrentUser(): Promise<CopilotHistory> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true },
    });
    if (!dbUser) return null;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - MAX_AGE_DAYS);

    const conversation = await prisma.agentConversation.findFirst({
      where: { userId: dbUser.id, updatedAt: { gte: cutoff } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: MAX_HYDRATED_MESSAGES,
          select: { id: true, role: true, content: true, createdAt: true },
        },
      },
    });

    if (!conversation || conversation.messages.length === 0) return null;

    return {
      conversationId: conversation.id,
      messages: [...conversation.messages].reverse().map((m) => ({
        id: m.id,
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
        timestamp: m.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("[copilot] history load failed:", err);
    return null;
  }
}
