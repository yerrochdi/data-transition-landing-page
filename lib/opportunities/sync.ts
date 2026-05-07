"use server";

import { prisma } from "@/lib/db";
import {
  fetchAllRelevantOffersWithFallback,
  type FranceTravailOffer,
} from "./france-travail";

/**
 * Maps a France Travail offer to the shape we persist in Prisma.
 * Keeps the externalId so a re-sync upserts (no duplicates).
 */
function mapOffer(offer: FranceTravailOffer) {
  const skills = (offer.competences ?? [])
    .map((c) => c.libelle)
    .filter((s): s is string => Boolean(s) && s.length < 80);

  // We treat all France Travail offers as "job" — there's no clean way
  // to detect freelance/formation/transition from the v2 API.
  return {
    title: offer.intitule.slice(0, 200),
    company: offer.entreprise?.nom?.slice(0, 200) ?? "Entreprise non précisée",
    location: offer.lieuTravail?.libelle ?? "France",
    type: "JOB" as const,
    salary: offer.salaire?.libelle ?? null,
    tags: [
      offer.romeLibelle,
      offer.typeContratLibelle,
      offer.experienceLibelle,
    ].filter((t): t is string => Boolean(t)),
    description: offer.description.slice(0, 8000),
    remote: /télétravail|remote|t[ée]l[ée]travail/i.test(offer.description ?? ""),
    sourceUrl: offer.origineOffre?.urlOrigine ?? null,
    postedAt: new Date(offer.dateCreation),
    isActive: true,
    source: "FRANCE_TRAVAIL" as const,
    externalId: offer.id,
    contractType: offer.typeContrat ?? null,
    experienceText: offer.experienceLibelle ?? null,
    romeCode: offer.romeCode ?? null,
    skills,
  };
}

/**
 * Runs a full sync of France Travail offers into the database.
 * - Upserts by externalId (idempotent — safe to run multiple times)
 * - Marks France Travail offers older than 30 days as inactive
 * - Returns a summary so the cron / admin can log progress
 */
export async function syncFranceTravailOffers(): Promise<{
  fetched: number;
  upserted: number;
  deactivated: number;
}> {
  const offers = await fetchAllRelevantOffersWithFallback();

  let upserted = 0;
  for (const offer of offers) {
    const data = mapOffer(offer);
    try {
      await prisma.opportunity.upsert({
        where: { externalId: data.externalId },
        create: data,
        update: {
          // Refresh fields likely to change between syncs.
          title: data.title,
          company: data.company,
          location: data.location,
          salary: data.salary,
          description: data.description,
          tags: data.tags,
          skills: data.skills,
          remote: data.remote,
          sourceUrl: data.sourceUrl,
          isActive: true,
        },
      });
      upserted++;
    } catch (err) {
      console.error("[sync] upsert failed for", offer.id, err);
    }
  }

  // Soft-deactivate stale offers (older than 30 days, France Travail source).
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const deactivated = await prisma.opportunity.updateMany({
    where: {
      source: "FRANCE_TRAVAIL",
      postedAt: { lt: cutoff },
      isActive: true,
    },
    data: { isActive: false },
  });

  return {
    fetched: offers.length,
    upserted,
    deactivated: deactivated.count,
  };
}
