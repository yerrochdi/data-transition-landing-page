"use client";

import {
  TrendingUp,
  Target,
  Flame,
  AlertTriangle,
  Zap,
  Sparkles,
  BarChart3,
  Trophy,
  Play,
  Lock,
  BookOpen,
  Shield,
  GraduationCap,
  Clock,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsData } from "@/lib/analytics/actions";

// ─── Metric Card ──────────────────────────────────────────────────

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
      "p-5 rounded-2xl ghost-border",
      accent ? "bg-surface-container-high light-streak surface-glow" : "bg-surface-container-low"
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-3xl font-headline font-extrabold text-foreground">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
    </div>
  );
}

// ─── Skill Bar ────────────────────────────────────────────────────

function SkillBar({ name, level, current }: { name: string; level: string; current: number }) {
  const levelLabel: Record<string, string> = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé",
    expert: "Expert",
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">{name}</span>
        <span className={cn(
          "text-[9px] font-bold px-2 py-0.5 rounded-full",
          current >= 75 ? "bg-emerald-500/10 text-emerald-400" :
          current >= 50 ? "bg-primary/10 text-primary" :
          "bg-amber-500/10 text-amber-400"
        )}>
          {levelLabel[level] || level}
        </span>
      </div>
      <div className="relative h-2 w-full bg-surface-container rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            current >= 75 ? "bg-emerald-500" :
            current >= 50 ? "bg-gradient-to-r from-primary to-blue-500" :
            "bg-amber-500"
          )}
          style={{ width: `${current}%` }}
        />
      </div>
    </div>
  );
}

// ─── Readiness Gauge ──────────────────────────────────────────────

function ReadinessGauge({ score }: { score: number }) {
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Bon" : score >= 40 ? "En construction" : "Débutant";
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-primary" : score >= 40 ? "text-amber-400" : "text-red-400";
  const bgColor = score >= 80 ? "from-emerald-500" : score >= 60 ? "from-primary" : score >= 40 ? "from-amber-500" : "from-red-500";

  return (
    <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="font-headline text-sm font-bold text-foreground">Readiness Score</h3>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--surface-container))" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="16" fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${score} ${100 - score}`}
              className={cn("transition-all duration-1000", score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-primary" : score >= 40 ? "stroke-amber-500" : "stroke-red-500")}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-headline font-black text-foreground">{score}%</span>
            <span className={cn("text-[9px] font-bold", color)}>{label}</span>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { label: "Profil", value: Math.min(score + 10, 100) },
            { label: "Compétences", value: Math.max(score - 5, 0) },
            { label: "Engagement", value: Math.min(score + 5, 100) },
          ].map((dim) => (
            <div key={dim.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">{dim.label}</span>
                <span className="text-[10px] font-bold text-foreground tabular-nums">{dim.value}%</span>
              </div>
              <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r to-transparent", bgColor)}
                  style={{ width: `${dim.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Journey Progress ─────────────────────────────────────────────

function JourneyOverview({ phases, progress, completedTasks, totalTasks }: {
  phases: AnalyticsData["journeyPhases"];
  progress: number;
  completedTasks: number;
  totalTasks: number;
}) {
  return (
    <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="font-headline text-sm font-bold text-foreground">Parcours</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-headline font-black text-primary tabular-nums">{progress}%</span>
          <span className="text-[10px] text-muted-foreground">{completedTasks}/{totalTasks}</span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 bg-surface-container rounded-full overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Phase bars */}
      <div className="space-y-3">
        {phases.map((phase) => {
          const isCompleted = phase.status === "COMPLETED";
          const isActive = phase.status === "ACTIVE";
          const isLocked = phase.status === "LOCKED";

          return (
            <div key={phase.id} className="flex items-center gap-3">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                isCompleted && "bg-emerald-500 text-white",
                isActive && "bg-primary/20 text-primary border border-primary/30",
                isLocked && "bg-surface-container text-muted-foreground/40"
              )}>
                {isCompleted ? <Trophy className="w-3 h-3" /> :
                 isActive ? <Play className="w-3 h-3" /> :
                 <Lock className="w-3 h-3" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-xs font-bold truncate",
                    isCompleted ? "text-emerald-400" :
                    isActive ? "text-foreground" :
                    "text-muted-foreground/40"
                  )}>
                    {phase.title}
                  </span>
                  <span className="text-[9px] text-muted-foreground tabular-nums ml-2 shrink-0">
                    {phase.doneTasks}/{phase.totalTasks}
                  </span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isCompleted ? "bg-emerald-500" :
                      isActive ? "bg-primary" :
                      "bg-transparent"
                    )}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Skill Gaps ───────────────────────────────────────────────────

function SkillGapsCard({ gaps, targetRole }: { gaps: string[]; targetRole: string | null }) {
  if (gaps.length === 0) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <h3 className="font-headline text-sm font-bold text-emerald-400">Aucun gap identifié</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Votre profil couvre les compétences clés pour {targetRole || "votre objectif"}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h3 className="font-headline text-sm font-bold text-foreground">Compétences à acquérir</h3>
      </div>
      <div className="space-y-2">
        {gaps.map((gap, i) => (
          <div key={gap} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest ghost-border">
            <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-sm font-bold text-foreground">{gap}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Summary ──────────────────────────────────────────────

function ProfileSummary({ data }: { data: AnalyticsData }) {
  const badges: { icon: React.ElementType; label: string; value: string; color: string }[] = [];

  if (data.educationLevel) {
    badges.push({ icon: GraduationCap, label: "Formation", value: data.educationLevel, color: "text-blue-400" });
  }
  if (data.experienceYears) {
    badges.push({ icon: Clock, label: "Expérience", value: `${data.experienceYears} ans`, color: "text-emerald-400" });
  }
  if (data.hasDataTraining) {
    badges.push({ icon: Brain, label: "Formation Data", value: "Oui", color: "text-purple-400" });
  }
  if (data.certifications.length > 0) {
    badges.push({ icon: Shield, label: "Certifications", value: `${data.certifications.length}`, color: "text-amber-400" });
  }
  if (data.availableHoursPerWeek) {
    badges.push({ icon: Clock, label: "Disponibilité", value: `${data.availableHoursPerWeek}h/sem`, color: "text-primary" });
  }

  return (
    <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-primary" />
        <h3 className="font-headline text-sm font-bold text-foreground">Profil</h3>
      </div>

      {/* Role transition */}
      {(data.currentRole || data.targetRole) && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-surface-container-lowest ghost-border">
          {data.currentRole && (
            <span className="text-xs font-bold text-muted-foreground">{data.currentRole}</span>
          )}
          {data.currentRole && data.targetRole && (
            <TrendingUp className="w-4 h-4 text-primary shrink-0" />
          )}
          {data.targetRole && (
            <span className="text-xs font-bold text-primary">{data.targetRole}</span>
          )}
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <div key={badge.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container ghost-border">
            <badge.icon className={cn("w-3 h-3", badge.color)} />
            <span className="text-[10px] text-muted-foreground">{badge.label}:</span>
            <span className="text-[10px] font-bold text-foreground">{badge.value}</span>
          </div>
        ))}
      </div>

      {/* Top skills */}
      {data.topSkills.length > 0 && (
        <div className="mt-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Compétences</span>
          <div className="flex flex-wrap gap-1.5">
            {data.topSkills.map((skill) => (
              <span key={skill} className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Insight ───────────────────────────────────────────────────

function AiInsightCard({ summary, recommendation, targetRole }: {
  summary: string | null;
  recommendation: string | null;
  targetRole: string | null;
}) {
  if (!summary && !recommendation) {
    return (
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-6 rounded-2xl light-streak surface-glow">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Insight IA</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Complétez votre parcours pour recevoir une analyse IA personnalisée de votre progression
          {targetRole ? ` vers ${targetRole}` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-high/70 backdrop-blur-sm p-6 rounded-2xl light-streak surface-glow">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="text-xs uppercase tracking-widest text-primary font-bold">Analyse IA</span>
      </div>
      {recommendation && (
        <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
      )}
      {summary && !recommendation && (
        <p className="text-sm text-foreground leading-relaxed line-clamp-4">{summary}</p>
      )}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────

export function AnalyticsView({ data }: { data: AnalyticsData }) {
  const daysSinceOnboarding = data.onboardingCompletedAt
    ? Math.floor((Date.now() - new Date(data.onboardingCompletedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
              Analytics & Progression
            </h1>
            <p className="text-xs text-muted-foreground">
              {data.targetRole
                ? `Votre évolution vers ${data.targetRole}`
                : "Suivez votre transformation en temps réel"}
              {daysSinceOnboarding !== null && ` · Jour ${daysSinceOnboarding + 1}`}
            </p>
          </div>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Career Score"
          value={data.careerScore}
          sublabel={`/ 1000 · ${data.completedTasks * 5} XP gagnés`}
          icon={Target}
          accent
        />
        <MetricCard
          label="Readiness"
          value={`${data.readinessScore}%`}
          sublabel="Prêt pour le marché"
          icon={Zap}
        />
        <MetricCard
          label="Streak"
          value={`${data.streakDays}j`}
          sublabel="Jours consécutifs"
          icon={Flame}
        />
        <MetricCard
          label="Parcours"
          value={`${data.journeyProgress}%`}
          sublabel={`${data.completedTasks}/${data.totalTasks} tâches`}
          icon={TrendingUp}
        />
      </div>

      {/* Two columns: Readiness + Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReadinessGauge score={data.readinessScore} />
        <JourneyOverview
          phases={data.journeyPhases}
          progress={data.journeyProgress}
          completedTasks={data.completedTasks}
          totalTasks={data.totalTasks}
        />
      </div>

      {/* Two columns: Skills + Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Progress */}
        {data.skillProgress.length > 0 && (
          <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
            <div className="flex items-center gap-2 mb-5">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="font-headline text-sm font-bold text-foreground">Niveau de compétences</h3>
            </div>
            <div className="space-y-4">
              {data.skillProgress.map((skill) => (
                <SkillBar
                  key={skill.name}
                  name={skill.name}
                  level={skill.level}
                  current={skill.current}
                />
              ))}
            </div>
          </div>
        )}

        {/* Skill Gaps */}
        <SkillGapsCard gaps={data.skillGaps} targetRole={data.targetRole} />
      </div>

      {/* Profile Summary */}
      <ProfileSummary data={data} />

      {/* AI Insight */}
      <AiInsightCard
        summary={data.aiSummary}
        recommendation={data.aiRecommendation}
        targetRole={data.targetRole}
      />
    </div>
  );
}
