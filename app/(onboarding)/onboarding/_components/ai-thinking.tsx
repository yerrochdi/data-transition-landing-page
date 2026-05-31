"use client";

/**
 * Composants partagés pour l'état de l'IA pendant l'onboarding :
 *   - <AiThinkingLoader> : animation "le coach réfléchit" avec messages
 *     qui évoluent (donne du poids perçu à l'attente)
 *   - <AiErrorState> : message d'erreur honnête + chaleureux qui invoque
 *     la forte affluence plutôt qu'un "erreur technique" anxiogène
 *
 * Mutualisé entre IkigaiModule, step-ikigai-market, step-ikigai-alignment
 * pour un rendu cohérent.
 */
import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

const THINKING_MESSAGES = [
  "Votre coach lit attentivement votre réponse…",
  "Il met en perspective avec votre parcours…",
  "Il identifie ce qui n'a pas été dit…",
  "Il rédige sa lecture…",
];

/**
 * Loader animé pour la génération d'un insight IA. Les messages défilent
 * toutes les ~2.5s pour donner l'impression d'un vrai travail de lecture.
 */
export function AiThinkingLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, THINKING_MESSAGES.length - 1));
    }, 2500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/8 to-surface-container-lowest/40 border border-primary/20 animate-fade-up-fast">
      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
      </div>
      <div className="flex-1 space-y-2.5 pt-0.5">
        <p
          key={msgIndex}
          className="text-[13px] text-primary/90 font-medium animate-fade-up-fast"
        >
          {THINKING_MESSAGES[msgIndex]}
        </p>
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-primary/15 animate-pulse w-4/5" />
          <div className="h-2 rounded-full bg-primary/10 animate-pulse w-3/5" />
        </div>
      </div>
    </div>
  );
}

/**
 * État d'erreur — message honnête qui n'angoisse pas. On invoque la
 * forte affluence (vrai, vu qu'on est en lancement) plutôt qu'une
 * "erreur" sèche. Bouton réessayer toujours visible.
 */
export function AiErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 animate-fade-up-fast">
      <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-400/80" />
      </div>
      <div className="flex-1">
        <p className="text-[13px] text-foreground/90 leading-relaxed mb-2">
          Votre coach IA est très sollicité en ce moment (forte affluence sur
          NextMove). Votre réponse est bien enregistrée — relancez l&apos;analyse
          dans un instant.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Relancer l&apos;analyse
        </button>
      </div>
    </div>
  );
}

/**
 * Rend du texte avec **gras** markdown → <strong>. Partagé par tous les
 * blocs d'insight pour un rendu cohérent.
 */
export function renderInsightText(text: string): React.ReactNode {
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
}
