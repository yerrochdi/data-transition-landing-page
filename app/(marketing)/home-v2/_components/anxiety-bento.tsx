"use client";

import { motion } from "framer-motion";
import {
  Users,
  Brain,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FoundingPlacesGrid } from "./founding-places-grid";
import type {
  FoundingPlace,
  FoundingPlacesStatus,
} from "@/lib/founding-members/places";

/**
 * Section 2 — "L'angoisse silencieuse des cadres 35-50".
 *
 * Adapté du bento-grid Aceternity (21st.dev) à la palette NextMove.
 * Objectif : crée l'identification émotionnelle ("enfin quelqu'un
 * comprend"). Pas de CTA explicite — sauf la grande card qui injecte
 * un mécanisme d'urgence concret (grille des places Founding).
 */

interface AnxietyBentoProps {
  foundingPlaces: FoundingPlacesStatus;
}

type Anxiety = {
  name: string;
  description: string;
  Icon: typeof Users;
  className: string;
  background: ReactNode;
  /** Quand true, le background est interactif (hover, clics) et on
   *  masque le text-overlay pour ne pas le bloquer. Utilisé par la
   *  grande card (grille des places Founding). */
  interactiveBackground?: boolean;
};

function buildAnxieties(foundingPlaces: FoundingPlacesStatus): Anxiety[] {
  return [
    {
      name:
        foundingPlaces.remaining > 0
          ? `${foundingPlaces.remaining} place${
              foundingPlaces.remaining > 1 ? "s" : ""
            } restante${foundingPlaces.remaining > 1 ? "s" : ""}.`
          : "Programme complet.",
      description:
        foundingPlaces.remaining > 0
          ? `Le programme Founding Member n'ouvre que 30 places. Chaque case verte est une candidature acceptée. Survolez pour voir leur profil. Cliquez une case vide pour candidater — sélection sous 48h.`
          : "Le programme est complet. Vous pouvez encore rejoindre la liste d'attente — les premières places se libèrent dans 3 mois.",
      Icon: Users,
      className: "md:col-span-2 md:row-span-2",
      background: (
        <FoundingPlacesGrid
          total={foundingPlaces.total}
          taken={foundingPlaces.taken}
          occupants={foundingPlaces.occupants}
        />
      ),
      interactiveBackground: true,
    },
  {
    name: "L'imposteur inversé",
    description:
      "Vous maîtrisez votre métier mieux que jamais. Mais vous ne savez plus si on vous embauche pour ce que vous savez faire — ou si on cherche déjà quelqu'un de 28 ans qui parle Python.",
    Icon: Brain,
    className: "md:col-span-1",
    background: <BgBrainPulse />,
  },
  {
    name: "Le piège du « trop tard »",
    description:
      "Reprendre un bootcamp à 42 ans, avec 2 enfants et un crédit, pour redevenir junior à 35k€ ? L'idée vous traverse l'esprit puis vous la rejetez. Mais vous n'avez aucun autre plan.",
    Icon: TrendingDown,
    className: "md:col-span-1",
    background: <BgDownArrow />,
  },
    {
      name: "Le silence du management",
      description:
        "Vos N+1 et le CODIR parlent IA en réunion sans vous regarder. Vous n'êtes ni invité aux groupes de travail, ni sollicité sur la stratégie. Et personne ne vous a encore dit pourquoi.",
      Icon: AlertCircle,
      className: "md:col-span-2",
      background: <BgWhisper />,
    },
  ];
}

export function AnxietyBento({ foundingPlaces }: AnxietyBentoProps) {
  const anxieties = buildAnxieties(foundingPlaces);
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="max-w-3xl mb-12 md:mb-16"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Diagnostic — Le marché cadres 2026
            </span>
          </div>
          <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground text-balance">
            L&apos;angoisse silencieuse des cadres 35-50.
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground/90 leading-relaxed text-pretty max-w-2xl">
            4 peurs que personne n&apos;ose nommer dans les conférences IA.
            Mais que vous reconnaîtrez peut-être.
          </p>
        </motion.div>

        {/* Bento grid — asymétrique 3 colonnes */}
        <div className="grid w-full grid-cols-1 md:grid-cols-3 md:auto-rows-[16rem] gap-4">
          {anxieties.map((a, i) => (
            <BentoCard key={a.name} anxiety={a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoCard({ anxiety, index }: { anxiety: Anxiety; index: number }) {
  const { name, description, Icon, className, background, interactiveBackground } = anxiety;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl",
        "bg-surface-container-lowest border border-border/40",
        "shadow-[0_-20px_80px_-20px_hsl(var(--primary)/0.08)_inset]",
        "transition-all duration-500",
        "hover:border-primary/30 hover:bg-surface-container-low",
        className
      )}
    >
      {/* Background art — derrière le texte. Quand interactiveBackground
          est true (grande card), le background reçoit les events souris. */}
      <div
        className={cn(
          "absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500",
          interactiveBackground ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {background}
      </div>

      {/* Card content — icon top, text bottom. Pour la grande card avec
          background interactif, on rend juste le titre + description en
          bas (le background fournit déjà son propre header). */}
      {interactiveBackground ? (
        <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-7 pointer-events-none">
          <div className="bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/95 to-transparent -mx-6 -mb-6 md:-mx-7 md:-mb-7 px-6 pb-6 md:px-7 md:pb-7 pt-12">
            <h3 className="font-headline text-lg md:text-xl font-bold text-foreground mb-2 leading-tight">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground/90 leading-relaxed max-w-md">
              {description}
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col h-full p-6 md:p-7">
          <Icon className="w-8 h-8 text-primary/80 transition-all duration-500 group-hover:text-primary group-hover:scale-110 origin-top-left" />
          <div className="mt-auto pt-6">
            <h3 className="font-headline text-lg md:text-xl font-bold text-foreground mb-2 leading-tight">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground/90 leading-relaxed max-w-md">
              {description}
            </p>
          </div>
        </div>
      )}

      {/* Subtle hover overlay vert */}
      <div className="pointer-events-none absolute inset-0 bg-primary/[0.025] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────
// Backgrounds artistiques — un par card secondaire, en SVG / pure CSS
// (La grande card utilise <FoundingPlacesGrid> directement, voir
//  buildAnxieties au-dessus.)
// ────────────────────────────────────────────────────────────────

/** Card 2 — réseau de connexions (pour "l'imposteur inversé" — Python qui vous rattrape) */
function BgBrainPulse() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 60%)",
          filter: "blur(30px)",
        }}
      />
      {/* Lignes diagonales subtiles */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0, transparent 28px, hsl(var(--primary) / 0.3) 28px, hsl(var(--primary) / 0.3) 29px)",
        }}
      />
    </div>
  );
}

/** Card 3 — flèche / graphique descendant pour "trop tard" */
function BgDownArrow() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 65%)",
          filter: "blur(35px)",
        }}
      />
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.2]"
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="downGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.6"
            />
          </linearGradient>
        </defs>
        {/* Plusieurs lignes descendantes en escalier */}
        {[0, 40, 80, 120, 160].map((offset, i) => (
          <path
            key={i}
            d={`M ${20 + offset} 50 L ${20 + offset} 200 L ${
              80 + offset
            } 200 L ${80 + offset} 350`}
            stroke="url(#downGrad)"
            strokeWidth="1.2"
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}

/** Card 4 — chuchotements / silence (lignes parallèles fines) */
function BgWhisper() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute top-1/3 -left-10 w-72 h-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
          filter: "blur(45px)",
        }}
      />
      {/* Lignes horizontales façon onde sonore */}
      <div className="absolute inset-0 flex flex-col justify-around opacity-[0.18] py-8">
        {[0.5, 0.8, 0.4, 1, 0.6, 0.3, 0.7, 0.5].map((w, i) => (
          <div
            key={i}
            className="h-px bg-primary mx-auto"
            style={{ width: `${w * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}
