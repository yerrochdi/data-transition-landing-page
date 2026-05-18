"use client";

import {
  motion,
  useSpring,
  useTransform,
  useInView,
  type MotionValue,
} from "framer-motion";
import {
  Hourglass,
  Brain,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Section 2 — "L'angoisse silencieuse des cadres 35-50".
 *
 * Adapté du bento-grid Aceternity (21st.dev) à la palette NextMove.
 * Objectif : crée l'identification émotionnelle ("enfin quelqu'un
 * comprend"). Pas de CTA — cette section sert uniquement à nommer
 * 4 angoisses spécifiques et taboues.
 */

type Anxiety = {
  name: string;
  description: string;
  Icon: typeof Hourglass;
  className: string;
  background: ReactNode;
};

const anxieties: Anxiety[] = [
  {
    name: "Le compte à rebours silencieux",
    description:
      "Vous regardez votre fil LinkedIn et vous voyez tous ces titres « Director… Head of… » qui se font remplacer ou redimensionner par l'IA. Chaque mois qui passe, votre cote diminue sans que personne ne vous le dise.",
    Icon: Hourglass,
    className: "md:col-span-2 md:row-span-2",
    background: <BgClockPulse />,
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

export function AnxietyBento() {
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
  const { name, description, Icon, className, background } = anxiety;

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
      {/* Background art — derrière le texte */}
      <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500">
        {background}
      </div>

      {/* Card content — icon top, text bottom, separated by flex spacer */}
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

      {/* Subtle hover overlay vert */}
      <div className="pointer-events-none absolute inset-0 bg-primary/[0.025] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────
// Backgrounds artistiques — un par card, en SVG / pure CSS
// ────────────────────────────────────────────────────────────────

/** Card 1 (la grande) — Compteur live qui s'incrémente :
 *  chiffre énorme + caption narrative qui rend visceral le "temps qui
 *  passe sans rien faire". Inspiré du composant Animated Counter de
 *  21st.dev (digits qui slidant en spring), avec une mention "live"
 *  (dot vert pulsé) qui pose le ton "ça se passe MAINTENANT, en lisant
 *  ce paragraphe vous êtes en train de perdre du terrain". */
function BgClockPulse() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Radial glow vert top-right */}
      <div
        className="absolute -top-10 -right-10 w-72 h-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Zone centrale du compteur */}
      <div className="absolute inset-x-7 top-12 flex flex-col items-center text-center pointer-events-none">
        {/* Live indicator */}
        <div className="inline-flex items-center gap-2 mb-3">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{
              opacity: [0.5, 1, 0.5],
              boxShadow: [
                "0 0 0 hsl(var(--primary))",
                "0 0 10px hsl(var(--primary))",
                "0 0 0 hsl(var(--primary))",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/90">
            En direct · marché data France
          </span>
        </div>

        {/* Le grand chiffre animé */}
        <LiveCounter target={847} />

        {/* Caption narrative qui rend le chiffre vivant */}
        <p className="text-xs md:text-sm text-muted-foreground/85 mt-3 max-w-[20rem] leading-relaxed">
          cadres ont ajouté <span className="text-foreground font-semibold">«&nbsp;data&nbsp;»</span> à leur titre LinkedIn
          <br />
          <span className="text-primary/70 font-semibold">cette semaine</span>{" "}
          dans votre secteur.
        </p>
      </div>
    </div>
  );
}

/**
 * Compteur qui s'anime de 0 vers `target` quand il entre dans la
 * viewport. Utilise un useSpring pour un mouvement organique (pas
 * linéaire). Les chiffres sont en tabular-nums pour ne pas faire
 * sauter la largeur.
 */
function LiveCounter({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isInView) setShouldAnimate(true);
  }, [isInView]);

  const spring = useSpring(0, { stiffness: 50, damping: 20, mass: 1 });
  const display = useTransform(spring, (latest) => Math.floor(latest));

  useEffect(() => {
    if (shouldAnimate) {
      spring.set(target);
    }
  }, [shouldAnimate, spring, target]);

  return (
    <div ref={ref} className="relative">
      <motion.div
        className="font-headline text-6xl md:text-7xl font-extrabold tabular-nums tracking-tighter text-primary leading-none"
        style={{
          textShadow:
            "0 0 32px hsl(var(--primary) / 0.5), 0 0 80px hsl(var(--primary) / 0.25)",
        }}
      >
        <CounterDisplay value={display} />
      </motion.div>
    </div>
  );
}

/** Affiche la valeur du MotionValue en se mettant à jour à chaque tick */
function CounterDisplay({ value }: { value: MotionValue<number> }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    return value.on("change", (latest) => setV(latest));
  }, [value]);
  return <>+{v.toLocaleString("fr-FR")}</>;
}

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
