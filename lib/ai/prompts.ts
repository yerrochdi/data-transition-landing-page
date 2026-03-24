import type { OnboardingFormData } from "@/lib/onboarding/types";

export const SYSTEM_PROMPT = `Tu es le Copilot de NextMove AI, un expert en transition de carrière vers les métiers de la data et de l'IA.

RÈGLE FONDAMENTALE : Ne suggère JAMAIS de rôles purement techniques qui ignorent l'expérience existante de l'utilisateur. Ton objectif est de trouver des rôles HYBRIDES qui combinent le domaine d'expertise actuel avec les compétences data/IA. La personne ne repart pas de zéro — elle ÉVOLUE.

Exemples de bonnes suggestions par domaine :
- Finance + Data → "Data Analyst Finance", "FinTech Data Strategist", "Risk Data Analyst", "Quantitative Analyst"
- Marketing + Data → "Growth Data Analyst", "AI Marketing Manager", "Marketing Analytics Lead", "CRM Data Strategist"
- RH + Data → "People Analytics Manager", "HR Data Strategist", "Talent Intelligence Analyst"
- Chef de projet IT + Data → "Data Product Manager", "Technical Program Manager - Data", "Data Engineering Lead"
- Juridique + Data → "Legal Data Analyst", "RegTech Consultant", "Compliance Data Officer"
- Santé + Data → "Health Data Analyst", "Clinical Data Manager", "BioTech Data Scientist"
- Logistique + Data → "Supply Chain Data Analyst", "Operations Intelligence Manager"
- Communication + Data → "Content Data Strategist", "Digital Analytics Manager"
- Éducation + Data → "EdTech Data Analyst", "Learning Analytics Specialist"
- Comptabilité + Data → "Financial Data Analyst", "Audit Data Specialist"

MAUVAISES suggestions (sauf si le profil est DÉJÀ très technique) :
- "Full-stack Developer", "ML Engineer", "DevOps Engineer", "Backend Developer"
- Rôles trop ambitieux sans contexte : "CTO", "VP Engineering", "Chief Data Officer"

RÈGLES DE COMMUNICATION :
- Réponds TOUJOURS et UNIQUEMENT en français. JAMAIS de chinois, japonais, ou tout autre alphabet non-latin. Si tu te surprends à écrire en chinois, ARRÊTE et reformule en français.
- Sois concis, encourageant et concret
- Utilise un ton professionnel mais chaleureux
- Appuie-toi sur des données concrètes quand possible
- Ne fais jamais de promesses irréalistes
- N'utilise AUCUN caractère chinois (汉字) dans tes réponses`;

export function buildAmbitionsPrompt(data: Partial<OnboardingFormData>): string {
  const educationContext = data.educationLevel
    ? `\nNiveau d'études : ${data.educationLevel}`
    : "";
  const certContext = data.certifications?.length
    ? `\nCertifications : ${data.certifications.join(", ")}`
    : "";
  const dataTrainingContext = data.hasDataTraining !== undefined
    ? `\nExpérience data/IA : ${data.hasDataTraining ? "Oui (a déjà touché à la data)" : "Non (part de zéro)"}`
    : "";

  return `L'utilisateur est actuellement "${data.currentRole || "non précisé"}" dans le secteur "${data.currentSector || "non précisé"}" avec ${data.experienceYears || "quelques"} ans d'expérience.${educationContext}${certContext}${dataTrainingContext}

Sa situation : "${data.situation || "non précisée"}"

En te basant sur son métier actuel, son secteur, son niveau d'études et ses certifications, propose EXACTEMENT 4 rôles de transition vers la data/IA qui valorisent son expérience.

${!data.hasDataTraining ? "IMPORTANT : Cette personne n'a PAS d'expérience en data/IA. Propose des rôles accessibles qui ne nécessitent pas de compétences techniques avancées au départ." : ""}

Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de texte avant/après) dans ce format :
[
  {
    "title": "Titre du rôle",
    "sector": "Secteur cible",
    "description": "2-3 phrases expliquant pourquoi ce rôle est idéal pour ce profil, quelles compétences actuelles sont valorisées, et quel est le potentiel.",
    "match": 85
  }
]

Le champ "match" est un score de compatibilité entre 70 et 95.
Les rôles doivent être du plus accessible au plus ambitieux.
Chaque rôle DOIT combiner le domaine actuel (${data.currentSector || "son secteur"}) avec la data/IA.
Les descriptions DOIVENT être en français.
IMPORTANT : Retourne UNIQUEMENT le JSON brut, sans balises markdown, sans \`\`\`, sans texte autour.`;
}

export function buildSkillsPrompt(data: Partial<OnboardingFormData>): string {
  const skillsWithLevels = data.skillLevels?.length
    ? data.skillLevels.map((s) => `${s.name} (${s.level})`).join(", ")
    : data.topSkills?.join(", ") || "aucune";

  return `Profil de l'utilisateur :
- Rôle actuel : ${data.currentRole || "non précisé"}
- Secteur : ${data.currentSector || "non précisé"}
- Expérience : ${data.experienceYears || "quelques"} ans
- Formation : ${data.educationLevel || "non précisé"}
- Certifications : ${data.certifications?.join(", ") || "aucune"}
- Expérience data/IA : ${data.hasDataTraining ? "Oui" : "Non"}
- Rôle cible : ${data.targetRole || "non précisé"}
- Secteur cible : ${data.targetSector || "non précisé"}
- Compétences et niveaux : ${skillsWithLevels}

Analyse ses compétences en profondeur :
1. **Compétences transférables** : Lesquelles de ses compétences actuelles sont directement valorisables dans la data/IA ? Tiens compte du NIVEAU indiqué. (liste courte avec explication)
2. **Gaps à combler** : 2-3 compétences spécifiques qu'il/elle doit acquérir pour atteindre son rôle cible. Sois précis (pas juste "Python" mais "Python pour l'analyse de données avec pandas/numpy"). Adapte la difficulté à son niveau actuel.
3. **Avantage compétitif** : Quel est son atout unique par rapport à quelqu'un qui vient d'un parcours purement technique ? (1-2 phrases)
4. **Parcours de montée en compétences** : Recommande 2-3 ressources/formations spécifiques adaptées à son niveau et budget.

Sois encourageant — valorise ce qu'il/elle a déjà.`;
}

export function buildMotivationPrompt(data: Partial<OnboardingFormData>): string {
  const motivationType = data.motivation === "attracted"
    ? "attiré par la data/IA"
    : data.motivation === "fleeing"
    ? "en recherche de changement (quitte son poste actuel)"
    : "les deux (quitte + attiré)";

  return `Profil :
- Rôle actuel : ${data.currentRole || "non précisé"} (${data.experienceYears || "?"} ans)
- Secteur : ${data.currentSector || "non précisé"}
- Motivation : ${motivationType}
- Rôle cible : ${data.targetRole || "non précisé"}

Réalisations clés décrites par l'utilisateur :
"${data.keyAchievements || "non renseigné"}"

Analyse ses réalisations et détecte :
1. **Compétences cachées** : Quelles compétences se révèlent à travers ces projets ? (souvent les gens ne réalisent pas qu'ils ont des compétences data)
2. **Forces sous-estimées** : Ce qui fait sa valeur unique sur le marché data
3. **Signal de réussite** : Ce que ses réalisations disent sur sa capacité à réussir la transition

Sois spécifique à SES réalisations. Maximum 120 mots.`;
}

export function buildConfidencePrompt(data: Partial<OnboardingFormData>): string {
  return `Profil :
- Situation : ${data.situation || "non précisée"}
- Rôle actuel : ${data.currentRole || "non précisé"} (${data.experienceYears || "quelques"} ans)
- Rôle cible : ${data.targetRole || "non précisé"}
- Motivation : ${data.motivation === "attracted" ? "attiré par la data" : data.motivation === "fleeing" ? "besoin de changement" : "les deux"}
- Blockers identifiés : ${data.blockers?.join(", ") || "aucun"}
- Niveau de confiance : ${data.confidenceLevel ?? 5}/10
- Scénario idéal : "${data.dreamScenario || "non précisé"}"

En tant que coach mindset, donne un message personnalisé qui :
1. Reconnaît ses freins spécifiques (mentionne-les directement)
2. Recadre positivement : transforme chaque frein en levier ou en preuve de lucidité
3. Donne UN conseil actionnable pour cette semaine
4. Termine par une phrase motivante adaptée à son niveau de confiance

${data.confidenceLevel !== undefined && data.confidenceLevel <= 3 ? "Le niveau de confiance est bas — sois particulièrement bienveillant et rassurant." : ""}
${data.confidenceLevel !== undefined && data.confidenceLevel >= 8 ? "Le niveau est élevé — canalise cette énergie vers l'action concrète." : ""}

Maximum 150 mots.`;
}

export function buildSummaryPrompt(data: OnboardingFormData): string {
  const skillsDetail = data.skillLevels?.length
    ? data.skillLevels.map((s) => `${s.name} (${s.level})`).join(", ")
    : data.topSkills.join(", ");

  const motivationLabel = data.motivation === "attracted"
    ? "Attiré par la data/IA"
    : data.motivation === "fleeing"
    ? "Besoin de changement"
    : data.motivation === "both"
    ? "Quitte + attiré"
    : "Non précisé";

  const prioritiesLabel = data.priorities?.length
    ? data.priorities.map((p, i) => `${i + 1}. ${p}`).join(", ")
    : "non précisées";

  return `Voici le profil COMPLET de l'utilisateur après son diagnostic :

IDENTITÉ PROFESSIONNELLE :
- Situation : ${data.situation}
- Rôle actuel : ${data.currentRole} dans le secteur ${data.currentSector}
- Expérience : ${data.experienceYears || "non précisée"} ans
- Formation : ${data.educationLevel || "non précisé"}
- Certifications : ${data.certifications?.join(", ") || "aucune"}
- Expérience data/IA : ${data.hasDataTraining ? "Oui" : "Non, part de zéro"}

OBJECTIF DE TRANSITION :
- Rôle cible : ${data.targetRole} dans le secteur ${data.targetSector}
- Motivation : ${motivationLabel}
- Scénario idéal : "${data.dreamScenario || "non précisé"}"

COMPÉTENCES & NIVEAUX :
- ${skillsDetail}
- Réalisations clés : "${data.keyAchievements || "non renseigné"}"

CONTEXTE PERSONNEL :
- Freins : ${data.blockers.join(", ")}
- Confiance : ${data.confidenceLevel}/10
- Objectif court terme (3 mois) : ${data.shortTermGoal || "non précisé"}
- Objectif moyen terme (12 mois) : ${data.longTermGoal || "non précisé"}
- Rythme souhaité : ${data.preferredPace}
- Disponibilité : ${data.availableHoursPerWeek}h/semaine
- Budget formation : ${data.trainingBudget}
- Localisation : ${data.location || "non précisée"}
- Mode de travail : ${data.remotePreference}
- Style d'apprentissage : ${data.learningStyle?.join(", ") || "non précisé"}
- Priorités : ${prioritiesLabel}

Génère un profil de synthèse structuré avec EXACTEMENT ces 4 sections (utilise ces titres exacts) :

**Profil détecté**
Un titre de profil hybride qui combine son expertise actuelle et la data/IA (1 ligne)

**Forces clés**
3-4 forces identifiées à partir de son expérience, compétences ET réalisations (liste à puces courte)

**Axes de progression**
2-3 compétences ou certifications à acquérir, spécifiques à son parcours. Tiens compte de son niveau actuel, son budget (${data.trainingBudget}) et sa disponibilité (${data.availableHoursPerWeek}h/sem). Recommande des ressources concrètes (noms de formations, plateformes).

**Parcours recommandé**
Un plan de transition concret en 3 étapes adaptées à :
- Son rythme : ${data.preferredPace}
- Sa disponibilité : ${data.availableHoursPerWeek}h/semaine
- Son budget : ${data.trainingBudget}
- Son style d'apprentissage : ${data.learningStyle?.join(", ") || "varié"}
- Ses priorités : ${prioritiesLabel}

Avec une estimation de probabilité de succès (pourcentage réaliste entre 65% et 90%).

Sois réaliste mais encourageant. Maximum 300 mots.`;
}
