/**
 * France Travail (formerly Pôle Emploi) — Offres d'emploi v2 client.
 *
 * Auth flow: OAuth2 client_credentials, scope `o2dsoffre api_offresdemploiv2`.
 * Tokens are short-lived (~24h), so we cache them in memory between calls.
 *
 * Docs: https://francetravail.io/data/api/offres-emploi
 *
 * Required env vars (set in Vercel):
 *   - FRANCE_TRAVAIL_CLIENT_ID
 *   - FRANCE_TRAVAIL_CLIENT_SECRET
 */

const TOKEN_URL =
  "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";
const SEARCH_URL =
  "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search";

const SCOPE = "o2dsoffre api_offresdemploiv2";

// ROME codes targeted for the V1 — data/IA roles relevant for cadres en pivot.
export const TARGET_ROME_CODES = [
  "M1810", // Analyse de tendances
  "M1811", // Direction d'études en sciences humaines, économiques et sociales
  "M1802", // Conseil et maîtrise d'ouvrage en systèmes d'information
  "M1805", // Études et développement informatique
  "E1106", // Communication
];

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with a 60s safety margin).
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
  const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "France Travail credentials missing — set FRANCE_TRAVAIL_CLIENT_ID and FRANCE_TRAVAIL_CLIENT_SECRET"
    );
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: SCOPE,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`France Travail auth failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

// ─── Search offers ──────────────────────────────────────────────────

export type FranceTravailOffer = {
  id: string;
  intitule: string;
  description: string;
  dateCreation: string;
  dateActualisation?: string;
  romeCode?: string;
  romeLibelle?: string;
  appellationlibelle?: string;
  entreprise?: { nom?: string; description?: string; logo?: string };
  typeContrat?: string; // CDI, CDD, MIS...
  typeContratLibelle?: string;
  experienceLibelle?: string;
  formations?: Array<{ niveauLibelle?: string; commentaire?: string }>;
  competences?: Array<{ libelle: string; exigence?: string }>;
  salaire?: { libelle?: string };
  lieuTravail?: { libelle?: string; commune?: string };
  origineOffre?: { urlOrigine?: string };
};

type SearchOptions = {
  motsCles?: string;
  codeROME?: string; // single ROME — France Travail expects one at a time for filtering
  commune?: string; // INSEE code
  range?: string; // "0-49" — France Travail returns max 150 per call
};

export async function searchOffers(options: SearchOptions = {}): Promise<FranceTravailOffer[]> {
  const token = await getAccessToken();

  const params = new URLSearchParams();
  if (options.motsCles) params.set("motsCles", options.motsCles);
  if (options.codeROME) params.set("codeROME", options.codeROME);
  if (options.commune) params.set("commune", options.commune);
  params.set("range", options.range ?? "0-49");

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  // 206 Partial Content is returned when results are paginated — still OK to consume.
  if (!res.ok && res.status !== 206) {
    const text = await res.text();
    throw new Error(`France Travail search failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { resultats?: FranceTravailOffer[] };
  return json.resultats ?? [];
}

/**
 * Fetches a batch of offers across all data/IA-relevant ROME codes,
 * deduplicates by ID, and returns the merged list. Used by the weekly
 * cron sync to refresh the database.
 */
export async function fetchAllRelevantOffers(): Promise<FranceTravailOffer[]> {
  const seen = new Map<string, FranceTravailOffer>();

  for (const code of TARGET_ROME_CODES) {
    try {
      const offers = await searchOffers({ codeROME: code, range: "0-49" });
      for (const offer of offers) {
        if (!seen.has(offer.id)) seen.set(offer.id, offer);
      }
    } catch (err) {
      // One bad ROME shouldn't block the whole sync — log and continue.
      console.error(`[france-travail] ROME ${code} fetch failed:`, err);
    }
  }

  return Array.from(seen.values());
}

// ─── Offline mock for development before credentials are activated ──

export const MOCK_OFFERS: FranceTravailOffer[] = [
  {
    id: "MOCK-001",
    intitule: "Data Analyst Senior — Finance d'entreprise",
    description:
      "Au sein de la direction financière, tu construis et maintiens les dashboards de pilotage. Tu travailles avec Power BI, SQL et Excel avancé pour fournir des analyses prédictives sur le P&L et le cash flow. Tu collabores avec les équipes contrôle de gestion.",
    dateCreation: "2026-05-01T10:00:00Z",
    romeCode: "M1810",
    romeLibelle: "Analyse de tendances",
    typeContrat: "CDI",
    typeContratLibelle: "Contrat à durée indéterminée",
    experienceLibelle: "5 ans d'expérience exigée",
    competences: [
      { libelle: "Power BI" },
      { libelle: "SQL" },
      { libelle: "Excel avancé" },
      { libelle: "Modélisation financière" },
    ],
    salaire: { libelle: "65 000 € à 85 000 € par an" },
    lieuTravail: { libelle: "75 - PARIS 08", commune: "75108" },
    entreprise: { nom: "Groupe financier (anonyme)" },
    origineOffre: { urlOrigine: "https://candidat.francetravail.fr/offres/recherche/detail/MOCK-001" },
  },
  {
    id: "MOCK-002",
    intitule: "AI Product Manager",
    description:
      "Tu rejoins l'équipe produit d'une scale-up B2B SaaS pour piloter la roadmap des features IA. Tu travailles avec les équipes ML pour prioriser, framer et lancer des produits IA en production. Profil 5-10 ans d'XP produit attendu.",
    dateCreation: "2026-05-02T09:00:00Z",
    romeCode: "M1805",
    romeLibelle: "Études et développement informatique",
    typeContrat: "CDI",
    typeContratLibelle: "Contrat à durée indéterminée",
    experienceLibelle: "5 ans d'expérience exigée",
    competences: [
      { libelle: "Product Management" },
      { libelle: "IA / Machine Learning" },
      { libelle: "Roadmap" },
      { libelle: "Discovery" },
    ],
    salaire: { libelle: "85 000 € à 115 000 € par an" },
    lieuTravail: { libelle: "75 - PARIS 09", commune: "75109" },
    entreprise: { nom: "Scale-up B2B SaaS" },
    origineOffre: { urlOrigine: "https://candidat.francetravail.fr/offres/recherche/detail/MOCK-002" },
  },
  {
    id: "MOCK-003",
    intitule: "Directeur(rice) Marketing Data-Driven",
    description:
      "Au sein d'une marque retail française, tu pilotes la stratégie marketing en t'appuyant sur la data (segmentation client, attribution, A/B testing). Tu encadres une équipe de 6 personnes et travailles avec la data team interne.",
    dateCreation: "2026-05-03T14:00:00Z",
    romeCode: "E1106",
    romeLibelle: "Communication",
    typeContrat: "CDI",
    typeContratLibelle: "Contrat à durée indéterminée",
    experienceLibelle: "10 ans d'expérience",
    competences: [
      { libelle: "Marketing digital" },
      { libelle: "Analyse data" },
      { libelle: "A/B testing" },
      { libelle: "Management" },
    ],
    salaire: { libelle: "90 000 € à 120 000 € par an" },
    lieuTravail: { libelle: "92 - NEUILLY-SUR-SEINE", commune: "92051" },
    entreprise: { nom: "Marque retail française" },
    origineOffre: { urlOrigine: "https://candidat.francetravail.fr/offres/recherche/detail/MOCK-003" },
  },
];

/**
 * Returns mock offers when credentials aren't configured. Lets the rest
 * of the pipeline (sync, scoring, UI) be tested before France Travail
 * activates the API.
 */
export async function fetchAllRelevantOffersWithFallback(): Promise<FranceTravailOffer[]> {
  if (!process.env.FRANCE_TRAVAIL_CLIENT_ID) {
    console.warn("[france-travail] No credentials, falling back to mock offers");
    return MOCK_OFFERS;
  }
  return fetchAllRelevantOffers();
}
