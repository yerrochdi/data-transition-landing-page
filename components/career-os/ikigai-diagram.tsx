"use client";

/**
 * <IkigaiDiagram> — visualisation des 4 cercles de l'Ikigai avec le
 * sweet spot au centre. Affiché en tête du bilan final quand les 4
 * dimensions ont été renseignées pendant l'onboarding.
 *
 * Chaque cercle porte un libellé court (le signal-clé de la dimension)
 * et l'intersection centrale nomme le sweet spot (le rôle cible aligné).
 */
import { useEffect, useState } from "react";
import { Flame, Zap, Globe, Compass } from "lucide-react";

export interface IkigaiDiagramData {
  /** Libellé court de ce qui anime la personne (ex: "Transmettre, structurer") */
  passion: string;
  /** Libellé court de ses forces (ex: "Clarifier le complexe") */
  forces: string;
  /** Libellé court du marché (ex: "People Analytics en demande") */
  market: string;
  /** Libellé court de l'alignement (ex: "55-65k, télétravail") */
  alignment: string;
  /** Le sweet spot — le rôle/positionnement qui croise les 4 (ex: "Head of People Analytics") */
  sweetSpot: string;
}

/**
 * Le prompt summary émet, en toute fin de bilan, un bloc balisé :
 *   <!--IKIGAI:{"passion":"...","forces":"...","market":"...","alignment":"...","sweetSpot":"..."}-->
 * On l'extrait pour alimenter le diagramme, et on le retire du markdown
 * affiché (invisible pour l'utilisateur dans le rendu texte).
 *
 * Retourne { data, cleaned } : les données du diagramme (ou null si
 * absent/invalide) + le contenu markdown nettoyé du bloc.
 */
export function extractIkigaiData(content: string): {
  data: IkigaiDiagramData | null;
  cleaned: string;
} {
  const match = content.match(/<!--\s*IKIGAI:(\{[\s\S]*?\})\s*-->/);
  if (!match) return { data: null, cleaned: content };

  const cleaned = content.replace(match[0], "").trim();
  try {
    const parsed = JSON.parse(match[1]) as Partial<IkigaiDiagramData>;
    if (
      parsed.passion &&
      parsed.forces &&
      parsed.market &&
      parsed.alignment &&
      parsed.sweetSpot
    ) {
      return {
        data: {
          passion: parsed.passion,
          forces: parsed.forces,
          market: parsed.market,
          alignment: parsed.alignment,
          sweetSpot: parsed.sweetSpot,
        },
        cleaned,
      };
    }
  } catch {
    // JSON cassé — on ignore le diagramme mais on garde le bilan propre
  }
  return { data: null, cleaned };
}

const QUADRANTS = [
  {
    key: "passion" as const,
    label: "Ce qui vous anime",
    icon: Flame,
    color: "#f97316", // orange
    pos: "top-left",
  },
  {
    key: "forces" as const,
    label: "Vos forces",
    icon: Zap,
    color: "#4be277", // primary green
    pos: "top-right",
  },
  {
    key: "market" as const,
    label: "Le marché",
    icon: Globe,
    color: "#3b82f6", // blue
    pos: "bottom-left",
  },
  {
    key: "alignment" as const,
    label: "Vos non-négociables",
    icon: Compass,
    color: "#a855f7", // violet
    pos: "bottom-right",
  },
];

export function IkigaiDiagram({ data }: { data: IkigaiDiagramData }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setRevealed(true), 150);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="my-10 not-prose">
      <h2 className="font-headline text-xl md:text-2xl font-bold text-foreground mb-2 text-center">
        Votre Ikigai professionnel
      </h2>
      <p className="text-sm text-muted-foreground/80 mb-8 text-center max-w-md mx-auto">
        Le point de rencontre entre ce qui vous anime, vos forces, le marché et
        vos non-négociables. C&apos;est là que se trouve votre prochaine étape.
      </p>

      {/* Desktop : 4 cercles qui se chevauchent + centre. Mobile : empilé */}
      <div className="relative mx-auto max-w-2xl">
        {/* Grille 2x2 des dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {QUADRANTS.map((q, i) => {
            const Icon = q.icon;
            return (
              <div
                key={q.key}
                className="rounded-2xl p-4 border transition-all duration-500"
                style={{
                  backgroundColor: `${q.color}0d`, // ~5% opacity
                  borderColor: `${q.color}33`, // ~20% opacity
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? "translateY(0)" : "translateY(12px)",
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${q.color}26`, color: q.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-widest font-bold"
                    style={{ color: q.color }}
                  >
                    {q.label}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-snug font-medium">
                  {data[q.key] || "—"}
                </p>
              </div>
            );
          })}
        </div>

        {/* Sweet spot — le centre qui converge */}
        <div
          className="rounded-2xl p-5 border-2 border-primary/40 bg-gradient-to-br from-primary/15 to-surface-container-lowest/40 text-center transition-all duration-700"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? "scale(1)" : "scale(0.94)",
            transitionDelay: "560ms",
            boxShadow: revealed
              ? "0 0 40px -10px hsl(var(--primary) / 0.4)"
              : "none",
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-1.5">
            Votre sweet spot
          </p>
          <p className="font-headline text-lg md:text-xl font-black text-foreground leading-tight">
            {data.sweetSpot}
          </p>
        </div>
      </div>
    </section>
  );
}
