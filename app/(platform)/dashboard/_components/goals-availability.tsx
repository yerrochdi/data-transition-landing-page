"use client";

import { Target, Clock, Wallet, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalsAvailabilityProps {
  shortTermGoal: string | null;
  longTermGoal: string | null;
  dreamScenario: string | null;
  availableHoursPerWeek: number | null;
  trainingBudget: string | null;
  preferredPace: string;
}

const BUDGET_LABELS: Record<string, { label: string; color: string }> = {
  none: { label: "Pas de budget", color: "text-red-400" },
  low: { label: "< 500€", color: "text-amber-400" },
  medium: { label: "500€ – 2000€", color: "text-blue-400" },
  high: { label: "> 2000€", color: "text-emerald-400" },
};

const PACE_LABELS: Record<string, string> = {
  RELAXED: "Relaxé",
  MODERATE: "Modéré",
  INTENSIVE: "Intensif",
  relaxed: "Relaxé",
  moderate: "Modéré",
  intensive: "Intensif",
};

export function GoalsAvailability({
  shortTermGoal,
  longTermGoal,
  dreamScenario,
  availableHoursPerWeek,
  trainingBudget,
  preferredPace,
}: GoalsAvailabilityProps) {
  const budget = trainingBudget ? BUDGET_LABELS[trainingBudget] : null;
  const hours = availableHoursPerWeek ?? 0;

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-headline text-sm font-bold text-foreground">
          Objectifs & Ressources
        </h3>
      </div>

      {/* Goals */}
      <div className="space-y-3 mb-5">
        {shortTermGoal && (
          <GoalCard
            label="Objectif 3 mois"
            value={shortTermGoal}
            accentClass="border-l-primary"
          />
        )}
        {longTermGoal && (
          <GoalCard
            label="Objectif 12 mois"
            value={longTermGoal}
            accentClass="border-l-emerald-500"
          />
        )}
        {dreamScenario && (
          <GoalCard
            label="Scénario idéal"
            value={dreamScenario}
            accentClass="border-l-amber-500"
          />
        )}
      </div>

      {/* Availability metrics */}
      <div className="grid grid-cols-3 gap-3">
        {/* Hours/week */}
        <div className="text-center p-3 bg-surface-container-lowest rounded-xl">
          <Clock className="w-4 h-4 text-primary mx-auto mb-1.5" />
          <p className="text-lg font-extrabold text-foreground">{hours}h</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">/ semaine</p>
        </div>

        {/* Budget */}
        <div className="text-center p-3 bg-surface-container-lowest rounded-xl">
          <Wallet className="w-4 h-4 text-primary mx-auto mb-1.5" />
          <p className={cn("text-xs font-extrabold", budget?.color || "text-foreground")}>
            {budget?.label || "—"}
          </p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Budget</p>
        </div>

        {/* Pace */}
        <div className="text-center p-3 bg-surface-container-lowest rounded-xl">
          <Calendar className="w-4 h-4 text-primary mx-auto mb-1.5" />
          <p className="text-xs font-extrabold text-foreground">
            {PACE_LABELS[preferredPace] || preferredPace}
          </p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Rythme</p>
        </div>
      </div>
    </div>
  );
}

function GoalCard({
  label,
  value,
  accentClass,
}: {
  label: string;
  value: string;
  accentClass: string;
}) {
  return (
    <div className={cn("border-l-2 pl-3 py-1", accentClass)}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">
        {label}
      </p>
      <p className="text-xs text-foreground leading-relaxed line-clamp-2">{value}</p>
    </div>
  );
}
