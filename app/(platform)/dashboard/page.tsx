"use client";

import {
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Trophy,
  Briefcase,
  Calendar,
  Flame,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import {
  mockUser,
  analyticsData,
  dashboardRecommendations,
  dashboardActivities,
  journeyPhases,
} from "@/lib/mock-data";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as Record<string, React.ElementType>)[name];
  return Icon ? <Icon className={className} /> : null;
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-surface-container-low p-6 rounded-2xl ghost-border hover-glow group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
        {delta && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
            {delta}
          </span>
        )}
      </div>
      <p className="text-2xl font-headline font-extrabold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const activePhase = journeyPhases.find((p) => p.status === "active");

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground mb-1">
          Bonjour, {mockUser.firstName}
        </h1>
        <p className="text-muted-foreground text-sm">
          Voici votre cockpit de transition. Continuez sur votre lancée.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Career Score"
          value={analyticsData.careerScore}
          delta={`+${analyticsData.careerScoreDelta}`}
          icon={Target}
        />
        <StatCard
          label="Progression globale"
          value={`${analyticsData.overallProgress}%`}
          icon={TrendingUp}
        />
        <StatCard
          label="Jours consécutifs"
          value={analyticsData.streakDays}
          icon={Flame}
        />
        <StatCard
          label="Tâches complétées"
          value={analyticsData.totalTasksCompleted}
          delta={`${analyticsData.totalTasksRemaining} restantes`}
          icon={CheckCircle}
        />
      </div>

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-headline text-lg font-bold text-foreground">AI Recommendations</h2>
        </div>
        <div className="space-y-3">
          {dashboardRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-surface-container-high/70 backdrop-blur-sm rounded-2xl p-5 ghost-border light-streak hover-glow group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <DynamicIcon name={rec.agentIcon} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                      {rec.agentName}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      rec.priority === "high"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{rec.title}</h3>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
                <Link
                  href={rec.actionUrl}
                  className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform shrink-0"
                >
                  {rec.actionLabel}
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Journey */}
        <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-sm font-bold text-foreground">Current Phase</h3>
            <Link href="/journey" className="text-xs text-primary font-bold hover:underline">
              View Path
            </Link>
          </div>
          {activePhase && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary">
                  Phase {activePhase.number}
                </span>
                <h4 className="font-headline text-lg font-bold text-foreground">{activePhase.title}</h4>
              </div>
              <div className="relative h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden mb-2">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-green-500 shadow-[0_0_10px_hsl(var(--primary))]"
                  style={{ width: `${activePhase.progress || 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{activePhase.description}</p>
              <div className="mt-4 space-y-2">
                {activePhase.tasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-xl ghost-border">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                      task.status === "done" ? "bg-primary text-primary-foreground" : "border border-primary text-primary"
                    }`}>
                      {task.status === "done" ? <CheckCircle className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                    </div>
                    <span className="text-xs text-foreground font-medium">{task.title}</span>
                    {task.progress !== undefined && (
                      <span className="text-[10px] text-primary font-bold ml-auto">{task.progress}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
          <h3 className="font-headline text-sm font-bold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {dashboardActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <DynamicIcon name={act.icon} className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{act.title}</p>
                  <p className="text-[10px] text-muted-foreground">{act.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
