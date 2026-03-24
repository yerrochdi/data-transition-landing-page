import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ai } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

const LINKEDIN_EXTRACTION_PROMPT = `Analyse ce texte extrait d'un profil LinkedIn PDF et extrais les informations suivantes en JSON.

RÈGLES :
- Réponds UNIQUEMENT avec du JSON valide, pas de markdown, pas de texte autour
- Si une information n'est pas trouvée, mets null
- Les compétences doivent être listées individuellement
- Déduis le secteur à partir de l'entreprise et du rôle
- L'expérience en années = différence entre la date du premier poste et aujourd'hui
- Pour le niveau d'études, déduis le niveau (bac, bac+2, bac+3, bac+5, bac+8, autodidacte)

FORMAT JSON attendu :
{
  "currentRole": "Titre du poste actuel",
  "currentCompany": "Entreprise actuelle",
  "currentSector": "Secteur déduit",
  "experienceYears": 10,
  "educationLevel": "bac+5",
  "certifications": ["Cert 1", "Cert 2"],
  "topSkills": ["Skill 1", "Skill 2", "Skill 3"],
  "experiences": [
    {
      "role": "Titre",
      "company": "Entreprise",
      "duration": "2 ans",
      "highlights": "Résumé des responsabilités"
    }
  ],
  "education": [
    {
      "degree": "Master en...",
      "school": "Université de...",
      "year": "2015"
    }
  ],
  "summary": "Résumé professionnel en 2-3 phrases",
  "hasDataExperience": false
}

IMPORTANT : Retourne UNIQUEMENT le JSON brut.`;

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
    const pdfData = await pdfParse(buffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length < 50) {
      return new Response("Le PDF ne contient pas assez de texte. Vérifiez qu'il s'agit bien d'un export LinkedIn.", { status: 400 });
    }

    // Truncate to avoid token limits (first 4000 chars is usually enough for a LinkedIn profile)
    const truncated = pdfText.substring(0, 4000);

    // Send to AI for structured extraction
    const completion = await ai.chat.completions.create({
      model: "moonshot-v1-32k",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${LINKEDIN_EXTRACTION_PROMPT}\n\nVoici le texte du profil LinkedIn :\n\n${truncated}`,
        },
      ],
      max_tokens: 1024,
      temperature: 0.3, // Low temperature for structured extraction
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return new Response("L'IA n'a pas pu analyser le profil", { status: 500 });
    }

    // Clean and parse JSON
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");

    try {
      const parsed = JSON.parse(cleaned);
      return Response.json(parsed);
    } catch {
      // If JSON parsing fails, return raw text for debugging
      console.error("Failed to parse AI response as JSON:", cleaned);
      return new Response("Erreur d'analyse du profil. Réessayez.", { status: 500 });
    }
  } catch (error) {
    console.error("LinkedIn parse error:", error);
    return new Response("Erreur lors du traitement du fichier", { status: 500 });
  }
}
