"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SkillLevel } from "@/lib/dashboard/actions";

interface SkillsRadarProps {
  skills: string[];
  skillLevels?: SkillLevel[];
}

// Map user skills to display categories with estimated levels
const SKILL_CATEGORIES: Record<string, { label: string; keywords: string[] }> = {
  leadership: { label: "Leadership", keywords: ["leadership", "management", "direction", "pilotage"] },
  gestion: { label: "Gestion de projet", keywords: ["gestion de projet", "amoa", "moa", "coordination", "organisation"] },
  communication: { label: "Communication", keywords: ["communication", "présentation", "rédaction", "négociation"] },
  analyse: { label: "Analyse", keywords: ["analyse", "modélisation", "audit", "diagnostic", "stratégie"] },
  technique: { label: "Tech / Data", keywords: ["sql", "python", "excel", "data", "bi", "tableau", "power bi", "code", "développement"] },
  domaine: { label: "Expertise métier", keywords: ["finance", "rh", "marketing", "juridique", "santé", "banque", "assurance", "comptabilité", "logistique"] },
};

const LEVEL_SCORES: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 95,
};

function computeRadarData(skills: string[], skillLevels?: SkillLevel[]) {
  const normalized = skills.map((s) => s.toLowerCase());

  // Build a map of skill → numeric score from skillLevels
  const levelMap = new Map<string, number>();
  if (skillLevels?.length) {
    for (const sl of skillLevels) {
      levelMap.set(sl.name.toLowerCase(), LEVEL_SCORES[sl.level] ?? 50);
    }
  }

  return Object.entries(SKILL_CATEGORIES).map(([, cat]) => {
    const matchingKeywords = cat.keywords.filter((kw) =>
      normalized.some((s) => s.includes(kw) || kw.includes(s))
    );

    let current: number;
    if (matchingKeywords.length > 0 && levelMap.size > 0) {
      // Find the best matching skill level for this category
      const scores: number[] = [];
      for (const kw of matchingKeywords) {
        for (const [skillName, score] of levelMap) {
          if (skillName.includes(kw) || kw.includes(skillName)) {
            scores.push(score);
          }
        }
      }
      if (scores.length > 0) {
        current = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      } else {
        // Has matching keywords but no explicit level → use match count heuristic
        current = Math.min(30 + matchingKeywords.length * 20, 80);
      }
    } else if (matchingKeywords.length > 0) {
      current = Math.min(30 + matchingKeywords.length * 25, 90);
    } else {
      current = 15;
    }

    const target = Math.min(current + 25, 100);
    return {
      category: cat.label,
      current,
      target,
    };
  });
}

export function SkillsRadar({ skills, skillLevels }: SkillsRadarProps) {
  const data = computeRadarData(skills, skillLevels);

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 ghost-border">
      <h3 className="font-headline text-sm font-bold text-foreground mb-2">Profil de compétences</h3>
      <p className="text-[10px] text-muted-foreground mb-4">Actuel vs. Cible pour votre transition</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid
              stroke="hsl(var(--muted) / 0.15)"
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            {/* Target area (behind) */}
            <Radar
              name="Cible"
              dataKey="target"
              stroke="hsl(var(--primary) / 0.4)"
              fill="hsl(var(--primary) / 0.08)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            {/* Current area (front) */}
            <Radar
              name="Actuel"
              dataKey="current"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary) / 0.25)"
              strokeWidth={2}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload;
                return (
                  <div className="bg-surface-container-highest border border-border/20 rounded-lg px-3 py-2 shadow-xl">
                    <p className="text-xs font-bold text-foreground">{item.category}</p>
                    <p className="text-[10px] text-primary">Actuel: {item.current}%</p>
                    <p className="text-[10px] text-muted-foreground">Cible: {item.target}%</p>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-1.5 rounded-full bg-primary" />
          <span className="text-[10px] text-muted-foreground">Actuel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1.5 rounded-full bg-primary/30 border border-primary/40 border-dashed" />
          <span className="text-[10px] text-muted-foreground">Cible</span>
        </div>
      </div>
    </div>
  );
}
