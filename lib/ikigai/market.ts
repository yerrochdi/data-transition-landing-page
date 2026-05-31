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
import { ai } from "@/lib/ai/client";

export type IkigaiMarketSnapshot = {
  totalOffers: number;
  recentOffers: number;
  /** `estimated: true` quand la fourchette vient d'une estimation IA
   * (France Travail n'avait pas de salaire exploitable). */
  medianSalary: { min: number; max: number; estimated: boolean } | null;
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
  return { min: mins[mid], max: maxs[mid], estimated: false };
}

/**
 * Estime une fourchette salariale réaliste (France, marché 2026) pour un
 * rôle donné via Kimi, quand France Travail ne fournit pas de salaire
 * exploitable. Renvoie null si l'IA échoue — l'UI gère l'absence.
 *
 * @param role       Rôle cible (ex: "Head of People Analytics")
 * @param years      Années d'expérience (pour calibrer la séniorité)
 * @param sector     Secteur (pour ajuster — finance paie + que assoc)
 */
export async function estimateSalaryForRole(
  role: string,
  years: number | null,
  sector: string | null
): Promise<{ min: number; max: number; estimated: boolean } | null> {
  if (!process.env.MOONSHOT_API_KEY || !role || role.trim().length < 3) {
    return null;
  }

  const prompt = `Tu es un expert en rémunération du marché de l'emploi français (cabinet type Robert Walters / Michael Page), édition 2026.

Estime la fourchette de salaire ANNUEL BRUT réaliste en France pour :
- Rôle : "${role}"
- Expérience : ${years ?? "non précisée"} ans
- Secteur : ${sector || "non précisé"}

RÈGLES :
- Fourchette réaliste France 2026 (pas USA, pas hype). Un Head 6 ans ≠ un Head 15 ans.
- Réponds UNIQUEMENT avec ce JSON, aucun texte autour, aucun caractère asiatique :
{"min": 45000, "max": 60000}
- min et max en euros bruts annuels, nombres entiers, sans espace ni symbole.`;

  try {
    const completion = await ai.chat.completions.create({
      model: "moonshot-v1-8k",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60,
      temperature: 0.3,
    });
    let text = (completion.choices[0]?.message?.content || "").trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
    const match = text.match(/\{[^}]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as { min?: number; max?: number };
    if (
      typeof parsed.min !== "number" ||
      typeof parsed.max !== "number" ||
      parsed.min < 10_000 ||
      parsed.max > 500_000 ||
      parsed.min > parsed.max
    ) {
      return null;
    }
    return {
      min: Math.round(parsed.min),
      max: Math.round(parsed.max),
      estimated: true,
    };
  } catch (err) {
    console.error("[ikigai-market] salary estimate failed:", err);
    return null;
  }
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
  targetRole: string,
  opts: { years?: number | null; sector?: string | null } = {}
): Promise<IkigaiMarketSnapshot | null> {
  if (!targetRole || targetRole.trim().length < 3) return null;

  // Estimation salaire IA en fallback — toujours dispo même si FT muet.
  const estimateSalary = () =>
    estimateSalaryForRole(targetRole, opts.years ?? null, opts.sector ?? null);

  try {
    const offers = await searchOffers({
      motsCles: targetRole.trim(),
      range: "0-49",
    });

    if (offers.length === 0) {
      // Aucune offre FR (souvent un rôle au titre anglais) → on garde une
      // valeur : estimation salaire IA pour ne pas laisser l'écran vide.
      const medianSalary = await estimateSalary();
      return {
        totalOffers: 0,
        recentOffers: 0,
        medianSalary,
        topSkills: [],
        topRegions: [],
        source: medianSalary
          ? "Estimation NextMove (peu d'offres au titre exact)"
          : "France Travail (aucune offre trouvée)",
      };
    }

    // Salaires réels depuis les offres
    const salaries = offers
      .map((o) => parseSalary(o.salaire?.libelle))
      .filter((s): s is [number, number] => s !== null);
    let medianSalary = computeMedianRange(salaries);

    // Si trop peu de salaires renseignés dans les offres → estimation IA
    if (!medianSalary) {
      medianSalary = await estimateSalary();
    }

    const topSkills = aggregateSkills(offers);
    const topRegions = aggregateRegions(offers);

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
    // Même en cas d'erreur FT, on tente de donner une estimation salaire
    const medianSalary = await estimateSalary().catch(() => null);
    if (medianSalary) {
      return {
        totalOffers: 0,
        recentOffers: 0,
        medianSalary,
        topSkills: [],
        topRegions: [],
        source: "Estimation NextMove",
      };
    }
    return null;
  }
}
