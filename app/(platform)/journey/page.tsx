"use client";

import { Check, Play, Lock, ArrowRight, Loader2, Rocket } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { journeyPhases } from "@/lib/mock-data";
import type { JourneyPhase, JourneyTask } from "@/lib/types";

function getPhaseIcon(status: JourneyPhase["status"]) {
  switch (status) {
    case "completed":
      return <Check className="w-4 h-4" />;
    case "active":
      return <Play className="w-4 h-4" />;
    case "locked":
      return <Lock className="w-4 h-4" />;
  }
}

function getTaskIcon(status: JourneyTask["status"]) {
  switch (status) {
    case "done":
      return <Check className="w-3 h-3" />;
    case "in_progress":
      return <Loader2 className="w-3 h-3 animate-spin" />;
    case "locked":
      return <Lock className="w-3 h-3" />;
  }
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as Record<string, React.ElementType>)[name];
  return Icon ? <Icon className={className} /> : null;
}

function PhaseNode({ phase, isLast }: { phase: JourneyPhase; isLast: boolean }) {
  const isCompleted = phase.status === "completed";
  const isActive = phase.status === "active";
  const isLocked = phase.status === "locked";

  return (
    <div className={cn("relative group", isLocked && "opacity-50 grayscale")}>
      {/* Timeline Node */}
      <div className="absolute -left-[16px] md:-left-[32px] top-0 w-8 md:w-16 flex justify-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-transform group-hover:scale-110",
            isCompleted && "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(75,226,119,0.5)]",
            isActive && "bg-surface-container-high border-2 border-primary text-primary shadow-[0_0_15px_rgba(75,226,119,0.3)] animate-pulse",
            isLocked && "bg-surface-container-lowest border border-border text-muted-foreground"
          )}
        >
          {getPhaseIcon(phase.status)}
        </div>
      </div>

      {/* Phase Card */}
      <div
        className={cn(
          "p-6 md:p-8 rounded-2xl transition-all overflow-hidden relative",
          isCompleted && "bg-surface-container-low ghost-border group-hover:bg-surface-container",
          isActive && "bg-surface-container-high border border-primary/20 shadow-xl shadow-primary/5 group-hover:bg-surface-bright",
          isLocked && "bg-surface-container-low ghost-border"
        )}
      >
        {/* Active phase neon accent */}
        {isActive && (
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary mb-1 block">
              Phase {phase.number}
            </span>
            <h3 className="font-headline text-2xl font-bold text-foreground">{phase.title}</h3>
            {isActive && (
              <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
            )}
          </div>

          {isCompleted && (
            <div className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              <span className="text-xs font-bold text-primary">COMPLETED</span>
            </div>
          )}
          {isActive && phase.progress !== undefined && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground">IN PROGRESS</span>
              <div className="w-16 h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary shadow-[0_0_5px_hsl(var(--primary))]"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Completed phase — modules grid */}
        {isCompleted && phase.modules.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {phase.modules.map((mod) => (
              <div key={mod.id} className="bg-surface-container-lowest p-4 rounded-xl ghost-border">
                <DynamicIcon name={mod.icon} className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs font-bold text-foreground mb-1">{mod.title}</p>
                <p className="text-[10px] text-muted-foreground">{mod.subtitle}</p>
              </div>
            ))}
          </div>
        )}

        {/* Vision phase — special layout */}
        {isCompleted && phase.id === "vision" && phase.modules.length > 0 && (
          <div className="flex items-center gap-4 bg-surface-container-lowest/50 p-4 rounded-xl mt-4">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{phase.modules[0].title}</p>
              <p className="text-xs text-muted-foreground">{phase.modules[0].subtitle}</p>
            </div>
            <Rocket className="w-5 h-5 text-primary" />
          </div>
        )}

        {/* Active phase — tasks */}
        {isActive && phase.tasks.length > 0 && (
          <div className="space-y-4">
            {phase.tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl",
                  task.status === "done" && "bg-surface-container-lowest/80 ghost-border",
                  task.status === "in_progress" && "bg-surface-container-highest border-l-4 border-primary shadow-lg",
                  task.status === "locked" && "bg-surface-container-lowest/40 ghost-border opacity-60"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center mt-1",
                    task.status === "done" && "border border-primary bg-primary text-primary-foreground",
                    task.status === "in_progress" && "border border-primary text-primary",
                    task.status === "locked" && "border border-border text-muted-foreground"
                  )}
                >
                  {getTaskIcon(task.status)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h4 className="text-sm font-bold text-foreground">{task.title}</h4>
                    {task.status === "done" && (
                      <span className="text-[10px] text-primary font-bold">DONE</span>
                    )}
                    {task.status === "in_progress" && task.progress !== undefined && (
                      <span className="text-[10px] text-primary font-bold">{task.progress}%</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                  {task.status === "in_progress" && (
                    <button className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
                      RESUME SESSION
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Locked phase — description only */}
        {isLocked && !isActive && (
          <p className="text-xs text-muted-foreground">{phase.description}</p>
        )}
      </div>
    </div>
  );
}

export default function JourneyPage() {
  const activePhase = journeyPhases.find((p) => p.status === "active");
  const progress = activePhase?.progress || 0;

  return (
    <div>
      <header className="mb-12">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground mb-2">
          The Journey Path
        </h1>
        <p className="text-muted-foreground font-body max-w-2xl">
          Your career evolution mapped by AI. Complete the architectural phases to unlock your final
          position in the tech ecosystem.
        </p>
      </header>

      <div className="relative pl-8 md:pl-16 space-y-16">
        {/* Vertical Progress Line */}
        <div className="absolute left-[15px] md:left-[31px] top-4 bottom-4 w-px bg-border/30">
          <div className="absolute top-0 left-0 w-full node-line" style={{ height: `${progress}%` }} />
        </div>

        {journeyPhases.map((phase, i) => (
          <PhaseNode key={phase.id} phase={phase} isLast={i === journeyPhases.length - 1} />
        ))}
      </div>
    </div>
  );
}
