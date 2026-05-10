"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  Sparkles,
  Lock,
  Zap,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createCheckoutSession, type CheckoutPlan } from "@/lib/billing/actions";

type PlanCard = {
  key: CheckoutPlan | "free";
  label: string;
  price: string;
  priceSuffix: string;
  hint?: string;
  icon: React.ElementType;
  highlight?: boolean;
  features: { text: string; included: boolean; highlight?: boolean }[];
  cta: string;
};

const PLANS: PlanCard[] = [
  {
    key: "free",
    label: "Free",
    price: "0€",
    priceSuffix: "/mois",
    icon: Sparkles,
    features: [
      { text: "Diagnostic IA complet", included: true },
      { text: "Phase 1 du parcours", included: true },
      { text: "5 messages Copilot / jour", included: true },
      { text: "Top 3 opportunités", included: true },
      { text: "1 livrable / mois", included: true },
      { text: "Phases 2 à 5 du parcours", included: false },
      { text: "Feed communautaire", included: false },
      { text: "Toutes les opportunités", included: false },
    ],
    cta: "Plan actuel",
  },
  {
    key: "boost",
    label: "Boost",
    price: "19€",
    priceSuffix: "/mois",
    icon: Zap,
    features: [
      { text: "Tout le contenu Free", included: true },
      { text: "Parcours complet (5 phases)", included: true, highlight: true },
      { text: "30 messages Copilot / jour", included: true },
      { text: "10 opportunités matchées", included: true },
      { text: "5 livrables / mois", included: true, highlight: true },
      { text: "Feed communautaire", included: true },
    ],
    cta: "Passer au Boost",
  },
  {
    key: "pro",
    label: "Pro",
    price: "49€",
    priceSuffix: "/mois",
    hint: "ou 390€/an (-33%)",
    icon: Crown,
    highlight: true,
    features: [
      { text: "Tout le contenu Boost", included: true },
      { text: "Copilot illimité", included: true, highlight: true },
      { text: "Toutes les opportunités", included: true, highlight: true },
      { text: "Livrables illimités", included: true, highlight: true },
      { text: "Briefs Pro (POC RAG, etc.)", included: true, highlight: true },
      { text: "Support prioritaire", included: true },
    ],
    cta: "Passer au Pro",
  },
  {
    key: "sprint",
    label: "Sprint",
    price: "149€",
    priceSuffix: "paiement unique",
    hint: "30 jours d'accès Pro complet",
    icon: Rocket,
    features: [
      { text: "Accès Pro pendant 30 jours", included: true, highlight: true },
      { text: "Idéal pour transitions rapides", included: true },
      { text: "Tous les briefs débloqués", included: true },
      { text: "Pas d'engagement", included: true },
      { text: "Reprend en Free après 30j", included: true },
    ],
    cta: "Acheter le Sprint",
  },
];

export function UpgradeView({
  currentPlan,
  userName,
}: {
  currentPlan: string;
  userName: string;
}) {
  const [loadingPlan, setLoadingPlan] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPaidUser =
    currentPlan === "BOOST" ||
    currentPlan === "PREMIUM" ||
    currentPlan === "FOUNDING" ||
    currentPlan === "ENTERPRISE";

  const handleUpgrade = async (plan: CheckoutPlan) => {
    setLoadingPlan(plan);
    setError(null);

    const result = await createCheckoutSession(plan);

    if (result.url) {
      window.location.href = result.url;
    } else {
      setError(result.error || "Erreur inattendue");
      setLoadingPlan(null);
    }
  };

  const matchPlan = (key: PlanCard["key"]): boolean => {
    if (key === "free") return currentPlan === "FREE";
    if (key === "boost") return currentPlan === "BOOST";
    if (key === "pro") return currentPlan === "PREMIUM" || currentPlan === "FOUNDING" || currentPlan === "ENTERPRISE";
    return false;
  };

  return (
    <div>
      {/* Header */}
      <header className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-headline text-3xl font-black text-foreground mb-2">
          {isPaidUser ? `Tu es ${currentPlan === "PREMIUM" ? "Pro" : currentPlan === "BOOST" ? "Boost" : "Founding Member"} !` : "Choisis ton plan"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isPaidUser
            ? "Tu peux gérer ton abonnement depuis tes paramètres."
            : `${userName}, choisis le plan qui colle à ton rythme de transition.`}
        </p>
      </header>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {PLANS.map((p) => {
          const Icon = p.icon;
          const isCurrent = matchPlan(p.key);

          return (
            <div
              key={p.key}
              className={cn(
                "relative rounded-2xl p-6 border transition-all flex flex-col",
                p.highlight
                  ? "border-2 border-primary/40 bg-gradient-to-br from-surface-container-low to-primary/5"
                  : "bg-surface-container-low ghost-border",
                isCurrent && !p.highlight && "ring-2 ring-primary/30"
              )}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                    Recommandé
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline text-lg font-bold text-foreground flex items-center gap-2">
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      p.highlight ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {p.label}
                </h3>
                {isCurrent && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Actuel
                  </span>
                )}
              </div>

              <div className="mb-5">
                <span className="text-3xl font-headline font-black text-foreground">
                  {p.price}
                </span>
                <span className="text-xs text-muted-foreground"> {p.priceSuffix}</span>
                {p.hint && (
                  <p className="text-[10px] text-muted-foreground mt-1">{p.hint}</p>
                )}
              </div>

              <div className="space-y-2 mb-5 flex-1">
                {p.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check
                        className={cn(
                          "w-3.5 h-3.5 shrink-0 mt-0.5",
                          feature.highlight ? "text-primary" : "text-emerald-400"
                        )}
                      />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={cn(
                        "text-xs leading-snug",
                        !feature.included && "text-muted-foreground/40 line-through",
                        feature.highlight && feature.included && "text-foreground font-bold",
                        feature.included && !feature.highlight && "text-foreground"
                      )}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {p.key === "free" ? (
                <div
                  className={cn(
                    "py-2.5 text-center text-xs font-bold rounded-xl",
                    isCurrent
                      ? "bg-surface-container text-muted-foreground"
                      : "bg-surface-container text-muted-foreground/50"
                  )}
                >
                  {isCurrent ? "Plan actuel" : "Démarre ici"}
                </div>
              ) : isCurrent ? (
                <div className="py-2.5 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-xl">
                  Plan actif
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(p.key as CheckoutPlan)}
                  disabled={loadingPlan !== null}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-bold transition-transform disabled:opacity-50",
                    p.highlight
                      ? "gradient-primary text-primary-foreground hover:scale-[1.02] shadow-lg shadow-primary/20"
                      : "bg-surface-container hover:bg-surface-container-high text-foreground"
                  )}
                >
                  {loadingPlan === p.key ? "Redirection..." : p.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-red-400 text-center mt-6">{error}</p>
      )}

      {/* Founding Member callout */}
      {currentPlan === "FREE" && (
        <div className="max-w-3xl mx-auto mt-10 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-primary/5 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-headline font-bold text-foreground text-sm mb-1">
                Programme Founding Member — 9€/mois à vie
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                30 places, sur invitation après candidature. Accès Pro complet à
                tarif fondateur, à vie.
              </p>
              <a
                href="/founding-members"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
              >
                Candidater au programme
                <Sparkles className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
