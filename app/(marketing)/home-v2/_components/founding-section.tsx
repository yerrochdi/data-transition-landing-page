"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Crown,
  Check,
  ArrowRight,
  MessageSquare,
  Calendar,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FoundingPlace, FoundingPlacesStatus } from "@/lib/founding-members/places";

/**
 * Section 7 — Programme Founding Member.
 *
 * Section de conversion finale en 3 blocs :
 * 1. Pitch du programme (30 places, 9€/mois à vie, le deal founding)
 * 2. Grille des 30 places en grand format (rappel de la mécanique
 *    d'urgence vue en Section 2, ici au moment de décider)
 * 3. "Qui je suis" — le fondateur porte le programme (photo + bio)
 */

const COLS = 10; // 10×3 = 30, plus large/aplati pour le hero
const ROWS = 3;

interface FoundingSectionProps {
  foundingPlaces: FoundingPlacesStatus;
}

export function FoundingSection({ foundingPlaces }: FoundingSectionProps) {
  const { total, taken, remaining, occupants } = foundingPlaces;

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
      {/* Glow d'ambiance */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[60%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* ── Bloc 1 : Pitch ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-primary/5 mb-6">
            <Crown className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Programme Founding Member
            </span>
          </div>
          <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground text-balance">
            30 places. 9€/mois à vie. Sur sélection.
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground/90 leading-relaxed text-pretty">
            Les 30 premiers cadres qui rejoignent NextMove obtiennent l&apos;accès
            Pro complet, à tarif fondateur, gelé{" "}
            <span className="text-foreground font-semibold">à vie</span>. En
            échange, vous façonnez le produit avec moi.
          </p>
        </motion.div>

        {/* ── Bloc 2 : Grille des 30 places ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="bg-surface-container-lowest border border-border/40 rounded-3xl p-7 md:p-10 mb-8"
        >
          <PlacesGridLarge total={total} taken={taken} occupants={occupants} />

          {/* Compteur + CTA */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <p className="text-sm text-muted-foreground text-center">
              {remaining > 0 ? (
                <>
                  <span className="font-bold text-primary text-lg">
                    {remaining}
                  </span>{" "}
                  place{remaining > 1 ? "s" : ""} encore disponible
                  {remaining > 1 ? "s" : ""} sur {total}
                </>
              ) : (
                <span className="font-bold text-amber-400">
                  Programme complet — liste d&apos;attente ouverte
                </span>
              )}
            </p>
            <Link
              href="/founding-members"
              className="group inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.7)]"
            >
              Candidater au programme
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="text-xs text-muted-foreground/70">
              Sélection sous 48h · sans engagement
            </p>
          </div>
        </motion.div>

        {/* ── Le deal founding : ce que vous donnez en échange ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="grid sm:grid-cols-3 gap-4 mb-16"
        >
          {[
            {
              Icon: MessageSquare,
              title: "1 retour / semaine",
              desc: "Pendant 3 mois. Ce qui marche, ce qui cloche, sans filtre.",
            },
            {
              Icon: Calendar,
              title: "1 call / mois avec moi",
              desc: "30 min en visio pour caler votre trajectoire et le produit.",
            },
            {
              Icon: Heart,
              title: "Honnêteté brute",
              desc: "Vous me dites la vérité, je vous construis le bon produit.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-surface-container-lowest border border-border/40 rounded-2xl p-5"
            >
              <item.Icon className="w-6 h-6 text-primary mb-3" />
              <p className="font-bold text-foreground text-sm mb-1.5">
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── Bloc 3 : Qui je suis ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="bg-gradient-to-br from-primary/8 to-surface-container-lowest border border-primary/15 rounded-3xl p-7 md:p-10"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Photo */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-primary/20 ring-4 ring-primary/5">
                <Image
                  src="/founder.png"
                  alt="Yassine Errochdi, fondateur de NextMove"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-2">
                Ce programme, c&apos;est moi qui le porte
              </p>
              <h3 className="font-headline text-xl md:text-2xl font-extrabold text-foreground mb-3">
                Yassine Errochdi
              </h3>
              <p className="text-sm md:text-base text-muted-foreground/90 leading-relaxed max-w-xl">
                Fondateur de DataKeaAI et chef de produit en intelligence
                artificielle. J&apos;ai accompagné des cadres et des équipes dans
                leur montée en compétence data. NextMove est né d&apos;un constat
                simple :{" "}
                <span className="text-foreground font-medium">
                  les cadres expérimentés n&apos;ont pas besoin de tout
                  recommencer, ils ont besoin d&apos;un système.
                </span>{" "}
                Sur les 30 premières places, je sélectionne et j&apos;accompagne
                personnellement chaque membre.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Grille des 30 places, version grand format pour la section Founding.
 * 10×3, cases plus grandes, hover tooltip identique à la version bento.
 */
function PlacesGridLarge({
  total,
  taken,
  occupants,
}: {
  total: number;
  taken: number;
  occupants: FoundingPlace[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cells = Array.from({ length: total }, (_, i) =>
    i < taken
      ? { type: "taken" as const, occupant: occupants[i] }
      : { type: "free" as const }
  );

  return (
    <div className="relative">
      <div
        className="grid gap-2.5 md:gap-3 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          maxWidth: "640px",
        }}
      >
        {cells.map((cell, i) => {
          const isHovered = hoveredIdx === i;

          if (cell.type === "free") {
            return (
              <Link
                key={i}
                href="/founding-members"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="relative"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: 0.2 + i * 0.012, duration: 0.3 }}
                  className={cn(
                    "aspect-square rounded-lg bg-primary cursor-pointer transition-all duration-300",
                    "shadow-[0_0_12px_hsl(var(--primary)/0.45)]",
                    isHovered &&
                      "scale-110 shadow-[0_0_22px_hsl(var(--primary)/0.8)]"
                  )}
                />
                {isHovered && <TooltipFree number={i + 1} pos={i} />}
              </Link>
            );
          }

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: 0.2 + i * 0.012, duration: 0.3 }}
                className={cn(
                  "aspect-square rounded-lg bg-primary/15 border border-primary/20 transition-all duration-300",
                  isHovered && "bg-primary/25 border-primary/40 scale-105"
                )}
              />
              {isHovered && (
                <TooltipTaken
                  occupant={cell.occupant}
                  number={i + 1}
                  pos={i}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TooltipTaken({
  occupant,
  number,
  pos,
}: {
  occupant: FoundingPlace;
  number: number;
  pos: number;
}) {
  const row = Math.floor(pos / COLS);
  const below = row === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: below ? -4 : 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none w-[280px]",
        below ? "top-full mt-3" : "bottom-full mb-3"
      )}
    >
      <div className="bg-surface-container-highest/95 backdrop-blur-md border border-primary/30 rounded-xl p-3.5 shadow-2xl text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] uppercase tracking-widest font-bold text-primary/80">
            Founding Member
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/70">
            #{number.toString().padStart(2, "0")}
          </span>
        </div>
        <p className="text-xs font-bold text-foreground mb-2">{occupant.role}</p>
        {occupant.motivation && (
          <p className="text-[11px] text-muted-foreground/95 italic leading-relaxed">
            «&nbsp;{occupant.motivation}&nbsp;»
          </p>
        )}
      </div>
    </motion.div>
  );
}

function TooltipFree({ number, pos }: { number: number; pos: number }) {
  const row = Math.floor(pos / COLS);
  const below = row === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: below ? -4 : 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none w-[220px]",
        below ? "top-full mt-3" : "bottom-full mb-3"
      )}
    >
      <div className="bg-surface-container-highest/95 backdrop-blur-md border border-primary/30 rounded-xl p-3.5 shadow-2xl text-left">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] uppercase tracking-widest font-bold text-primary">
            Place libre
          </span>
          <span className="text-[9px] font-mono text-muted-foreground/70">
            #{number.toString().padStart(2, "0")}
          </span>
        </div>
        <p className="text-sm font-bold text-foreground mb-0.5">Votre place ?</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Cliquez pour candidater.
        </p>
      </div>
    </motion.div>
  );
}
