"use client";

import { Sparkles, Lock, Crown, TrendingUp, BookOpen, Users, Zap } from "lucide-react";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { AiInsightPanel } from "./ai-insight-panel";
import { useEffect, useState } from "react";

interface StepSummaryProps {
  formData: OnboardingFormData;
  aiContent: string | null;
  onAiUpdate: (content: string) => void;
  chosenPlan?: "free" | "boost" | "pro" | "sprint";
}

function CareerScore({ confidence, hasData }: { confidence: number; hasData: boolean }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  // Compute a score based on confidence + whether they have data experience
  const baseScore = Math.min(95, Math.max(55, confidence * 7 + (hasData ? 15 : 5) + 10));

  useEffect(() => {
    let frame = 0;
    const target = baseScore;
    const duration = 40; // frames
    const interval = setInterval(() => {
      frame++;
      setAnimatedScore(Math.round((frame / duration) * target));
      if (frame >= duration) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [baseScore]);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--surface-container))" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke="url(#scoreGradient)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-100"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline text-2xl font-black text-foreground">{animatedScore}%</span>
          <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-bold">Score</span>
        </div>
      </div>
      <p className="text-[10px] text-primary font-bold mt-2 uppercase tracking-widest">Career Match Score</p>
    </div>
  );
}

const PRO_FEATURES = [
  {
    icon: BookOpen,
    title: "Parcours complet en 5 phases",
    description: "Micro-leçons IA personnalisées, quiz adaptatifs, progression guidée",
  },
  {
    icon: Zap,
    title: "Copilot IA illimité",
    description: "Pose tes questions carrière à tout moment, réponses contextualisées",
  },
  {
    icon: Users,
    title: "Opportunités ciblées",
    description: "Offres d'emploi matchées avec ton profil et ta progression",
  },
  {
    icon: TrendingUp,
    title: "Sessions IA immersives",
    description: "Entraînement interactif sur chaque compétence de ton parcours",
  },
];

export function StepSummary({
  formData,
  aiContent,
  onAiUpdate,
  chosenPlan = "free",
}: StepSummaryProps) {
  const isPro = chosenPlan !== "free";

  return (
    <div className="space-y-6">
      {/* Career Score + Profile recap */}
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-6 rounded-2xl light-streak surface-glow">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-foreground">
              Votre Career OS — version 1
            </h3>
            <p className="text-xs text-primary">
              Bilan rédigé par NextMove · évolutif avec votre carrière
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <CareerScore
            confidence={formData.confidenceLevel || 5}
            hasData={formData.hasDataTraining}
          />
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="bg-surface-container-lowest p-3 rounded-xl ghost-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                Profil actuel
              </p>
              <p className="text-sm text-foreground font-bold">
                {formData.currentRole || "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formData.currentSector || "—"} · {formData.experienceYears || "?"} ans
              </p>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded-xl ghost-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                Objectif
              </p>
              <p className="text-sm text-foreground font-bold">
                {formData.targetRole || "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formData.targetSector || "—"} · Rythme{" "}
                {formData.preferredPace === "relaxed"
                  ? "tranquille"
                  : formData.preferredPace === "intensive"
                  ? "intensif"
                  : "modéré"}
              </p>
            </div>
          </div>
        </div>

        {/* AI-generated full analysis — auto-trigger */}
        <AiInsightPanel
          label="Analyse complète"
          step="summary"
          data={formData}
          content={aiContent}
          onContentUpdate={onAiUpdate}
          autoTrigger
        />
      </div>

      {/* Pro Teaser — only for free plan users */}
      {!isPro && (
        <div className="relative overflow-hidden rounded-2xl">
          {/* Blurred preview */}
          <div className="bg-gradient-to-b from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-primary" />
              <h3 className="font-headline text-base font-bold text-foreground">
                Débloquez votre plan d&apos;action complet
              </h3>
            </div>

            {/* Teaser features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {PRO_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="relative bg-surface-container-lowest/50 backdrop-blur p-4 rounded-xl ghost-border group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground mb-0.5">{feature.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-surface-container/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>

            {/* Blurred action plan preview */}
            <div className="relative mb-5">
              <div className="space-y-2 blur-[3px] select-none pointer-events-none">
                <div className="bg-surface-container-lowest p-3 rounded-lg">
                  <p className="text-xs font-bold text-foreground">Phase 1 : Fondamentaux Data (Semaine 1-2)</p>
                  <p className="text-[10px] text-muted-foreground">4 micro-leçons IA adaptées à votre profil de {formData.currentRole}</p>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg">
                  <p className="text-xs font-bold text-foreground">Phase 2 : Spécialisation {formData.targetRole} (Semaine 3-6)</p>
                  <p className="text-[10px] text-muted-foreground">Sessions immersives IA + quiz de validation</p>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg">
                  <p className="text-xs font-bold text-foreground">Phase 3-5 : Portfolio, Réseau, Entretiens</p>
                  <p className="text-[10px] text-muted-foreground">Coaching IA pour décrocher votre poste de {formData.targetRole}</p>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-surface-container/90 backdrop-blur-sm px-4 py-2 rounded-full ghost-border flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary">Plan Pro requis</span>
                </div>
              </div>
            </div>

            {/* CTA info — actual upgrade happens via the "Lancer mon parcours" button */}
            <p className="text-center text-[10px] text-muted-foreground">
              Cliquez sur <span className="text-primary font-bold">&quot;Lancer mon parcours&quot;</span> pour accéder au plan Pro à 49€/mois
            </p>
          </div>
        </div>
      )}

      {/* Pro confirmation banner */}
      {isPro && (
        <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 rounded-2xl p-5 flex items-center gap-4 animate-fade-up">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Plan Pro sélectionné</p>
            <p className="text-xs text-muted-foreground">
              Après votre diagnostic, vous serez redirigé vers le paiement sécurisé Stripe.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
