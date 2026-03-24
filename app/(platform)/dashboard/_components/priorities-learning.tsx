"use client";

import { ListOrdered, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrioritiesLearningProps {
  priorities: string[];
  learningStyle: string[];
  keyAchievements: string | null;
}

const PRIORITY_LABELS: Record<string, string> = {
  growth: "Évolution de carrière",
  security: "Sécurité de l'emploi",
  salary: "Augmentation salariale",
  impact: "Impact & sens",
  freedom: "Liberté & autonomie",
  balance: "Équilibre vie pro/perso",
};

const LEARNING_LABELS: Record<string, { label: string; emoji: string }> = {
  autodidact: { label: "Autodidacte", emoji: "📚" },
  courses: { label: "Cours en ligne", emoji: "🎓" },
  bootcamp: { label: "Bootcamp", emoji: "🚀" },
  mentoring: { label: "Mentorat", emoji: "🤝" },
  projects: { label: "Projets pratiques", emoji: "🔧" },
};

export function PrioritiesLearning({
  priorities,
  learningStyle,
  keyAchievements,
}: PrioritiesLearningProps) {
  if (priorities.length === 0 && learningStyle.length === 0 && !keyAchievements) {
    return null;
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <div className="flex items-center gap-2 mb-4">
        <ListOrdered className="w-5 h-5 text-primary" />
        <h3 className="font-headline text-sm font-bold text-foreground">
          Priorités & Apprentissage
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Priorities ranked */}
        {priorities.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2.5">
              Vos priorités (classées)
            </p>
            <div className="space-y-1.5">
              {priorities.map((p, i) => (
                <div key={p} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : i === 1
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-container text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className={cn(
                    "text-xs",
                    i === 0 ? "font-bold text-foreground" : "text-muted-foreground"
                  )}>
                    {PRIORITY_LABELS[p] || p}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning style */}
        {learningStyle.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Style d&apos;apprentissage
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {learningStyle.map((style) => {
                const info = LEARNING_LABELS[style];
                return (
                  <span
                    key={style}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-container-lowest rounded-lg ghost-border text-xs font-medium text-foreground"
                  >
                    {info?.emoji && <span>{info.emoji}</span>}
                    {info?.label || style}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Key achievements */}
      {keyAchievements && (
        <div className="mt-4 pt-4 border-t border-border/10">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
            Réalisations clés
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {keyAchievements}
          </p>
        </div>
      )}
    </div>
  );
}
