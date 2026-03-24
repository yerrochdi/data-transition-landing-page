"use client";

import { cn } from "@/lib/utils";
import type { OnboardingFormData, SkillWithLevel } from "@/lib/onboarding/types";
import { AiInsightPanel } from "./ai-insight-panel";

const SKILL_LIST = [
  // Business & Management
  "Gestion de projet",
  "AMOA / MOA",
  "Leadership",
  "Communication",
  "Agile / Scrum",
  "Relation client",
  "Négociation",
  // Analytical
  "Excel / Tableaux de bord",
  "Analyse financière",
  "Analyse de données",
  "Reporting / KPIs",
  "Gestion des risques",
  // Technical
  "SQL / Base de données",
  "Python",
  "Power BI / Tableau",
  "Cloud AWS/GCP/Azure",
  "Architecture technique",
  "API / Intégrations",
  // Domain
  "Marketing digital",
  "CRM / Salesforce",
  "RH / People Analytics",
  "Finance / Comptabilité",
  "Droit / Conformité",
  "Supply Chain / Logistique",
];

const LEVELS: { value: SkillWithLevel["level"]; label: string; color: string }[] = [
  { value: "beginner", label: "Débutant", color: "text-muted-foreground bg-surface-container" },
  { value: "intermediate", label: "Intermédiaire", color: "text-amber-500 bg-amber-500/10" },
  { value: "advanced", label: "Avancé", color: "text-blue-400 bg-blue-400/10" },
  { value: "expert", label: "Expert", color: "text-primary bg-primary/10" },
];

interface StepSkillsProps {
  selected: string[];
  skillLevels: SkillWithLevel[];
  formData: Partial<OnboardingFormData>;
  aiContent: string | null;
  onToggle: (skill: string) => void;
  onSetLevel: (skill: string, level: SkillWithLevel["level"]) => void;
  onAiUpdate: (content: string) => void;
}

export function StepSkills({
  selected,
  skillLevels,
  formData,
  aiContent,
  onToggle,
  onSetLevel,
  onAiUpdate,
}: StepSkillsProps) {
  const getLevel = (skill: string): SkillWithLevel["level"] | null => {
    return skillLevels.find((s) => s.name === skill)?.level ?? null;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-foreground mb-1">
          Sélectionnez vos compétences (au moins 3)
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Puis indiquez votre niveau pour chacune — ça change tout pour les recommandations
        </p>

        <div className="space-y-2">
          {SKILL_LIST.map((skill) => {
            const isSelected = selected.includes(skill);
            const level = getLevel(skill);
            return (
              <div key={skill}>
                <button
                  onClick={() => onToggle(skill)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl text-left transition-all",
                    isSelected
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "border border-muted-foreground/30"
                    )}>
                      {isSelected && "✓"}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary font-bold" : "text-foreground"
                    )}>
                      {skill}
                    </span>
                  </div>
                  {isSelected && level && (
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      LEVELS.find((l) => l.value === level)?.color
                    )}>
                      {LEVELS.find((l) => l.value === level)?.label}
                    </span>
                  )}
                </button>

                {/* Level selector — shown when skill is selected */}
                {isSelected && (
                  <div className="flex gap-1.5 ml-8 mt-1.5 mb-1">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => onSetLevel(skill, l.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all",
                          level === l.value
                            ? l.color + " border border-current/20"
                            : "text-muted-foreground/50 hover:text-muted-foreground bg-surface-container-lowest"
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selection count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {selected.length} compétence{selected.length > 1 ? "s" : ""} sélectionnée{selected.length > 1 ? "s" : ""}
          {selected.length < 3 && ` — encore ${3 - selected.length} minimum`}
        </span>
      </div>

      {/* AI analysis — show when 3+ skills selected */}
      {selected.length >= 3 && (
        <AiInsightPanel
          label="Analyse de vos compétences"
          step="skills"
          data={{ ...formData, topSkills: selected, skillLevels }}
          content={aiContent}
          onContentUpdate={onAiUpdate}
        />
      )}
    </div>
  );
}
