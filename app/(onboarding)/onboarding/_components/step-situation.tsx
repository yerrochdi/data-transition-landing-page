"use client";

import { cn } from "@/lib/utils";

const options = [
  "En poste — je veux évoluer",
  "En poste — je veux changer de secteur",
  "En transition active",
  "En reconversion complète",
  "Freelance — je veux pivoter",
];

interface StepSituationProps {
  value: string;
  onChange: (v: string) => void;
}

export function StepSituation({ value, onChange }: StepSituationProps) {
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
    </div>
  );
}
