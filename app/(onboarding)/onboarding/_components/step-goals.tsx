"use client";

import { cn } from "@/lib/utils";

interface StepGoalsProps {
  shortTermGoal: string;
  longTermGoal: string;
  preferredPace: "relaxed" | "moderate" | "intensive";
  onFieldChange: (field: string, value: string) => void;
}

export function StepGoals({
  shortTermGoal,
  longTermGoal,
  preferredPace,
  onFieldChange,
}: StepGoalsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Objectif à court terme (3 mois)
        </label>
        <textarea
          value={shortTermGoal}
          onChange={(e) => onFieldChange("shortTermGoal", e.target.value)}
          placeholder="Ex: Maîtriser SQL et Python pour l'analyse de données dans mon secteur..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-24"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Objectif à moyen terme (12 mois)
        </label>
        <textarea
          value={longTermGoal}
          onChange={(e) => onFieldChange("longTermGoal", e.target.value)}
          placeholder="Ex: Décrocher un poste de Data Analyst dans la FinTech..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-24"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Rythme préféré
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["relaxed", "moderate", "intensive"] as const).map((pace) => (
            <button
              key={pace}
              onClick={() => onFieldChange("preferredPace", pace)}
              className={cn(
                "p-3 rounded-xl text-xs font-bold transition-all capitalize",
                preferredPace === pace
                  ? "bg-primary/10 border border-primary/30 text-primary"
                  : "bg-surface-container-lowest ghost-border text-muted-foreground hover:bg-surface-container"
              )}
            >
              {pace === "relaxed"
                ? "Tranquille"
                : pace === "moderate"
                ? "Modéré"
                : "Intensif"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
