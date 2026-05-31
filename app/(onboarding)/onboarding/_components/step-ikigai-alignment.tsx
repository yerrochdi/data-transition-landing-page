"use client";

/**
 * Sprint 3D — Module Ikigai ALIGNEMENT : "ce pour quoi vous voulez être PAYÉE".
 * Très différent des 3 autres : 2 inputs structurés (salaire + non-négociables)
 * + un AI insight global qui croise avec le rôle cible.
 *
 * Pas de IkigaiModule générique ici parce que la structure est trop
 * différente — on a besoin de chips pour les non-négociables.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Compass,
  Loader2,
  RefreshCw,
  Sparkles,
  Wallet,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";

interface StepIkigaiAlignmentProps {
  formData: OnboardingFormData;
  onSalaryChange: (value: string) => void;
  onNonNegotiableAdd: (value: string) => void;
  onNonNegotiableRemove: (value: string) => void;
  onInsightChange: (insight: string) => void;
}

const NON_NEGOTIABLES_SUGGESTIONS = [
  "Télétravail 3j/sem minimum",
  "Pas de management hiérarchique",
  "Impact social ou environnemental",
  "Équipe à taille humaine",
  "Pas de déplacements fréquents",
  "Apprentissage continu garanti",
  "Autonomie sur mes horaires",
  "Stack technique moderne",
];

export function StepIkigaiAlignment({
  formData,
  onSalaryChange,
  onNonNegotiableAdd,
  onNonNegotiableRemove,
  onInsightChange,
}: StepIkigaiAlignmentProps) {
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const salary = formData.ikigai.alignment.salaryExpectation;
  const nonNeg = formData.ikigai.alignment.nonNegotiables;
  const insight = formData.ikigai.alignment.aiInsight;

  const isReady = salary.trim().length >= 3 && nonNeg.length >= 1;

  const handleCustomAdd = () => {
    const trimmed = customInput.trim();
    if (trimmed.length < 3) return;
    if (nonNeg.includes(trimmed)) return;
    onNonNegotiableAdd(trimmed);
    setCustomInput("");
  };

  const handleSuggestionToggle = (suggestion: string) => {
    if (nonNeg.includes(suggestion)) {
      onNonNegotiableRemove(suggestion);
    } else {
      onNonNegotiableAdd(suggestion);
    }
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
          step: "ikigai-alignment",
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
  }, [formData, onInsightChange]);

  // Auto-trigger : quand les 2 inputs sont remplis et stable 1.2s
  useEffect(() => {
    if (!isReady || insight || loading) return;
    const t = window.setTimeout(() => generate(), 1500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, salary, nonNeg.length]);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex items-start gap-3 p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-surface-container-lowest/40 border border-primary/15">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
          <Compass className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">
            Vos non-négociables — le cadre de la transition
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Le sweet spot ne se trouve pas dans l&apos;abstrait : il existe dans des
            conditions concrètes. Posons-les clairement.
          </p>
        </div>
      </div>

      {/* Salaire attendu */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Wallet className="w-4 h-4 text-primary" />
          Attente salariale (annuel brut)
        </label>
        <input
          type="text"
          value={salary}
          onChange={(e) => onSalaryChange(e.target.value)}
          placeholder="Ex : 55-65k brut/an"
          className="w-full bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
        />
        <p className="text-[10px] text-muted-foreground/60">
          Le format est libre — fourchette, chiffre rond, ou "à négocier selon
          le poste".
        </p>
      </div>

      {/* Non-négociables — suggestions cochables */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground block">
          Vos non-négociables
        </label>
        <p className="text-xs text-muted-foreground -mt-1.5">
          Cochez ce qui résonne. Ajoutez les vôtres ensuite.
        </p>
        <div className="flex flex-wrap gap-2">
          {NON_NEGOTIABLES_SUGGESTIONS.map((s) => {
            const isSelected = nonNeg.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestionToggle(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  isSelected
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-surface-container-lowest border-border/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Custom add */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCustomAdd())}
            placeholder="Ajouter un autre non-négociable…"
            className="flex-1 bg-surface-container-lowest border border-border/30 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 transition-colors"
          />
          <button
            type="button"
            onClick={handleCustomAdd}
            disabled={customInput.trim().length < 3}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-40"
          >
            <Plus className="w-3 h-3" />
            Ajouter
          </button>
        </div>

        {/* Custom items déjà ajoutés (ceux pas dans suggestions) */}
        {nonNeg.filter((n) => !NON_NEGOTIABLES_SUGGESTIONS.includes(n)).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {nonNeg
              .filter((n) => !NON_NEGOTIABLES_SUGGESTIONS.includes(n))
              .map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/15 border border-primary/40 text-primary"
                >
                  {n}
                  <button
                    type="button"
                    onClick={() => onNonNegotiableRemove(n)}
                    aria-label="Retirer"
                    className="hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* AI insight */}
      {(loading || streaming || insight) && (
        <AlignmentInsight
          loading={loading && !streaming}
          streaming={streaming}
          content={insight ?? ""}
          error={error}
          onRetry={generate}
        />
      )}
    </div>
  );
}

function AlignmentInsight({
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
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-lowest/60 ghost-border">
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
      className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-surface-container-lowest/60 border border-primary/20"
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
          aria-label="Régénérer"
          className="text-muted-foreground/50 hover:text-primary transition-colors shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
