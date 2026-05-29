"use client";

import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { AiReformulation } from "./ai-reformulation";

const options = [
  "En poste — je veux évoluer",
  "En poste — je veux changer de secteur",
  "En transition active",
  "En reconversion complète",
  "Freelance — je veux pivoter",
];

interface StepSituationProps {
  value: string;
  /** Tout le formData courant — utilisé par la reformulation IA. */
  formData: OnboardingFormData;
  onChange: (v: string) => void;
}

export function StepSituation({ value, formData, onChange }: StepSituationProps) {
  // Signature stable basée sur la situation choisie.
  // La reformulation se déclenche dès qu'une option est sélectionnée.
  const signature = value ? `situation:${value}` : "";

  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "w-full text-left p-4 rounded-xl text-sm transition-all",
            value === opt
              ? "bg-primary/10 border border-primary/30 text-foreground font-bold"
              : "bg-surface-container-lowest ghost-border text-muted-foreground hover:bg-surface-container"
          )}
        >
          {opt}
        </button>
      ))}

      {/* Reformulation live — apparaît dès qu'une situation est choisie */}
      <AiReformulation step="situation" data={formData} signature={signature} />
    </div>
  );
}
