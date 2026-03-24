"use client";

import { Sparkles, Brain, ArrowRight } from "lucide-react";
import Link from "next/link";
import { renderMarkdownBlock } from "@/lib/utils/render-markdown";

interface AiSummaryProps {
  aiSummary: string | null;
  hasCompletedOnboarding: boolean;
}

export function AiSummary({ aiSummary, hasCompletedOnboarding }: AiSummaryProps) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-headline text-sm font-bold text-foreground">Diagnostic IA</h3>
      </div>
      {aiSummary ? (
        <div className="space-y-0">{renderMarkdownBlock(aiSummary)}</div>
      ) : (
        <div className="text-center py-6">
          <Brain className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-xs text-muted-foreground mb-4">
            {hasCompletedOnboarding
              ? "Aucun résumé IA disponible."
              : "Complétez votre diagnostic pour obtenir une analyse personnalisée."}
          </p>
          {!hasCompletedOnboarding && (
            <Link
              href="/onboarding"
              className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Lancer le diagnostic
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
