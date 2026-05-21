"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles,
  GraduationCap,
  FileCheck,
  Briefcase,
  Bot,
} from "lucide-react";

/**
 * Section 4 — "Comment marche le Career OS".
 *
 * Frise horizontale 01→02→03→04→05 des piliers du produit. Une ligne
 * lumineuse verte se "dessine" (scaleX) au fur et à mesure que la
 * section entre dans la viewport. Chaque étape arrive en stagger.
 *
 * Sur mobile, la frise passe en vertical (la ligne devient verticale).
 */

type Step = {
  num: string;
  Icon: typeof Sparkles;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    num: "01",
    Icon: Sparkles,
    title: "Diagnostic IA",
    description:
      "On lit votre parcours, vos forces, vos angles morts. Vous repartez avec un bilan personnel rédigé pour vous — votre Career OS v1.",
  },
  {
    num: "02",
    Icon: GraduationCap,
    title: "Parcours sur-mesure",
    description:
      "Un plan en phases adapté à votre métier et votre rythme. On greffe la data sur votre expertise, on ne vous transforme pas en junior.",
  },
  {
    num: "03",
    Icon: FileCheck,
    title: "Livrables concrets",
    description:
      "Des projets data réels que vous produisez en quelques jours, corrigés par l'IA. Chaque livrable validé enrichit votre portfolio public.",
  },
  {
    num: "04",
    Icon: Briefcase,
    title: "Opportunités matchées",
    description:
      "De vraies offres data-augmentées, scorées selon votre profil, avec l'explication du gap. Plus de candidatures à l'aveugle.",
  },
  {
    num: "05",
    Icon: Bot,
    title: "Copilot permanent",
    description:
      "Un compagnon de carrière qui sait où vous en êtes et vous oriente vers la prochaine action utile. Pendant la transition — et après.",
  },
];

export function CareerOsSteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "center 60%"],
  });
  // La ligne se dessine de 0 à 100% pendant que la section entre
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="max-w-3xl mb-16 md:mb-24"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              La 3e voie en pratique
            </span>
          </div>
          <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground text-balance">
            Votre Career OS, étape par étape.
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground/90 leading-relaxed text-pretty max-w-2xl">
            Pas une formation de plus. Un système qui transforme votre
            expérience en avantage data — et qui reste avec vous bien après
            votre transition.
          </p>
        </motion.div>

        {/* Frise */}
        <div ref={containerRef} className="relative">
          {/* Ligne de fond (track) — horizontale desktop, verticale mobile */}
          <div className="absolute hidden md:block top-7 left-[10%] right-[10%] h-px bg-border/40" />
          <div className="absolute md:hidden left-7 top-7 bottom-7 w-px bg-border/40" />

          {/* Ligne lumineuse qui se dessine */}
          <motion.div
            style={{ scaleX: lineScale }}
            className="absolute hidden md:block top-7 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/40 via-primary to-primary/40 origin-left shadow-[0_0_8px_hsl(var(--primary))]"
          />
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute md:hidden left-7 top-7 bottom-7 w-px bg-gradient-to-b from-primary/40 via-primary to-primary/40 origin-top shadow-[0_0_8px_hsl(var(--primary))]"
          />

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative">
            {steps.map((step, i) => (
              <StepItem key={step.num} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepItem({ step, index }: { step: Step; index: number }) {
  const { num, Icon, title, description } = step;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className="relative flex md:flex-col gap-4 md:gap-0 md:text-left"
    >
      {/* Node — pastille numérotée sur la ligne */}
      <div className="relative shrink-0 md:mb-6">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            delay: index * 0.12 + 0.2,
            type: "spring",
            stiffness: 200,
            damping: 18,
          }}
          className="relative z-10 w-14 h-14 rounded-2xl bg-surface-container-lowest border border-primary/30 flex items-center justify-center shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]"
        >
          <Icon className="w-6 h-6 text-primary" />
        </motion.div>
        {/* Numéro en filigrane */}
        <span className="absolute -top-2 -right-2 text-[10px] font-bold font-mono text-primary/60 bg-background px-1 rounded">
          {num}
        </span>
      </div>

      {/* Texte */}
      <div className="flex-1 md:pr-2">
        <h3 className="font-headline text-base md:text-lg font-bold text-foreground mb-2 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground/85 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
