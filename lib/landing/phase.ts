import type { FoundingPlacesStatus } from "@/lib/founding-members/places";

/**
 * Landing phase — switches the whole landing's CTAs and messaging
 * automatically based on whether the Founding Member program still has
 * open slots.
 *
 * - "founding" : pre-launch. All CTAs push toward /founding-members
 *   (apply to the 30-place program, 9€/mois à vie, on selection).
 * - "open" : the 30 slots are filled. CTAs pivot to /upgrade (paid
 *   plans, instant checkout, no application). The founding section
 *   becomes a pricing section.
 *
 * The pivot is automatic: the day the founder accepts the 30th
 * application, `remaining` hits 0 and the landing flips on next load.
 * No manual intervention.
 */
export type LandingPhase = "founding" | "open";

export interface LandingPhaseConfig {
  phase: LandingPhase;
  /** Hero eyebrow tag text. */
  eyebrow: string;
  /** Primary CTA label used across the landing. */
  ctaLabel: string;
  /** Primary CTA destination. */
  ctaHref: string;
  /** Sub-line shown under the hero CTA. */
  ctaSubline: string;
}

export function getLandingPhase(
  founding: FoundingPlacesStatus
): LandingPhaseConfig {
  const isFounding = founding.remaining > 0;

  if (isFounding) {
    return {
      phase: "founding",
      eyebrow: "Career OS · Pré-lancement",
      ctaLabel: "Candidate au programme Founding Member",
      ctaHref: "/founding-members",
      ctaSubline: `9€/mois à vie · ${founding.remaining} place${
        founding.remaining > 1 ? "s" : ""
      } restante${founding.remaining > 1 ? "s" : ""} · sélection sous 48h`,
    };
  }

  return {
    phase: "open",
    eyebrow: "Career OS · Maintenant ouvert",
    ctaLabel: "Démarrer mon Career OS",
    ctaHref: "/upgrade",
    ctaSubline: "À partir de 19€/mois · sans engagement · sans sélection",
  };
}
