"use client";

import {
  TrendingUp,
  Target,
  Flame,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Sparkles,
} from "lucide-react";
import { analyticsData, journeyPhases } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function MetricCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={cn(
      "p-6 rounded-2xl ghost-border",
      accent ? "bg-surface-container-high light-streak surface-glow" : "bg-surface-container-low"
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-3xl font-headline font-extrabold text-foreground">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </div>
  );
}

function SkillBar({ name, current, target }: { name: string; current: number; target: number }) {
  const percentage = Math.round((current / target) * 100);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">{name}</span>
        <span className="text-[10px] text-muted-foreground">
          {current}% / {target}%
        </span>
      </div>
      <div className="relative h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-green-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-muted-foreground/50"
          style={{ left: `${(target / 100) * 100}%` }}
        />
      </div>
    </div>
  );
}

function WeeklyChart() {
  const max = Math.max(...analyticsData.weeklyActivity.map((w) => w.agentInteractions));
  return (
    <div className="flex items-end gap-3 h-32">
      {analyticsData.weeklyActivity.map((week) => (
        <div key={week.week} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full relative">
            <div
              className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-lg transition-all hover:from-primary/50"
              style={{ height: `${(week.agentInteractions / max) * 100}px` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{week.week}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const data = analyticsData;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Skill Roadmap & Analytics
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Track your evolution, identify gaps, and accelerate your transformation.
        </p>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Career Score" value={data.careerScore} sublabel={`+${data.careerScoreDelta} depuis le début`} icon={Target} accent />
        <MetricCard label="Readiness" value={`${data.readinessScore}%`} sublabel="Prêt pour le marché" icon={Zap} />
        <MetricCard label="Streak" value={`${data.streakDays}j`} sublabel="Jours consécutifs" icon={Flame} />
        <MetricCard label="Blockers" value={data.blockerCount} sublabel="À résoudre" icon={AlertTriangle} />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Progress */}
        <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
          <h3 className="font-headline text-sm font-bold text-foreground mb-6">Skill Progress</h3>
          <div className="space-y-4">
            {data.skillProgress.map((skill) => (
              <SkillBar key={skill.name} name={skill.name} current={skill.current} target={skill.target} />
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
          <h3 className="font-headline text-sm font-bold text-foreground mb-6">Agent Interactions</h3>
          <WeeklyChart />
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-headline font-bold text-foreground">
                {data.weeklyActivity.reduce((s, w) => s + w.tasksCompleted, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Tasks Done</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-headline font-bold text-foreground">
                {data.weeklyActivity.reduce((s, w) => s + w.hoursSpent, 0)}h
              </p>
              <p className="text-[10px] text-muted-foreground">Hours Spent</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-headline font-bold text-primary">
                {data.weeklyActivity.reduce((s, w) => s + w.agentInteractions, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">AI Interactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Journey Progress */}
      <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
        <h3 className="font-headline text-sm font-bold text-foreground mb-6">Journey Overview</h3>
        <div className="flex gap-4">
          {journeyPhases.map((phase) => (
            <div key={phase.id} className="flex-1">
              <div className={cn(
                "h-2 rounded-full mb-2",
                phase.status === "completed" && "bg-primary",
                phase.status === "active" && "bg-primary/50",
                phase.status === "locked" && "bg-surface-container-lowest"
              )} />
              <p className="text-xs font-bold text-foreground">{phase.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {phase.status === "completed" ? "Done" : phase.status === "active" ? `${phase.progress}%` : "Locked"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-6 rounded-2xl light-streak surface-glow">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-xs uppercase tracking-widest text-primary font-bold">AI Performance Summary</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          Votre progression est supérieure à la moyenne (+12 points). Les principaux gaps à combler sont en <strong>Cloud AWS</strong> et <strong>FinTech Domain Knowledge</strong>.
          La certification AWS SAP recommandée par l&apos;Opportunity Scout pourrait faire passer votre Career Score de 780 à ~850 en 6 semaines.
        </p>
      </div>
    </div>
  );
}
