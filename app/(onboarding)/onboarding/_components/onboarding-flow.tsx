"use client";

import { useReducer, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  GraduationCap,
  Target,
  Zap,
  Heart,
  Shield,
  Flame,
  Settings,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Cpu,
} from "lucide-react";
import { Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formReducer,
  initialFormData,
  initialAiInsights,
  type OnboardingFormData,
  type AiInsights,
  type SkillWithLevel,
} from "@/lib/onboarding/types";
import {
  saveOnboardingStep,
  completeOnboarding,
} from "@/lib/onboarding/actions";
import { createCheckoutSession } from "@/lib/billing/actions";

import { StepSituation } from "./step-situation";
import { StepLinkedIn } from "./step-linkedin";
import { StepRole } from "./step-role";
import { StepEducation } from "./step-education";
import { StepAmbitions } from "./step-ambitions";
import { StepSkills } from "./step-skills";
import { StepMotivation } from "./step-motivation";
import { StepBlockers } from "./step-blockers";
import { StepConfidence } from "./step-confidence";
import { StepAvailability } from "./step-availability";
import { StepTechnical } from "./step-technical";
import { StepSummary } from "./step-summary";

// ───────────────────────────────────────────────────
// Step definitions (10 steps)
// ───────────────────────────────────────────────────
const STEPS = [
  { id: "situation", title: "Situation", description: "Votre contexte professionnel", icon: "User" },
  { id: "linkedin", title: "LinkedIn", description: "Importez votre profil (optionnel)", icon: "Linkedin" },
  { id: "role", title: "Métier & Secteur", description: "Votre rôle et expérience", icon: "Briefcase" },
  { id: "education", title: "Formation", description: "Diplômes et certifications", icon: "GraduationCap" },
  { id: "technical", title: "Profil technique", description: "Votre appétence pour le code", icon: "Cpu" },
  { id: "ambitions", title: "Ambitions", description: "Votre rôle cible data/IA", icon: "Target" },
  { id: "skills", title: "Compétences", description: "Vos forces et niveaux", icon: "Zap" },
  { id: "motivation", title: "Motivation", description: "Ce qui vous pousse", icon: "Heart" },
  { id: "blockers", title: "Freins", description: "Ce qui vous retient", icon: "Shield" },
  { id: "confidence", title: "Confiance", description: "Votre mindset actuel", icon: "Flame" },
  { id: "availability", title: "Préférences", description: "Disponibilité et priorités", icon: "Settings" },
  { id: "summary", title: "Synthèse IA", description: "Votre profil analysé", icon: "Sparkles" },
];

const iconMap: Record<string, React.ElementType> = {
  User, Briefcase, GraduationCap, Target, Zap, Heart, Shield, Flame, Settings, Sparkles, Linkedin, Cpu,
};

interface OnboardingFlowProps {
  initialData?: Partial<OnboardingFormData> | null;
}

export function OnboardingFlow({ initialData }: OnboardingFlowProps) {
  const router = useRouter();
  const [formData, dispatch] = useReducer(
    formReducer,
    initialData ? { ...initialFormData, ...initialData } : initialFormData
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [aiInsights, setAiInsights] = useState<AiInsights>(initialAiInsights);
  const [isPending, startTransition] = useTransition();
  const [completing, setCompleting] = useState(false);

  const step = STEPS[currentStep];
  const Icon = iconMap[step.icon] || User;
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  // ───────────────────────────────────────────────────
  // Save helpers
  // ───────────────────────────────────────────────────
  // Map visual step index to save step index (LinkedIn step doesn't save separately)
  const getSaveStepIndex = (visualStep: number): number | null => {
    if (visualStep === 1) return null; // LinkedIn step — no dedicated save
    if (visualStep === 0) return 0;
    return visualStep - 1; // shift by 1 after LinkedIn
  };

  const getStepData = useCallback(
    (stepIndex: number): Partial<OnboardingFormData> => {
      const saveIndex = getSaveStepIndex(stepIndex);
      if (saveIndex === null) return {};
      switch (saveIndex) {
        case 0: return { situation: formData.situation };
        case 1: return { currentRole: formData.currentRole, currentSector: formData.currentSector, experienceYears: formData.experienceYears };
        case 2: return { educationLevel: formData.educationLevel, certifications: formData.certifications, hasDataTraining: formData.hasDataTraining };
        case 3: return { technicalAppetite: formData.technicalAppetite };
        case 4: return { targetRole: formData.targetRole, targetSector: formData.targetSector };
        case 5: return { topSkills: formData.topSkills, skillLevels: formData.skillLevels };
        case 6: return { motivation: formData.motivation, keyAchievements: formData.keyAchievements, dreamScenario: formData.dreamScenario };
        case 7: return { blockers: formData.blockers };
        case 8: return { confidenceLevel: formData.confidenceLevel };
        case 9: return {
          shortTermGoal: formData.shortTermGoal, longTermGoal: formData.longTermGoal,
          preferredPace: formData.preferredPace, availableHoursPerWeek: formData.availableHoursPerWeek,
          trainingBudget: formData.trainingBudget, location: formData.location,
          remotePreference: formData.remotePreference, learningStyle: formData.learningStyle,
          priorities: formData.priorities,
        };
        default: return {};
      }
    },
    [formData]
  );

  // ───────────────────────────────────────────────────
  // Navigation
  // ───────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (isLast) {
      setCompleting(true);
      completeOnboarding(
        formData,
        typeof aiInsights.summary === "string" ? aiInsights.summary : aiInsights.ambitions,
        aiInsights.skills
      ).then(async (result) => {
        if (result.success) {
          // Check if user chose Pro plan during signup
          const chosenPlan = localStorage.getItem("nextmove_chosen_plan");
          if (chosenPlan === "pro") {
            localStorage.removeItem("nextmove_chosen_plan");
            const checkout = await createCheckoutSession();
            if (checkout.url) {
              window.location.href = checkout.url;
              return;
            }
          }
          router.push("/dashboard");
        } else {
          setCompleting(false);
          console.error("Complete error:", result.error);
        }
      });
      return;
    }

    // Save current step (non-blocking) — skip LinkedIn step
    const saveIndex = getSaveStepIndex(currentStep);
    if (saveIndex !== null) {
      const stepData = getStepData(currentStep);
      startTransition(() => {
        saveOnboardingStep(saveIndex, stepData);
      });
    }

    setCurrentStep((prev) => prev + 1);
  }, [currentStep, isLast, formData, aiInsights, getStepData, router]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  // ───────────────────────────────────────────────────
  // Field change handlers
  // ───────────────────────────────────────────────────
  const handleFieldChange = useCallback(
    (field: string, value: string | number | boolean | string[] | null) => {
      dispatch({
        type: "SET_FIELD",
        field: field as keyof OnboardingFormData,
        value: value as OnboardingFormData[keyof OnboardingFormData],
      });
    },
    []
  );

  const updateAiInsight = useCallback(
    (key: keyof AiInsights, content: string) => {
      setAiInsights((prev) => ({ ...prev, [key]: content }));
    },
    []
  );

  // ───────────────────────────────────────────────────
  // Render current step
  // ───────────────────────────────────────────────────
  // ───────────────────────────────────────────────────
  // LinkedIn profile parsed → pre-fill form fields
  // ───────────────────────────────────────────────────
  const handleLinkedInParsed = useCallback(
    (profile: {
      currentRole: string | null;
      currentCompany: string | null;
      currentSector: string | null;
      experienceYears: number | null;
      educationLevel: string | null;
      certifications: string[];
      topSkills: string[];
      experiences: { role: string; company: string; duration: string; highlights: string }[];
      education: { degree: string; school: string; year: string }[];
      summary: string | null;
      hasDataExperience: boolean;
    }) => {
      if (profile.currentRole) dispatch({ type: "SET_FIELD", field: "currentRole", value: profile.currentRole });
      if (profile.currentSector) dispatch({ type: "SET_FIELD", field: "currentSector", value: profile.currentSector });
      if (profile.experienceYears) dispatch({ type: "SET_FIELD", field: "experienceYears", value: profile.experienceYears });
      if (profile.educationLevel) dispatch({ type: "SET_FIELD", field: "educationLevel", value: profile.educationLevel });
      if (profile.certifications?.length) dispatch({ type: "SET_FIELD", field: "certifications", value: profile.certifications });
      if (profile.topSkills?.length) {
        dispatch({ type: "SET_FIELD", field: "topSkills", value: profile.topSkills });
        dispatch({
          type: "SET_FIELD",
          field: "skillLevels",
          value: profile.topSkills.map((name) => ({ name, level: "intermediate" as const })),
        });
      }
      dispatch({ type: "SET_FIELD", field: "hasDataTraining", value: profile.hasDataExperience });
    },
    []
  );

  const handleLinkedInSkip = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepSituation value={formData.situation} onChange={(v) => handleFieldChange("situation", v)} />;
      case 1:
        return <StepLinkedIn onProfileParsed={handleLinkedInParsed} onSkip={handleLinkedInSkip} />;
      case 2:
        return <StepRole currentRole={formData.currentRole} currentSector={formData.currentSector} experienceYears={formData.experienceYears} onFieldChange={handleFieldChange} />;
      case 3:
        return (
          <StepEducation
            educationLevel={formData.educationLevel}
            certifications={formData.certifications}
            hasDataTraining={formData.hasDataTraining}
            onFieldChange={handleFieldChange}
            onToggleCertification={(cert) => dispatch({ type: "TOGGLE_CERTIFICATION", cert })}
          />
        );
      case 4:
        return <StepTechnical value={formData.technicalAppetite} onChange={(v) => handleFieldChange("technicalAppetite", v)} />;
      case 5:
        return <StepAmbitions targetRole={formData.targetRole} targetSector={formData.targetSector} formData={formData} aiContent={aiInsights.ambitions} onFieldChange={handleFieldChange} onAiUpdate={(c) => updateAiInsight("ambitions", c)} />;
      case 6:
        return (
          <StepSkills
            selected={formData.topSkills}
            skillLevels={formData.skillLevels}
            formData={formData}
            aiContent={aiInsights.skills}
            onToggle={(skill) => dispatch({ type: "TOGGLE_SKILL", skill })}
            onSetLevel={(skill, level) => dispatch({ type: "SET_SKILL_LEVEL", skill, level })}
            onAiUpdate={(c) => updateAiInsight("skills", c)}
          />
        );
      case 7:
        return (
          <StepMotivation
            motivation={formData.motivation}
            keyAchievements={formData.keyAchievements}
            dreamScenario={formData.dreamScenario}
            formData={formData}
            aiContent={aiInsights.motivation}
            onFieldChange={handleFieldChange}
            onAiUpdate={(c) => updateAiInsight("motivation", c)}
          />
        );
      case 8:
        return <StepBlockers selected={formData.blockers} onToggle={(blocker) => dispatch({ type: "TOGGLE_BLOCKER", blocker })} />;
      case 9:
        return <StepConfidence level={formData.confidenceLevel} formData={formData} aiContent={aiInsights.confidence} onChange={(level) => handleFieldChange("confidenceLevel", level)} onAiUpdate={(c) => updateAiInsight("confidence", c)} />;
      case 10:
        return (
          <StepAvailability
            availableHoursPerWeek={formData.availableHoursPerWeek}
            trainingBudget={formData.trainingBudget}
            location={formData.location}
            remotePreference={formData.remotePreference}
            learningStyle={formData.learningStyle}
            priorities={formData.priorities}
            shortTermGoal={formData.shortTermGoal}
            longTermGoal={formData.longTermGoal}
            preferredPace={formData.preferredPace}
            onFieldChange={handleFieldChange}
            onToggleLearningStyle={(style) => dispatch({ type: "TOGGLE_LEARNING_STYLE", style })}
            onReorderPriorities={(priorities) => dispatch({ type: "REORDER_PRIORITIES", priorities })}
          />
        );
      case 11:
        return <StepSummary formData={formData} aiContent={typeof aiInsights.summary === "string" ? aiInsights.summary : null} onAiUpdate={(c) => updateAiInsight("summary", c)} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ────── Sidebar stepper ────── */}
      <aside className="hidden lg:block lg:col-span-4">
        <div className="sticky top-24 space-y-1.5">
          <h2 className="font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">
            Votre diagnostic
          </h2>
          {STEPS.map((s, i) => {
            const StepIcon = iconMap[s.icon] || User;
            const isCompleted = i < currentStep;
            const isActive = i === currentStep;
            const isLocked = i > currentStep;
            return (
              <button
                key={s.id}
                onClick={() => { if (i <= currentStep) setCurrentStep(i); }}
                disabled={isLocked}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all",
                  isActive && "bg-primary/10 border border-primary/30",
                  isCompleted && "opacity-80 hover:opacity-100 cursor-pointer",
                  isLocked && "opacity-40 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                  isCompleted && "bg-primary/20 text-primary",
                  isLocked && "bg-surface-container-lowest text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "text-xs font-bold truncate",
                    isActive && "text-primary",
                    isCompleted && "text-foreground",
                    isLocked && "text-muted-foreground"
                  )}>
                    {s.title}
                  </p>
                  <p className="text-[9px] text-muted-foreground truncate">{s.description}</p>
                </div>
              </button>
            );
          })}

          {/* Progress */}
          <div className="mt-4 p-3 bg-surface-container-lowest rounded-xl ghost-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Progression
              </span>
              <span className="text-xs font-bold text-primary">
                {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
              </span>
            </div>
            <div className="relative h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-green-500 shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-500"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ────── Main content ────── */}
      <div className="lg:col-span-8">
        {/* Mobile progress */}
        <div className="lg:hidden sticky top-16 z-40 bg-background/80 backdrop-blur-xl pb-4 pt-2 -mx-6 px-6 mb-8">
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  "flex-1 h-1 rounded-full transition-all",
                  i <= currentStep
                    ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
                    : "bg-surface-container-lowest"
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Étape {currentStep + 1}/{STEPS.length}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Step Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold text-foreground">{step.title}</h1>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 animate-fade-up" key={currentStep}>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="sticky bottom-0 z-40 bg-background/80 backdrop-blur-xl py-4 -mx-6 px-6 flex items-center justify-between border-t border-border/10">
          <button
            onClick={handleBack}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              isFirst
                ? "opacity-0 pointer-events-none"
                : "bg-surface-container-lowest ghost-border text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <button
            onClick={handleNext}
            disabled={completing}
            className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
          >
            {completing ? (
              "Finalisation..."
            ) : isLast ? (
              <>
                Lancer mon parcours
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
