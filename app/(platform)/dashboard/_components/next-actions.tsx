"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Play,
  MessageSquare,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NextAction {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  color: string;
  bg: string;
  priority: number; // lower = higher priority
}

interface NextActionsProps {
  targetRole: string | null;
  skillGaps: string[];
  overallJourneyProgress: number;
  activePhaseTitle: string | null;
  nextTaskTitle: string | null;
  completedTasks: number;
  totalTasks: number;
}

export function NextActions({
  targetRole,
  skillGaps,
  overallJourneyProgress,
  activePhaseTitle,
  nextTaskTitle,
  completedTasks,
  totalTasks,
}: NextActionsProps) {
  const router = useRouter();

  // Build contextual actions based on user state
  const actions: NextAction[] = [];

  // Journey action — always present if there are tasks to do
  if (overallJourneyProgress < 100 && nextTaskTitle) {
    actions.push({
      id: "journey",
      icon: Play,
      label: activePhaseTitle ? `Phase : ${activePhaseTitle}` : "Continuer le parcours",
      description: nextTaskTitle,
      href: "/journey",
      color: "text-primary",
      bg: "bg-primary/10",
      priority: 1,
    });
  } else if (completedTasks === 0) {
    actions.push({
      id: "journey-start",
      icon: Target,
      label: "Demarrer votre parcours",
      description: "Votre premiere tache vous attend — ca prend 5 minutes.",
      href: "/journey",
      color: "text-primary",
      bg: "bg-primary/10",
      priority: 1,
    });
  }

  // Copilot action
  actions.push({
    id: "copilot",
    icon: MessageSquare,
    label: "Parler au Copilot IA",
    description: targetRole
      ? `Demandez conseil pour devenir ${targetRole}`
      : "Posez vos questions sur votre transition",
    href: "/agents",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    priority: 2,
  });

  // Skill gaps action
  if (skillGaps.length > 0) {
    actions.push({
      id: "resources",
      icon: BookOpen,
      label: `Combler : ${skillGaps[0]}`,
      description: "Trouvez les meilleures formations pour ce gap",
      href: "/resources",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      priority: 3,
    });
  }

  // Opportunities action
  if (overallJourneyProgress >= 30) {
    actions.push({
      id: "opportunities",
      icon: Zap,
      label: "Explorer le marche",
      description: `Voir les offres de ${targetRole || "data"} qui matchent votre profil`,
      href: "/opportunities",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      priority: 4,
    });
  }

  // Show top 3 actions
  const displayed = actions.sort((a, b) => a.priority - b.priority).slice(0, 3);

  return (
    <div className="bg-surface-container-low rounded-2xl ghost-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Prochaines actions
          </h3>
        </div>
        {totalTasks > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {completedTasks}/{totalTasks} taches terminees
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {displayed.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => router.push(action.href)}
              className={cn(
                "group flex items-start gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.02]",
                i === 0
                  ? "bg-surface-container-high border border-primary/20 shadow-lg shadow-primary/5"
                  : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", action.bg)}>
                <Icon className={cn("w-5 h-5", action.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("text-xs font-bold truncate", i === 0 ? "text-primary" : "text-foreground")}>
                    {action.label}
                  </p>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
