"use client";

import Link from "next/link";
import { Lock, Sparkles, ArrowRight } from "lucide-react";

/**
 * Wraps a feature behind a paywall. When `unlocked` is false, the
 * children are rendered visible but blurred and overlaid with an
 * upgrade CTA — the "Pattern B teaser" decided in Sprint 1.
 *
 * Why blur + tease instead of hard hide?
 *   Showing what the user is missing converts much better than a flat
 *   "this is locked" panel. The user sees the value, gets curious,
 *   and clicks through to upgrade.
 */
export function PaidFeatureGate({
  unlocked,
  children,
  title,
  description,
  ctaLabel = "Débloquer",
  ctaHref = "/upgrade",
  variant = "card",
}: {
  unlocked: boolean;
  children: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  variant?: "card" | "inline";
}) {
  if (unlocked) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content underneath, non-interactive */}
      <div
        aria-hidden
        className="pointer-events-none select-none blur-sm opacity-40"
      >
        {children}
      </div>

      {/* Overlay CTA */}
      <div
        className={
          variant === "card"
            ? "absolute inset-0 flex items-center justify-center p-6"
            : "absolute inset-0 flex items-center justify-center"
        }
      >
        <div className="bg-surface-container-high/95 backdrop-blur-sm border border-primary/30 rounded-2xl p-6 max-w-sm text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary mx-auto mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-headline text-base font-bold text-foreground mb-1.5">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {description}
            </p>
          )}
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {ctaLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
