"use client";

import { Crown, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradeWallProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export function UpgradeWall({
  title = "Fonctionnalité Premium",
  description = "Passe au plan Pro pour débloquer cette fonctionnalité et accélérer ta transition.",
  compact = false,
}: UpgradeWallProps) {
  if (compact) {
    return (
      <Link
        href="/upgrade"
        className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 rounded-xl hover:border-primary/40 transition-colors group"
      >
        <Crown className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-bold text-foreground flex-1">
          {title}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform" />
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-primary/5 via-surface-container-low to-amber-500/5 rounded-2xl border border-primary/20">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center mb-4">
        <Crown className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-headline text-lg font-bold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>
      <Link
        href="/upgrade"
        className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
      >
        <Zap className="w-4 h-4" />
        Passer au Pro — 49€/mois
      </Link>
    </div>
  );
}
