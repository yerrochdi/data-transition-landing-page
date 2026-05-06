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
  | { type: "HYDRATE"; data: Partial<OnboardingFormData> };

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
    default:
      return state;
  }
}
