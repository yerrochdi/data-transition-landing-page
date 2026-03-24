"use client";

import { Shield, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockersCardsProps {
  blockers: string[];
  confidenceLevel: number;
}

// Map common blockers to actionable tips
const BLOCKER_TIPS: Record<string, { tip: string; action: string }> = {
  "manque de confiance technique": {
    tip: "Commencez par un projet personnel simple — un dashboard Excel automatisé ou une analyse Python.",
    action: "Trouver un mini-projet",
  },
  "pas assez de réseau dans le secteur cible": {
    tip: "Rejoignez 2-3 communautés LinkedIn data/IA et commentez activement pendant 30 jours.",
    action: "Explorer les communautés",
  },
  "manque de temps pour se former": {
    tip: "Bloquez 30 min/jour le matin. La régularité bat l'intensité.",
    action: "Planifier mes créneaux",
  },
  "peur de quitter un emploi stable": {
    tip: "Préparez votre transition en parallèle. Visez d'abord une compétence monetizable.",
    action: "Voir les formations courtes",
  },
  "manque de diplômes/certifications": {
    tip: "Les certifications Google, IBM ou DataCamp valent plus que les diplômes traditionnels en data.",
    action: "Voir les certifications",
  },
  "syndrome de l'imposteur": {
    tip: "Votre expérience métier est un avantage que 90% des data juniors n'ont pas.",
    action: "Lire les success stories",
  },
  "difficulté financière pour se former": {
    tip: "Explorez le CPF, les formations gratuites (Coursera, OpenClassrooms) et les bootcamps financés.",
    action: "Explorer les financements",
  },
};

function findTip(blocker: string): { tip: string; action: string } {
  const normalized = blocker.toLowerCase();
  for (const [key, value] of Object.entries(BLOCKER_TIPS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  // Fuzzy matching on key words
  const words = normalized.split(/\s+/);
  for (const [key, value] of Object.entries(BLOCKER_TIPS)) {
    if (words.some((w) => w.length > 4 && key.includes(w))) {
      return value;
    }
  }
  return {
    tip: "Identifiez une première action concrète à faire cette semaine pour avancer.",
    action: "Parler au Copilot IA",
  };
}

export function BlockersCards({ blockers, confidenceLevel }: BlockersCardsProps) {
  if (blockers.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          <h3 className="font-headline text-sm font-bold text-foreground">
            Freins à débloquer
          </h3>
        </div>
        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
          {blockers.length} identifié{blockers.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {blockers.map((blocker, i) => {
          const { tip, action } = findTip(blocker);
          return (
            <div
              key={i}
              className={cn(
                "p-4 rounded-xl border transition-all",
                "bg-surface-container-lowest border-border/10 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <p className="text-xs font-bold text-foreground mb-2">{blocker}</p>
              <div className="flex items-start gap-2 mb-3">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">{tip}</p>
              </div>
              <button className="flex items-center gap-1.5 text-[10px] text-primary font-bold hover:underline">
                {action}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {confidenceLevel <= 4 && (
        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-[11px] text-primary font-medium">
            Votre confiance est à {confidenceLevel}/10 — c&apos;est normal en début de transition. Chaque petit pas compte.
          </p>
        </div>
      )}
    </div>
  );
}
