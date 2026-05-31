export interface SkillWithLevel {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface OnboardingFormData {
  // Step 1: Situation
  situation: string;

  // Step 2: Role & Sector
  currentRole: string;
  currentSector: string;
  experienceYears: number | null;

  // Step 3: Education & Certifications
  educationLevel: string;
  certifications: string[];
  hasDataTraining: boolean;

  // Step 4: Technical appetite
  technicalAppetite: "no-code" | "low-code" | "code" | "flexible";

  /**
   * Step 4b (Sprint 3.1) — Usage actuel de l'IA dans le poste.
   * Crucial pour calibrer la transition : quelqu'un qui "code déjà avec
   * l'IA" n'a pas le même point de départ que quelqu'un qui n'a jamais
   * ouvert ChatGPT. Alimente le diagnostic et les recommandations.
   */
  aiUsage: {
    /** Niveau d'usage déclaré. */
    level: "none" | "occasional" | "regular" | "builder" | "";
    /** Outils IA déjà utilisés (ChatGPT, Copilot, Claude, Midjourney…). */
    tools: string[];
    /** Contexte libre : comment / pour quoi elle utilise l'IA aujourd'hui. */
    context: string;
  };

  // Step 5: Ambitions (AI-powered)
  targetRole: string;
  targetSector: string;

  // Career goal — 3 imposed dimensions (Sprint 1, V1)
  vertical: "FINANCE" | "TECH" | "OTHER" | "";
  transitionType: "PIVOT" | "UPSKILL" | "INTERNAL_EVOLUTION" | "";
  horizon: "THREE_MONTHS" | "SIX_MONTHS" | "TWELVE_MONTHS" | "";
  successIndicator: "NEW_JOB" | "DATA_PROJECTS" | "SALARY_INCREASE" | "";

  // Step 5: Skills with proficiency
  topSkills: string[]; // kept for backward compat
  skillLevels: SkillWithLevel[];

  // Step 6: Motivation & Achievements
  motivation: string; // "attracted" | "fleeing" | "both"
  keyAchievements: string; // free text — 2-3 key projects
  dreamScenario: string; // "Dans 2 ans, idéalement je..."

  // Step 7: Blockers
  blockers: string[];

  // Step 8: Confidence
  confidenceLevel: number;

  // Step 9: Goals, Availability & Preferences
  shortTermGoal: string;
  longTermGoal: string;
  preferredPace: "relaxed" | "moderate" | "intensive";
  availableHoursPerWeek: number;
  trainingBudget: string; // "none" | "low" | "medium" | "high"
  location: string;
  remotePreference: "remote" | "hybrid" | "onsite" | "flexible";
  learningStyle: string[]; // ["autodidact", "courses", "bootcamp", "mentoring", "projects"]
  priorities: string[]; // ordered: ["growth", "security", "salary", "impact", "freedom"]

  /**
   * Diagnostic narratif issu de l'analyse LinkedIn approfondie.
   * Quand renseigné (PDF analysé avec succès), il est injecté dans les
   * prompts suivants (Ambitions, Skills, Summary) pour donner à l'IA
   * une "lecture senior" du parcours plutôt que les seuls champs déclaratifs.
   * null si l'user a sauté LinkedIn ou utilisé la saisie rapide.
   */
  linkedinAnalysis: {
    synthesis: string;
    deduced_specialty: string;
    real_skills_deduced: string[];
    hidden_patterns: string[];
    transition_angle: string;
    questions_to_clarify: string[];
    /**
     * Réponses de l'utilisateur·rice aux questions de clarification.
     * Clé = la question, valeur = la réponse libre (ou "" si pas répondu,
     * "__skip__" si marqué pas pertinent). Ces réponses enrichissent les
     * prompts suivants pour que l'IA ait un contexte plus précis.
     */
    clarification_answers?: Record<string, string>;
  } | null;

  /**
   * Sprint 3 — IKIGAI : les 4 dimensions qui font le sweet spot d'une
   * transition de carrière selon le concept japonais :
   *   - passion : ce que la personne AIME (énergie intrinsèque)
   *   - forces : ce dans quoi elle est DOUÉE (par regard externe + auto)
   *   - market : ce dont le MARCHÉ a besoin (data France Travail)
   *   - alignment : ce pour quoi elle veut être PAYÉE (rémunération + non-négociables)
   *
   * Chaque module stocke :
   *   - la/les réponse(s) libre(s) de l'utilisateur·rice
   *   - l'éventuel insight IA généré sur cette dimension
   *   - les "signals" extraits pour le diagnostic croisé final
   */
  ikigai: {
    passion: {
      userText: string;
      aiInsight: string | null;
      signals: string[]; // ex: ["énergisée par la transmission", "fière des projets d'équipe"]
    };
    forces: {
      userText: string;
      aiInsight: string | null;
      signals: string[]; // ex: ["pilotage transverse", "création de supports pédagogiques"]
    };
    market: {
      targetRole: string; // pré-rempli depuis Ambitions
      snapshot: {
        totalOffers: number;
        recentOffers: number;
        medianSalary: { min: number; max: number } | null;
        topSkills: string[];
        topRegions: string[];
        source: string;
      } | null;
      aiInsight: string | null;
    };
    alignment: {
      salaryExpectation: string; // ex: "45-55k brut/an"
      nonNegotiables: string[]; // ex: ["télétravail 3j/sem", "impact concret"]
      aiInsight: string | null;
    };
  };

  // Step 10: Summary (AI-powered, read-only)
}

export interface AiInsights {
  ambitions: string | null;
  skills: string | null;
  motivation: string | null;
  confidence: string | null;
  summary: {
    profile: string;
    strengths: string;
    gaps: string;
    recommendation: string;
  } | null;
}

export const initialFormData: OnboardingFormData = {
  situation: "",
  currentRole: "",
  currentSector: "",
  experienceYears: null,
  educationLevel: "",
  certifications: [],
  hasDataTraining: false,
  technicalAppetite: "flexible",
  aiUsage: { level: "", tools: [], context: "" },
  targetRole: "",
  targetSector: "",
  vertical: "",
  transitionType: "",
  horizon: "",
  successIndicator: "",
  topSkills: [],
  skillLevels: [],
  blockers: [],
  motivation: "",
  keyAchievements: "",
  dreamScenario: "",
  confidenceLevel: 5,
  shortTermGoal: "",
  longTermGoal: "",
  preferredPace: "moderate",
  availableHoursPerWeek: 5,
  trainingBudget: "low",
  location: "",
  remotePreference: "flexible",
  learningStyle: [],
  priorities: [],
  linkedinAnalysis: null,
  ikigai: {
    passion: { userText: "", aiInsight: null, signals: [] },
    forces: { userText: "", aiInsight: null, signals: [] },
    market: { targetRole: "", snapshot: null, aiInsight: null },
    alignment: { salaryExpectation: "", nonNegotiables: [], aiInsight: null },
  },
};

export const initialAiInsights: AiInsights = {
  ambitions: null,
  skills: null,
  motivation: null,
  confidence: null,
  summary: null,
};

// Actions for useReducer
export type FormAction =
  | { type: "SET_FIELD"; field: keyof OnboardingFormData; value: OnboardingFormData[keyof OnboardingFormData] }
  | { type: "TOGGLE_SKILL"; skill: string }
  | { type: "SET_SKILL_LEVEL"; skill: string; level: SkillWithLevel["level"] }
  | { type: "TOGGLE_BLOCKER"; blocker: string }
  | { type: "TOGGLE_LEARNING_STYLE"; style: string }
  | { type: "TOGGLE_CERTIFICATION"; cert: string }
  | { type: "REORDER_PRIORITIES"; priorities: string[] }
  | { type: "HYDRATE"; data: Partial<OnboardingFormData> }
  // Sprint 3 — Ikigai actions (évitent les setters massifs côté composants)
  | { type: "SET_IKIGAI_PASSION_TEXT"; value: string }
  | { type: "SET_IKIGAI_PASSION_INSIGHT"; value: string }
  | { type: "SET_IKIGAI_FORCES_TEXT"; value: string }
  | { type: "SET_IKIGAI_FORCES_INSIGHT"; value: string }
  | { type: "SET_IKIGAI_MARKET_ROLE"; value: string }
  | {
      type: "SET_IKIGAI_MARKET_SNAPSHOT";
      value: OnboardingFormData["ikigai"]["market"]["snapshot"];
    }
  | { type: "SET_IKIGAI_MARKET_INSIGHT"; value: string }
  | { type: "SET_IKIGAI_ALIGNMENT_SALARY"; value: string }
  | { type: "ADD_IKIGAI_ALIGNMENT_NON_NEG"; value: string }
  | { type: "REMOVE_IKIGAI_ALIGNMENT_NON_NEG"; value: string }
  | { type: "SET_IKIGAI_ALIGNMENT_INSIGHT"; value: string }
  // Usage IA
  | { type: "SET_AI_USAGE_LEVEL"; value: OnboardingFormData["aiUsage"]["level"] }
  | { type: "TOGGLE_AI_USAGE_TOOL"; value: string }
  | { type: "SET_AI_USAGE_CONTEXT"; value: string };

export function formReducer(state: OnboardingFormData, action: FormAction): OnboardingFormData {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_SKILL": {
      const hasSkill = state.topSkills.includes(action.skill);
      return {
        ...state,
        topSkills: hasSkill
          ? state.topSkills.filter((s) => s !== action.skill)
          : [...state.topSkills, action.skill],
        skillLevels: hasSkill
          ? state.skillLevels.filter((s) => s.name !== action.skill)
          : [...state.skillLevels, { name: action.skill, level: "intermediate" }],
      };
    }
    case "SET_SKILL_LEVEL":
      return {
        ...state,
        skillLevels: state.skillLevels.map((s) =>
          s.name === action.skill ? { ...s, level: action.level } : s
        ),
      };
    case "TOGGLE_BLOCKER":
      return {
        ...state,
        blockers: state.blockers.includes(action.blocker)
          ? state.blockers.filter((b) => b !== action.blocker)
          : [...state.blockers, action.blocker],
      };
    case "TOGGLE_LEARNING_STYLE":
      return {
        ...state,
        learningStyle: state.learningStyle.includes(action.style)
          ? state.learningStyle.filter((s) => s !== action.style)
          : [...state.learningStyle, action.style],
      };
    case "TOGGLE_CERTIFICATION":
      return {
        ...state,
        certifications: state.certifications.includes(action.cert)
          ? state.certifications.filter((c) => c !== action.cert)
          : [...state.certifications, action.cert],
      };
    case "REORDER_PRIORITIES":
      return { ...state, priorities: action.priorities };
    case "HYDRATE":
      return { ...state, ...action.data };
    // Sprint 3 — Ikigai
    case "SET_IKIGAI_PASSION_TEXT":
      return { ...state, ikigai: { ...state.ikigai, passion: { ...state.ikigai.passion, userText: action.value } } };
    case "SET_IKIGAI_PASSION_INSIGHT":
      return { ...state, ikigai: { ...state.ikigai, passion: { ...state.ikigai.passion, aiInsight: action.value } } };
    case "SET_IKIGAI_FORCES_TEXT":
      return { ...state, ikigai: { ...state.ikigai, forces: { ...state.ikigai.forces, userText: action.value } } };
    case "SET_IKIGAI_FORCES_INSIGHT":
      return { ...state, ikigai: { ...state.ikigai, forces: { ...state.ikigai.forces, aiInsight: action.value } } };
    case "SET_IKIGAI_MARKET_ROLE":
      return { ...state, ikigai: { ...state.ikigai, market: { ...state.ikigai.market, targetRole: action.value } } };
    case "SET_IKIGAI_MARKET_SNAPSHOT":
      return { ...state, ikigai: { ...state.ikigai, market: { ...state.ikigai.market, snapshot: action.value } } };
    case "SET_IKIGAI_MARKET_INSIGHT":
      return { ...state, ikigai: { ...state.ikigai, market: { ...state.ikigai.market, aiInsight: action.value } } };
    case "SET_IKIGAI_ALIGNMENT_SALARY":
      return { ...state, ikigai: { ...state.ikigai, alignment: { ...state.ikigai.alignment, salaryExpectation: action.value } } };
    case "ADD_IKIGAI_ALIGNMENT_NON_NEG":
      return state.ikigai.alignment.nonNegotiables.includes(action.value)
        ? state
        : { ...state, ikigai: { ...state.ikigai, alignment: { ...state.ikigai.alignment, nonNegotiables: [...state.ikigai.alignment.nonNegotiables, action.value] } } };
    case "REMOVE_IKIGAI_ALIGNMENT_NON_NEG":
      return { ...state, ikigai: { ...state.ikigai, alignment: { ...state.ikigai.alignment, nonNegotiables: state.ikigai.alignment.nonNegotiables.filter((n) => n !== action.value) } } };
    case "SET_IKIGAI_ALIGNMENT_INSIGHT":
      return { ...state, ikigai: { ...state.ikigai, alignment: { ...state.ikigai.alignment, aiInsight: action.value } } };
    // Usage IA
    case "SET_AI_USAGE_LEVEL":
      return { ...state, aiUsage: { ...state.aiUsage, level: action.value } };
    case "TOGGLE_AI_USAGE_TOOL":
      return {
        ...state,
        aiUsage: {
          ...state.aiUsage,
          tools: state.aiUsage.tools.includes(action.value)
            ? state.aiUsage.tools.filter((t) => t !== action.value)
            : [...state.aiUsage.tools, action.value],
        },
      };
    case "SET_AI_USAGE_CONTEXT":
      return { ...state, aiUsage: { ...state.aiUsage, context: action.value } };
    default:
      return state;
  }
}
