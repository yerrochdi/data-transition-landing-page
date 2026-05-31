"use client";

/**
 * Step "Usage IA" (Sprint 3.1) — où en est la personne avec l'IA AUJOURD'HUI.
 *
 * Crucial pour le diagnostic : quelqu'un qui "code déjà avec l'IA" part
 * d'un tout autre point que quelqu'un qui n'a jamais ouvert ChatGPT. Cette
 * info calibre les recommandations et le réalisme de la transition.
 */
import { Bot, MessageSquare, Wrench, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { AiReformulation } from "./ai-reformulation";

interface StepAiUsageProps {
  formData: OnboardingFormData;
  onLevelChange: (level: OnboardingFormData["aiUsage"]["level"]) => void;
  onToggleTool: (tool: string) => void;
  onContextChange: (context: string) => void;
}

const LEVELS = [
  {
    value: "none" as const,
    icon: Bot,
    title: "Jamais ou presque",
    desc: "Je n'utilise pas l'IA dans mon travail aujourd'hui.",
  },
  {
    value: "occasional" as const,
    icon: MessageSquare,
    title: "Occasionnel",
    desc: "J'utilise ChatGPT ou équivalent de temps en temps, pour dépanner.",
  },
  {
    value: "regular" as const,
    icon: Wrench,
    title: "Régulier",
    desc: "L'IA fait partie de mon quotidien : rédaction, analyse, recherche.",
  },
  {
    value: "builder" as const,
    icon: Code2,
    title: "Je construis avec l'IA",
    desc: "Je code, j'automatise ou je crée des outils avec l'IA (vibe coding, agents, scripts).",
  },
];

const AI_TOOLS = [
  "ChatGPT",
  "Claude",
  "GitHub Copilot",
  "Cursor",
  "Gemini",
  "Midjourney",
  "Perplexity",
  "Notion AI",
  "Make / n8n",
  "Mistral",
];

export function StepAiUsage({
  formData,
  onLevelChange,
  onToggleTool,
  onContextChange,
}: StepAiUsageProps) {
  const { level, tools, context } = formData.aiUsage;

  // Reformulation déclenchée dès qu'un niveau est choisi
  const signature = level
    ? `aiusage:${level}|tools:${[...tools].sort().join("-")}|ctx:${context.trim().length}`
    : "";

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Question souvent oubliée mais{" "}
        <strong className="text-foreground">déterminante</strong> : où en
        êtes-vous avec l&apos;IA aujourd&apos;hui ? Votre point de départ change
        tout dans la trajectoire qu&apos;on va construire.
      </p>

      {/* Niveau d'usage */}
      <div className="space-y-3">
        {LEVELS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = level === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onLevelChange(opt.value)}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all flex items-start gap-4",
                isSelected
                  ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                  : "bg-surface-container-lowest ghost-border hover:bg-surface-container hover:scale-[1.01]"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-container text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={cn(
                    "font-headline font-bold text-sm mb-0.5",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {opt.title}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Outils — affichés dès qu'un niveau ≠ none est choisi */}
      {level && level !== "none" && (
        <div className="space-y-2 animate-fade-up-fast">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
            Quels outils utilisez-vous ?
          </label>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.map((tool) => {
              const isSelected = tools.includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => onToggleTool(tool)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    isSelected
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-surface-container-lowest border-border/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  )}
                >
                  {tool}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Contexte libre — affiché dès qu'un niveau ≠ none */}
      {level && level !== "none" && (
        <div className="space-y-2 animate-fade-up-fast">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
            Concrètement, pour quoi ? (optionnel)
          </label>
          <textarea
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            placeholder="Ex : Je rédige mes synthèses avec ChatGPT, j'automatise des relances clients avec Make, et j'ai commencé à créer des petits scripts Python avec Claude pour analyser mes exports."
            rows={3}
            className="w-full bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Reformulation IA */}
      <AiReformulation step="ai-usage" data={formData} signature={signature} />
    </div>
  );
}
