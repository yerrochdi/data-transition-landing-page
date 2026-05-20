"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowRight, FileText, Check } from "lucide-react";

/**
 * Section 6 — "Le bilan personnel".
 *
 * Asset différenciant de NextMove : on montre un aperçu réaliste du
 * bilan style consultant généré à la fin de l'onboarding (cf. sprint
 * Career OS, buildSummaryPrompt). Pattern teaser premium : on montre
 * les 2-3 premières sections en entier, puis fondu + overlay CTA pour
 * créer le désir de lire la suite.
 *
 * L'exemple reprend le profil de Marc (DAF) vu en Section 5 → continuité.
 */

export function BilanShowcase() {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
          {/* Colonne gauche — argumentaire */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-px bg-primary/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Votre point de départ
              </span>
            </div>
            <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground text-balance">
              Un bilan écrit pour vous. Pas un rapport ChatGPT.
            </h2>
            <p className="mt-5 text-base md:text-lg text-muted-foreground/90 leading-relaxed text-pretty">
              À la fin de votre diagnostic, vous recevez un bilan rédigé comme
              le ferait un consultant carrière senior. Votre positionnement
              réel, vos forces qui valent vraiment, vos angles morts, et le
              next move qu&apos;on vous recommande — précisément pour vous.
            </p>

            <ul className="mt-7 space-y-3">
              {[
                "3 pages, structure de cabinet (Bain / Korn Ferry)",
                "Cite vos vrais éléments — pas du blabla générique",
                "Une recommandation assumée, pas 4 options molles",
                "Il évolue avec vous — version après version",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-muted-foreground/90 leading-snug">
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/founding-members"
              className="group mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]"
            >
              Obtenir mon bilan
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Colonne droite — mockup du bilan */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative"
          >
            {/* Glow derrière le document */}
            <div
              className="absolute -inset-8 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.12) 0%, transparent 65%)",
                filter: "blur(40px)",
              }}
            />

            {/* Le document */}
            <div className="relative bg-surface-container-lowest border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
              {/* Barre de fenêtre */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-surface-container-low">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                <span className="ml-2 text-[10px] text-muted-foreground/60 font-mono">
                  bilan-career-os.pdf
                </span>
              </div>

              {/* Contenu du bilan — hauteur fixe + fondu en bas */}
              <div className="relative h-[30rem] overflow-hidden">
                <div className="p-7 md:p-9">
                  {/* En-tête doc */}
                  <div className="flex items-center gap-2 text-primary mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-bold">
                      Career OS · version 1
                    </span>
                  </div>
                  <h3 className="font-headline text-xl font-black text-foreground mb-1">
                    Bilan personnel
                  </h3>
                  <p className="text-[10px] text-muted-foreground/60 mb-5">
                    Rédigé pour Marc · DAF · Industrie
                  </p>

                  {/* Bloc visuel : jauge readiness + mini-stats */}
                  <div className="flex items-center gap-5 mb-6 p-4 rounded-xl bg-surface-container-low border border-border/30">
                    <ReadinessGauge target={68} />
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <MiniStat value="4" label="Forces" />
                      <MiniStat value="3" label="Gaps" />
                      <MiniStat value="82%" label="Réussite" accent />
                    </div>
                  </div>

                  {/* Synthèse */}
                  <h4 className="font-headline text-base font-bold text-foreground mt-6 mb-2">
                    Synthèse
                  </h4>
                  <p className="text-[13px] leading-[1.7] text-foreground/85 mb-4">
                    Marc, vous dirigez la finance d&apos;une ETI depuis 9 ans et
                    vous le faites bien — vos chiffres sont fiables, votre board
                    vous fait confiance. Mais vous dépendez d&apos;un cabinet
                    externe pour tout ce qui touche au prédictif, et ça vous met
                    mal à l&apos;aise. Votre objectif (devenir le DAF qui pilote
                    sa propre intelligence financière) est{" "}
                    <strong className="text-foreground">réaliste</strong> — à
                    condition de ne pas tomber dans le piège du « je vais
                    apprendre Python ».
                  </p>

                  {/* Lecture de votre profil */}
                  <h4 className="font-headline text-base font-bold text-foreground mt-6 mb-2">
                    Lecture de votre profil
                  </h4>
                  <p className="text-[13px] leading-[1.7] text-foreground/85 mb-3">
                    <strong className="text-foreground">
                      Ce que je lis de votre parcours.
                    </strong>{" "}
                    Neuf ans à la tête d&apos;une fonction finance, ça veut dire
                    une chose que les profils techniques n&apos;ont pas : vous
                    savez quelles questions valent la peine d&apos;être posées
                    aux données. C&apos;est exactement ce qui manque aux data
                    analysts qu&apos;on vous oppose…
                  </p>
                  <p className="text-[13px] leading-[1.7] text-foreground/85">
                    <strong className="text-foreground">
                      Ce que vos contraintes imposent.
                    </strong>{" "}
                    Avec 5h par semaine et un budget formation limité, on
                    oublie le bootcamp de 40h. On vise des outils que vous
                    pilotez sans coder…
                  </p>
                </div>

                {/* Fondu en bas */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, hsl(var(--surface-container-lowest)) 85%)",
                  }}
                />

                {/* Overlay CTA */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-highest/90 backdrop-blur-md border border-primary/30">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">
                      + Diagnostic, Recommandation, Plan 6 mois…
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Jauge circulaire readiness, s'anime de 0 → target quand visible. */
function ReadinessGauge({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame = 0;
    const duration = 40;
    const timer = setInterval(() => {
      frame++;
      setValue(Math.round((frame / duration) * target));
      if (frame >= duration) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [isInView, target]);

  const r = 26;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div ref={ref} className="relative w-[68px] h-[68px] shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="hsl(var(--surface-container-highest))"
          strokeWidth="5"
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.05s linear",
            filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline text-base font-black text-foreground leading-none">
          {value}%
        </span>
        <span className="text-[7px] uppercase tracking-widest text-muted-foreground/60 font-bold mt-0.5">
          Ready
        </span>
      </div>
    </div>
  );
}

/** Mini-stat du bloc visuel (Forces / Gaps / Réussite). */
function MiniStat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <p
        className={`font-headline text-lg font-black leading-none ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="text-[8px] uppercase tracking-widest text-muted-foreground/60 font-bold mt-1">
        {label}
      </p>
    </div>
  );
}
