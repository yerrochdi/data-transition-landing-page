"use client";

import { Code, Blocks, MousePointerClick, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { AiReformulation } from "./ai-reformulation";

const OPTIONS = [
  {
    value: "no-code",
    icon: MousePointerClick,
    title: "No-code / Business",
    description:
      "Je veux utiliser des outils visuels (Tableau, Power BI, Notion, Airtable, Make...) sans coder. Je veux piloter la data, pas la programmer.",
    examples: "Data Analyst (BI), Product Owner Data, Data Storyteller, CRM Analyst",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  {
    value: "low-code",
    icon: Blocks,
    title: "Low-code / Hybride",
    description:
      "Je suis ouvert a un peu de technique (SQL, Excel avance, formules, no-code avance) mais je ne veux pas devenir developpeur.",
    examples: "Data Analyst, Growth Analyst, Analytics Engineer (junior), BI Developer",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  {
    value: "code",
    icon: Code,
    title: "Code / Technique",
    description:
      "Je suis motive pour apprendre Python, SQL avance, et des outils techniques. Je veux un role avec du code.",
    examples: "Data Engineer, Data Scientist, ML Engineer, Analytics Engineer",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
  {
    value: "flexible",
    icon: Shuffle,
    title: "Flexible / Je ne sais pas encore",
    description:
      "Je veux que NextMove me recommande le bon niveau technique en fonction de mon profil et mes objectifs.",
    examples: "L'IA adaptera les suggestions a votre profil",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
] as const;

interface StepTechnicalProps {
  value: string;
  formData: OnboardingFormData;
  onChange: (value: string) => void;
}

export function StepTechnical({ value, formData, onChange }: StepTechnicalProps) {
  // Signature stable basée sur l'appétence choisie.
  const signature = value ? `tech:${value}` : "";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Cette information est <strong className="text-foreground">essentielle</strong> pour vous proposer un parcours
        adapte. Il n&apos;y a pas de mauvaise reponse — chaque profil a sa place dans la data.
      </p>

      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "w-full text-left p-5 rounded-xl transition-all",
                isSelected
                  ? `${opt.bg} border-2 ${opt.border} shadow-lg`
                  : "bg-surface-container-lowest ghost-border hover:bg-surface-container hover:scale-[1.01]"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? `${opt.bg} ${opt.color}` : "bg-surface-container text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "font-headline font-bold text-sm mb-1",
                      isSelected ? opt.color : "text-foreground"
                    )}
                  >
                    {opt.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">{opt.description}</p>
                  <p className="text-[10px] text-muted-foreground/70">
                    <span className="font-bold">Exemples :</span> {opt.examples}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reformulation IA — apparaît dès qu'une option est choisie */}
      <AiReformulation step="technical" data={formData} signature={signature} />
    </div>
  );
}
