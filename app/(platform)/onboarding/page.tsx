"use client";

import { useState } from "react";
import {
  User,
  Briefcase,
  Target,
  Zap,
  Shield,
  Heart,
  Flag,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { onboardingSteps } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  User,
  Briefcase,
  Target,
  Zap,
  Shield,
  Heart,
  Flag,
  Sparkles,
};

const stepContent: Record<string, React.ReactNode> = {};

function StepSituation({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    "En poste — je veux évoluer",
    "En poste — je veux changer de secteur",
    "En transition active",
    "En reconversion complète",
    "Freelance — je veux pivoter",
  ];
  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "w-full text-left p-4 rounded-xl text-sm transition-all",
            value === opt
              ? "bg-primary/10 border border-primary/30 text-foreground font-bold"
              : "bg-surface-container-lowest ghost-border text-muted-foreground hover:bg-surface-container"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function StepRole() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Rôle actuel
        </label>
        <input
          type="text"
          placeholder="Ex: Chef de projet IT, Business Analyst..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Secteur d&apos;activité
        </label>
        <input
          type="text"
          placeholder="Ex: Banque, Assurance, Tech..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Années d&apos;expérience
        </label>
        <input
          type="number"
          placeholder="8"
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
    </div>
  );
}

function StepAmbitions() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Rôle cible
        </label>
        <input
          type="text"
          placeholder="Ex: Solutions Architect, CTO, Lead Data..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Secteur cible
        </label>
        <input
          type="text"
          placeholder="Ex: FinTech, SaaS, HealthTech..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>
      {/* AI Suggestion */}
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-4 rounded-xl light-streak">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">AI Suggestion</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          Basé sur votre profil AMOA/IT avec 8 ans d&apos;expérience, les rôles de <strong>Solutions Architect</strong> et <strong>Technical Lead</strong> dans la FinTech présentent le meilleur rapport accessibilité/impact salarial.
        </p>
      </div>
    </div>
  );
}

function StepSkills() {
  const skills = [
    "Architecture technique", "Cloud AWS/GCP", "Microservices", "Data Engineering",
    "Gestion de projet", "AMOA", "SQL / Base de données", "API Design",
    "Leadership", "Communication", "DevOps / CI-CD", "Agile / Scrum",
  ];
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Sélectionnez vos compétences principales :</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <button
            key={skill}
            onClick={() =>
              setSelected((prev) =>
                prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
              )
            }
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all",
              selected.includes(skill)
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-surface-container-lowest text-muted-foreground ghost-border hover:bg-surface-container"
            )}
          >
            {skill}
          </button>
        ))}
      </div>
      {selected.length >= 3 && (
        <div className="bg-surface-container-high/70 backdrop-blur-sm p-4 rounded-xl light-streak animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">AI Analysis</span>
          </div>
          <p className="text-xs text-foreground leading-relaxed">
            Profil solide en <strong>gestion de projet</strong> et <strong>architecture</strong>. Je détecte un gap potentiel en <strong>Cloud</strong> et <strong>DevOps</strong> qu&apos;il faudra combler pour les rôles d&apos;architecte.
          </p>
        </div>
      )}
    </div>
  );
}

function StepBlockers() {
  const blockers = [
    "Manque de confiance technique",
    "Pas assez de réseau dans le secteur cible",
    "CV pas adapté au nouveau rôle",
    "Syndrome de l'imposteur",
    "Manque de temps pour se former",
    "Pas de certifications reconnues",
    "Incertitude financière",
    "Peur du changement",
  ];
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="space-y-3">
      {blockers.map((b) => (
        <button
          key={b}
          onClick={() =>
            setSelected((prev) =>
              prev.includes(b) ? prev.filter((s) => s !== b) : [...prev, b]
            )
          }
          className={cn(
            "w-full text-left p-4 rounded-xl text-sm transition-all",
            selected.includes(b)
              ? "bg-destructive/10 border border-destructive/20 text-foreground font-bold"
              : "bg-surface-container-lowest ghost-border text-muted-foreground hover:bg-surface-container"
          )}
        >
          {b}
        </button>
      ))}
    </div>
  );
}

function StepConfidence() {
  const [level, setLevel] = useState(5);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-6xl font-headline font-extrabold text-primary text-glow mb-2">{level}</p>
        <p className="text-xs text-muted-foreground">sur 10</p>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Peu confiant</span>
        <span>Très confiant</span>
      </div>
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-4 rounded-xl light-streak animate-fade-up">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Mindset Coach</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          {level <= 4
            ? "C'est normal de douter au début d'une transition. Le parcours NextMove est conçu pour construire votre confiance étape par étape."
            : level <= 7
            ? "Bon niveau de confiance ! Nous allons canaliser cette énergie vers des actions concrètes pour accélérer votre transition."
            : "Excellent mindset ! Votre détermination est un atout majeur. Concentrons-nous sur l'exécution stratégique."}
        </p>
      </div>
    </div>
  );
}

function StepGoals() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Objectif à court terme (3 mois)
        </label>
        <textarea
          placeholder="Ex: Décrocher un entretien pour un rôle d'architecte dans la FinTech..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-24"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Objectif à moyen terme (12 mois)
        </label>
        <textarea
          placeholder="Ex: Être en poste en tant que Solutions Architect avec une hausse salariale de 30%..."
          className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-24"
        />
      </div>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
          Rythme préféré
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["relaxed", "moderate", "intensive"] as const).map((pace) => (
            <button
              key={pace}
              className="p-3 rounded-xl bg-surface-container-lowest ghost-border text-xs font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all capitalize"
            >
              {pace === "relaxed" ? "Tranquille" : pace === "moderate" ? "Modéré" : "Intensif"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSummary() {
  return (
    <div className="space-y-6">
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-6 rounded-2xl light-streak surface-glow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-foreground">Votre profil IA</h3>
            <p className="text-xs text-primary">Analysé par NextMove Copilot</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl ghost-border">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Profil détecté</p>
            <p className="text-sm text-foreground font-bold">AMOA / Chef de projet IT → Solutions Architect</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl ghost-border">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Forces clés</p>
            <p className="text-sm text-foreground">Vision business, gestion de projet, architecture systèmes</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl ghost-border">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Axes de progression</p>
            <p className="text-sm text-foreground">Cloud AWS, DevOps, certifications techniques</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl ghost-border">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Recommandation</p>
            <p className="text-sm text-foreground">Parcours intensif de 6 mois ciblant les rôles d&apos;architecte en FinTech. Probabilité de succès estimée : <span className="text-primary font-bold">78%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const stepComponents = [
  StepSituation,
  StepRole,
  StepAmbitions,
  StepSkills,
  StepBlockers,
  StepConfidence,
  StepGoals,
  StepSummary,
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [situation, setSituation] = useState("");
  const step = onboardingSteps[currentStep];
  const Icon = iconMap[step.icon] || User;
  const isLast = currentStep === onboardingSteps.length - 1;
  const isFirst = currentStep === 0;

  const CurrentStepComponent = stepComponents[currentStep];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {onboardingSteps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "flex-1 h-1 rounded-full transition-all",
                i <= currentStep ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]" : "bg-surface-container-lowest"
              )}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
            Step {currentStep + 1} of {onboardingSteps.length}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% complete
          </span>
        </div>
      </div>

      {/* Step Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-foreground">{step.title}</h1>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8 animate-fade-up">
        {currentStep === 0 ? (
          <StepSituation value={situation} onChange={setSituation} />
        ) : (
          <CurrentStepComponent />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
            isFirst
              ? "opacity-0 pointer-events-none"
              : "bg-surface-container-lowest ghost-border text-muted-foreground hover:text-foreground"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          onClick={() => {
            if (!isLast) setCurrentStep((prev) => prev + 1);
          }}
          className="gradient-primary text-primary-foreground px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
        >
          {isLast ? "Lancer mon parcours" : "Continuer"}
          {isLast ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
