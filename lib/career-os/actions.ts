"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import type {
  CareerAnchors,
  CareerInflection,
  LongTermVision,
} from "./types";

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    select: { id: true },
  });
  return dbUser?.id ?? null;
}

/**
 * Save the user's "Trajectoire longue" — the 3 key career inflections
 * they identify when filling the dedicated mini-flow.
 */
export async function saveCareerInflections(
  inflections: CareerInflection[]
): Promise<{ ok: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  // Validate: between 1 and 5 inflections, each with non-empty fields
  const clean = inflections
    .filter(
      (i) =>
        i.year?.trim() &&
        i.from?.trim() &&
        i.to?.trim() &&
        i.why?.trim() &&
        i.lesson?.trim()
    )
    .slice(0, 5);

  if (clean.length === 0) {
    return {
      ok: false,
      error: "Ajoute au moins une inflexion complète (tous les champs remplis).",
    };
  }

  await prisma.onboardingResponse.update({
    where: { userId },
    data: {
      careerInflections: JSON.parse(JSON.stringify(clean)),
      careerInflectionsAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/career-os/inflections");
  return { ok: true };
}

/**
 * Save the user's "Vision longue" — 5/10y projection + dealbreakers.
 */
export async function saveLongTermVision(
  vision: LongTermVision
): Promise<{ ok: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const trimmed: LongTermVision = {
    fiveYears: vision.fiveYears?.trim() ?? "",
    tenYears: vision.tenYears?.trim() ?? "",
    idealLife: vision.idealLife?.trim() ?? "",
    dealbreakers: vision.dealbreakers?.trim() ?? "",
  };

  if (!trimmed.fiveYears || !trimmed.tenYears) {
    return {
      ok: false,
      error: "Au minimum, partage ta projection à 5 et 10 ans.",
    };
  }

  await prisma.onboardingResponse.update({
    where: { userId },
    data: {
      longTermVision: JSON.parse(JSON.stringify(trimmed)),
      longTermVisionAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Save the user's "Ancres" — geographic, sector and burnout
 * non-negotiables.
 */
export async function saveCareerAnchors(
  anchors: CareerAnchors
): Promise<{ ok: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const trimmed: CareerAnchors = {
    geoAnchors: anchors.geoAnchors?.trim() ?? "",
    sectorExclusions: anchors.sectorExclusions?.trim() ?? "",
    burnoutTriggers: anchors.burnoutTriggers?.trim() ?? "",
  };

  if (!trimmed.geoAnchors && !trimmed.sectorExclusions && !trimmed.burnoutTriggers) {
    return {
      ok: false,
      error: "Remplis au moins un des 3 champs.",
    };
  }

  await prisma.onboardingResponse.update({
    where: { userId },
    data: {
      careerAnchors: JSON.parse(JSON.stringify(trimmed)),
      careerAnchorsAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Read what the user has already filled in — used by the dashboard
 * card to show progress and by the mini-flow pages to pre-fill.
 */
export async function getCareerOsEnrichment(): Promise<{
  hasInflections: boolean;
  hasLongTermVision: boolean;
  hasAnchors: boolean;
  inflections: CareerInflection[];
  longTermVision: LongTermVision | null;
  anchors: CareerAnchors | null;
} | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const row = await prisma.onboardingResponse.findUnique({
    where: { userId },
    select: {
      careerInflections: true,
      longTermVision: true,
      careerAnchors: true,
    },
  });
  if (!row) {
    return {
      hasInflections: false,
      hasLongTermVision: false,
      hasAnchors: false,
      inflections: [],
      longTermVision: null,
      anchors: null,
    };
  }

  const inflections = (row.careerInflections as CareerInflection[] | null) ?? [];
  const longTermVision = (row.longTermVision as LongTermVision | null) ?? null;
  const anchors = (row.careerAnchors as CareerAnchors | null) ?? null;

  return {
    hasInflections: inflections.length > 0,
    hasLongTermVision: !!longTermVision?.fiveYears,
    hasAnchors:
      !!anchors &&
      (!!anchors.geoAnchors ||
        !!anchors.sectorExclusions ||
        !!anchors.burnoutTriggers),
    inflections,
    longTermVision,
    anchors,
  };
}
