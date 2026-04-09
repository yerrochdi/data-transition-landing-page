"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Play,
  Lock,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  MessageSquare,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleTask } from "@/lib/journey/actions";
import type { JourneyData, JourneyPhaseData, JourneyTaskData } from "@/lib/journey/actions";

// ─── Task Item ────────────────────────────────────────────────────

function TaskItem({
  task,
  phaseStatus,
  onToggle,
  isPending,
  onAskCopilot,
  router,
}: {
  task: JourneyTaskData;
  phaseStatus: string;
  onToggle: (taskProgressId: string) => void;
  isPending: boolean;
  onAskCopilot: (taskTitle: string) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const isDone = task.status === "DONE";
  const isLocked = task.status === "LOCKED";
  const canToggle = !isLocked && task.taskProgressId && !isPending;

  // Extract links from description (detect known platforms)
  const hasLink = /(?:DataCamp|Coursera|Khan Academy|HackerRank|Kaggle|LinkedIn|Power BI|Tableau|Google|W3Schools|Mode Analytics)/i.test(task.description);

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl transition-all",
        isDone && "bg-emerald-500/5 border border-emerald-500/10",
        task.status === "IN_PROGRESS" && "bg-surface-container-lowest ghost-border",
        isLocked && "bg-surface-container-lowest/40 ghost-border opacity-50"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => canToggle && onToggle(task.taskProgressId!)}
        disabled={!canToggle}
        className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all",
          isDone && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
          task.status === "IN_PROGRESS" && "border-2 border-primary text-primary hover:bg-primary/10 cursor-pointer",
          isLocked && "border border-border text-muted-foreground cursor-not-allowed"
        )}
      >
        {isDone ? (
          <Check className="w-3.5 h-3.5" />
        ) : isLocked ? (
          <Lock className="w-3 h-3" />
        ) : (
          <Circle className="w-3 h-3" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className={cn(
            "text-sm font-bold",
            isDone ? "text-emerald-400 line-through decoration-emerald-500/30" : "text-foreground"
          )}>
            {task.title}
          </h4>
          {isDone && (
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
              +5 XP
            </span>
          )}
          {!isDone && !isLocked && (
            <span className="text-[9px] font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full shrink-0">
              +5 XP
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{task.description}</p>

        {/* Action buttons */}
        {!isDone && !isLocked && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push(`/journey/task/${task.id}`)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <GraduationCap className="w-3 h-3" />
              Commencer la session
            </button>
            {canToggle && (
              <button
                onClick={() => onToggle(task.taskProgressId!)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Check className="w-3 h-3" />
                Marquer terminé
              </button>
            )}
            <button
              onClick={() => onAskCopilot(task.title)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              Aide du Copilot
            </button>
            {hasLink && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <ExternalLink className="w-3 h-3" />
                Ressource mentionnée dans la description
              </span>
            )}
          </div>
        )}
        {isDone && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => router.push(`/journey/task/${task.id}`)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-lg transition-colors"
            >
              <GraduationCap className="w-3 h-3" />
              Revoir la session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Phase Card ───────────────────────────────────────────────────

function PhaseCard({
  phase,
  isExpanded,
  onToggleExpand,
  onToggleTask,
  onAskCopilot,
  isPending,
  router,
}: {
  phase: JourneyPhaseData;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleTask: (taskProgressId: string) => void;
  onAskCopilot: (taskTitle: string) => void;
  isPending: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const isCompleted = phase.status === "COMPLETED";
  const isActive = phase.status === "ACTIVE";
  const isLocked = phase.status === "LOCKED";
  const doneTasks = phase.tasks.filter((t) => t.status === "DONE").length;
  const totalTasks = phase.tasks.length;

  return (
    <div className={cn("relative group", isLocked && "opacity-40")}>
      {/* Timeline Node */}
      <div className="absolute -left-4 md:-left-8 top-6 w-8 md:w-16 flex justify-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all",
            isCompleted && "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]",
            isActive && "bg-surface-container-high border-2 border-primary text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]",
            isLocked && "bg-surface-container border border-border text-muted-foreground"
          )}
        >
          {isCompleted ? (
            <Trophy className="w-4 h-4" />
          ) : isActive ? (
            <Play className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Phase Card */}
      <button
        onClick={onToggleExpand}
        disabled={isLocked}
        className={cn(
          "w-full text-left p-6 rounded-2xl transition-all",
          isCompleted && "bg-surface-container-low ghost-border hover:bg-surface-container",
          isActive && "bg-surface-container-high border border-primary/20 shadow-xl shadow-primary/5",
          isLocked && "bg-surface-container-low ghost-border cursor-not-allowed"
        )}
      >
        {/* Active glow */}
        {isActive && (
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none rounded-2xl" />
        )}

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary">
                Phase {phase.number}
              </span>
              {isCompleted && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Terminée
                </span>
              )}
              {isActive && (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                  En cours
                </span>
              )}
            </div>
            {!isLocked && (
              isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          <h3 className="font-headline text-xl font-bold text-foreground mb-1">{phase.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">{phase.description}</p>

          {/* Progress bar */}
          {!isLocked && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCompleted ? "bg-emerald-500" : "bg-primary"
                  )}
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                {doneTasks}/{totalTasks}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Expanded Tasks */}
      {isExpanded && !isLocked && (
        <div className="mt-3 ml-2 space-y-2">
          {phase.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              phaseStatus={phase.status}
              onToggle={onToggleTask}
              onAskCopilot={onAskCopilot}
              isPending={isPending}
              router={router}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────

export function JourneyView({ initialData }: { initialData: JourneyData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(() => {
    // Auto-expand active phase
    const active = initialData.phases.find((p) => p.status === "ACTIVE");
    return new Set(active ? [active.id] : []);
  });
  const [isPending, startTransition] = useTransition();

  const handleAskCopilot = (taskTitle: string) => {
    // Navigate to copilot with pre-filled question
    const query = encodeURIComponent(`Aide-moi avec cette tache : "${taskTitle}". Comment je fais concretement ?`);
    router.push(`/agents?q=${query}`);
  };

  const toggleExpand = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const handleToggleTask = (taskProgressId: string) => {
    // Optimistic update
    setData((prev) => {
      const newPhases = prev.phases.map((phase) => {
        const newTasks = phase.tasks.map((task) => {
          if (task.taskProgressId === taskProgressId) {
            const newStatus = task.status === "DONE" ? "IN_PROGRESS" as const : "DONE" as const;
            return { ...task, status: newStatus, progress: newStatus === "DONE" ? 100 : 0 };
          }
          return task;
        });

        const doneTasks = newTasks.filter((t) => t.status === "DONE").length;
        const totalTasks = newTasks.length;
        const phaseProgress = Math.round((doneTasks / totalTasks) * 100);
        const allDone = doneTasks === totalTasks;

        return {
          ...phase,
          tasks: newTasks,
          progress: phaseProgress,
          status: allDone ? "COMPLETED" as const : phase.status === "LOCKED" ? "LOCKED" as const : "ACTIVE" as const,
        };
      });

      // Unlock next phase if current completed
      for (let i = 0; i < newPhases.length - 1; i++) {
        if (newPhases[i].status === "COMPLETED" && newPhases[i + 1].status === "LOCKED") {
          newPhases[i + 1] = {
            ...newPhases[i + 1],
            status: "ACTIVE",
            tasks: newPhases[i + 1].tasks.map((t) => ({
              ...t,
              status: t.status === "LOCKED" ? "IN_PROGRESS" as const : t.status,
            })),
          };
        }
      }

      const completedTasks = newPhases.reduce(
        (sum, p) => sum + p.tasks.filter((t) => t.status === "DONE").length, 0
      );
      const totalTasks = newPhases.reduce((sum, p) => sum + p.tasks.length, 0);

      return {
        ...prev,
        phases: newPhases,
        completedTasks,
        overallProgress: Math.round((completedTasks / totalTasks) * 100),
      };
    });

    // Server update
    startTransition(async () => {
      const result = await toggleTask(taskProgressId);
      if (!result.success) {
        console.error("Failed to toggle task:", result.error);
        // TODO: revert optimistic update on failure
      }
    });
  };

  const activePhase = data.phases.find((p) => p.status === "ACTIVE");

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
              Parcours de transition
            </h1>
            <p className="text-xs text-muted-foreground">
              Votre feuille de route personnalisée vers la data/IA
            </p>
          </div>
        </div>
      </header>

      {/* Overall Progress */}
      <div className="bg-surface-container-low rounded-2xl ghost-border p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Flame className={cn("w-5 h-5", data.overallProgress >= 50 ? "text-amber-400" : "text-muted-foreground")} />
            <span className="text-sm font-headline font-bold text-foreground">Progression globale</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-headline font-black text-primary tabular-nums">
              {data.overallProgress}%
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">
              {data.completedTasks}/{data.totalTasks} tâches
            </span>
          </div>
        </div>
        <div className="h-3 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-700 shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
            style={{ width: `${data.overallProgress}%` }}
          />
        </div>

        {/* Phase indicators */}
        <div className="flex items-center gap-2 mt-4">
          {data.phases.map((phase) => (
            <div key={phase.id} className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full",
                phase.status === "COMPLETED" ? "bg-emerald-500" :
                phase.status === "ACTIVE" ? "bg-primary animate-pulse" :
                "bg-surface-container"
              )} />
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider",
                phase.status === "COMPLETED" ? "text-emerald-400" :
                phase.status === "ACTIVE" ? "text-primary" :
                "text-muted-foreground/40"
              )}>
                {phase.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Task Banner */}
      {activePhase && (() => {
        const nextTask = activePhase.tasks.find((t) => t.status === "IN_PROGRESS");
        if (!nextTask) return null;
        return (
          <div className="bg-gradient-to-r from-primary/10 via-surface-container-high to-primary/5 rounded-2xl border border-primary/20 p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                Votre prochaine action
              </span>
            </div>
            <h3 className="font-headline text-lg font-bold text-foreground mb-1">
              {nextTask.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">{nextTask.description}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => router.push(`/journey/task/${nextTask.id}`)}
                className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold hover:scale-[1.02] transition-transform"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Commencer la session
              </button>
              {nextTask.taskProgressId && (
                <button
                  onClick={() => handleToggleTask(nextTask.taskProgressId!)}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Déjà fait — valider
                </button>
              )}
              <button
                onClick={() => handleAskCopilot(nextTask.title)}
                className="inline-flex items-center gap-2 bg-surface-container-lowest ghost-border px-5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Aide du Copilot
              </button>
            </div>
          </div>
        );
      })()}

      {/* Phases Timeline */}
      <div className="relative pl-10 md:pl-16 space-y-6">
        {/* Vertical Line */}
        <div className="absolute left-4 md:left-7 top-6 bottom-6 w-px bg-border/20">
          <div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 via-primary to-transparent transition-all duration-700"
            style={{ height: `${data.overallProgress}%` }}
          />
        </div>

        {data.phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            isExpanded={expandedPhases.has(phase.id)}
            onToggleExpand={() => toggleExpand(phase.id)}
            onToggleTask={handleToggleTask}
            onAskCopilot={handleAskCopilot}
            isPending={isPending}
            router={router}
          />
        ))}
      </div>
    </div>
  );
}
