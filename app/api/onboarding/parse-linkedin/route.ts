import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ai } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";

// Le diagnostic narratif Kimi prend 15-30s. Sans ce maxDuration, Vercel
// coupe au timeout par défaut (10s) -> "Erreur lors du traitement".
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// pdf-parse v1 tries to load a test file on require() — dynamic import avoids this at build time
async function parsePdf(buffer: Buffer) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse/lib/pdf-parse");
  return pdfParse(buffer);
}

const LINKEDIN_EXTRACTION_PROMPT = `Vous êtes un consultant senior en transition de carrière (Bain, Korn Ferry). Analysez ce profil LinkedIn pour produire UN DIAGNOSTIC en deux temps :

PARTIE 1 — Extraction factuelle (pour pré-remplir le formulaire)
PARTIE 2 — LECTURE SENIOR DU PARCOURS (le coeur de votre valeur ajoutée)

RÈGLES ABSOLUES :
- Réponds UNIQUEMENT avec du JSON valide, pas de markdown, pas de texte autour
- Français UNIQUEMENT. AUCUN caractère asiatique (chinois, japonais, coréen). Aucun. Si vous êtes tentés, repassez en français.
- Si une information n'est pas trouvée, mets null ou tableau vide []
- VOUVOIEMENT systématique dans les champs de texte libre
- Pas de "Bravo", "Excellent", "Magnifique". Vous êtes posé, pas vendeur.

ANTI-HALLUCINATION (CRITIQUE) :
- Les certifications : ne listez QUE celles EXPLICITEMENT mentionnées dans le PDF.
  N'inventez JAMAIS de certifs ("Google Data Analytics", "PMP", etc.) qui ne sont
  pas littéralement dans le texte source. Si le profil n'a aucune certification
  visible : retournez [] (tableau vide). C'est honnête et c'est ce qui rassure.
- Les compétences : ne listez QUE celles présentes dans la section "Compétences"
  du LinkedIn OU clairement déductibles d'une description de poste explicite.
  N'inventez jamais "SQL" si le mot n'apparaît nulle part dans le CV.
- L'expérience en années : compter PRÉCISÉMENT (ex: 4 ans 8 mois = "4 ans 8 mois"
  en string, ou 5 en number arrondi inférieur). JAMAIS de décimal type "4.7 ans".
- Les compétences déduites (real_skills_deduced) : doivent être JUSTIFIABLES
  par une mission concrète. Ex: si le CV dit "Animation du processus de contrôle
  des données administratives", vous pouvez dire "Pilotage qualité data administrative".
  Si ce n'est pas dans le CV : ne le mettez pas.

FORMAT JSON attendu :
{
  "currentRole": "Titre exact du poste actuel",
  "currentCompany": "Entreprise actuelle",
  "currentSector": "Secteur précis déduit (ex: 'Conseil IT', 'Banque privée', 'Énergie', 'RH/SIRH')",
  "experienceYears": 10,
  "educationLevel": "bac+5",
  "certifications": ["Cert 1", "Cert 2"],
  "topSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "experiences": [
    { "role": "Titre", "company": "Entreprise", "duration": "2 ans 3 mois", "highlights": "1-2 phrases sur les responsabilités réelles" }
  ],
  "education": [
    { "degree": "Master en...", "school": "Université de...", "year": "2015" }
  ],
  "hasDataExperience": false,

  "diagnostic": {
    "synthesis": "3-4 phrases qui résument QUI est cette personne professionnellement. Pas un copié-collé du CV : une vraie lecture senior. Mentionnez la séniorité réelle, le domaine de fond, le pattern de carrière (ex: 'professionnelle senior SIRH avec 6 ans d'expérience hybride RH x IT, 3 transitions internes réussies, expo internationale US/Canada').",
    "deduced_specialty": "1 phrase qui nomme la spécialité réelle (pas le titre LinkedIn). Ex: 'Spécialiste SIRH / data administration RH' ou 'Consultant projet IT orienté change management'.",
    "real_skills_deduced": ["3 à 6 compétences DÉDUITES des descriptions de postes, pas auto-déclarées. Ex: 'Pilotage d'éditeur', 'Animation de processus de contrôle qualité', 'Création de supports e-learning multilingues'"],
    "hidden_patterns": ["2 à 4 patterns INVISIBLES dans le CV. Format court (3-8 mots). Ex: 'Domaine hybride RH x outils', '3 transitions internes réussies', 'Expo internationale US/Canada', 'Trajectoire ascendante stable'"],
    "transition_angle": "1-2 phrases : quel est l'angle d'attaque NATUREL pour cette personne vers la data/IA ? Si la personne est RH/SIRH, pensez 'People Analytics' avant de penser 'Data Analyst'. Si la personne est finance, pensez 'Analytics Finance' avant 'Data Engineer'. Capitalisez sur le domaine métier — c'est le pont, pas l'obstacle.",
    "questions_to_clarify": ["2 à 3 questions OUVERTES que vous poseriez à cette personne dans un premier entretien pour mieux la cerner. Format : 1 phrase chacune. Ex: 'Votre rôle actuel vous met-il en contact avec la data au quotidien ?', 'Le SIRH vous limite-t-il, ou est-ce une base que vous voulez enrichir ?'"]
  }
}

IMPORTANT :
- Retourne UNIQUEMENT le JSON brut, pas de markdown ni de texte autour
- AUCUN caractère asiatique nulle part
- Le \`diagnostic\` est OBLIGATOIRE — c'est ce qui distingue NextMove d'un wrapper ChatGPT
- Pour un profil RH : pensez "People Analytics / Talent Intelligence / HRIS"
- Pour un profil finance : pensez "FP&A augmenté / Finance Analytics"
- Pour un profil marketing : pensez "Growth Analytics / Customer Intelligence"
- Pour un profil tech : pensez "Data Engineering / ML Engineering"
- JAMAIS proposer "Senior Data Analyst" générique sans le décliner au domaine métier`;

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Non authentifié", { status: 401 });
  }

  if (!process.env.MOONSHOT_API_KEY) {
    return new Response("Service IA non configuré", { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response("Aucun fichier fourni", { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return new Response("Le fichier doit être un PDF", { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response("Le fichier ne doit pas dépasser 5MB", { status: 400 });
    }

    // Parse PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await parsePdf(buffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length < 50) {
      return new Response("Le PDF ne contient pas assez de texte. Vérifiez qu'il s'agit bien d'un export LinkedIn.", { status: 400 });
    }

    // On garde plus de contexte (8000 chars) car on demande maintenant un
    // diagnostic narratif en plus de l'extraction factuelle.
    const truncated = pdfText.substring(0, 8000);

    // Send to AI for structured extraction + narrative diagnostic
    const completion = await ai.chat.completions.create({
      model: "moonshot-v1-32k",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${LINKEDIN_EXTRACTION_PROMPT}\n\nVoici le texte du profil LinkedIn :\n\n${truncated}`,
        },
      ],
      // 2500 tokens : extraction + diagnostic (3-4 phrases × plusieurs champs).
      max_tokens: 2500,
      // Temperature 0.4 : un peu plus de marge stylistique pour le diagnostic
      // narratif tout en gardant la rigueur du JSON.
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return new Response("L'IA n'a pas pu analyser le profil", { status: 500 });
    }

    // Clean and parse JSON
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");

    // Purge any CJK characters that Kimi might leak despite the system prompt.
    // On nettoie côté serveur pour garantir un rendu propre côté client.
    cleaned = cleaned
      .replace(/[　-〿]/g, "") // CJK punctuation
      .replace(/[぀-ゟ]/g, "") // Hiragana
      .replace(/[゠-ヿ]/g, "") // Katakana
      .replace(/[一-鿿]/g, "") // CJK Unified Ideographs
      .replace(/[豈-﫿]/g, "") // CJK Compatibility Ideographs
      .replace(/[＀-￯]/g, ""); // Full-width forms

    try {
      const parsed = JSON.parse(cleaned);

      // Validation minimale : on s'assure que le diagnostic est présent.
      // S'il manque (réponse partielle), on log mais on renvoie quand même
      // ce qu'on a — l'extraction factuelle est utile même sans diagnostic.
      if (!parsed.diagnostic) {
        console.warn("[parse-linkedin] No diagnostic in response, returning factual only");
      }

      return Response.json(parsed);
    } catch (parseErr) {
      console.error("Failed to parse AI response as JSON:", cleaned.slice(0, 500));
      console.error("Parse error:", parseErr);
      return new Response(
        "Erreur d'analyse du profil. Le format de la réponse IA est invalide. Réessayez.",
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("LinkedIn parse error:", error);
    return new Response("Erreur lors du traitement du fichier", { status: 500 });
  }
}
