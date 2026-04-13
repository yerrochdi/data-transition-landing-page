"use client";

import { useState } from "react";
import { GraduationCap, Award, BookOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DATA_EXPERIENCE_LEVELS = [
  {
    value: "discovery",
    label: "Découverte",
    description:
      "Je n'ai pas encore travaillé avec des données. Tout est nouveau pour moi.",
    hasDataTraining: false,
  },
  {
    value: "beginner",
    label: "Initié",
    description:
      "J'utilise Excel/Sheets régulièrement, j'ai fait quelques analyses ou dashboards.",
    hasDataTraining: true,
  },
  {
    value: "intermediate",
    label: "Confirmé",
    description:
      "Je travaille avec des outils data (SQL, Power BI, Python…) dans mon poste actuel.",
    hasDataTraining: true,
  },
  {
    value: "expert",
    label: "Expert",
    description:
      "La data/IA est mon métier. Je cherche à évoluer vers un rôle plus senior ou stratégique.",
    hasDataTraining: true,
  },
] as const;

interface StepEducationProps {
  educationLevel: string;
  certifications: string[];
  hasDataTraining: boolean;
  onFieldChange: (field: string, value: string | boolean) => void;
  onToggleCertification: (cert: string) => void;
}

const EDUCATION_LEVELS = [
  { value: "bac", label: "Bac", description: "Baccalauréat ou équivalent" },
  { value: "bac+2", label: "Bac+2", description: "BTS, DUT, DEUG" },
  { value: "bac+3", label: "Bac+3", description: "Licence, BUT" },
  { value: "bac+5", label: "Bac+5", description: "Master, Ingénieur, MBA" },
  { value: "bac+8", label: "Bac+8", description: "Doctorat, PhD" },
  { value: "autodidacte", label: "Autodidacte", description: "Formation continue, certifications" },
];

const COMMON_CERTIFICATIONS = [
  "Google Data Analytics",
  "Google Project Management",
  "IBM Data Science",
  "AWS Cloud Practitioner",
  "Azure Fundamentals",
  "Scrum Master / PSM",
  "PMP / PRINCE2",
  "Power BI / Tableau",
  "Python / SQL (Coursera, DataCamp...)",
  "ITIL",
  "Lean Six Sigma",
  "Autre certification data/IA",
];

export function StepEducation({
  educationLevel,
  certifications,
  hasDataTraining,
  onFieldChange,
  onToggleCertification,
}: StepEducationProps) {
  const [selectedDataLevel, setSelectedDataLevel] = useState<string | null>(
    () => {
      // No way to recover the exact level from a boolean, so leave unselected
      // until the user picks one in this session.
      return null;
    }
  );

  function handleDataLevelSelect(
    level: (typeof DATA_EXPERIENCE_LEVELS)[number]
  ) {
    setSelectedDataLevel(level.value);
    onFieldChange("hasDataTraining", level.hasDataTraining);
  }

  return (
    <div className="space-y-8">
      {/* Education Level */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
          <GraduationCap className="w-4 h-4 text-primary" />
          Niveau d&apos;études
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EDUCATION_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => onFieldChange("educationLevel", level.value)}
              className={cn(
                "p-3 rounded-xl text-left transition-all",
                educationLevel === level.value
                  ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                  : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
              )}
            >
              <p className={cn(
                "text-sm font-bold",
                educationLevel === level.value ? "text-primary" : "text-foreground"
              )}>
                {level.label}
              </p>
              <p className="text-[10px] text-muted-foreground">{level.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
          <Award className="w-4 h-4 text-primary" />
          Certifications obtenues
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Sélectionnez celles que vous avez déjà (optionnel)
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_CERTIFICATIONS.map((cert) => {
            const selected = certifications.includes(cert);
            return (
              <button
                key={cert}
                onClick={() => onToggleCertification(cert)}
                className={cn(
                  "px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                  selected
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-surface-container-lowest text-muted-foreground ghost-border hover:text-foreground"
                )}
              >
                {selected && <Check className="w-3 h-3" />}
                {cert}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Experience Level */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          Niveau d&apos;expérience data/IA
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DATA_EXPERIENCE_LEVELS.map((level) => {
            const isSelected = selectedDataLevel === level.value;
            return (
              <button
                key={level.value}
                onClick={() => handleDataLevelSelect(level)}
                className={cn(
                  "p-4 rounded-xl text-left transition-all",
                  isSelected
                    ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                    : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-bold",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {level.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {level.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
