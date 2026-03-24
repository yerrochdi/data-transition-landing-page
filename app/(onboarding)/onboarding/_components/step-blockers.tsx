"use client";

import { cn } from "@/lib/utils";

const blockers = [
  "Manque de confiance technique",
  "Pas assez de réseau dans le secteur cible",
  "CV pas adapté au nouveau rôle",
  "Syndrome de l'imposteur",
  "Manque de temps pour se former",
  "Pas de certifications reconnues",
  "Incertitude financière",
  "Peur du changement",
];

interface StepBlockersProps {
  selected: string[];
  onToggle: (blocker: string) => void;
}

export function StepBlockers({ selected, onToggle }: StepBlockersProps) {
  return (
    <div className="space-y-3">
      {blockers.map((b) => (
        <button
          key={b}
          onClick={() => onToggle(b)}
          className={cn(
            "w-full text-left p-4 rounded-xl text-sm transition-all",
            selected.includes(b)
              ? "bg-destructive/10 border border-destructive/20 text-foreground font-bold"
              : "bg-surface-container-lowest ghost-border text-muted-foreground hover:bg-surface-container"
          )}
        >
          {b}
        </button>
      ))}
    </div>
  );
}
