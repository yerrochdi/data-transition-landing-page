"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LandingPhaseConfig } from "@/lib/landing/phase";

/**
 * Hero "Background Paths" — composant kokonutd (21st.dev) adapté à
 * NextMove. Le visuel signature : ~70 lignes SVG qui "flottent" en
 * boucle dans le background, sens horaire et antihoraire. Chaque
 * lettre du headline arrive en spring stagger.
 *
 * Adaptation NextMove :
 * - Background dark NextMove + traits vert primary (au lieu de slate)
 * - Headline narratif "Vous avez 2 choix. On vous propose le 3e."
 * - CTA Founding Member en bouton primary (vert) au lieu de ghost
 * - Sub-info 9€/mois · 30 places · sélection sous 48h
 */

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-primary"
        viewBox="0 0 696 316"
        fill="none"
        aria-hidden="true"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.05 + path.id * 0.018}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.5, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({ phase }: { phase: LandingPhaseConfig }) {
  // Headline en 2 morceaux : ce qu'on dit, puis le punch
  const line1 = "Vous avez 2 choix.";
  const line2 = "On vous propose le 3e.";

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Animated SVG paths — le signature visual de kokonutd */}
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Vignette douce top + bottom pour que le texte respire au-dessus des paths */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 25%, transparent 75%, hsl(var(--background)) 100%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="max-w-5xl mx-auto"
        >
          {/* Eyebrow Founding */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 mb-10 backdrop-blur-sm"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{
                opacity: [0.5, 1, 0.5],
                boxShadow: [
                  "0 0 0px hsl(var(--primary))",
                  "0 0 8px hsl(var(--primary))",
                  "0 0 0px hsl(var(--primary))",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {phase.eyebrow}
            </span>
          </motion.div>

          {/* Headline — character-by-character stagger sur 2 lignes */}
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 md:mb-10 tracking-tighter leading-[1.04]">
            <AnimatedWord text={line1} baseDelay={0.3} />
            <br />
            <AnimatedWord
              text={line2}
              baseDelay={1.0}
              accentWord="3e"
            />
          </h1>

          {/* Sub-tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.9, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-base md:text-lg text-muted-foreground/90 leading-relaxed max-w-2xl mx-auto mb-12 text-pretty"
          >
            Ignorer l&apos;IA ou redevenir junior à 40 ans n&apos;en sont pas.
            <span className="text-foreground font-medium">
              {" "}
              NextMove construit la 3e voie :
            </span>{" "}
            capitaliser sur vos 15+ ans d&apos;expérience et y greffer une couche
            data/IA.
          </motion.p>

          {/* CTA Founding Member */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.15, ease: [0.25, 0.4, 0.25, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <Link
              href={phase.ctaHref}
              className="group relative inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-primary text-primary-foreground text-base font-bold overflow-hidden transition-transform duration-300 hover:scale-[1.03] shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.7)]"
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 30%, hsl(0 0% 100% / 0.22) 50%, transparent 70%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1.5,
                }}
              />
              <span className="relative">{phase.ctaLabel}</span>
              <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <p className="text-xs text-muted-foreground/80 mt-1">
              {phase.ctaSubline}
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 3 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <motion.div
          className="w-[1px] h-10 bg-gradient-to-b from-transparent via-muted-foreground/40 to-transparent"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}

/**
 * Rend un texte lettre-par-lettre avec spring stagger.
 * Si `accentWord` est passé, ce mot reçoit la couleur primary + glow pulse.
 * Les espaces sont préservés via &nbsp; (problème classique avec inline-block).
 */
function AnimatedWord({
  text,
  baseDelay,
  accentWord,
}: {
  text: string;
  baseDelay: number;
  accentWord?: string;
}) {
  const words = text.split(" ");
  let globalIdx = 0;

  return (
    <>
      {words.map((word, wordIndex) => {
        const isAccent = accentWord && word.replace(/[.,!?]$/, "") === accentWord;
        const isLast = wordIndex === words.length - 1;

        const renderedWord = (
          <span key={`w-${wordIndex}`} className="inline-block">
            {word.split("").map((letter) => {
              const i = globalIdx++;
              return (
                <motion.span
                  key={`l-${wordIndex}-${i}`}
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: baseDelay + i * 0.025,
                    type: "spring",
                    stiffness: 150,
                    damping: 25,
                  }}
                  className={
                    isAccent
                      ? "inline-block text-primary"
                      : "inline-block text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/75"
                  }
                  style={
                    isAccent
                      ? {
                          textShadow:
                            "0 0 28px hsl(var(--primary) / 0.55), 0 0 64px hsl(var(--primary) / 0.25)",
                        }
                      : undefined
                  }
                >
                  {letter}
                </motion.span>
              );
            })}
          </span>
        );

        return (
          <span key={`g-${wordIndex}`}>
            {renderedWord}
            {!isLast && <span>&nbsp;</span>}
          </span>
        );
      })}
    </>
  );
}
