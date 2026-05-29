"use client";

/**
 * <AiReformulation> — bulle "J'entends que…" qui s'affiche après chaque
 * step important de l'onboarding. C'est LE levier principal pour faire
 * sentir à l'utilisateur que NextMove est un vrai coach IA et non
 * un wrapper ChatGPT.
 *
 * Différent de <AiInsightPanel> :
 * - 1-2 lignes max (pas un bilan)
 * - Vouvoiement consultant senior
 * - Trigger DÉCLENCHÉ (pas auto) → le composant attend que le step ait
 *   suffisamment de données (callback `ready`) avant de lancer l'appel.
 * - Cache local par signature de données : si l'utilisateur revient en
 *   arrière, on ne refait pas l'appel.
 * - Streaming caractère par caractère (effet "tape" pour la perception
 *   "ça réfléchit vraiment").
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import type { OnboardingFormData } from "@/lib/onboarding/types";

/**
 * Rendu inline minimaliste : convertit `**bold**` en <strong>.
 * Le prompt autorise gras sur 1-2 mots-clés max — un parseur full markdown
 * serait disproportionné. Si l'IA renvoie d'autres styles, on les laisse
 * en texte (mieux que casser le rendu).
 */
function renderReformulation(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

type ReformulationStep =
  | "situation"
  | "role"
  | "education"
  | "technical"
  | "skills"
  | "blockers"
  | "motivation"
  | "confidence"
  | "ambitions"
  | "availability";

interface AiReformulationProps {
  step: ReformulationStep;
  /** Données du formulaire — sert à construire le prompt côté serveur. */
  data: Partial<OnboardingFormData>;
  /**
   * Signature unique des champs PERTINENTS pour ce step.
   * Quand cette signature change, on relance l'appel.
   * Ex: pour "role", signature = `${role}-${sector}-${years}`.
   * Si elle est vide ou trop courte, on n'appelle pas (rien à reformuler).
   */
  signature: string;
  /** Délai (ms) avant de déclencher l'appel après que la signature soit
   * "prête". Évite de spammer l'API si l'utilisateur tape encore. */
  debounceMs?: number;
  /** Cache : si true, on garde la reformulation précédente même si
   * la signature change (utile pour ne pas regénérer en boucle). */
  persistOnRemount?: boolean;
}

export function AiReformulation({
  step,
  data,
  signature,
  debounceMs = 800,
}: AiReformulationProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache local par signature — évite de regénérer si on revient
  // sur le step sans avoir modifié les inputs clés.
  const cacheRef = useRef<Map<string, string>>(new Map());
  const lastTriggeredSig = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (sig: string) => {
      // Avorte tout call en cours pour ne pas mélanger les streams.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setStreaming(false);
      setContent("");

      try {
        const res = await fetch("/api/onboarding/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step, data, mode: "reformulation" }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Erreur du service IA");
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
          setContent(accumulated);
        }

        cacheRef.current.set(sig, accumulated);
        setStreaming(false);
      } catch (e) {
        // AbortError est attendu si on annule volontairement
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Erreur inattendue");
        setStreaming(false);
      } finally {
        setLoading(false);
      }
    },
    [step, data]
  );

  // Trigger debouncé quand la signature change
  useEffect(() => {
    // Signature vide ou trop courte → rien à reformuler
    if (!signature || signature.length < 3) {
      setContent("");
      setError(null);
      lastTriggeredSig.current = "";
      return;
    }

    // Déjà reformulé pour cette signature → on ressort du cache
    const cached = cacheRef.current.get(signature);
    if (cached) {
      setContent(cached);
      setStreaming(false);
      setLoading(false);
      lastTriggeredSig.current = signature;
      return;
    }

    // Si on a déjà tiré sur cette signature, on ne re-tire pas
    if (lastTriggeredSig.current === signature) return;

    const timer = setTimeout(() => {
      lastTriggeredSig.current = signature;
      generate(signature);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [signature, debounceMs, generate]);

  // Pas de signature exploitable → on n'affiche rien (silence est plus
  // pro qu'une bulle vide)
  if (!signature || signature.length < 3) return null;

  // État erreur : message discret + bouton réessayer
  if (error) {
    return (
      <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-lowest/60 ghost-border animate-fade-up-fast">
        <Sparkles className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
        <div className="flex-1 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground italic">
            L&apos;IA prendra le relais plus tard — continuons.
          </p>
          <button
            type="button"
            onClick={() => generate(signature)}
            className="flex items-center gap-1 text-[10px] text-primary/80 hover:text-primary"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // État loading initial (avant le 1er chunk)
  if (loading && !streaming) {
    return (
      <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15 animate-fade-up-fast">
        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 rounded-full bg-primary/20 animate-pulse w-3/4" />
          <div className="h-2.5 rounded-full bg-primary/15 animate-pulse w-1/2" />
        </div>
      </div>
    );
  }

  // Pas encore de contenu (signature pas mûre)
  if (!content) return null;

  // Rendu final : bulle "J'entends que…" avec streaming visible.
  // animation-delay-100 = petit retard derrière l'animation du step pour
  // créer un effet de cascade ("d'abord le step, puis l'IA réagit").
  return (
    <div
      className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-surface-container-lowest/60 border border-primary/20 animate-fade-up-fast-fast animation-delay-100"
      role="status"
      aria-live="polite"
    >
      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
      </div>
      <p className="text-[13px] leading-relaxed text-foreground/90 flex-1">
        {renderReformulation(content)}
        {streaming && (
          <span
            aria-hidden
            className="inline-block w-1 h-3.5 bg-primary ml-0.5 align-middle animate-pulse"
          />
        )}
      </p>
      {!streaming && content && (
        <button
          type="button"
          onClick={() => {
            cacheRef.current.delete(signature);
            lastTriggeredSig.current = "";
            generate(signature);
          }}
          aria-label="Régénérer la reformulation"
          className="text-muted-foreground/50 hover:text-primary transition-colors shrink-0"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
