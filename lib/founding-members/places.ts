"use server";

import { prisma } from "@/lib/db";

const TOTAL_PLACES = 30;

export interface FoundingPlace {
  /** Public-safe role label (no company name). */
  role: string;
  /** Short anonymized snippet from `situation` (≤100 chars). */
  situation: string;
  /** Short anonymized snippet from `motivation` (≤100 chars). */
  motivation: string;
  /** Acceptance date — used for the tooltip ("acceptée le 12 mai"). */
  acceptedAt: Date | null;
}

export interface FoundingPlacesStatus {
  total: number;
  taken: number;
  remaining: number;
  /** Occupied slots, oldest first. Length === taken. */
  occupants: FoundingPlace[];
}

/**
 * Trim and clean a user-submitted text snippet to make it tooltip-safe:
 *  - strip whitespace
 *  - collapse internal whitespace
 *  - truncate to `maxLen` chars on word boundary with ellipsis
 *  Returns an empty string if input is falsy.
 */
function cleanSnippet(raw: string | null | undefined, maxLen = 100): string {
  if (!raw) return "";
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  const slice = cleaned.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const cutoff = lastSpace > maxLen * 0.75 ? lastSpace : maxLen;
  return slice.slice(0, cutoff) + "…";
}

/**
 * Read the current state of the Founding program slots.
 * Counts ACCEPTED applications (not just activated ones) — once accepted,
 * the slot is reserved while the user has the activation window to pay.
 *
 * Public-safe: returns only role + anonymized quote + accepted date.
 * Never returns name, email, LinkedIn, or company.
 */
export async function getFoundingPlacesStatus(): Promise<FoundingPlacesStatus> {
  const accepted = await prisma.foundingMemberApplication.findMany({
    where: { status: "ACCEPTED" },
    select: {
      currentRole: true,
      situation: true,
      motivation: true,
      reviewedAt: true,
      createdAt: true,
    },
    orderBy: { reviewedAt: "asc" },
    take: TOTAL_PLACES,
  });

  const occupants: FoundingPlace[] = accepted.map((a) => ({
    role: a.currentRole?.trim() || "Cadre data-augmenté",
    situation: cleanSnippet(a.situation),
    motivation: cleanSnippet(a.motivation),
    acceptedAt: a.reviewedAt ?? a.createdAt,
  }));

  return {
    total: TOTAL_PLACES,
    taken: occupants.length,
    remaining: Math.max(0, TOTAL_PLACES - occupants.length),
    occupants,
  };
}
