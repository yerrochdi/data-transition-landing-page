"use client";

import { cn } from "@/lib/utils";

interface ReadinessBreakdownProps {
  readinessScore: number;
  experienceYears: number | null;
  hasDataTraining: boolean;
  educationLevel: string | null;
  certifications: string[];
  confidenceLevel: number;
  availableHoursPerWeek: number | null;
  skillCount: number;
  blockerCount: number;
}

interface Dimension {
  label: string;
  score: number;
  maxScore: number;
  color: string;
}

function computeDimensions(props: ReadinessBreakdownProps): Dimension[] {
  const {
    experienceYears,
    hasDataTraining,
    educationLevel,
    certifications,
    confidenceLevel,
    availableHoursPerWeek,
    skillCount,
    blockerCount,
  } = props;

  // Experience (max 20)
  const years = experienceYears ?? 0;
  let expScore = years >= 10 ? 20 : years >= 5 ? 16 : years >= 2 ? 10 : 5;

  // Technical readiness (max 25)
  let techScore = 0;
  if (hasDataTraining) techScore += 12;
  techScore += Math.min(certifications.length * 4, 8);
  techScore += Math.min(skillCount * 1.5, 5);

  // Education (max 15)
  const edu = (educationLevel || "").toLowerCase();
  let eduScore = 3;
  if (edu.includes("bac+5") || edu.includes("master") || edu.includes("ingénieur")) eduScore = 15;
  else if (edu.includes("bac+3") || edu.includes("licence")) eduScore = 10;
  else if (edu.includes("bac+2")) eduScore = 7;
  else if (edu.includes("bac")) eduScore = 5;

  // Mindset (max 20)
  let mindsetScore = Math.round((confidenceLevel / 10) * 12);
  if (blockerCount === 0) mindsetScore += 8;
  else if (blockerCount <= 2) mindsetScore += 5;
  else mindsetScore += 2;
  mindsetScore = Math.min(mindsetScore, 20);

  // Resources (max 20)
  const hours = availableHoursPerWeek ?? 0;
  let resourceScore = 0;
  if (hours >= 15) resourceScore = 14;
  else if (hours >= 8) resourceScore = 10;
  else if (hours >= 3) resourceScore = 6;
  else resourceScore = 2;
  resourceScore += certifications.length > 0 ? 6 : 0;
  resourceScore = Math.min(resourceScore, 20);

  return [
    { label: "Expérience métier", score: expScore, maxScore: 20, color: "hsl(var(--primary))" },
    { label: "Compétences tech", score: Math.round(techScore), maxScore: 25, color: "hsl(210, 100%, 55%)" },
    { label: "Formation", score: eduScore, maxScore: 15, color: "hsl(270, 70%, 60%)" },
    { label: "Mindset", score: mindsetScore, maxScore: 20, color: "hsl(45, 93%, 47%)" },
    { label: "Ressources", score: Math.round(resourceScore), maxScore: 20, color: "hsl(160, 80%, 45%)" },
  ];
}

export function ReadinessBreakdown(props: ReadinessBreakdownProps) {
  const { readinessScore } = props;
  const dimensions = computeDimensions(props);

  const getScoreLabel = (score: number) => {
    if (score >= 75) return { text: "Excellent", color: "text-emerald-400" };
    if (score >= 50) return { text: "Bon", color: "text-primary" };
    if (score >= 30) return { text: "En construction", color: "text-amber-400" };
    return { text: "Débutant", color: "text-red-400" };
  };

  const label = getScoreLabel(readinessScore);

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-headline text-sm font-bold text-foreground">
          Readiness Transition
        </h3>
        <div className="flex items-center gap-2">
          <span className={cn("text-xl font-headline font-black tabular-nums", label.color)}>
            {readinessScore}%
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", label.color, label.color.replace("text-", "bg-").replace("400", "500/10"))}>
            {label.text}
          </span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-2.5 bg-surface-container rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-1000 ease-out"
          style={{ width: `${readinessScore}%` }}
        />
      </div>

      {/* Dimensions */}
      <div className="space-y-3">
        {dimensions.map((dim) => {
          const pct = Math.round((dim.score / dim.maxScore) * 100);
          return (
            <div key={dim.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-muted-foreground">{dim.label}</span>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: dim.color }}>
                  {dim.score}/{dim.maxScore}
                </span>
              </div>
              <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: dim.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
