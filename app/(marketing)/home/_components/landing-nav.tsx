"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { LandingPhaseConfig } from "@/lib/landing/phase";

/**
 * Nav flottante minimaliste de la landing v2.
 * - Logo NextMove à gauche
 * - "Se connecter" + CTA adaptatif (selon phase founding/open) à droite
 * - Devient opaque au scroll
 */
export function LandingNav({ phase }: { phase: LandingPhaseConfig }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/30"
          : "bg-transparent"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">N</span>
        </div>
        <span className="font-headline font-black text-lg text-foreground tracking-tight">
          NextMove
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        <Link
          href="/login"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Se connecter
        </Link>
        <Link
          href={phase.ctaHref}
          className="bg-primary text-primary-foreground px-4 md:px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all hover:scale-[1.02]"
        >
          {phase.phase === "founding" ? "Candidater" : "Commencer"}
        </Link>
      </div>
    </nav>
  );
}
