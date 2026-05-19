"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FoundingPlace } from "@/lib/founding-members/places";

/**
 * Grille 6×5 = 30 places du programme Founding Member.
 * - Cases prises : vert foncé éteint, hover affiche un tooltip avec
 *   le rôle anonymisé + citation extraite de la motivation.
 * - Cases libres : vert primary vif, hover affiche "Votre place ?" +
 *   redirige vers /founding-members au clic.
 *
 * Mécanique d'urgence ancrée dans la réalité : chiffre dynamique lu
 * en DB côté serveur, pas un fake.
 */

interface FoundingPlacesGridProps {
  total: number;
  taken: number;
  occupants: FoundingPlace[];
}

const COLS = 6;
const ROWS = 5;

export function FoundingPlacesGrid({
  total,
  taken,
  occupants,
}: FoundingPlacesGridProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const remaining = Math.max(0, total - taken);

  // Map des occupants par index pour rendu rapide
  // Les `taken` premières cases sont occupées, le reste est libre
  const cells = Array.from({ length: total }, (_, i) => {
    if (i < taken) {
      return { type: "taken" as const, occupant: occupants[i] };
    }
    return { type: "free" as const };
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Radial glow vert */}
      <div
        className="absolute -top-10 -right-10 w-72 h-72 rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Header : "X / 30 places prises" + compteur restant */}
      <div className="absolute inset-x-7 top-7 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
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
            Programme Founding Member
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
          {taken}/{total} pris
        </span>
      </div>

      {/* Grille des 30 places, centrée */}
      <div className="absolute inset-x-7 top-20 bottom-32 flex items-center justify-center pointer-events-none">
        <div
          className="grid gap-2 md:gap-2.5 pointer-events-auto"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            width: "100%",
            maxWidth: "440px",
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
                  className="relative group/cell"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{
                      delay: 0.3 + i * 0.015,
                      duration: 0.35,
                    }}
                    className={cn(
                      "aspect-square rounded-md bg-primary cursor-pointer transition-all duration-300",
                      "shadow-[0_0_10px_hsl(var(--primary)/0.45)]",
                      isHovered &&
                        "scale-110 shadow-[0_0_20px_hsl(var(--primary)/0.75)]"
                    )}
                  />
                </Link>
              );
            }

            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="relative group/cell"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    delay: 0.3 + i * 0.015,
                    duration: 0.35,
                  }}
                  className={cn(
                    "aspect-square rounded-md bg-primary/15 border border-primary/20 cursor-default transition-all duration-300",
                    isHovered && "bg-primary/25 border-primary/40 scale-105"
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint nombre restant + CTA contextuel */}
      <div className="absolute inset-x-7 top-[15.5rem] md:top-[16.5rem] flex items-center justify-center pointer-events-none">
        <p className="text-[11px] text-muted-foreground/80 text-center">
          {remaining > 0 ? (
            <>
              <span className="font-bold text-primary">{remaining}</span> place
              {remaining > 1 ? "s" : ""} restante{remaining > 1 ? "s" : ""}
              {" · "}cliquez une case verte pour candidater
            </>
          ) : (
            <>
              <span className="font-bold text-amber-400">Programme complet</span>
              {" · "}rejoignez la liste d&apos;attente
            </>
          )}
        </p>
      </div>

      {/* Tooltip d'aperçu */}
      {hoveredIdx !== null && (
        <FoundingTooltip
          cell={cells[hoveredIdx]}
          memberNumber={hoveredIdx + 1}
          position={hoveredIdx}
          cols={COLS}
        />
      )}
    </div>
  );
}

/**
 * Tooltip affiché au hover d'une case. Placement intelligent :
 * - cases du haut de grille → tooltip vers le bas
 * - cases du bas → tooltip vers le haut
 */
function FoundingTooltip({
  cell,
  memberNumber,
  position,
  cols,
}: {
  cell: { type: "taken"; occupant: FoundingPlace } | { type: "free" };
  memberNumber: number;
  position: number;
  cols: number;
}) {
  const row = Math.floor(position / cols);
  const isUpperHalf = row < 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: isUpperHalf ? -4 : 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none",
        "max-w-[320px] w-[320px]",
        isUpperHalf ? "top-[15.5rem] md:top-[16.5rem]" : "top-20"
      )}
    >
      <div className="bg-surface-container-highest/95 backdrop-blur-md border border-primary/30 rounded-xl p-4 shadow-2xl">
        {cell.type === "taken" ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="text-[9px] uppercase tracking-widest font-bold text-primary/80">
                  Founding Member
                </span>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground/70">
                #{memberNumber.toString().padStart(2, "0")}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground mb-3 leading-tight">
              {cell.occupant.role}
            </p>

            {cell.occupant.situation && (
              <div className="mb-2.5">
                <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-1">
                  Situation
                </p>
                <p className="text-[11px] text-muted-foreground/95 italic leading-relaxed">
                  «&nbsp;{cell.occupant.situation}&nbsp;»
                </p>
              </div>
            )}

            {cell.occupant.motivation && (
              <div className="mb-2">
                <p className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-1">
                  Motivation
                </p>
                <p className="text-[11px] text-muted-foreground/95 italic leading-relaxed">
                  «&nbsp;{cell.occupant.motivation}&nbsp;»
                </p>
              </div>
            )}

            {cell.occupant.acceptedAt && (
              <p className="text-[9px] text-muted-foreground/60 mt-3 pt-2 border-t border-border/30">
                Accepté le{" "}
                {new Date(cell.occupant.acceptedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest font-bold text-primary">
                  Place libre
                </span>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground/70">
                #{memberNumber.toString().padStart(2, "0")}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">
              Votre place ?
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Cliquez pour accéder au formulaire de candidature. Sélection sous 48h.
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
