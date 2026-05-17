"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

/**
 * Hero narratif — landing v2.
 *
 * Le frame validé : on parle au cadre 42 ans qui voit l'IA arriver et
 * croit avoir le choix entre ignorer (1) ou redevenir junior (2). On lui
 * propose la 3e voie. CTA Founding Member, urgence pré-lancement.
 *
 * Animations : split-text par mot sur 3 lignes en stagger, glow vert
 * en pulse continu sur le mot "3e", grille de fond animée, shimmer sur
 * le CTA. Pas de blobs, pas de glassmorphism — vibe Linear 2026.
 */

const lineWords = (text: string) => text.split(" ");

export function HeroNarrative() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  // Subtle fade-out as user scrolls — no parallax bourrin
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.5]);
  const y = useTransform(scrollYProgress, [0, 0.6], [0, 40]);

  // Stagger config — chaque ligne a son propre delay de base, puis chaque
  // mot dans la ligne stagger de 40ms
  const lineDelays = [0.25, 0.6, 0.95];
  const subtitleDelay = 1.4;
  const ctaDelay = 1.7;

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden min-h-[100svh] flex items-center"
    >
      {/* ── BACKGROUND LAYERS ─────────────────────────────────────── */}

      {/* Grid pattern — fine lines en pulse subtil */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      {/* Radial glow top-right — discret, statique */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.10) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      {/* Subtle vignette top to give weight to text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 30%, transparent 70%, hsl(var(--background)) 100%)",
        }}
      />

      {/* ── CONTENT ──────────────────────────────────────────────── */}

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 mx-auto max-w-5xl px-6 md:px-12 py-32 md:py-40 text-center"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-10"
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{
              opacity: [0.6, 1, 0.6],
              boxShadow: [
                "0 0 0px hsl(var(--primary))",
                "0 0 8px hsl(var(--primary))",
                "0 0 0px hsl(var(--primary))",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Career OS · Pré-lancement
          </span>
        </motion.div>

        {/* Headline 3 lignes — split-text par mot */}
        <h1 className="font-headline font-extrabold tracking-[-0.03em] text-foreground text-balance text-[clamp(2.25rem,6.5vw,5.25rem)] leading-[1.05]">
          {/* Line 1 */}
          <AnimatedLine delay={lineDelays[0]} className="block">
            {lineWords("Director Marketing à 42 ans.")}
          </AnimatedLine>

          {/* Line 2 */}
          <AnimatedLine delay={lineDelays[1]} className="block mt-1.5 md:mt-3">
            {lineWords("Vous voyez l'IA arriver.")}
          </AnimatedLine>

          {/* Line 3 — avec accent sur "3e" */}
          <AnimatedLine
            delay={lineDelays[2]}
            className="block mt-1.5 md:mt-3"
            renderWord={(word, i, isLast) => {
              const isAccent = word === "3e";
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: lineDelays[2] + i * 0.04,
                    ease: [0.25, 0.4, 0.25, 1],
                  }}
                  className={`inline-block ${isAccent ? "relative" : ""}`}
                >
                  {isAccent ? (
                    <motion.span
                      className="text-primary inline-block"
                      style={{
                        textShadow:
                          "0 0 24px hsl(var(--primary) / 0.55), 0 0 60px hsl(var(--primary) / 0.25)",
                      }}
                      animate={{
                        textShadow: [
                          "0 0 24px hsl(var(--primary) / 0.55), 0 0 60px hsl(var(--primary) / 0.25)",
                          "0 0 32px hsl(var(--primary) / 0.75), 0 0 80px hsl(var(--primary) / 0.35)",
                          "0 0 24px hsl(var(--primary) / 0.55), 0 0 60px hsl(var(--primary) / 0.25)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                      }}
                    >
                      {word}
                    </motion.span>
                  ) : (
                    word
                  )}
                  {!isLast && " "}
                </motion.span>
              );
            }}
          >
            {lineWords("Vous avez 2 choix — on vous propose le 3e.")}
          </AnimatedLine>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: subtitleDelay,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className="mt-8 md:mt-10 text-base md:text-lg text-muted-foreground/90 leading-relaxed max-w-2xl mx-auto text-pretty"
        >
          Ignorer la vague ou redevenir junior à 40 ans n&apos;en sont pas.
          NextMove construit votre 3e voie : capitaliser sur vos 15+ ans
          d&apos;expérience et y greffer une couche data/IA.
          <span className="text-foreground font-medium">
            {" "}
            Sans tout recommencer.
          </span>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: ctaDelay,
            ease: [0.25, 0.4, 0.25, 1],
          }}
          className="mt-10 md:mt-12 flex flex-col items-center gap-4"
        >
          <Link
            href="/founding-members"
            className="group relative inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-primary text-primary-foreground text-[15px] font-semibold overflow-hidden transition-transform duration-300 hover:scale-[1.02] shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.6)]"
          >
            {/* Shimmer */}
            <motion.span
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(110deg, transparent 30%, hsl(0 0% 100% / 0.18) 50%, transparent 70%)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1.5,
              }}
            />
            <span className="relative">
              Candidate au programme Founding Member
            </span>
            <ArrowRight className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <p className="text-xs text-muted-foreground/80">
            <span className="text-primary font-semibold">9€/mois à vie</span>
            {" · "}
            <span className="text-foreground/80">30 places</span>
            {" · "}
            sélection sous 48h
          </p>

          <Link
            href="#pricing"
            className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 group"
          >
            <span>Plutôt voir le produit complet</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2.5 }}
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
 * Internal — anime une ligne de la headline en stagger par mot.
 * Permet à la ligne 3 d'overrider le rendu pour styliser "3e".
 */
function AnimatedLine({
  children,
  delay,
  className = "",
  renderWord,
}: {
  children: string[];
  delay: number;
  className?: string;
  renderWord?: (word: string, i: number, isLast: boolean) => React.ReactNode;
}) {
  return (
    <span className={className}>
      {children.map((word, i) => {
        const isLast = i === children.length - 1;
        if (renderWord) return renderWord(word, i, isLast);
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: delay + i * 0.04,
              ease: [0.25, 0.4, 0.25, 1],
            }}
            className="inline-block"
          >
            {word}
            {!isLast && " "}
          </motion.span>
        );
      })}
    </span>
  );
}
