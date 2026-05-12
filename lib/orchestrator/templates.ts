import type { ActionTemplate } from "@/lib/generated/prisma/enums";

/**
 * The 7 canonical actions the orchestrator can suggest, plus a "keep
 * momentum" sentinel when the user is fully active.
 *
 * Each template renders to a card on the dashboard with:
 *  - title    → short imperative ("Lance ton premier livrable")
 *  - why      → 1 sentence explaining why NOW
 *  - cta      → button label
 *  - href     → where the button goes
 *  - iconName → name of a lucide-react icon (resolved client-side)
 *
 * Some templates need runtime metadata (e.g. which brief to suggest).
 * Their renderer accepts a `metadata` arg.
 */
export type RenderedAction = {
  template: ActionTemplate;
  title: string;
  why: string;
  cta: string;
  href: string;
  iconName: string;
  estimatedMinutes: number;
};

type Metadata = Record<string, string | undefined> | null;

export function renderAction(
  template: ActionTemplate,
  metadata: Metadata
): RenderedAction {
  switch (template) {
    case "COMPLETE_ONBOARDING":
      return {
        template,
        title: "Termine ton onboarding",
        why: "Tant qu'il n'est pas fini, je ne peux pas personnaliser tes recommandations.",
        cta: "Reprendre l'onboarding",
        href: "/onboarding",
        iconName: "ListChecks",
        estimatedMinutes: 10,
      };

    case "RUN_DIAGNOSTIC":
      return {
        template,
        title: "Lance ton diagnostic IA",
        why: "C'est le point de départ. Sans diagnostic, je ne sais pas où tu veux aller, ni quoi te suggérer.",
        cta: "Démarrer le diagnostic",
        href: "/journey",
        iconName: "Sparkles",
        estimatedMinutes: 15,
      };

    case "FIRST_QUICK_DELIVERABLE": {
      const slug = metadata?.briefSlug ?? "generic-data-augmented-cv";
      const title = metadata?.briefTitle ?? "ton premier livrable rapide";
      return {
        template,
        title: `Quick win : ${title}`,
        why: "Premier livrable validé en 3 jours = première ligne LinkedIn. C'est ce qui crée du momentum.",
        cta: "Voir le brief",
        href: `/deliverables/${slug}`,
        iconName: "FileCheck",
        estimatedMinutes: 60,
      };
    }

    case "ADVANCE_PHASE_1":
      return {
        template,
        title: "Termine ton Diagnostic",
        why: "C'est l'étape qui calibre tout le reste — opportunités, briefs, parcours. Pas de raccourci, on doit la finir avant d'attaquer la suite.",
        cta: "Reprendre le diagnostic",
        href: "/journey",
        iconName: "GraduationCap",
        estimatedMinutes: 30,
      };

    case "EXPLORE_OPPORTUNITIES":
      return {
        template,
        title: "Étudie 3 offres data matchées",
        why: "Maintenant que ton profil est cadré, voyons ce que le marché propose pour calibrer ta cible.",
        cta: "Voir les opportunités",
        href: "/opportunities",
        iconName: "Briefcase",
        estimatedMinutes: 20,
      };

    case "AMBITIOUS_DELIVERABLE": {
      const slug = metadata?.briefSlug ?? "tech-product-metrics-dashboard";
      const title = metadata?.briefTitle ?? "un livrable plus ambitieux";
      return {
        template,
        title: `Étape suivante : ${title}`,
        why: "Tu as déjà un premier livrable validé. Il est temps de monter en exigence pour étoffer ton portfolio.",
        cta: "Voir le brief",
        href: `/deliverables/${slug}`,
        iconName: "TrendingUp",
        estimatedMinutes: 240,
      };
    }

    case "ADVANCE_LATER_PHASE": {
      const phase = metadata?.phaseLabel ?? "ta phase suivante";
      return {
        template,
        title: `Continue : ${phase}`,
        why: "Tu as débloqué cette phase. Garde le rythme — un cadre qui avance d'1 phase / mois finit son pivot en 6 mois.",
        cta: "Reprendre le parcours",
        href: "/journey",
        iconName: "Crown",
        estimatedMinutes: 30,
      };
    }

    case "UPGRADE_FOR_MORE": {
      const reason = metadata?.reason ?? "atteindre ton prochain livrable";
      return {
        template,
        title: "Tu as épuisé ton quota — passe au plan supérieur",
        why: `Tu as livré tes ${reason}. Pour continuer cette semaine, passe au Boost (5 livrables/mois) ou au Pro (illimité). Sinon, reprends le 1er du mois prochain.`,
        cta: "Voir les plans",
        href: "/upgrade",
        iconName: "Crown",
        estimatedMinutes: 3,
      };
    }

    case "KEEP_MOMENTUM":
      return {
        template,
        title: "Tu es à jour — garde le rythme",
        why: "Tu as terminé toutes les actions prioritaires de la semaine. Reviens demain ou ouvre le Copilot pour aller plus loin.",
        cta: "Parler au Copilot",
        href: "/agents",
        iconName: "Award",
        estimatedMinutes: 15,
      };
  }
}
