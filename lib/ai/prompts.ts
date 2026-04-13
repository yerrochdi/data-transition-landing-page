import type { OnboardingFormData } from "@/lib/onboarding/types";

export const SYSTEM_PROMPT = `Tu es le Copilot de NextMove AI, un expert en transition de carrière et en évolution professionnelle dans les métiers de la data et de l'IA.

RÈGLE N°1 — DÉTECTION DE SÉNIORITÉ :
Avant TOUTE suggestion, évalue le niveau de séniorité de l'utilisateur :
- JUNIOR (0-3 ans, pas d'expérience data) → Propose des rôles d'entrée : Data Analyst, BI Analyst, Analytics Associate
- CONFIRMÉ (3-7 ans, ou quelques compétences data) → Propose des rôles mid-level : Senior Data Analyst, Data Product Manager, Analytics Manager
- SENIOR (7-12 ans, ou rôle de management) → Propose des rôles de leadership : Head of Data, Director of Analytics, VP Data Strategy
- EXPERT/LEAD (12+ ans, ou déjà dans la data/IA) → Propose des rôles C-level ou stratégiques : Chief Data Officer, VP AI/ML, Head of AI Strategy, Data Transformation Director
- Si la personne est DÉJÀ dans la data/IA → NE PROPOSE JAMAIS un rôle inférieur ou latéral. Propose UNIQUEMENT des rôles SUPÉRIEURS en séniorité ou en scope.

RÈGLE N°2 — LE NEXT MOVE EST TOUJOURS VERS LE HAUT :
L'objectif de NextMove est d'aider les gens à PROGRESSER. Les suggestions doivent toujours représenter une ÉVOLUTION :
- Plus de responsabilités
- Plus de scope (équipe → département → entreprise)
- Plus de stratégie (exécution → pilotage → vision)
- Plus d'impact business
JAMAIS de rôle en dessous ou au même niveau que le poste actuel.

RÈGLE N°3 — RESPECT DE L'EXPERTISE EXISTANTE :
- Si quelqu'un est Lead Data, ne lui demande PAS s'il connaît SQL
- Si quelqu'un est manager, ne lui propose PAS des rôles individuels
- Si quelqu'un a 15 ans d'expérience, ne lui parle PAS comme à un débutant
- Adapte le VOCABULAIRE et la PROFONDEUR à son niveau

RÈGLE N°4 — APPÉTENCE TECHNIQUE :
- "no-code" → Rôles business/stratégie : Data Storyteller, BI Manager, Product Owner Data, CRM Director, People Analytics Director
- "low-code" → Rôles hybrides : Data Analyst, Growth Manager, Analytics Lead, BI Developer Senior
- "code" → Rôles techniques : Data Engineer, Data Scientist, ML Engineer, Analytics Engineer, Platform Engineer
- "flexible" → Adapte au profil global

RÈGLE N°5 — RÔLES HYBRIDES DOMAINE + DATA :
Combine TOUJOURS le domaine d'expertise actuel avec la data/IA :
- Finance → "Head of Financial Data", "FinTech Data Director", "Chief Analytics Officer Finance"
- Marketing → "VP Marketing Analytics", "Head of Growth Data", "AI Marketing Director"
- RH → "VP People Analytics", "Director Talent Intelligence", "Head of HR Data"
- Santé → "Chief Clinical Data Officer", "Head of Health AI", "Director Medical Analytics"
- Juridique → "Head of Legal Analytics", "Director RegTech", "Chief Compliance Data Officer"

RÈGLES DE COMMUNICATION :
- Réponds TOUJOURS et UNIQUEMENT en français
- JAMAIS de chinois, japonais, ou alphabet non-latin
- Sois concis, expert et concret
- Tutoie l'utilisateur
- Ton professionnel mais chaleureux
- Adapte le niveau de discours à la séniorité détectée
- Ne fais jamais de promesses irréalistes
- N'utilise AUCUN caractère chinois (汉字) dans tes réponses`;

export function buildAmbitionsPrompt(data: Partial<OnboardingFormData>): string {
  const years = data.experienceYears || 0;
  const role = data.currentRole || "non précisé";
  const sector = data.currentSector || "non précisé";

  // Detect seniority level
  const isAlreadyData = /data|analytics|bi|intelligence|machine learning|ml|ia|ai|scientist|engineer.*data/i.test(role);
  const isManager = /lead|head|director|manager|chief|vp|responsable|directeur|chef/i.test(role);
  const isSenior = years >= 7 || isManager;
  const isExpert = (years >= 12 || isAlreadyData) && isManager;

  let seniorityContext: string;
  if (isExpert) {
    seniorityContext = `SÉNIORITÉ DÉTECTÉE : EXPERT/LEADER (${years} ans, rôle "${role}")
Cette personne est déjà senior dans la data/IA. Propose UNIQUEMENT des rôles SUPÉRIEURS :
- Chief Data Officer, VP Data & AI, Head of AI Strategy, Data Transformation Director
- Rôles de scope plus large (passer d'une équipe à un département, d'un pays à l'international)
- Rôles plus stratégiques (passer de l'exécution au board)
NE PROPOSE JAMAIS un rôle en dessous de son niveau actuel. C'est INTERDIT.`;
  } else if (isAlreadyData) {
    seniorityContext = `SÉNIORITÉ DÉTECTÉE : DÉJÀ DANS LA DATA (${years} ans, rôle "${role}")
Cette personne travaille déjà dans la data/IA. Propose des rôles qui représentent une PROGRESSION :
- Plus de responsabilités (IC → Lead, Lead → Head, Head → VP)
- Plus de scope (technique → technique + business, mono-produit → multi-produit)
- Spécialisation plus poussée ou rôle plus stratégique
NE PROPOSE JAMAIS un rôle au même niveau ou en dessous.`;
  } else if (isSenior) {
    seniorityContext = `SÉNIORITÉ DÉTECTÉE : SENIOR (${years} ans, rôle "${role}")
Cette personne a une expérience significative. Propose des rôles de LEADERSHIP dans la data :
- Head of Data, Director Analytics, VP Data, Data Strategy Lead
- Rôles qui valorisent ses années de management/expertise métier
NE PROPOSE PAS de rôles juniors (Data Analyst, BI Analyst de base).`;
  } else {
    seniorityContext = `SÉNIORITÉ DÉTECTÉE : EN TRANSITION (${years} ans, rôle "${role}")
Cette personne débute sa transition vers la data. Propose un mix :
- 2 rôles accessibles rapidement (Data Analyst, BI Analyst)
- 2 rôles ambitieux à moyen terme (Senior Analyst, Analytics Manager)`;
  }

  const educationContext = data.educationLevel
    ? `\nNiveau d'études : ${data.educationLevel}`
    : "";
  const certContext = data.certifications?.length
    ? `\nCertifications : ${data.certifications.join(", ")}`
    : "";

  const techLabels: Record<string, string> = {
    "no-code": "NO-CODE — outils visuels uniquement, pas de code",
    "low-code": "LOW-CODE — SQL basique et Excel avancé OK, pas de Python",
    "code": "CODE — motivé pour Python, SQL avancé, outils techniques",
    "flexible": "FLEXIBLE — à adapter selon le profil",
  };
  const techContext = data.technicalAppetite
    ? `\nAppétence technique : ${techLabels[data.technicalAppetite] || data.technicalAppetite}`
    : "";

  return `${seniorityContext}

PROFIL COMPLET :
- Rôle actuel : "${role}" dans le secteur "${sector}"
- Expérience : ${years} ans${educationContext}${certContext}
- Expérience data/IA : ${data.hasDataTraining ? "Oui" : "Non"}${techContext}
- Situation : "${data.situation || "non précisée"}"

MISSION : Propose EXACTEMENT 4 rôles de "next move" qui représentent une ÉVOLUTION VERS LE HAUT.
Chaque rôle doit combiner l'expertise dans le secteur "${sector}" avec la data/IA.
Les rôles doivent être RÉALISTES mais ASPIRATIONNELS — toujours un cran au-dessus.

${data.technicalAppetite === "no-code" ? "CONTRAINTE : Pas de code. Rôles business/stratégie/management uniquement." : ""}
${data.technicalAppetite === "low-code" ? "CONTRAINTE : SQL et outils BI OK, mais pas de rôles nécessitant du Python avancé." : ""}

Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de texte avant/après) :
[
  {
    "title": "Titre du rôle",
    "sector": "Secteur cible",
    "description": "2-3 phrases : pourquoi ce rôle est le bon next move, quelles compétences actuelles sont un atout, et ce que ça apporte (salaire, impact, scope). En français.",
    "match": 85
  }
]

"match" : score de compatibilité entre 70 et 95. Du plus accessible au plus ambitieux.
IMPORTANT : JSON brut uniquement, sans \`\`\`, sans texte autour.`;
}

export function buildSkillsPrompt(data: Partial<OnboardingFormData>): string {
  const skillsWithLevels = data.skillLevels?.length
    ? data.skillLevels.map((s) => `${s.name} (${s.level})`).join(", ")
    : data.topSkills?.join(", ") || "aucune";

  const techLabels: Record<string, string> = {
    "no-code": "NO-CODE — ne veut pas coder, uniquement outils visuels",
    "low-code": "LOW-CODE — SQL basique et Excel avancé OK, pas de Python avancé",
    "code": "CODE — motivé pour la programmation",
    "flexible": "FLEXIBLE — à adapter",
  };

  const role = data.currentRole || "non précisé";
  const years = data.experienceYears || 0;
  const isAlreadyData = /data|analytics|bi|intelligence|machine learning|ml|ia|ai|scientist|engineer.*data/i.test(role);

  const adaptedIntro = isAlreadyData
    ? `Cette personne est DÉJÀ experte data/IA (${role}, ${years} ans). Ne parle pas de compétences "transférables" — elle les a déjà. Focus sur ce qui la distingue pour le NEXT LEVEL et les gaps stratégiques (leadership, business acumen, architecture, etc.).`
    : years >= 7
    ? `Professionnel(le) senior (${years} ans). Valorise son expertise métier comme avantage compétitif. Les "gaps" ne sont pas des bases mais des spécialisations.`
    : `Profil en transition vers la data/IA. Identifie les ponts entre son expérience et le rôle cible.`;

  return `${adaptedIntro}

Profil :
- Rôle actuel : ${role}
- Secteur : ${data.currentSector || "non précisé"}
- Expérience : ${years} ans
- Formation : ${data.educationLevel || "non précisé"}
- Certifications : ${data.certifications?.join(", ") || "aucune"}
- Expérience data/IA : ${data.hasDataTraining ? "Oui" : "Non"}
- Appétence technique : ${techLabels[data.technicalAppetite || "flexible"] || "flexible"}
- Rôle cible : ${data.targetRole || "non précisé"}
- Secteur cible : ${data.targetSector || "non précisé"}
- Compétences et niveaux : ${skillsWithLevels}

Analyse ses compétences en profondeur :
1. **${isAlreadyData ? "Forces stratégiques" : "Compétences transférables"}** : ${isAlreadyData ? "Ce qui fait sa valeur unique pour un rôle de niveau supérieur" : "Lesquelles de ses compétences actuelles sont directement valorisables dans la data/IA"}. Tiens compte du NIVEAU indiqué. (liste courte avec explication)
2. **${isAlreadyData ? "Axes de progression stratégiques" : "Gaps à combler"}** : ${isAlreadyData ? "2-3 compétences de leadership/stratégie pour passer au niveau supérieur (ex: stakeholder management, data governance, business strategy, board communication)" : `2-3 compétences spécifiques pour atteindre son rôle cible. ${data.technicalAppetite === "no-code" ? "UNIQUEMENT des outils no-code/visuels. PAS de Python, R ou SQL avancé." : data.technicalAppetite === "low-code" ? "Privilégie SQL, Excel avancé, outils BI. Pas de Python avancé." : "Sois précis (pas juste 'Python' mais 'Python pour l'analyse de données avec pandas/numpy')."}`}
3. **Avantage compétitif** : ${isAlreadyData ? "Ce qui le/la différencie des autres candidats au même rôle cible" : "Son atout unique par rapport à quelqu'un d'un parcours purement technique"} (1-2 phrases)
4. **${isAlreadyData ? "Accélérateurs de carrière" : "Parcours de montée en compétences"}** : ${isAlreadyData ? "2-3 actions stratégiques (certifications de leadership, conférences à donner, publications, communauté à rejoindre)" : `2-3 ressources/formations adaptées à son niveau technique (${data.technicalAppetite || "flexible"})`}

${isAlreadyData ? "Parle en expert à expert. Pas de ton condescendant." : "Sois encourageant — valorise ce qu'il/elle a déjà."}`;
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

  const years = data.experienceYears || 0;
  const role = data.currentRole || "";
  const isAlreadyData = /data|analytics|bi|intelligence|machine learning|ml|ia|ai|scientist|engineer.*data/i.test(role);
  const isManager = /lead|head|director|manager|chief|vp|responsable|directeur|chef/i.test(role);
  const seniorityNote = isAlreadyData
    ? "ATTENTION : Cette personne est DÉJÀ dans la data/IA. Adapte le ton — parle en expert à expert. Ne sois pas condescendant. Focus sur l'évolution stratégique, pas sur les bases."
    : isManager
    ? `ATTENTION : Cette personne est MANAGER avec ${years} ans d'expérience. Parle-lui comme à un pair senior. Focus sur le leadership data, pas sur l'apprentissage technique de base.`
    : years >= 7
    ? `Cette personne a ${years} ans d'expérience — c'est un(e) professionnel(le) confirmé(e). Valorise son expertise métier comme un avantage compétitif majeur.`
    : "";

  return `${seniorityNote ? seniorityNote + "\n\n" : ""}Voici le profil COMPLET de l'utilisateur après son diagnostic :

IDENTITÉ PROFESSIONNELLE :
- Situation : ${data.situation}
- Rôle actuel : ${data.currentRole} dans le secteur ${data.currentSector}
- Expérience : ${data.experienceYears || "non précisée"} ans
- Formation : ${data.educationLevel || "non précisé"}
- Certifications : ${data.certifications?.join(", ") || "aucune"}
- Expérience data/IA : ${data.hasDataTraining ? "Oui" : "Non, part de zéro"}
- Appétence technique : ${data.technicalAppetite === "no-code" ? "NO-CODE — ne veut pas coder" : data.technicalAppetite === "low-code" ? "LOW-CODE — SQL basique OK" : data.technicalAppetite === "code" ? "CODE — motivé technique" : "FLEXIBLE"}

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
2-3 compétences ou certifications à acquérir, spécifiques à son parcours. RESPECTE son appétence technique (${data.technicalAppetite}) : ${data.technicalAppetite === "no-code" ? "UNIQUEMENT des outils visuels/no-code, PAS de code" : data.technicalAppetite === "low-code" ? "SQL et outils BI, pas de Python avancé" : "adapte au profil"}. Tiens compte de son budget (${data.trainingBudget}) et sa disponibilité (${data.availableHoursPerWeek}h/sem). Recommande des ressources concrètes (noms de formations, plateformes).

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

// ============================================================
// Task Session Prompts (AI-Driven Learning)
// ============================================================

interface SessionProfile {
  currentRole: string;
  targetRole: string;
  currentSector: string;
  targetSector: string;
  technicalAppetite: string;
  confidenceLevel: number;
  experienceYears: number | null;
}

export function buildLessonPrompt(
  taskTitle: string,
  taskDescription: string,
  phaseTitle: string,
  profile: SessionProfile
): string {
  const techLevel = profile.technicalAppetite === "no-code"
    ? "L'utilisateur NE VEUT PAS coder. Explique avec des outils visuels, des analogies métier, des exemples concrets sans code."
    : profile.technicalAppetite === "low-code"
    ? "L'utilisateur accepte SQL basique et Excel avancé mais pas de Python. Reste accessible."
    : profile.technicalAppetite === "code"
    ? "L'utilisateur est motivé pour le technique. Tu peux montrer des exemples de code simples."
    : "Adapte le niveau technique au profil.";

  return `Tu es un formateur expert en transition de carrière vers la data/IA.

PROFIL DE L'APPRENANT :
- Rôle actuel : ${profile.currentRole} (${profile.experienceYears || "quelques"} ans)
- Secteur : ${profile.currentSector}
- Objectif : devenir ${profile.targetRole} dans ${profile.targetSector}
- Appétence technique : ${profile.technicalAppetite}
- Confiance : ${profile.confidenceLevel}/10

CONSIGNE TECHNIQUE : ${techLevel}

PHASE : ${phaseTitle}
TÂCHE : ${taskTitle}
DESCRIPTION : ${taskDescription}

Génère une micro-leçon personnalisée et engageante. Structure :

**Pourquoi c'est important pour vous**
2-3 phrases qui connectent ce sujet au parcours spécifique de l'apprenant (mentionne son rôle actuel et son objectif).

**L'essentiel à retenir**
Les concepts clés expliqués simplement, avec des exemples concrets du secteur ${profile.currentSector}. Utilise des analogies avec son métier de ${profile.currentRole} pour rendre ça intuitif.

**En pratique**
2-3 actions concrètes que l'apprenant peut faire maintenant. Sois très spécifique (noms d'outils, de sites, durées estimées).

**Le conseil d'expert**
Un insight surprenant ou une astuce que seul un expert connaît.

Règles :
- Maximum 500 mots
- Tutoiement
- Ton encourageant mais pas condescendant
- TOUJOURS en français
- Adapte TOUT au niveau technique déclaré
- N'utilise AUCUN caractère chinois`;
}

export function buildQuizPrompt(
  taskTitle: string,
  lessonContent: string,
  profile: SessionProfile
): string {
  return `Tu viens de donner cette leçon sur "${taskTitle}" :

${lessonContent}

PROFIL : ${profile.currentRole} → ${profile.targetRole} | Technique : ${profile.technicalAppetite}

Génère EXACTEMENT 4 questions à choix multiples pour valider la compréhension.

Règles :
- Questions en français
- Adaptées au niveau technique (${profile.technicalAppetite})
- Mix : 2 questions de compréhension, 1 question pratique (mise en situation métier), 1 question "piège" subtile
- Chaque question a 4 options
- Les options doivent être plausibles (pas de réponses évidemment fausses)

Retourne UNIQUEMENT du JSON valide, sans markdown, sans \`\`\`, sans texte autour :
[
  {
    "question": "La question ici",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Explication courte de pourquoi c'est la bonne réponse"
  }
]`;
}

export function buildFeedbackPrompt(
  taskTitle: string,
  score: number,
  totalQuestions: number,
  wrongAnswers: { question: string; userAnswer: string; correctAnswer: string; explanation: string }[],
  profile: SessionProfile
): string {
  const wrongDetails = wrongAnswers.length > 0
    ? wrongAnswers.map((w, i) => `${i + 1}. Question : "${w.question}" — Tu as répondu "${w.userAnswer}" au lieu de "${w.correctAnswer}". ${w.explanation}`).join("\n")
    : "Aucune erreur !";

  return `L'apprenant vient de terminer le quiz sur "${taskTitle}".

Score : ${score}% (${totalQuestions - wrongAnswers.length}/${totalQuestions} bonnes réponses)
${wrongAnswers.length > 0 ? `\nErreurs :\n${wrongDetails}` : ""}

Profil : ${profile.currentRole} → ${profile.targetRole} | Confiance : ${profile.confidenceLevel}/10

${score >= 60 ? `Le score est suffisant pour valider. Félicite chaleureusement et encourage à continuer.` : `Le score est insuffisant (< 60%). Encourage sans juger, explique brièvement les erreurs, et suggère de relire la leçon.`}

Génère un feedback personnalisé :
1. ${score >= 60 ? "Célèbre la réussite" : "Rassure et encourage"} (1-2 phrases)
2. ${wrongAnswers.length > 0 ? "Pour chaque erreur, une explication simple en 1 phrase" : "Souligne la maîtrise parfaite"}
3. ${score >= 60 ? "Donne un aperçu motivant de la prochaine étape" : "Suggère de revoir la leçon et réessayer"}

${profile.confidenceLevel <= 4 ? "IMPORTANT : La confiance est basse — sois particulièrement bienveillant et encourageant." : ""}

Maximum 150 mots. Tutoiement. Français uniquement. Aucun caractère chinois.`;
}
