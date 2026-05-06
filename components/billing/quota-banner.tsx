import Link from "next/link";
import { AlertCircle, Zap, ArrowRight } from "lucide-react";

/**
 * Inline banner shown when a daily quota is exhausted. Encourages an
 * upgrade with a clear CTA. Used at the top of the feature page where
 * the quota was hit (eg. /agents for Copilot, task session viewer, etc.).
 */
export function QuotaExceededBanner({
  resource,
  used,
  limit,
  ctaHref = "/upgrade",
}: {
  resource: "copilot" | "session";
  used: number;
  limit: number;
  ctaHref?: string;
}) {
  const labels = {
    copilot: {
      title: "Tu as utilisé tous tes messages Copilot du jour",
      description: `${used}/${limit} messages utilisés. Reviens demain ou passe à un plan supérieur pour des messages illimités.`,
    },
    session: {
      title: "Tu as utilisé toutes tes sessions IA du jour",
      description: `${used}/${limit} sessions utilisées. Reviens demain ou passe à un plan supérieur pour des sessions illimitées.`,
    },
  }[resource];

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-headline text-sm font-bold text-foreground mb-1">
          {labels.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {labels.description}
        </p>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1.5 gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform"
        >
          <Zap className="w-3.5 h-3.5" />
          Voir les plans
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Compact pill shown in the UI to display remaining quota
 * (eg. in the topbar or above an input). Does NOT block usage.
 */
export function QuotaIndicator({
  used,
  limit,
  label,
}: {
  used: number;
  limit: number | null;
  label: string;
}) {
  if (limit === null) {
    return (
      <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
        ∞ {label}
      </span>
    );
  }

  const remaining = Math.max(0, limit - used);
  const isLow = remaining <= 2;

  return (
    <span
      className={`inline-flex items-center gap-1 border text-[10px] font-bold px-2 py-0.5 rounded-full ${
        isLow
          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
          : "bg-surface-container-lowest border-border/30 text-muted-foreground"
      }`}
    >
      {remaining}/{limit} {label}
    </span>
  );
}
