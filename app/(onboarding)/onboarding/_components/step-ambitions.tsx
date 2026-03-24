"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, RefreshCw, Loader2, Check, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";

interface SuggestedRole {
  title: string;
  sector: string;
  description: string;
  match: number;
}

interface StepAmbitionsProps {
  targetRole: string;
  targetSector: string;
  formData: Partial<OnboardingFormData>;
  aiContent: string | null;
  onFieldChange: (field: string, value: string) => void;
  onAiUpdate: (content: string) => void;
}

export function StepAmbitions({
  targetRole,
  targetSector,
  formData,
  aiContent,
  onFieldChange,
  onAiUpdate,
}: StepAmbitionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<SuggestedRole[]>([]);
  const hasTriggered = useRef(false);

  // Parse roles from AI content — handles markdown code blocks
  useEffect(() => {
    if (!aiContent) {
      setRoles([]);
      return;
    }
    try {
      // Strip markdown code block if present (```json ... ```)
      let cleaned = aiContent.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        setRoles(parsed);
      }
    } catch {
      // Still streaming or invalid JSON — ignore
    }
  }, [aiContent]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRoles([]);
    onAiUpdate("");

    try {
      const res = await fetch("/api/onboarding/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "ambitions", data: formData }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      if (!res.body) throw new Error("Pas de réponse");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      onAiUpdate(accumulated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }, [formData, onAiUpdate]);

  // Auto-trigger when we have enough data
  useEffect(() => {
    if (
      !hasTriggered.current &&
      !aiContent &&
      !loading &&
      formData.currentRole &&
      formData.currentSector
    ) {
      hasTriggered.current = true;
      generate();
    }
  }, [formData.currentRole, formData.currentSector, aiContent, loading, generate]);

  const selectRole = (role: SuggestedRole) => {
    onFieldChange("targetRole", role.title);
    onFieldChange("targetSector", role.sector);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Basé sur votre profil de <strong className="text-foreground">{formData.currentRole || "—"}</strong> dans le secteur <strong className="text-foreground">{formData.currentSector || "—"}</strong>, voici les rôles data/IA qui valorisent votre expérience :
      </p>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs text-primary font-bold">
              Analyse de votre profil en cours...
            </span>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-xl p-5 ghost-border animate-pulse"
            >
              <div className="h-4 bg-surface-container rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface-container rounded w-full mb-2" />
              <div className="h-3 bg-surface-container rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-surface-container-high/70 p-4 rounded-xl light-streak">
          <p className="text-xs text-muted-foreground mb-3">
            L&apos;analyse IA est temporairement indisponible.
          </p>
          <button
            onClick={() => {
              hasTriggered.current = false;
              setError(null);
              generate();
            }}
            className="flex items-center gap-2 text-xs text-primary font-bold hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
          {/* Fallback: manual input */}
          <div className="mt-4 space-y-3 pt-4 border-t border-border/10">
            <p className="text-xs text-muted-foreground">Ou saisissez manuellement :</p>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => onFieldChange("targetRole", e.target.value)}
              placeholder="Rôle cible"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={targetSector}
              onChange={(e) => onFieldChange("targetSector", e.target.value)}
              placeholder="Secteur cible"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {/* Role cards */}
      {!loading && !error && roles.length > 0 && (
        <div className="space-y-3">
          {roles.map((role, i) => {
            const isSelected = targetRole === role.title;
            return (
              <button
                key={i}
                onClick={() => selectRole(role)}
                className={cn(
                  "w-full text-left p-5 rounded-xl transition-all",
                  isSelected
                    ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                    : "bg-surface-container-lowest ghost-border hover:bg-surface-container hover:scale-[1.01]"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-container text-muted-foreground"
                      )}
                    >
                      {isSelected ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Target className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-headline font-bold text-sm",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {role.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {role.sector}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0",
                    role.match >= 85
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-container text-muted-foreground"
                  )}>
                    {role.match}% match
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ml-13 pl-13">
                  {role.description}
                </p>
              </button>
            );
          })}

          {/* Regenerate button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                hasTriggered.current = false;
                onAiUpdate("");
                setRoles([]);
                generate();
              }}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Proposer d&apos;autres rôles
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-primary">
              <Sparkles className="w-3 h-3" />
              Analyse IA basée sur votre profil
            </div>
          </div>

          {/* Selected role confirmation */}
          {targetRole && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 animate-fade-up">
              <p className="text-xs text-foreground">
                <span className="text-primary font-bold">Objectif sélectionné :</span>{" "}
                {targetRole} dans le secteur {targetSector}
              </p>
            </div>
          )}
        </div>
      )}

      {/* No data state */}
      {!loading && !error && roles.length === 0 && !aiContent && (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground">
            Remplissez votre métier et secteur à l&apos;étape précédente pour obtenir des suggestions personnalisées.
          </p>
        </div>
      )}
    </div>
  );
}
