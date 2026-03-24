"use client";

import { Sparkles } from "lucide-react";
import type { OnboardingFormData, AiInsights } from "@/lib/onboarding/types";
import { AiInsightPanel } from "./ai-insight-panel";

interface StepSummaryProps {
  formData: OnboardingFormData;
  aiContent: string | null;
  onAiUpdate: (content: string) => void;
}

export function StepSummary({
  formData,
  aiContent,
  onAiUpdate,
}: StepSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-6 rounded-2xl light-streak surface-glow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-foreground">
              Votre profil IA
            </h3>
            <p className="text-xs text-primary">
              Analysé par NextMove Copilot
            </p>
          </div>
        </div>

        {/* Quick profile recap */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface-container-lowest p-3 rounded-xl ghost-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
              Profil actuel
            </p>
            <p className="text-sm text-foreground font-bold">
              {formData.currentRole || "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formData.currentSector || "—"} · {formData.experienceYears || "?"}{" "}
              ans
            </p>
          </div>
          <div className="bg-surface-container-lowest p-3 rounded-xl ghost-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
              Objectif
            </p>
            <p className="text-sm text-foreground font-bold">
              {formData.targetRole || "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formData.targetSector || "—"} · Rythme{" "}
              {formData.preferredPace === "relaxed"
                ? "tranquille"
                : formData.preferredPace === "intensive"
                ? "intensif"
                : "modéré"}
            </p>
          </div>
        </div>

        {/* AI-generated full analysis — auto-trigger */}
        <AiInsightPanel
          label="Analyse complète"
          step="summary"
          data={formData}
          content={aiContent}
          onContentUpdate={onAiUpdate}
          autoTrigger
        />
      </div>
    </div>
  );
}
