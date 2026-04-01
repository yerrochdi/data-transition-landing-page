"use client";

import {
  Trophy,
  Flame,
  Zap,
  Star,
  Rocket,
  Target,
  Shield,
  GraduationCap,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  unlocked: boolean;
  color: string;
}

interface AchievementsProps {
  careerScore: number;
  readinessScore: number;
  streakDays: number;
  skillCount: number;
  gapCount: number;
  confidenceLevel: number;
  hasDataTraining: boolean;
  certificationCount: number;
  blockerCount: number;
}

export function Achievements({
  careerScore,
  readinessScore,
  streakDays,
  skillCount,
  gapCount,
  confidenceLevel,
  hasDataTraining,
  certificationCount,
  blockerCount,
}: AchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: "first-steps",
      icon: Rocket,
      title: "Premier pas",
      description: "Diagnostic complété",
      unlocked: true, // always unlocked if onboarding done
      color: "text-primary",
    },
    {
      id: "score-200",
      icon: Star,
      title: "Rising Star",
      description: "Career Score > 200",
      unlocked: careerScore >= 200,
      color: "text-amber-400",
    },
    {
      id: "score-500",
      icon: Trophy,
      title: "Half Way",
      description: "Career Score > 500",
      unlocked: careerScore >= 500,
      color: "text-amber-400",
    },
    {
      id: "ready-50",
      icon: Target,
      title: "En bonne voie",
      description: "Readiness > 50%",
      unlocked: readinessScore >= 50,
      color: "text-emerald-400",
    },
    {
      id: "ready-80",
      icon: Zap,
      title: "Prêt au décollage",
      description: "Readiness > 80%",
      unlocked: readinessScore >= 80,
      color: "text-emerald-400",
    },
    {
      id: "streak-3",
      icon: Flame,
      title: "On Fire",
      description: "3 jours de streak",
      unlocked: streakDays >= 3,
      color: "text-orange-400",
    },
    {
      id: "streak-7",
      icon: Flame,
      title: "Inarrêtable",
      description: "7 jours de streak",
      unlocked: streakDays >= 7,
      color: "text-red-400",
    },
    {
      id: "skills-5",
      icon: Shield,
      title: "Multi-compétent",
      description: "5+ compétences",
      unlocked: skillCount >= 5,
      color: "text-blue-400",
    },
    {
      id: "data-exp",
      icon: GraduationCap,
      title: "Data Initié",
      description: "Expérience data/IA",
      unlocked: hasDataTraining,
      color: "text-purple-400",
    },
    {
      id: "certified",
      icon: GraduationCap,
      title: "Certifié",
      description: "1+ certification",
      unlocked: certificationCount >= 1,
      color: "text-purple-400",
    },
    {
      id: "confident",
      icon: MessageCircle,
      title: "Confiant",
      description: "Confiance ≥ 7/10",
      unlocked: confidenceLevel >= 7,
      color: "text-primary",
    },
    {
      id: "no-gaps",
      icon: CheckCircle,
      title: "Complet",
      description: "Aucun skill gap",
      unlocked: gapCount === 0,
      color: "text-emerald-400",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="bg-surface-container-low rounded-2xl ghost-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="font-headline text-sm font-bold text-foreground">Badges</h3>
        </div>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {achievements.map((badge) => (
          <div
            key={badge.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
              badge.unlocked
                ? "bg-surface-container-lowest ghost-border"
                : "bg-surface-container/50 opacity-30"
            )}
            title={badge.description}
          >
            <badge.icon className={cn("w-4 h-4", badge.unlocked ? badge.color : "text-muted-foreground")} />
            <div>
              <p className={cn("text-[10px] font-bold leading-tight", badge.unlocked ? "text-foreground" : "text-muted-foreground")}>
                {badge.title}
              </p>
              <p className="text-[8px] text-muted-foreground leading-tight">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
