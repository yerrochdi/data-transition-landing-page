"use client";

import { AlertTriangle, BookOpen, ExternalLink, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillGapsProps {
  skillGaps: string[];
  topSkills: string[];
  targetRole: string | null;
}

// Learning resource recommendations per skill gap
const SKILL_RESOURCES: Record<string, { platform: string; course: string; duration: string; free: boolean }> = {
  sql: { platform: "DataCamp", course: "Introduction to SQL", duration: "4h", free: true },
  python: { platform: "Coursera", course: "Python for Data Science (IBM)", duration: "20h", free: true },
  "data visualization": { platform: "Udemy", course: "Tableau 2024 A-Z", duration: "14h", free: false },
  "excel avancé": { platform: "OpenClassrooms", course: "Excel : Analysez des données", duration: "10h", free: true },
  statistiques: { platform: "Khan Academy", course: "Statistiques et probabilités", duration: "15h", free: true },
  "power bi ou tableau": { platform: "Microsoft Learn", course: "Power BI Data Analyst", duration: "25h", free: true },
  "machine learning": { platform: "Coursera", course: "ML Specialization (Andrew Ng)", duration: "60h", free: true },
  "product analytics": { platform: "Reforge", course: "Product Analytics", duration: "30h", free: false },
};

function findResource(gap: string): { platform: string; course: string; duration: string; free: boolean } | null {
  const normalized = gap.toLowerCase().replace(" (approfondir)", "");
  for (const [key, value] of Object.entries(SKILL_RESOURCES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  return null;
}

export function SkillGaps({ skillGaps, topSkills, targetRole }: SkillGapsProps) {
  if (skillGaps.length === 0 && topSkills.length === 0) return null;

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="font-headline text-sm font-bold text-foreground">
            Compétences à acquérir
          </h3>
        </div>
        {targetRole && (
          <span className="text-[10px] font-bold text-muted-foreground bg-surface-container px-2.5 py-1 rounded-full">
            Pour devenir {targetRole}
          </span>
        )}
      </div>

      {/* Current strengths summary */}
      {topSkills.length > 0 && (
        <div className="mb-5 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
              Vos acquis ({topSkills.length} compétences)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topSkills.slice(0, 8).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
            {topSkills.length > 8 && (
              <span className="px-2 py-0.5 text-emerald-400/60 text-[10px] font-medium">
                +{topSkills.length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Gaps with resources */}
      {skillGaps.length > 0 && (
        <div className="space-y-3">
          {skillGaps.map((gap, i) => {
            const resource = findResource(gap);
            const isDeepen = gap.includes("(approfondir)");
            return (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  "bg-surface-container-lowest border-border/10 hover:border-amber-500/20"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      isDeepen
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-amber-500/10 text-amber-400"
                    )}>
                      {i + 1}
                    </div>
                    <span className="text-xs font-bold text-foreground">{gap}</span>
                  </div>
                  {isDeepen ? (
                    <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      Approfondir
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      À acquérir
                    </span>
                  )}
                </div>
                {resource && (
                  <div className="flex items-center gap-2 mt-2 ml-7">
                    <BookOpen className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {resource.platform} — {resource.course}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60">
                      ({resource.duration})
                    </span>
                    {resource.free && (
                      <span className="text-[9px] font-bold text-emerald-400">Gratuit</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
