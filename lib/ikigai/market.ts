"use server";

/**
 * Sprint 3C — Module Ikigai MARCHÉ.
 *
 * Réutilise l'intégration France Travail existante (lib/opportunities)
 * pour produire un "snapshot marché" centré sur UN rôle cible (vs
 * l'agrégation globale data/IA des opportunities).
 *
 * Structure renvoyée : voir OnboardingFormData.ikigai.market.snapshot.
 */

import { searchOffers, type FranceTravailOffer } from "@/lib/opportunities/france-travail";

export type IkigaiMarketSnapshot = {
  totalOffers: number;
  recentOffers: number;
  medianSalary: { min: number; max: number } | null;
  topSkills: string[];
  topRegions: string[];
  source: string;
};

/**
 * Parse un libellé salaire "30K à 40K annuel" / "Annuel de 35000,00 Euros
 * à 45000,00 Euros" en [min, max] euros bruts. Retourne null si pas parseable.
 */
function parseSalary(libelle?: string): [number, number] | null {
  if (!libelle) return null;
  const nums = libelle.match(/(\d+[.,]?\d*)\s*[Kk]?/g);
  if (!nums || nums.length < 2) return null;
  const toEuros = (s: string) => {
    const cleaned = s.replace(",", ".").trim();
    const isK = /[Kk]/.test(cleaned);
    const n = parseFloat(cleaned.replace(/[Kk]/, ""));
    if (isNaN(n)) return 0;
    return isK ? n * 1000 : n;
  };
  const min = toEuros(nums[0]);
  const max = toEuros(nums[1]);
  if (min < 10_000 || max < 10_000 || min > 500_000 || max > 500_000) return null;
  return [Math.round(min), Math.round(max)];
}

function computeMedianRange(
  salaries: number[][]
): IkigaiMarketSnapshot["medianSalary"] {
  if (salaries.length < 3) return null; // pas assez de signal
  const mins = salaries.map((s) => s[0]).sort((a, b) => a - b);
  const maxs = salaries.map((s) => s[1]).sort((a, b) => a - b);
  const mid = Math.floor(mins.length / 2);
  return { min: mins[mid], max: maxs[mid] };
}

function aggregateSkills(offers: FranceTravailOffer[]): string[] {
  const counts = new Map<string, number>();
  for (const offer of offers) {
    for (const c of offer.competences ?? []) {
      if (!c.libelle) continue;
      counts.set(c.libelle, (counts.get(c.libelle) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label]) => label);
}

function aggregateRegions(offers: FranceTravailOffer[]): string[] {
  const counts = new Map<string, number>();
  for (const offer of offers) {
    const lib = offer.lieuTravail?.libelle;
    if (!lib) continue;
    // Garde juste la ville/département principal (avant " - " ou virgule)
    const cleaned = lib.split(/[-,]/)[0].trim();
    if (!cleaned) continue;
    counts.set(cleaned, (counts.get(cleaned) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label]) => label);
}

/**
 * Récupère un snapshot marché pour un rôle cible donné.
 *
 * Fait UN seul appel France Travail (motsCles) sur les 49 dernières offres
 * sans filtre expérience pour avoir une vue large. Si France Travail n'a
 * pas de credentials configurés ou échoue, on renvoie null silencieusement
 * — l'UI affichera "données indisponibles" et le coach IA basculera en mode
 * qualitatif.
 */
export async function getMarketSnapshotForRole(
  targetRole: string
): Promise<IkigaiMarketSnapshot | null> {
  if (!targetRole || targetRole.trim().length < 3) return null;

  try {
    const offers = await searchOffers({
      motsCles: targetRole.trim(),
      range: "0-49",
    });

    if (offers.length === 0) {
      return {
        totalOffers: 0,
        recentOffers: 0,
        medianSalary: null,
        topSkills: [],
        topRegions: [],
        source: "France Travail (aucune offre trouvée)",
      };
    }

    // Salaires
    const salaries = offers
      .map((o) => parseSalary(o.salaire?.libelle))
      .filter((s): s is [number, number] => s !== null);
    const medianSalary = computeMedianRange(salaries);

    // Skills / Regions
    const topSkills = aggregateSkills(offers);
    const topRegions = aggregateRegions(offers);

    // "Récentes" = offres des 30 derniers jours
    const now = Date.now();
    const recentOffers = offers.filter((o) => {
      const created = new Date(o.dateCreation).getTime();
      return now - created < 30 * 86_400_000;
    }).length;

    return {
      totalOffers: offers.length,
      recentOffers,
      medianSalary,
      topSkills,
      topRegions,
      source: "France Travail",
    };
  } catch (err) {
    console.error("[ikigai-market] snapshot failed:", err);
    return null;
  }
}
