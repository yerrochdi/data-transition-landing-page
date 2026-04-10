"use client";

import {
  Users,
  Trophy,
  CheckCircle2,
  GraduationCap,
  Crown,
  Sparkles,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedItem } from "@/lib/feed/actions";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; verb: string }
> = {
  TASK_COMPLETED: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    verb: "a terminé",
  },
  PHASE_COMPLETED: {
    icon: Trophy,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    verb: "a complété la phase",
  },
  MILESTONE: {
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    verb: "",
  },
  ONBOARDING_STEP: {
    icon: Sparkles,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    verb: "a rejoint NextMove",
  },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return `il y a ${Math.floor(days / 7)}sem`;
}

export function FeedView({
  feed,
  userName,
}: {
  feed: FeedItem[];
  userName: string;
}) {
  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
              Communauté
            </h1>
            <p className="text-xs text-muted-foreground">
              Vois les avancées des autres — tu n&apos;es pas seul(e) dans cette transition
            </p>
          </div>
        </div>
      </header>

      {feed.length === 0 ? (
        <div className="text-center py-16">
          <Flame className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-headline text-lg font-bold text-foreground mb-2">
            Le feed est vide pour l&apos;instant
          </h3>
          <p className="text-sm text-muted-foreground">
            Complète des tâches pour être le premier à apparaître ici !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {feed.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.MILESTONE;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="flex items-start gap-4 p-4 bg-surface-container-low rounded-xl ghost-border hover:bg-surface-container transition-colors"
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                    config.bg,
                    config.color
                  )}
                >
                  {item.userInitial}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-bold">{item.userName}</span>{" "}
                    <span className="text-muted-foreground">
                      {config.verb}
                    </span>{" "}
                    <span className="font-semibold">{item.title}</span>
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {item.description}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    {timeAgo(item.createdAt)}
                  </p>
                </div>

                {/* Type Icon */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    config.bg
                  )}
                >
                  <Icon className={cn("w-4 h-4", config.color)} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
