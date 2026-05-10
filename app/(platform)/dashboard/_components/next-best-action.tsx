"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Sparkles,
  Check,
  X,
  Loader2,
  ListChecks,
  FileCheck,
  GraduationCap,
  Briefcase,
  Crown,
  TrendingUp,
  Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  completeCurrentAction,
  skipCurrentAction,
} from "@/lib/orchestrator/actions";

export type NextBestActionProps = {
  template: string;
  title: string;
  why: string;
  cta: string;
  href: string;
  // Icon name string — we resolve to a component client-side because
  // function references can't cross the server/client boundary.
  iconName: string;
  estimatedMinutes: number;
  readinessSnapshot: number;
};

const ICON_MAP: Record<string, LucideIcon> = {
  ListChecks,
  Sparkles,
  FileCheck,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Crown,
  Award,
};

export function NextBestAction({
  title,
  why,
  cta,
  href,
  iconName,
  estimatedMinutes,
  readinessSnapshot,
}: NextBestActionProps) {
  const Icon = ICON_MAP[iconName] ?? Sparkles;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSkip, setShowSkip] = useState(false);

  const handleComplete = () => {
    startTransition(async () => {
      await completeCurrentAction();
      router.refresh();
    });
  };

  const handleSkip = () => {
    startTransition(async () => {
      await skipCurrentAction();
      router.refresh();
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-primary/10 via-surface-container-lowest to-surface-container-low border border-primary/20">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative space-y-4">
        {/* Top row */}
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-widest font-bold">
            Cette semaine, je te recommande
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-headline text-xl md:text-2xl font-black text-foreground leading-tight">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {why}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~{estimatedMinutes} min
          </span>
          {readinessSnapshot > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              Readiness {readinessSnapshot}%
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all hover:scale-[1.02]"
          >
            {cta}
            <Sparkles className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleComplete}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-bold disabled:opacity-50"
            title="Marquer cette recommandation comme faite"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">C'est fait</span>
          </button>

          {!showSkip ? (
            <button
              onClick={() => setShowSkip(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Pas pertinent ?
            </button>
          ) : (
            <div className="inline-flex items-center gap-2">
              <button
                onClick={handleSkip}
                disabled={isPending}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold disabled:opacity-50"
              >
                <X className="w-3 h-3" /> Suivante
              </button>
              <button
                onClick={() => setShowSkip(false)}
                className="text-xs text-muted-foreground"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
