"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Crown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section 7 — version "open" (post-Founding).
 *
 * S'affiche automatiquement quand les 30 places Founding sont prises
 * (remaining === 0). Remplace la grille founding par les plans payants
 * classiques. CTA → /upgrade (checkout direct, pas de sélection).
 */

type Plan = {
  name: string;
  price: string;
  period: string;
  hint?: string;
  features: string[];
  highlight?: boolean;
};

const plans: Plan[] = [
  {
    name: "Boost",
    price: "19€",
    period: "/mois",
    features: [
      "Parcours complet (5 phases)",
      "30 messages Copilot / jour",
      "10 opportunités matchées",
      "5 livrables / mois",
      "Feed communautaire",
    ],
  },
  {
    name: "Pro",
    price: "49€",
    period: "/mois",
    hint: "ou 390€/an (-33%)",
    highlight: true,
    features: [
      "Copilot IA illimité",
      "Toutes les opportunités",
      "Livrables illimités + briefs Pro",
      "Parcours complet en 5 phases",
      "Support prioritaire",
    ],
  },
  {
    name: "Sprint",
    price: "149€",
    period: "30 jours",
    hint: "paiement unique",
    features: [
      "Accès Pro complet pendant 30 jours",
      "Idéal pour une transition rapide",
      "Tous les briefs débloqués",
      "Sans engagement",
    ],
  },
];

export function OpenPricing() {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12 overflow-hidden">
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[60%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Choisissez votre plan
            </span>
            <span className="w-8 h-px bg-primary/40" />
          </div>
          <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground text-balance">
            Démarrez votre Career OS aujourd&apos;hui.
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground/90 leading-relaxed text-pretty">
            Pas de sélection, pas d&apos;engagement. Choisissez le plan qui colle
            à votre rythme — vous pouvez changer ou arrêter à tout moment.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className={cn(
                "relative rounded-2xl p-6 md:p-7 flex flex-col",
                plan.highlight
                  ? "bg-gradient-to-b from-primary/10 to-surface-container-lowest border-2 border-primary/40 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.4)] md:-translate-y-4"
                  : "bg-surface-container-lowest border border-border/40"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/30">
                    <Crown className="w-3 h-3" />
                    Recommandé
                  </span>
                </div>
              )}

              <h3 className="font-headline text-lg font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <div className="mb-5">
                <span className="font-headline text-3xl font-black text-foreground">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground"> {plan.period}</span>
                {plan.hint && (
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    {plan.hint}
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        plan.highlight
                          ? "bg-primary/15 text-primary"
                          : "bg-primary/10 text-primary/80"
                      )}
                    >
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-muted-foreground/90 leading-snug">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/upgrade"
                className={cn(
                  "group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all",
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]"
                    : "bg-surface-container hover:bg-surface-container-high text-foreground"
                )}
              >
                Choisir {plan.name}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Note Free + Founding complet */}
        <p className="text-center text-xs text-muted-foreground/70 mt-8">
          Vous pouvez aussi commencer{" "}
          <Link href="/signup" className="text-primary font-semibold hover:underline">
            gratuitement
          </Link>{" "}
          (diagnostic + Phase 1). Le programme Founding Member est complet.
        </p>
      </div>
    </section>
  );
}
