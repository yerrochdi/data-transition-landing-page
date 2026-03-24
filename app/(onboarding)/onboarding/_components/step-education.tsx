"use client";

import { GraduationCap, Award, BookOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

      {/* Data Training */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          Expérience avec la data/IA
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => onFieldChange("hasDataTraining", true)}
            className={cn(
              "p-4 rounded-xl text-left transition-all",
              hasDataTraining
                ? "bg-primary/10 border-2 border-primary/40"
                : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
            )}
          >
            <p className={cn("text-sm font-bold", hasDataTraining ? "text-primary" : "text-foreground")}>
              Oui, j&apos;ai déjà touché à la data
            </p>
            <p className="text-[10px] text-muted-foreground">
              Cours en ligne, projets perso, Excel avancé, SQL, Python...
            </p>
          </button>
          <button
            onClick={() => onFieldChange("hasDataTraining", false)}
            className={cn(
              "p-4 rounded-xl text-left transition-all",
              !hasDataTraining && educationLevel
                ? "bg-primary/10 border-2 border-primary/40"
                : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
            )}
          >
            <p className={cn(
              "text-sm font-bold",
              !hasDataTraining && educationLevel ? "text-primary" : "text-foreground"
            )}>
              Non, je pars de zéro
            </p>
            <p className="text-[10px] text-muted-foreground">
              Pas d&apos;expérience technique en data — c&apos;est OK, on commence ensemble
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
