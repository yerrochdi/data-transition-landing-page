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
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";

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
}: IkigaiModuleProps) {
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isReady = value.trim().length >= minCharsForAi;

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
        <label className="block">
          <p className="text-sm font-bold text-foreground mb-2 leading-snug">
            {question}
          </p>
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

      {/* AI insight — apparaît quand l'utilisateur·rice a tapé assez */}
      {(loading || streaming || aiInsight) && (
        <IkigaiAiInsight
          loading={loading && !streaming}
          streaming={streaming}
          content={aiInsight ?? ""}
          error={error}
          onRetry={generate}
        />
      )}
    </div>
  );
}

/**
 * Bulle IA — affiche l'insight du coach senior en streaming caractère
 * par caractère, comme dans <AiReformulation>. Bouton régénérer à la fin.
 */
function IkigaiAiInsight({
  loading,
  streaming,
  content,
  error,
  onRetry,
}: {
  loading: boolean;
  streaming: boolean;
  content: string;
  error: string | null;
  onRetry: () => void;
}) {
  // Parsing minimaliste : **bold** en <strong>
  const render = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  };

  if (error) {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-lowest/60 ghost-border">
        <Sparkles className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
        <div className="flex-1 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground italic">
            L&apos;IA prend une pause — réessayez quand vous voulez.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 text-[10px] text-primary/80 hover:text-primary"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
        <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 rounded-full bg-primary/20 animate-pulse w-3/4" />
          <div className="h-2.5 rounded-full bg-primary/15 animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-surface-container-lowest/60 border border-primary/20"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 text-[13px] leading-relaxed text-foreground/90">
        {render(content)}
        {streaming && (
          <span
            aria-hidden
            className="inline-block w-1 h-3.5 bg-primary ml-0.5 align-middle animate-pulse"
          />
        )}
      </div>
      {!streaming && content && (
        <button
          type="button"
          onClick={onRetry}
          aria-label="Régénérer l'insight"
          className="text-muted-foreground/50 hover:text-primary transition-colors shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
