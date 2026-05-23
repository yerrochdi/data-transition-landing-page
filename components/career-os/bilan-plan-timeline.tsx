"use client";

/**
 * Timeline visuelle du plan d'action 6 mois.
 *
 * Le bilan markdown contient une section `# Plan d'action — 6 mois`
 * structurée en 3 phases ("Mois 1-2 : …", "Mois 3-4 : …", "Mois 5-6 : …").
 * Cet extracteur lit le markdown et transforme cette section en frise
 * visuelle (pastilles numérotées + cartes phase + ligne de progression).
 *
 * Si l'extraction échoue (format imprévu), on retourne null et le
 * renderer principal laissera la section markdown brute à la place.
 */
import { CheckCircle2, Sparkles } from "lucide-react";

export interface PlanPhase {
  /** Titre court de la phase ("Mois 1-2 : Diagnostic data interne") */
  title: string;
  /** Actions de la phase, déjà nettoyées (sans le tiret markdown). */
  actions: string[];
}

/**
 * Extrait les 3 phases du plan d'action depuis le markdown brut.
 * Tolérant aux variantes de formulation (numéro / virgule / espaces).
 * Retourne null si on n'a pas pu trouver au moins 2 phases.
 */
export function extractPlanPhases(markdown: string): PlanPhase[] | null {
  // Capture la section "# Plan d'action" jusqu'au prochain "# " ou la fin
  const sectionMatch = markdown.match(
    /#\s*Plan[\s\S]*?(?=\n#\s|\n# |$)/i
  );
  if (!sectionMatch) return null;

  const sectionText = sectionMatch[0];

  // Trouve chaque phase : ligne qui commence par "- **Mois X-Y …**" ou
  // "**Mois X-Y …**" ou similaire. On capture le titre + tout le texte
  // jusqu'à la prochaine phase ou la fin de section.
  const phaseRegex =
    /(?:^|\n)\s*-?\s*\*\*\s*(Mois\s*\d+[\s\S]*?)\*\*\s*([\s\S]*?)(?=(?:\n\s*-?\s*\*\*Mois)|$)/gi;
  const phases: PlanPhase[] = [];

  let match;
  while ((match = phaseRegex.exec(sectionText)) !== null) {
    const title = match[1].trim().replace(/\s+/g, " ");
    const body = match[2].trim();

    // Actions = lignes commençant par "- " ou "•" ou nettoyage d'une phrase courante
    const actions = body
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^[-•—]\s*/, "").trim())
      .filter((l) => l.length > 0 && l.length < 300);

    if (title && actions.length > 0) {
      phases.push({ title, actions });
    }
  }

  return phases.length >= 2 ? phases : null;
}

export function BilanPlanTimeline({ phases }: { phases: PlanPhase[] }) {
  return (
    <section className="my-10 not-prose">
      <h2 className="font-headline text-xl md:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Plan d&apos;action — 6 mois
      </h2>
      <p className="text-sm text-muted-foreground/80 mb-8">
        {phases.length} phases. Chacune débouche sur un résultat concret.
      </p>

      <div className="relative">
        {/* Ligne de progression verticale (mobile) / horizontale (desktop) */}
        <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/60 via-primary/30 to-primary/10" />
        <div className="md:hidden absolute left-[27px] top-7 bottom-7 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-primary/10" />

        <div
          className="relative grid gap-6 md:gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.min(phases.length, 3)}, minmax(0, 1fr))`,
          }}
        >
          {phases.map((phase, i) => (
            <PhaseCard key={i} index={i} phase={phase} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PhaseCard({ index, phase }: { index: number; phase: PlanPhase }) {
  // On limite à 4 actions visibles pour ne pas surcharger la timeline
  // (les actions trop nombreuses sont gardées par le markdown brut)
  const displayed = phase.actions.slice(0, 4);
  const overflow = phase.actions.length - displayed.length;

  return (
    <div className="relative flex md:flex-col gap-4 md:gap-0">
      {/* Pastille numérotée */}
      <div className="relative shrink-0 md:mb-5">
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-surface-container-lowest border border-primary/40 flex items-center justify-center shadow-[0_0_24px_-6px_hsl(var(--primary)/0.5)]">
          <span className="font-headline text-base font-black text-primary">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Contenu de la phase */}
      <div className="flex-1 md:pr-2">
        <h3 className="font-headline text-base md:text-lg font-bold text-foreground mb-3 leading-tight">
          {phase.title}
        </h3>
        <ul className="space-y-2">
          {displayed.map((action, j) => (
            <li
              key={j}
              className="flex items-start gap-2 text-[13px] text-muted-foreground/90 leading-relaxed"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-1" />
              <span>{action}</span>
            </li>
          ))}
          {overflow > 0 && (
            <li className="text-[11px] text-muted-foreground/60 italic pl-5">
              + {overflow} action{overflow > 1 ? "s" : ""} dans le bilan détaillé
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
