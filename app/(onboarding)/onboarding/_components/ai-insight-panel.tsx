"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { renderMarkdownBlock } from "@/lib/utils/render-markdown";

interface AiInsightPanelProps {
  label: string;
  step: "ambitions" | "skills" | "confidence" | "summary";
  data: Partial<OnboardingFormData>;
  content: string | null;
  onContentUpdate: (content: string) => void;
  autoTrigger?: boolean;
}

export function AiInsightPanel({
  label,
  step,
  data,
  content,
  onContentUpdate,
  autoTrigger = false,
}: AiInsightPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const hasAutoTriggered = useRef(false);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStreaming(false);
    onContentUpdate("");

    try {
      const res = await fetch("/api/onboarding/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, data }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur du service IA");
      }

      if (!res.body) {
        throw new Error("Pas de réponse streaming");
      }

      setStreaming(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        accumulated += text;
        onContentUpdate(accumulated);
      }

      setStreaming(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
      setStreaming(false);
    } finally {
      setLoading(false);
    }
  }, [step, data, onContentUpdate]);

  // Auto-trigger for summary/confidence steps
  useEffect(() => {
    if (autoTrigger && !hasAutoTriggered.current && !content && !loading) {
      hasAutoTriggered.current = true;
      generate();
    }
  }, [autoTrigger, content, loading, generate]);

  // Error state
  if (error) {
    return (
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-4 rounded-xl light-streak animate-fade-up">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-destructive" />
            <span className="text-[10px] uppercase tracking-widest text-destructive font-bold">
              {label}
            </span>
          </div>
          <button
            onClick={generate}
            className="flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          L&apos;analyse IA est temporairement indisponible. Vous pouvez continuer votre parcours.
        </p>
      </div>
    );
  }

  // Loading skeleton
  if (loading && !streaming) {
    return (
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-4 rounded-xl light-streak animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
            {label} — Analyse en cours...
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-surface-container-lowest rounded animate-pulse w-full" />
          <div className="h-3 bg-surface-container-lowest rounded animate-pulse w-4/5" />
          <div className="h-3 bg-surface-container-lowest rounded animate-pulse w-3/5" />
        </div>
      </div>
    );
  }

  // No content yet — show trigger button (for non-auto steps)
  if (!content && !autoTrigger) {
    return (
      <button
        onClick={generate}
        className="w-full bg-surface-container-high/70 backdrop-blur-sm p-4 rounded-xl light-streak hover:bg-surface-container-high transition-all group animate-fade-up"
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-primary">
            Analyser mon profil avec l&apos;IA
          </span>
        </div>
      </button>
    );
  }

  // No content and auto-trigger hasn't fired yet
  if (!content) return null;

  // Content display (streaming or final)
  return (
    <div className="bg-surface-container-high/70 backdrop-blur-sm p-4 rounded-xl light-streak animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
            {label}
          </span>
        </div>
        {!streaming && (
          <button
            onClick={generate}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Régénérer
          </button>
        )}
      </div>
      <div className="text-xs text-foreground leading-relaxed">
        {streaming ? (
          <span className="whitespace-pre-wrap">
            {content}
            <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />
          </span>
        ) : (
          <div className="space-y-0">{renderMarkdownBlock(content)}</div>
        )}
      </div>
    </div>
  );
}
