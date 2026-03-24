"use client";

import type { OnboardingFormData } from "@/lib/onboarding/types";
import { AiInsightPanel } from "./ai-insight-panel";

interface StepConfidenceProps {
  level: number;
  formData: Partial<OnboardingFormData>;
  aiContent: string | null;
  onChange: (level: number) => void;
  onAiUpdate: (content: string) => void;
}

export function StepConfidence({
  level,
  formData,
  aiContent,
  onChange,
  onAiUpdate,
}: StepConfidenceProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-6xl font-headline font-extrabold text-primary text-glow mb-2">
          {level}
        </p>
        <p className="text-xs text-muted-foreground">sur 10</p>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={level}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Peu confiant</span>
        <span>Très confiant</span>
      </div>

      {/* AI coaching — auto-trigger */}
      <AiInsightPanel
        label="Mindset Coach"
        step="confidence"
        data={{ ...formData, confidenceLevel: level }}
        content={aiContent}
        onContentUpdate={onAiUpdate}
        autoTrigger
      />
    </div>
  );
}
