"use client";

import { Flame, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StreakTipProps {
  streakDays: number;
  dailyTip: string;
}

export function StreakTip({ streakDays, dailyTip }: StreakTipProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4">
      {/* Streak Badge */}
      <div className="flex items-center gap-3 bg-surface-container-low rounded-2xl ghost-border p-4 sm:p-5">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          streakDays >= 7 ? "bg-amber-500/20" : streakDays >= 3 ? "bg-primary/20" : "bg-surface-container"
        )}>
          <Flame className={cn(
            "w-6 h-6",
            streakDays >= 7 ? "text-amber-400" : streakDays >= 3 ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        <div>
          <p className={cn(
            "text-2xl font-headline font-black tabular-nums",
            streakDays >= 7 ? "text-amber-400" : streakDays >= 3 ? "text-primary" : "text-foreground"
          )}>
            {streakDays}
          </p>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            jour{streakDays > 1 ? "s" : ""} de streak
          </p>
        </div>
        {streakDays >= 7 && (
          <span className="text-lg ml-1">🔥</span>
        )}
      </div>

      {/* Daily Tip */}
      <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">
            Conseil du jour
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {dailyTip}
          </p>
          <Link
            href="/agents"
            className="inline-flex items-center gap-1 text-[10px] text-primary font-bold mt-2 hover:underline"
          >
            Demander au Copilot
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
