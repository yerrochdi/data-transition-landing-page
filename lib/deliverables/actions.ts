"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuotas } from "@/lib/billing/plan";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DeliverableBrief, Deliverable, User } from "@/lib/generated/prisma/client";
import { DeliverableStatus } from "@/lib/generated/prisma/enums";

// ─── Types ────────────────────────────────────────────────────────

export type BriefCard = Pick<
  DeliverableBrief,
  | "id"
  | "slug"
  | "title"
  | "shortDescription"
  | "sector"
  | "skillCategory"
  | "difficulty"
  | "estimatedDays"
  | "tools"
  | "isPremium"
  | "suggestedAtPhase"
  | "useFromProfile"
  | "submissionMode"
> & {
  userStatus: DeliverableStatus | null;
};

export type CatalogueData = {
  briefs: BriefCard[];
  startedThisMonth: number;
  monthlyLimit: number | null;
  plan: string;
};

export type BriefDetail = DeliverableBrief & {
  userDeliverable: Deliverable | null;
};

// ─── Internal helpers ─────────────────────────────────────────────

async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;
  return prisma.user.findUnique({ where: { supabaseId: authUser.id } });
}

function startOfMonthUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

// ─── Catalogue ────────────────────────────────────────────────────

export async function getCatalogueData(): Promise<CatalogueData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const quotas = getQuotas({
    plan: user.plan,
    sprintExpiresAt: user.sprintExpiresAt,
  });

  const [briefs, userDeliverables, startedThisMonth] = await Promise.all([
    prisma.deliverableBrief.findMany({
      where: { isPublished: true },
      orderBy: [{ difficulty: "asc" }, { estimatedDays: "asc" }],
    }),
    prisma.deliverable.findMany({
      where: { userId: user.id },
      select: { briefId: true, status: true },
    }),
    prisma.deliverable.count({
      where: {
        userId: user.id,
        startedAt: { gte: startOfMonthUTC() },
      },
    }),
  ]);

  const statusByBrief = new Map(
    userDeliverables.map((d) => [d.briefId, d.status])
  );

  const cards: BriefCard[] = briefs.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    shortDescription: b.shortDescription,
    sector: b.sector,
    skillCategory: b.skillCategory,
    difficulty: b.difficulty,
    estimatedDays: b.estimatedDays,
    tools: b.tools,
    isPremium: b.isPremium,
    suggestedAtPhase: b.suggestedAtPhase,
    useFromProfile: b.useFromProfile,
    submissionMode: b.submissionMode,
    userStatus: statusByBrief.get(b.id) ?? null,
  }));

  return {
    briefs: cards,
    startedThisMonth,
    monthlyLimit: quotas.deliverablesPerMonth,
    plan: user.plan,
  };
}

// ─── Brief detail ─────────────────────────────────────────────────

export async function getBriefBySlug(slug: string): Promise<BriefDetail | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const brief = await prisma.deliverableBrief.findUnique({
    where: { slug },
  });
  if (!brief) return null;

  const userDeliverable = await prisma.deliverable.findUnique({
    where: { userId_briefId: { userId: user.id, briefId: brief.id } },
  });

  return { ...brief, userDeliverable };
}

// ─── Start a deliverable ──────────────────────────────────────────

export async function startDeliverable(
  briefSlug: string
): Promise<{ ok: boolean; error?: string; deliverableId?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const brief = await prisma.deliverableBrief.findUnique({
    where: { slug: briefSlug },
  });
  if (!brief) return { ok: false, error: "Brief not found" };

  const quotas = getQuotas({
    plan: user.plan,
    sprintExpiresAt: user.sprintExpiresAt,
  });

  // Premium gate
  if (brief.isPremium && user.plan === "FREE") {
    return {
      ok: false,
      error: "Ce brief est réservé aux plans Boost et supérieurs.",
    };
  }

  // Already started?
  const existing = await prisma.deliverable.findUnique({
    where: { userId_briefId: { userId: user.id, briefId: brief.id } },
  });
  if (existing) {
    return { ok: true, deliverableId: existing.id };
  }

  // Monthly quota check
  if (quotas.deliverablesPerMonth !== null) {
    const startedThisMonth = await prisma.deliverable.count({
      where: {
        userId: user.id,
        startedAt: { gte: startOfMonthUTC() },
      },
    });
    if (startedThisMonth >= quotas.deliverablesPerMonth) {
      return {
        ok: false,
        error: `Tu as atteint ta limite de ${quotas.deliverablesPerMonth} livrable(s) ce mois-ci. Passe au plan supérieur pour continuer.`,
      };
    }
  }

  const deliverable = await prisma.deliverable.create({
    data: {
      userId: user.id,
      briefId: brief.id,
      status: DeliverableStatus.DRAFT,
    },
  });

  revalidatePath("/deliverables");
  revalidatePath(`/deliverables/${briefSlug}`);
  return { ok: true, deliverableId: deliverable.id };
}

// ─── Generate first draft from user profile ───────────────────────

export async function generateFirstDraft(
  deliverableId: string
): Promise<{ ok: boolean; draft?: string; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
    include: { brief: true },
  });
  if (!deliverable || deliverable.userId !== user.id) {
    return { ok: false, error: "Forbidden" };
  }
  if (!deliverable.brief.useFromProfile) {
    return {
      ok: false,
      error: "Ce brief ne supporte pas la génération depuis le profil.",
    };
  }
  if (deliverable.status === DeliverableStatus.VALIDATED) {
    return { ok: false, error: "Livrable déjà validé." };
  }

  const { generateDraftFromProfile } = await import("./draft-generator");
  const result = await generateDraftFromProfile(user.id, deliverable.brief.id);
  if (!result.ok || !result.draft) {
    return { ok: false, error: result.error ?? "Erreur de génération" };
  }

  // Persist the generated draft so the user has it next time
  await prisma.deliverable.update({
    where: { id: deliverableId },
    data: { content: result.draft },
  });

  return { ok: true, draft: result.draft };
}

// ─── Save draft ───────────────────────────────────────────────────

export async function saveDraft(
  deliverableId: string,
  payload: { content?: string; externalUrl?: string }
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
  });
  if (!deliverable || deliverable.userId !== user.id) {
    return { ok: false, error: "Forbidden" };
  }
  if (deliverable.status === DeliverableStatus.VALIDATED) {
    return { ok: false, error: "Ce livrable est déjà validé." };
  }

  await prisma.deliverable.update({
    where: { id: deliverableId },
    data: {
      content: payload.content ?? deliverable.content,
      externalUrl: payload.externalUrl ?? deliverable.externalUrl,
    },
  });

  return { ok: true };
}

// ─── Submit for AI review ─────────────────────────────────────────
// (The actual AI call lives in lib/deliverables/ai-review.ts. This action
//  only flips the status and records the submission timestamp.)

export async function submitForReview(
  deliverableId: string
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
    include: { brief: true },
  });
  if (!deliverable || deliverable.userId !== user.id) {
    return { ok: false, error: "Forbidden" };
  }

  // Validation rules depend on the brief's submissionMode:
  //   TEXT_ONLY      → only the text content matters (≥ 200 chars, the
  //                    deliverable IS the text — CV, 1-pager, résumé)
  //   LINK_REQUIRED  → need a valid link AND a short description (≥ 100
  //                    chars to give the IA context — RAG, dashboard…)
  const trimmedContent = deliverable.content?.trim() ?? "";
  const trimmedUrl = deliverable.externalUrl?.trim() ?? "";
  const isTextOnly = deliverable.brief.submissionMode === "TEXT_ONLY";

  if (isTextOnly) {
    if (trimmedContent.length < 200) {
      return {
        ok: false,
        error: `Ton livrable fait ${trimmedContent.length} caractères. Ajoute-en au moins ${
          200 - trimmedContent.length
        } de plus avant de soumettre — un CV ou un 1-pager solide nécessite du contenu.`,
      };
    }
  } else {
    // LINK_REQUIRED
    if (trimmedUrl.length === 0 || !/^https?:\/\//i.test(trimmedUrl)) {
      return {
        ok: false,
        error:
          "Colle un lien valide (Notion, GitHub, Figma, Drive…) vers ton livrable avant de soumettre.",
      };
    }
    if (trimmedContent.length < 100) {
      return {
        ok: false,
        error: `Ajoute une description de ta démarche (au moins ${
          100 - trimmedContent.length
        } caractères de plus). L'IA en a besoin pour évaluer ton livrable.`,
      };
    }
  }

  await prisma.deliverable.update({
    where: { id: deliverableId },
    data: {
      status: DeliverableStatus.SUBMITTED,
      submittedAt: new Date(),
    },
  });

  // Trigger the AI review (server-side). Lazy-import to avoid circular deps.
  const { reviewDeliverable } = await import("./ai-review");
  await reviewDeliverable(deliverableId);

  revalidatePath(`/deliverables/${deliverable.brief.slug}`);
  revalidatePath("/my-portfolio");
  return { ok: true };
}

// ─── Toggle public sharing ────────────────────────────────────────

export async function togglePublic(
  deliverableId: string
): Promise<{ ok: boolean; error?: string; shareableSlug?: string | null }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const deliverable = await prisma.deliverable.findUnique({
    where: { id: deliverableId },
  });
  if (!deliverable || deliverable.userId !== user.id) {
    return { ok: false, error: "Forbidden" };
  }

  const nextIsPublic = !deliverable.isPublic;
  let shareableSlug = deliverable.shareableSlug;

  // Generate a slug the first time the user opts in.
  if (nextIsPublic && !shareableSlug) {
    shareableSlug = `${user.firstName.toLowerCase()}-${deliverableId.slice(0, 8)}`
      .replace(/[^a-z0-9-]/g, "");
  }

  await prisma.deliverable.update({
    where: { id: deliverableId },
    data: { isPublic: nextIsPublic, shareableSlug },
  });

  revalidatePath("/my-portfolio");
  return { ok: true, shareableSlug: nextIsPublic ? shareableSlug : null };
}

// ─── Server-action wrapper to start + redirect ────────────────────

export async function startAndOpenDeliverable(briefSlug: string) {
  const result = await startDeliverable(briefSlug);
  if (!result.ok) {
    // Redirect with error in query string
    redirect(`/deliverables/${briefSlug}?error=${encodeURIComponent(result.error ?? "unknown")}`);
  }
  redirect(`/deliverables/${briefSlug}`);
}

// ─── Portfolio (own validated deliverables) ───────────────────────

export type PortfolioItem = {
  id: string;
  title: string;
  briefSlug: string;
  sector: string;
  validatedAt: Date | null;
  isPublic: boolean;
  shareableSlug: string | null;
  score: number;
  externalUrl: string | null;
};

export async function getMyPortfolio(): Promise<PortfolioItem[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const items = await prisma.deliverable.findMany({
    where: {
      userId: user.id,
      status: { in: [DeliverableStatus.VALIDATED, DeliverableStatus.REVIEWED] },
    },
    include: { brief: true },
    orderBy: { validatedAt: "desc" },
  });

  return items.map((d) => ({
    id: d.id,
    title: d.brief.title,
    briefSlug: d.brief.slug,
    sector: d.brief.sector,
    validatedAt: d.validatedAt,
    isPublic: d.isPublic,
    shareableSlug: d.shareableSlug,
    score:
      typeof (d.aiReview as { score?: number })?.score === "number"
        ? (d.aiReview as { score: number }).score
        : 0,
    externalUrl: d.externalUrl,
  }));
}

// ─── Public portfolio item (by shareableSlug) ────────────────────

export type PublicPortfolioItem = {
  title: string;
  shortDescription: string;
  sector: string;
  estimatedDays: number;
  difficulty: number;
  authorFirstName: string;
  authorLastName: string;
  validatedAt: Date | null;
  score: number;
  strengths: string[];
  content: string | null;
  externalUrl: string | null;
};

export async function getPublicDeliverable(
  shareableSlug: string
): Promise<PublicPortfolioItem | null> {
  const item = await prisma.deliverable.findUnique({
    where: { shareableSlug },
    include: {
      brief: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });
  if (!item || !item.isPublic) return null;

  const review = item.aiReview as
    | { score?: number; strengths?: string[] }
    | null
    | undefined;

  return {
    title: item.brief.title,
    shortDescription: item.brief.shortDescription,
    sector: item.brief.sector,
    estimatedDays: item.brief.estimatedDays,
    difficulty: item.brief.difficulty,
    authorFirstName: item.user.firstName,
    authorLastName: item.user.lastName,
    validatedAt: item.validatedAt,
    score: typeof review?.score === "number" ? review.score : 0,
    strengths: Array.isArray(review?.strengths) ? review.strengths : [],
    content: item.content,
    externalUrl: item.externalUrl,
  };
}
