"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Crown,
  Sparkles,
  Bot,
  GraduationCap,
  Briefcase,
  Infinity,
  Lock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createCheckoutSession } from "@/lib/billing/actions";

const FREE_FEATURES = [
  { text: "Diagnostic IA complet", included: true },
  { text: "Phase 1 du parcours", included: true },
  { text: "3 sessions IA / jour", included: true },
  { text: "5 messages Copilot / jour", included: true },
  { text: "Top 3 opportunités", included: true },
  { text: "Phases 2 à 5 du parcours", included: false },
  { text: "Sessions IA illimitées", included: false },
  { text: "Copilot illimité", included: false },
  { text: "Toutes les opportunités", included: false },
];

const PRO_FEATURES = [
  { text: "Diagnostic IA complet", included: true },
  { text: "Parcours complet (5 phases)", included: true, highlight: true },
  { text: "Sessions IA illimitées", included: true, highlight: true },
  { text: "Copilot illimité", included: true, highlight: true },
  { text: "Toutes les opportunités", included: true, highlight: true },
  { text: "Feed communautaire", included: true },
  { text: "Support prioritaire", included: true },
];

export function UpgradeView({
  currentPlan,
  userName,
}: {
  currentPlan: string;
  userName: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPremium = currentPlan === "PREMIUM" || currentPlan === "ENTERPRISE";

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);

    const result = await createCheckoutSession();

    if (result.url) {
      window.location.href = result.url;
    } else {
      setError(result.error || "Erreur inattendue");
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-headline text-3xl font-black text-foreground mb-2">
          {isPremium ? "Tu es Premium !" : "Passe à la vitesse supérieure"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {isPremium
            ? "Tu as accès à toutes les fonctionnalités de NextMove AI."
            : `${userName}, débloque tout le potentiel de NextMove AI pour accélérer ta transition.`}
        </p>
      </header>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free Plan */}
        <div
          className={cn(
            "rounded-2xl p-6 border",
            currentPlan === "FREE"
              ? "bg-surface-container-low border-primary/20"
              : "bg-surface-container-low ghost-border"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg font-bold text-foreground">
              Free
            </h3>
            {currentPlan === "FREE" && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                Plan actuel
              </span>
            )}
          </div>

          <div className="mb-6">
            <span className="text-3xl font-headline font-black text-foreground">
              0€
            </span>
            <span className="text-sm text-muted-foreground"> /mois</span>
          </div>

          <div className="space-y-3 mb-6">
            {FREE_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                {feature.included ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    feature.included
                      ? "text-foreground"
                      : "text-muted-foreground/40 line-through"
                  )}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {currentPlan === "FREE" && (
            <div className="py-3 text-center text-sm text-muted-foreground bg-surface-container rounded-xl">
              Plan actuel
            </div>
          )}
        </div>

        {/* Pro Plan */}
        <div className="relative rounded-2xl p-6 border-2 border-primary/30 bg-gradient-to-br from-surface-container-low to-primary/5">
          {/* Popular badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="gradient-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
              Recommandé
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Pro
            </h3>
            {isPremium && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                Actif
              </span>
            )}
          </div>

          <div className="mb-6">
            <span className="text-3xl font-headline font-black text-foreground">
              49€
            </span>
            <span className="text-sm text-muted-foreground"> /mois</span>
            <p className="text-xs text-muted-foreground mt-1">ou 390€/an (-33%)</p>
          </div>

          <div className="space-y-3 mb-6">
            {PRO_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Check
                  className={cn(
                    "w-4 h-4 shrink-0",
                    feature.highlight ? "text-primary" : "text-emerald-400"
                  )}
                />
                <span
                  className={cn(
                    "text-sm",
                    feature.highlight
                      ? "text-foreground font-bold"
                      : "text-foreground"
                  )}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {!isPremium ? (
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <>Redirection...</>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Passer au Pro — 49€/mois
                </>
              )}
            </button>
          ) : (
            <div className="py-3 text-center text-sm font-bold text-emerald-400 bg-emerald-500/10 rounded-xl">
              Plan actif
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 text-center mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Value props */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-10">
        {[
          {
            icon: GraduationCap,
            title: "Parcours complet",
            description:
              "5 phases de la reconversion, de A à Z, personnalisées par l'IA",
          },
          {
            icon: Bot,
            title: "IA illimitée",
            description:
              "Sessions interactives et Copilot disponible 24/7 sans limite",
          },
          {
            icon: Briefcase,
            title: "Opportunités",
            description:
              "Accès à toutes les opportunités matchées avec ton profil",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="text-center p-4 bg-surface-container-low rounded-xl ghost-border"
          >
            <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <h4 className="text-sm font-bold text-foreground mb-1">
              {item.title}
            </h4>
            <p className="text-[10px] text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
