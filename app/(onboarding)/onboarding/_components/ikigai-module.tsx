"use client";

/**
 * <IkigaiModule> — composant de base réutilisable pour les 4 modules
 * Ikigai (Passion, Forces, Marché, Alignement). Encapsule :
 *
 *   - Une introduction émotionnelle (le "pourquoi" cette question)
 *   - Un textarea principal (réponse libre)
 *   - Un appel IA streamé qui reformule et creuse (style coach senior)
 *   - L'affichage de l'insight IA en bulle bordure primary
 *
 * Sprint 3 — Le but : faire sentir un vrai coach, pas un Typeform.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { AiThinkingLoader, AiErrorState, renderInsightText } from "./ai-thinking";

export type IkigaiStep = "passion" | "forces" | "alignment";

interface IkigaiModuleProps {
  /** Identifiant du module pour l'appel API. */
  step: IkigaiStep;
  /** Icône Lucide à afficher dans l'intro. */
  introIcon: React.ElementType;
  /** Titre court (4-6 mots) — apparaît au-dessus du textarea. */
  introTitle: string;
  /** Pourquoi cette question existe — 2-3 phrases qui posent l'enjeu. */
  introBody: string;
  /** Question principale (la "vraie" question Ikigai). */
  question: string;
  /** Placeholder du textarea. */
  placeholder: string;
  /** Valeur actuelle du textarea (réponse de l'utilisateur·rice). */
  value: string;
  /** Insight IA déjà généré (null si pas encore appelé). */
  aiInsight: string | null;
  /** Tout le formData courant — sert à enrichir le prompt avec le contexte. */
  formData: OnboardingFormData;
  /** Appelé à chaque changement du textarea. */
  onChange: (value: string) => void;
  /** Appelé quand l'insight IA est généré ou regénéré. */
  onInsightChange: (insight: string) => void;
  /** Seuil minimal de caractères avant de proposer l'appel IA. Défaut 50. */
  minCharsForAi?: number;
  /**
   * Amorces de réponse cliquables. Au clic, l'amorce est insérée dans le
   * textarea (concaténée si déjà du texte) pour aider la personne à
   * démarrer sans partir d'une page blanche. Elle complète ensuite librement.
   */
  suggestions?: string[];
}

export function IkigaiModule({
  step,
  introIcon: IntroIcon,
  introTitle,
  introBody,
  question,
  placeholder,
  value,
  aiInsight,
  formData,
  onChange,
  onInsightChange,
  minCharsForAi = 50,
  suggestions,
}: IkigaiModuleProps) {
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isReady = value.trim().length >= minCharsForAi;

  // Insère une amorce dans le textarea. Si du texte existe déjà, on
  // l'ajoute proprement à la suite (nouvelle phrase). Sinon on démarre avec.
  const insertSuggestion = (s: string) => {
    const current = value.trim();
    const next = current ? `${current} ${s}` : s;
    onChange(next);
  };

  const generate = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setStreaming(false);
    onInsightChange("");

    try {
      const res = await fetch("/api/onboarding/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: `ikigai-${step}`,
          data: formData,
          mode: "ikigai",
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Erreur du service IA");
      if (!res.body) throw new Error("Pas de réponse streaming");

      setStreaming(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(chunk, { stream: true });
        onInsightChange(accumulated);
      }
      setStreaming(false);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Erreur inattendue");
      setStreaming(false);
    } finally {
      setLoading(false);
    }
  }, [step, formData, onInsightChange]);

  // Auto-trigger : quand l'utilisateur·rice a tapé assez ET arrête de
  // taper pendant 1.2s, on lance l'appel IA. Pas de spam pendant qu'on tape.
  useEffect(() => {
    if (!isReady || aiInsight || loading) return;
    const t = window.setTimeout(() => generate(), 1200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, value]);

  return (
    <div className="space-y-6">
      {/* Intro émotionnelle — pose l'enjeu en 2-3 phrases coach */}
      <div className="flex items-start gap-3 p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-surface-container-lowest/40 border border-primary/15">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
          <IntroIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">{introTitle}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{introBody}</p>
        </div>
      </div>

      {/* Question + textarea — la "vraie" question Ikigai */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-foreground leading-snug">
          {question}
        </p>

        {/* Amorces cliquables — aident à démarrer sans page blanche */}
        {suggestions && suggestions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-bold">
              Besoin d&apos;un coup de pouce ? Cliquez pour démarrer
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => insertSuggestion(s)}
                  className="px-3 py-1.5 rounded-lg text-xs text-left bg-surface-container-lowest border border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <label className="block">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className="w-full bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
          />
        </label>
        <p className="text-[10px] text-muted-foreground/60 text-right">
          {value.trim().length < minCharsForAi
            ? `${value.trim().length}/${minCharsForAi} caractères — au-delà, votre coach IA prend le relais.`
            : `${value.trim().length} caractères — votre coach IA est en train de lire.`}
        </p>
      </div>

      {/* AI insight — états mutualisés via ai-thinking.tsx */}
      {error && <AiErrorState onRetry={generate} />}
      {!error && loading && !streaming && <AiThinkingLoader />}
      {!error && (streaming || aiInsight) && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-surface-container-lowest/60 border border-primary/20"
          role="status"
          aria-live="polite"
        >
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 text-[13px] leading-relaxed text-foreground/90">
            {renderInsightText(aiInsight ?? "")}
            {streaming && (
              <span
                aria-hidden
                className="inline-block w-1 h-3.5 bg-primary ml-0.5 align-middle animate-pulse"
              />
            )}
          </div>
          {!streaming && aiInsight && (
            <button
              type="button"
              onClick={generate}
              aria-label="Régénérer l'insight"
              className="text-muted-foreground/50 hover:text-primary transition-colors shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
