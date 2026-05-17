"use client";

import { Sparkles, Brain, ArrowRight, User, Zap, TrendingUp, Route } from "lucide-react";
import Link from "next/link";
import { renderInlineMarkdown } from "@/lib/utils/render-markdown";
import { cn } from "@/lib/utils";
import { CareerOsBilan } from "@/components/career-os/bilan-renderer";

interface AiSummaryProps {
  aiSummary: string | null;
  hasCompletedOnboarding: boolean;
}

/**
 * Detect whether the stored summary follows the new Career OS bilan
 * format (consultant-style, headings like "# Synthèse", "# Diagnostic")
 * versus the legacy 4-section format ("**Profil détecté**", etc.).
 *
 * Old summaries (pre-2026-05-17) stay rendered with the legacy parser;
 * new summaries get the document-style renderer.
 */
function isCareerOsBilanFormat(text: string): boolean {
  return /^#\s+Synth[èe]se\b/m.test(text) && /^#\s+Diagnostic\b/m.test(text);
}

interface ParsedSection {
  title: string;
  content: string[];
  icon: React.ElementType;
  accentColor: string;
}

/**
 * Strip CJK and markdown artifacts
 */
function cleanText(text: string): string {
  return text
    .replace(/[\u2E80-\u9FFF\uF900-\uFAFF]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Parse AI summary into 4 structured sections
 */
function parseSections(text: string): ParsedSection[] {
  const cleaned = cleanText(text);

  const sectionConfigs: { pattern: RegExp; title: string; icon: React.ElementType; accentColor: string }[] = [
    { pattern: /profil\s*d[ée]tect[ée]/i, title: "Profil détecté", icon: User, accentColor: "text-primary border-primary/30 bg-primary/5" },
    { pattern: /forces?\s*cl[ée]s?/i, title: "Forces clés", icon: Zap, accentColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" },
    { pattern: /axes?\s*de\s*progression/i, title: "Axes de progression", icon: TrendingUp, accentColor: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
    { pattern: /parcours\s*recommand[ée]/i, title: "Parcours recommandé", icon: Route, accentColor: "text-blue-400 border-blue-500/30 bg-blue-500/5" },
  ];

  // Split text into sections using ** headers **
  const lines = cleaned.split("\n");
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line is a section header
    const headerText = trimmed.replace(/\*\*/g, "").replace(/:$/, "").trim();
    const matchedConfig = sectionConfigs.find((c) => c.pattern.test(headerText));

    if (matchedConfig) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        title: matchedConfig.title,
        content: [],
        icon: matchedConfig.icon,
        accentColor: matchedConfig.accentColor,
      };
    } else if (currentSection) {
      currentSection.content.push(trimmed);
    }
  }
  if (currentSection) sections.push(currentSection);

  return sections;
}

export function AiSummary({ aiSummary, hasCompletedOnboarding }: AiSummaryProps) {
  if (!aiSummary) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-headline text-sm font-bold text-foreground">Diagnostic IA</h3>
        </div>
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
      </div>
    );
  }

  // New Career OS bilan format → use the document-style renderer
  if (isCareerOsBilanFormat(aiSummary)) {
    return <CareerOsBilan content={aiSummary} />;
  }

  const sections = parseSections(aiSummary);

  // If parsing found sections, render structured view
  if (sections.length >= 2) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-headline text-sm font-bold text-foreground">Diagnostic IA</h3>
        </div>

        <div className="space-y-4">
          {sections.map((section, i) => {
            const Icon = section.icon;
            const colors = section.accentColor.split(" ");
            const textColor = colors[0];
            const borderColor = colors[1];
            const bgColor = colors[2];

            return (
              <div
                key={i}
                className={cn("border rounded-xl p-4 transition-all", borderColor, bgColor)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("w-4 h-4", textColor)} />
                  <h4 className={cn("text-xs font-headline font-bold uppercase tracking-wider", textColor)}>
                    {section.title}
                  </h4>
                </div>
                <div className="space-y-1.5 ml-6">
                  {section.content.map((line, j) => {
                    // List items
                    if (line.startsWith("- ") || line.startsWith("• ")) {
                      return (
                        <div key={j} className="flex gap-2 items-start">
                          <div className={cn("w-1 h-1 rounded-full mt-1.5 shrink-0", textColor.replace("text-", "bg-"))} />
                          <span className="text-[11px] text-muted-foreground leading-relaxed">
                            {renderInlineMarkdown(line.substring(2))}
                          </span>
                        </div>
                      );
                    }
                    // Numbered items
                    if (/^\d+[\.\)]\s/.test(line)) {
                      const num = line.match(/^(\d+)/)?.[1] || "1";
                      const content = line.replace(/^\d+[\.\)]\s*/, "");
                      return (
                        <div key={j} className="flex gap-2 items-start">
                          <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5", textColor, textColor.replace("text-", "bg-").replace("400", "500/15"))}>
                            {num}
                          </span>
                          <span className="text-[11px] text-muted-foreground leading-relaxed">
                            {renderInlineMarkdown(content)}
                          </span>
                        </div>
                      );
                    }
                    // Regular text
                    return (
                      <p key={j} className="text-[11px] text-muted-foreground leading-relaxed">
                        {renderInlineMarkdown(line)}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback: render raw text with basic formatting
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-headline text-sm font-bold text-foreground">Diagnostic IA</h3>
      </div>
      <div className="space-y-1">
        {cleanText(aiSummary).split("\n").filter(l => l.trim()).map((line, i) => {
          const trimmed = line.trim();
          if (/^\*\*[^*]+\*\*\s*:?\s*$/.test(trimmed)) {
            const title = trimmed.replace(/\*\*/g, "").replace(/:$/, "").trim();
            return (
              <h4 key={i} className="font-headline text-xs font-bold text-primary uppercase tracking-wider mt-3 mb-1.5 first:mt-0">
                {title}
              </h4>
            );
          }
          if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
            return (
              <div key={i} className="flex gap-2 items-start ml-1 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  {renderInlineMarkdown(trimmed.substring(2))}
                </span>
              </div>
            );
          }
          return (
            <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">
              {renderInlineMarkdown(trimmed)}
            </p>
          );
        })}
      </div>
    </div>
  );
}
