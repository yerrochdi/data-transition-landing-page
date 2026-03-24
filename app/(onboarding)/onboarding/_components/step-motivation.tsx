"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Heart, Rocket, ArrowRightLeft, Trophy, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { renderMarkdownBlock } from "@/lib/utils/render-markdown";

interface StepMotivationProps {
  motivation: string;
  keyAchievements: string;
  dreamScenario: string;
  formData: Partial<OnboardingFormData>;
  aiContent: string | null;
  onFieldChange: (field: string, value: string) => void;
  onAiUpdate: (content: string) => void;
}

const MOTIVATIONS = [
  {
    value: "attracted",
    icon: Rocket,
    label: "Attiré par la data/IA",
    description: "Je suis passionné par ce domaine et je veux y aller",
  },
  {
    value: "fleeing",
    icon: ArrowRightLeft,
    label: "Besoin de changement",
    description: "Mon poste actuel ne me convient plus, je cherche une sortie",
  },
  {
    value: "both",
    icon: Heart,
    label: "Les deux",
    description: "Je veux quitter mon poste ET la data m'attire vraiment",
  },
];

export function StepMotivation({
  motivation,
  keyAchievements,
  dreamScenario,
  formData,
  aiContent,
  onFieldChange,
  onAiUpdate,
}: StepMotivationProps) {
  const [loading, setLoading] = useState(false);
  const hasTriggered = useRef(false);

  const analyzeAchievements = useCallback(async () => {
    if (!keyAchievements || keyAchievements.length < 20) return;
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "motivation", data: formData }),
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }
      onAiUpdate(accumulated);
    } catch {
      // Silently fail — this is supplementary
    } finally {
      setLoading(false);
    }
  }, [keyAchievements, formData, onAiUpdate]);

  // Auto-trigger AI when achievements are filled
  useEffect(() => {
    if (
      !hasTriggered.current &&
      !aiContent &&
      !loading &&
      keyAchievements.length >= 30 &&
      motivation
    ) {
      hasTriggered.current = true;
      const timer = setTimeout(analyzeAchievements, 500);
      return () => clearTimeout(timer);
    }
  }, [keyAchievements, motivation, aiContent, loading, analyzeAchievements]);

  return (
    <div className="space-y-8">
      {/* Motivation */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
          <Heart className="w-4 h-4 text-primary" />
          Qu&apos;est-ce qui vous pousse à changer ?
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Comprendre votre motivation nous aide à calibrer l&apos;accompagnement
        </p>
        <div className="space-y-2">
          {MOTIVATIONS.map((m) => {
            const selected = motivation === m.value;
            return (
              <button
                key={m.value}
                onClick={() => onFieldChange("motivation", m.value)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all",
                  selected
                    ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                    : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  selected ? "bg-primary text-primary-foreground" : "bg-surface-container text-muted-foreground"
                )}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={cn("text-sm font-bold", selected ? "text-primary" : "text-foreground")}>
                    {m.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{m.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Key Achievements */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
          <Trophy className="w-4 h-4 text-primary" />
          Vos réalisations clés
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Décrivez 2-3 projets ou résultats dont vous êtes fier — l&apos;IA détectera vos compétences cachées
        </p>
        <textarea
          value={keyAchievements}
          onChange={(e) => onFieldChange("keyAchievements", e.target.value)}
          placeholder="Ex: J'ai piloté la migration du SIRH de mon entreprise (500 utilisateurs), réduit les délais de reporting de 40%, formé une équipe de 8 personnes sur le nouvel outil..."
          rows={4}
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ghost-border"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          {keyAchievements.length < 30
            ? `Encore ${30 - keyAchievements.length} caractères pour activer l'analyse IA`
            : "L'IA analysera vos compétences cachées"}
        </p>
      </div>

      {/* AI Analysis of achievements */}
      {loading && (
        <div className="flex items-center gap-2 p-4 bg-surface-container-high/70 rounded-xl">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-xs text-primary font-bold">Analyse de vos réalisations...</span>
        </div>
      )}
      {aiContent && !loading && (
        <div className="bg-surface-container-high/70 backdrop-blur-sm p-4 rounded-xl light-streak">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Compétences détectées
            </span>
          </div>
          <div className="text-xs text-foreground leading-relaxed">
            {renderMarkdownBlock(aiContent)}
          </div>
        </div>
      )}

      {/* Dream Scenario */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
          <Rocket className="w-4 h-4 text-primary" />
          Votre scénario idéal
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Dans 2 ans, si tout se passe parfaitement, vous êtes...
        </p>
        <textarea
          value={dreamScenario}
          onChange={(e) => onFieldChange("dreamScenario", e.target.value)}
          placeholder="Ex: Je suis HR Data Strategist dans une grande banque, je pilote les analytics RH, je gagne 20% de plus qu'aujourd'hui, et j'ai une vraie expertise reconnue en data..."
          rows={3}
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ghost-border"
        />
      </div>
    </div>
  );
}
