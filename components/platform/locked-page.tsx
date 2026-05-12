import Link from "next/link";
import { Lock, ArrowRight, Sparkles } from "lucide-react";

/**
 * Generic "locked feature" teaser. Used when a user reaches a page they
 * haven't unlocked yet. Explains the requirement clearly and offers a
 * single next step. Keeps the user on-track instead of frustrated.
 */
export function LockedPage({
  title,
  reason,
  requirement,
  suggestedHref,
  suggestedCta,
  imagePreview,
}: {
  title: string;
  reason: string;
  requirement: string;
  suggestedHref: string;
  suggestedCta: string;
  imagePreview?: React.ReactNode;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-headline text-2xl md:text-3xl font-black text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          {reason}
        </p>
      </div>

      {/* Requirement card */}
      <div className="bg-gradient-to-br from-primary/10 to-surface-container-lowest border border-primary/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">
              Pour débloquer
            </p>
            <p className="text-base font-bold text-foreground mb-3">
              {requirement}
            </p>
            <Link
              href={suggestedHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
            >
              {suggestedCta}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Optional teaser preview (e.g. blurred opportunity cards) */}
      {imagePreview && (
        <div className="relative">
          <div className="opacity-30 blur-[2px] pointer-events-none select-none">
            {imagePreview}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}
    </div>
  );
}
