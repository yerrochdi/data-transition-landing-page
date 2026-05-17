/**
 * <CareerOsBilan> — renders the AI-generated career bilan as a long-form
 * document, NOT as Material-style cards. The goal is to feel like a
 * consultant's deliverable (Notion / Medium typography), so the user
 * believes a human took the time to write it for them.
 *
 * Markdown parsing is deliberately lightweight (no external lib) — the
 * prompt enforces a strict structure we can rely on.
 */
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerOsBilanProps {
  content: string;
  signerName?: string;
  signerTitle?: string;
  /** Hides the surrounding chrome (header + signature). Use when the
   * bilan is rendered inside another shell, e.g. the public page. */
  bare?: boolean;
}

/**
 * Strip CJK ideographs and other non-Latin characters the model
 * sometimes leaks in despite the system prompt.
 */
function cleanText(text: string): string {
  return text
    .replace(/[⺀-鿿豈-﫿]/g, "")
    .replace(/　/g, " ");
}

/**
 * Render a single line of markdown-flavoured text with **bold** support.
 */
function renderInline(line: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "spacer" };

/**
 * Parse the bilan markdown into a flat sequence of blocks. We support
 * headings (#, ##, ###), bullet lists (-) and paragraphs.
 */
function parseBlocks(raw: string): Block[] {
  const lines = cleanText(raw).split("\n");
  const blocks: Block[] = [];
  let listBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length) {
      blocks.push({ type: "ul", items: listBuffer });
      listBuffer = [];
    }
  };
  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      blocks.push({ type: "p", text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h1", text: trimmed.replace(/^#\s+/, "") });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: trimmed.replace(/^##\s+/, "") });
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: trimmed.replace(/^###\s+/, "") });
      continue;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      listBuffer.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }

    // Regular text — accumulate into current paragraph
    flushList();
    paragraphBuffer.push(trimmed);
  }
  flushParagraph();
  flushList();

  return blocks;
}

export function CareerOsBilan({
  content,
  signerName = "Yassine Errochdi",
  signerTitle = "Fondateur de NextMove",
  bare = false,
}: CareerOsBilanProps) {
  const blocks = parseBlocks(content);
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article
      className={cn(
        "max-w-3xl mx-auto",
        !bare && "bg-surface-container-low rounded-2xl ghost-border p-8 md:p-12"
      )}
    >
      {/* Document header */}
      {!bare && (
        <header className="mb-10 pb-6 border-b border-border/30">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">
              Career OS · version 1
            </span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-black text-foreground mb-2">
            Bilan personnel
          </h1>
          <p className="text-xs text-muted-foreground">
            Rédigé le {today} · NextMove
          </p>
        </header>
      )}

      {/* Document body */}
      <div className="space-y-1 font-serif-like">
        {blocks.map((block, i) => {
          switch (block.type) {
            case "h1":
              return (
                <h2
                  key={i}
                  className="font-headline text-xl md:text-2xl font-bold text-foreground mt-10 mb-4 first:mt-0"
                >
                  {block.text}
                </h2>
              );
            case "h2":
              return (
                <h3
                  key={i}
                  className="font-headline text-lg font-bold text-foreground mt-6 mb-3"
                >
                  {block.text}
                </h3>
              );
            case "h3":
              return (
                <h4
                  key={i}
                  className="font-headline text-base font-bold text-foreground mt-4 mb-2"
                >
                  {block.text}
                </h4>
              );
            case "p":
              return (
                <p
                  key={i}
                  className="text-[15px] leading-[1.75] text-foreground/90 my-3"
                >
                  {renderInline(block.text)}
                </p>
              );
            case "ul":
              return (
                <ul
                  key={i}
                  className="list-disc pl-6 space-y-2 my-4 text-[15px] leading-[1.7] text-foreground/90 marker:text-primary"
                >
                  {block.items.map((item, j) => (
                    <li key={j}>{renderInline(item)}</li>
                  ))}
                </ul>
              );
            case "spacer":
              return <div key={i} className="h-4" />;
          }
        })}
      </div>

      {/* Signature */}
      {!bare && (
        <footer className="mt-12 pt-6 border-t border-border/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              YE
            </div>
            <div>
              <p className="font-headline text-base font-bold text-foreground">
                {signerName}
              </p>
              <p className="text-xs text-muted-foreground mb-2">{signerTitle}</p>
              <p className="text-xs text-muted-foreground italic max-w-md leading-relaxed">
                Ce bilan a été rédigé sur la base du dossier que vous avez
                partagé. Il continuera d&apos;évoluer avec votre carrière —
                votre Career OS reste votre compagnon, version après version.
              </p>
            </div>
          </div>
        </footer>
      )}
    </article>
  );
}
