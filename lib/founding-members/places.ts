"use server";

import { prisma } from "@/lib/db";

const TOTAL_PLACES = 30;

export interface FoundingPlace {
  /** Public-safe role label (no company name). */
  role: string;
  /** Short anonymized quote, ~80 chars max, extracted from motivation. */
  quote: string;
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
 * Trim and clean the user-submitted motivation to make it tooltip-safe:
 *  - strip leading/trailing whitespace
 *  - collapse internal whitespace
 *  - drop trailing punctuation
 *  - truncate to 80 chars with ellipsis
 */
function cleanQuote(raw: string): string {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 80) return cleaned;
  // Don't cut mid-word; backtrack to last space within 80 chars window
  const slice = cleaned.slice(0, 80);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 60 ? slice.slice(0, lastSpace) : slice) + "…";
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
      motivation: true,
      reviewedAt: true,
      createdAt: true,
    },
    orderBy: { reviewedAt: "asc" },
    take: TOTAL_PLACES,
  });

  const occupants: FoundingPlace[] = accepted.map((a) => ({
    role: a.currentRole?.trim() || "Cadre data-augmenté",
    quote: a.motivation
      ? cleanQuote(a.motivation)
      : "Cadre rejoint le programme Founding.",
    acceptedAt: a.reviewedAt ?? a.createdAt,
  }));

  return {
    total: TOTAL_PLACES,
    taken: occupants.length,
    remaining: Math.max(0, TOTAL_PLACES - occupants.length),
    occupants,
  };
}
