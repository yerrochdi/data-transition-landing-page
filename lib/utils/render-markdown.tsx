import React from "react";

/**
 * Strip non-Latin characters (Chinese, Japanese, etc.) that Moonshot sometimes injects.
 * Keeps Latin, accented chars, digits, punctuation, emojis, and common symbols.
 */
function stripNonLatin(text: string): string {
  // Remove CJK unified ideographs and CJK symbols
  return text.replace(/[\u2E80-\u9FFF\uF900-\uFAFF]/g, "").replace(/\s{2,}/g, " ").trim();
}

/**
 * Render inline markdown: **bold** → <strong>
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  const cleaned = stripNonLatin(text);
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Render a block of markdown text with basic formatting:
 * - **Bold headers** on their own line
 * - List items (- or •)
 * - Numbered items (1. or 1))
 * - Regular paragraphs with inline bold
 */
export function renderMarkdownBlock(text: string): React.ReactNode[] {
  const cleaned = stripNonLatin(text);
  const lines = cleaned.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // Bold headers: **Title**
    if (/^\*\*[^*]+\*\*\s*:?\s*$/.test(trimmed)) {
      const title = trimmed.replace(/\*\*/g, "").replace(/:$/, "").trim();
      elements.push(
        <h4
          key={i}
          className="font-headline text-xs font-bold text-primary uppercase tracking-wider mt-4 mb-2 first:mt-0"
        >
          {title}
        </h4>
      );
      return;
    }

    // List items: - text or • text
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const content = trimmed.substring(2);
      elements.push(
        <div key={i} className="flex gap-2 items-start ml-1 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-1.5 shrink-0" />
          <span className="text-xs text-muted-foreground leading-relaxed">
            {renderInlineMarkdown(content)}
          </span>
        </div>
      );
      return;
    }

    // Numbered items: 1. text or 1) text
    if (/^\d+[\.\)]\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)/)?.[1] || "1";
      const content = trimmed.replace(/^\d+[\.\)]\s*/, "");
      elements.push(
        <div key={i} className="flex gap-3 items-start mb-2">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {num}
          </span>
          <span className="text-xs text-muted-foreground leading-relaxed">
            {renderInlineMarkdown(content)}
          </span>
        </div>
      );
      return;
    }

    // Regular text with inline bold
    elements.push(
      <p key={i} className="text-xs text-muted-foreground leading-relaxed mb-1">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  return elements;
}
