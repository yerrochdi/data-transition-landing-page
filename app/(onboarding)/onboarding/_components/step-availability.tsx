"use client";

import { Clock, Wallet, MapPin, Monitor, BookOpen, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import { AiReformulation } from "./ai-reformulation";

interface StepAvailabilityProps {
  availableHoursPerWeek: number;
  trainingBudget: string;
  location: string;
  remotePreference: string;
  learningStyle: string[];
  priorities: string[];
  shortTermGoal: string;
  longTermGoal: string;
  preferredPace: string;
  formData: OnboardingFormData;
  onFieldChange: (field: string, value: string | number | string[]) => void;
  onToggleLearningStyle: (style: string) => void;
  onReorderPriorities: (priorities: string[]) => void;
}

const LEARNING_STYLES = [
  { value: "autodidact", label: "Autodidacte", description: "Livres, docs, tutos YouTube" },
  { value: "courses", label: "Cours en ligne", description: "Coursera, OpenClassrooms, Udemy" },
  { value: "bootcamp", label: "Bootcamp", description: "Formation intensive 2-6 mois" },
  { value: "mentoring", label: "Mentorat", description: "Accompagnement par un expert" },
  { value: "projects", label: "Projets pratiques", description: "Apprendre en faisant" },
];

const BUDGET_OPTIONS = [
  { value: "none", label: "0€", description: "Gratuit uniquement (CPF, MOOCs)" },
  { value: "low", label: "< 500€", description: "Quelques formations en ligne" },
  { value: "medium", label: "500-2000€", description: "Certifications, cours premium" },
  { value: "high", label: "> 2000€", description: "Bootcamp, formation longue" },
];

const REMOTE_OPTIONS = [
  { value: "remote", label: "100% Remote" },
  { value: "hybrid", label: "Hybride" },
  { value: "onsite", label: "Présentiel" },
  { value: "flexible", label: "Flexible" },
];

const PRIORITY_ITEMS = [
  { value: "growth", label: "Évolution de carrière", icon: "📈" },
  { value: "salary", label: "Rémunération", icon: "💰" },
  { value: "security", label: "Stabilité / sécurité", icon: "🛡️" },
  { value: "impact", label: "Impact & sens", icon: "🌍" },
  { value: "freedom", label: "Autonomie / liberté", icon: "🕊️" },
  { value: "balance", label: "Équilibre vie pro/perso", icon: "⚖️" },
];

export function StepAvailability({
  availableHoursPerWeek,
  trainingBudget,
  location,
  remotePreference,
  learningStyle,
  priorities,
  shortTermGoal,
  longTermGoal,
  preferredPace,
  formData,
  onFieldChange,
  onToggleLearningStyle,
  onReorderPriorities,
}: StepAvailabilityProps) {

  const handlePriorityClick = (value: string) => {
    if (priorities.includes(value)) {
      onReorderPriorities(priorities.filter((p) => p !== value));
    } else {
      onReorderPriorities([...priorities, value]);
    }
  };

  // Signature : on attend que les heures ET le rythme soient renseignés
  // (les 2 inputs les plus discriminants). Le style d'apprentissage
  // affine la signature pour relancer si l'user change d'avis.
  const signature =
    availableHoursPerWeek && preferredPace
      ? `avail:${availableHoursPerWeek}|pace:${preferredPace}|style:${[...learningStyle].sort().join("-")}`
      : "";

  return (
    <div className="space-y-8">
      {/* Objectives */}
      <div>
        <label className="text-sm font-bold text-foreground mb-3 block">
          Objectifs
        </label>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 block">
              Court terme (3 mois)
            </label>
            <input
              type="text"
              value={shortTermGoal}
              onChange={(e) => onFieldChange("shortTermGoal", e.target.value)}
              placeholder="Ex: Maîtriser SQL et Python pour l'analyse de données"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 ghost-border"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 block">
              Moyen terme (12 mois)
            </label>
            <input
              type="text"
              value={longTermGoal}
              onChange={(e) => onFieldChange("longTermGoal", e.target.value)}
              placeholder="Ex: Décrocher un poste de Data Analyst dans la FinTech"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 ghost-border"
            />
          </div>
        </div>
      </div>

      {/* Available hours */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
          <Clock className="w-4 h-4 text-primary" />
          Temps disponible pour se former
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Combien d&apos;heures par semaine pouvez-vous consacrer ?
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={30}
            value={availableHoursPerWeek}
            onChange={(e) => onFieldChange("availableHoursPerWeek", parseInt(e.target.value))}
            className="flex-1 accent-primary h-2"
          />
          <div className="bg-primary/10 px-4 py-2 rounded-xl min-w-[80px] text-center">
            <span className="text-lg font-headline font-extrabold text-primary">{availableHoursPerWeek}</span>
            <span className="text-[10px] text-muted-foreground block">h/sem</span>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
          <span>1h</span>
          <span>10h</span>
          <span>20h</span>
          <span>30h</span>
        </div>
      </div>

      {/* Rythme */}
      <div>
        <label className="text-sm font-bold text-foreground mb-3 block">
          Rythme souhaité
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "relaxed", label: "Tranquille", desc: "À mon rythme" },
            { value: "moderate", label: "Modéré", desc: "Régulier et constant" },
            { value: "intensive", label: "Intensif", desc: "Le plus vite possible" },
          ].map((pace) => (
            <button
              key={pace.value}
              onClick={() => onFieldChange("preferredPace", pace.value)}
              className={cn(
                "p-3 rounded-xl text-center transition-all",
                preferredPace === pace.value
                  ? "bg-primary/10 border-2 border-primary/40"
                  : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
              )}
            >
              <p className={cn("text-sm font-bold", preferredPace === pace.value ? "text-primary" : "text-foreground")}>
                {pace.label}
              </p>
              <p className="text-[10px] text-muted-foreground">{pace.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
          <Wallet className="w-4 h-4 text-primary" />
          Budget formation
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFieldChange("trainingBudget", opt.value)}
              className={cn(
                "p-3 rounded-xl text-left transition-all",
                trainingBudget === opt.value
                  ? "bg-primary/10 border-2 border-primary/40"
                  : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
              )}
            >
              <p className={cn("text-sm font-bold", trainingBudget === opt.value ? "text-primary" : "text-foreground")}>
                {opt.label}
              </p>
              <p className="text-[10px] text-muted-foreground">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Location + Remote */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            Localisation
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => onFieldChange("location", e.target.value)}
            placeholder="Ex: Paris, Lyon, Bordeaux..."
            className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 ghost-border"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3">
            <Monitor className="w-4 h-4 text-primary" />
            Mode de travail
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {REMOTE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFieldChange("remotePreference", opt.value)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold transition-all",
                  remotePreference === opt.value
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-surface-container-lowest text-muted-foreground ghost-border hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Style */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
          <BookOpen className="w-4 h-4 text-primary" />
          Comment apprenez-vous le mieux ?
        </label>
        <p className="text-xs text-muted-foreground mb-3">Sélectionnez 1 à 3 styles</p>
        <div className="space-y-2">
          {LEARNING_STYLES.map((style) => {
            const selected = learningStyle.includes(style.value);
            return (
              <button
                key={style.value}
                onClick={() => onToggleLearningStyle(style.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                  selected
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded flex items-center justify-center text-xs shrink-0",
                  selected ? "bg-primary text-primary-foreground" : "border border-muted-foreground/30"
                )}>
                  {selected && "✓"}
                </div>
                <div>
                  <p className={cn("text-sm font-bold", selected ? "text-primary" : "text-foreground")}>
                    {style.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{style.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Priorities — click to rank */}
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
          <GripVertical className="w-4 h-4 text-primary" />
          Vos priorités
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Cliquez dans l&apos;ordre de vos priorités (1 = le plus important)
        </p>
        <div className="space-y-2">
          {PRIORITY_ITEMS.map((item) => {
            const rank = priorities.indexOf(item.value);
            const isSelected = rank >= 0;
            return (
              <button
                key={item.value}
                onClick={() => handlePriorityClick(item.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                  isSelected
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-container text-muted-foreground"
                )}>
                  {isSelected ? rank + 1 : item.icon}
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {item.label}
                </span>
                {isSelected && (
                  <span className="text-[10px] text-primary/60 ml-auto">#{rank + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reformulation IA — calibre les attentes de l'utilisateur
          (réaliste vs vendeur) selon les heures/rythme déclarés. */}
      <AiReformulation step="availability" data={formData} signature={signature} />
    </div>
  );
}
