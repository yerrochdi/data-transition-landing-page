"use client";

import { CheckCircle, Clock, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  title: string;
  description: string;
  duration: string;
  status: "done" | "active" | "locked";
}

interface TransitionTimelineProps {
  aiRecommendation: string | null;
  preferredPace: string;
}

function stripMarkdownAndCJK(text: string): string {
  return text
    .replace(/\*\*/g, "")           // Remove **bold**
    .replace(/[\u2E80-\u9FFF\uF900-\uFAFF]/g, "") // Remove CJK characters
    .replace(/\s{2,}/g, " ")        // Collapse multiple spaces
    .trim();
}

function parseStepsFromAI(text: string): TimelineStep[] {
  // Try to extract numbered steps from AI recommendation
  const cleaned = stripMarkdownAndCJK(text);
  const lines = cleaned.split("\n").filter((l) => l.trim());
  const steps: TimelineStep[] = [];

  for (const line of lines) {
    // Match patterns like "1. Apprendre..." or "1) Apprendre..."
    const match = line.match(/^\d+[\.\)]\s*(.+)/);
    if (match) {
      const content = match[1].trim();
      // Try to extract duration in parentheses
      const durationMatch = content.match(/\(([^)]*(?:mois|semaines?|jours?)(?:[^)]*)?)\)/i);
      const duration = durationMatch ? durationMatch[1] : "";
      const title = content.replace(/\([^)]*\)\s*\.?\s*$/, "").trim();
      // Cut at first sentence for description
      const parts = title.split(/[.!]\s/);
      steps.push({
        title: parts[0].substring(0, 80) + (parts[0].length > 80 ? "..." : ""),
        description: parts.slice(1).join(". ").substring(0, 120) || "",
        duration,
        status: steps.length === 0 ? "active" : "locked",
      });
    }
  }

  return steps;
}

function getDefaultSteps(pace: string): TimelineStep[] {
  const durations = {
    RELAXED: ["3-4 mois", "6-9 mois", "12-15 mois"],
    MODERATE: ["2-3 mois", "4-6 mois", "9-12 mois"],
    INTENSIVE: ["1-2 mois", "3-4 mois", "6-8 mois"],
  };
  const d = durations[pace as keyof typeof durations] || durations.MODERATE;

  return [
    { title: "Fondations Data/IA", description: "Acquérir les bases techniques essentielles", duration: d[0], status: "active" },
    { title: "Spécialisation", description: "Se former au rôle cible et obtenir des certifications", duration: d[1], status: "locked" },
    { title: "Positionnement", description: "Personal branding, réseau et candidatures ciblées", duration: d[2], status: "locked" },
  ];
}

export function TransitionTimeline({ aiRecommendation, preferredPace }: TransitionTimelineProps) {
  const steps = aiRecommendation
    ? parseStepsFromAI(aiRecommendation)
    : getDefaultSteps(preferredPace);

  // If AI parsing failed to find steps, use defaults
  const displaySteps = steps.length >= 2 ? steps : getDefaultSteps(preferredPace);

  const statusIcon = {
    done: <CheckCircle className="w-5 h-5" />,
    active: <Clock className="w-5 h-5" />,
    locked: <Lock className="w-5 h-5" />,
  };

  const statusColor = {
    done: "bg-primary text-primary-foreground",
    active: "bg-primary/20 text-primary border-2 border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]",
    locked: "bg-surface-container text-muted-foreground",
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline text-sm font-bold text-foreground">Parcours de transition</h3>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {preferredPace === "RELAXED" ? "Rythme relaxé" : preferredPace === "INTENSIVE" ? "Rythme intensif" : "Rythme modéré"}
        </span>
      </div>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-primary via-primary/30 to-transparent" />

        <div className="space-y-6">
          {displaySteps.map((step, i) => (
            <div key={i} className="relative flex gap-4">
              {/* Icon */}
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all", statusColor[step.status])}>
                {statusIcon[step.status]}
              </div>
              {/* Content */}
              <div className={cn("flex-1 pb-2", step.status === "locked" && "opacity-50")}>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
                  {step.duration && (
                    <span className="text-[10px] text-muted-foreground bg-surface-container px-2 py-0.5 rounded-full">
                      {step.duration}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                )}
                {step.status === "active" && (
                  <button className="mt-2 flex items-center gap-1.5 text-[10px] text-primary font-bold hover:underline">
                    Commencer cette étape
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
