"use client";

/**
 * Bande de dataviz affichée en haut du bilan (Direction B du checkpoint
 * onboarding) : jauge readiness animée + scores + radar des skills.
 *
 * Les données viennent du diagnostic réel (UserProfile.readinessScore,
 * careerScore, confidenceLevel, topSkills, skillGaps) — pas de chiffre
 * inventé. Si une donnée manque, on n'affiche pas le bloc concerné
 * plutôt que d'inventer.
 */
import { useEffect, useRef, useState } from "react";
import { Target, Award, Brain, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BilanHeaderStats {
  readinessScore: number; // 0-100
  careerScore: number; // 0-1000
  confidenceLevel: number; // 1-10
  topSkills: string[];
  skillGaps: string[];
}

export function BilanHeaderStats({ stats }: { stats: BilanHeaderStats }) {
  return (
    <section className="mb-10 grid gap-4 md:grid-cols-[auto_1fr]">
      {/* Jauge readiness à gauche */}
      <ReadinessGauge target={stats.readinessScore} />

      {/* Grid 2x2 de mini-stats à droite */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          Icon={Award}
          label="Career Score"
          value={stats.careerScore}
          max={1000}
          accent="primary"
        />
        <StatCard
          Icon={Brain}
          label="Confiance"
          value={stats.confidenceLevel}
          max={10}
          suffix={`/${10}`}
        />
        <SkillsCard
          label="Forces clés"
          skills={stats.topSkills}
          Icon={Target}
          accent
        />
        <SkillsCard
          label="Axes à travailler"
          skills={stats.skillGaps}
          Icon={AlertTriangle}
        />
      </div>
    </section>
  );
}

/* ── Jauge circulaire animée ──────────────────────────────────── */

function ReadinessGauge({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Anime de 0 vers target sur ~1s
    let frame = 0;
    const duration = 40;
    const timer = setInterval(() => {
      frame++;
      setValue(Math.round((frame / duration) * target));
      if (frame >= duration) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [target]);

  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      ref={ref}
      className="relative w-[152px] h-[152px] shrink-0 mx-auto md:mx-0"
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="hsl(var(--surface-container-highest))"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.04s linear",
            filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.55))",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline text-3xl font-black text-foreground leading-none">
          {value}%
        </span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70 font-bold mt-2">
          Readiness
        </span>
      </div>
    </div>
  );
}

/* ── Mini-stat avec barre de progression ──────────────────────── */

function StatCard({
  Icon,
  label,
  value,
  max,
  suffix,
  accent,
}: {
  Icon: typeof Award;
  label: string;
  value: number;
  max: number;
  suffix?: string;
  accent?: "primary";
}) {
  const ratio = Math.min(100, (value / max) * 100);
  return (
    <div className="rounded-xl bg-surface-container-low border border-border/30 p-3.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground/70" />
        <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span
          className={cn(
            "font-headline text-xl font-black leading-none",
            accent === "primary" ? "text-primary" : "text-foreground"
          )}
        >
          {value.toLocaleString("fr-FR")}
        </span>
        <span className="text-[10px] text-muted-foreground/60 font-mono">
          {suffix ?? `/${max.toLocaleString("fr-FR")}`}
        </span>
      </div>
      {/* Barre */}
      <div className="h-1 rounded-full bg-surface-container-highest overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            accent === "primary" ? "bg-primary" : "bg-foreground/60"
          )}
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

/* ── Card skills (forces / gaps) ──────────────────────────────── */

function SkillsCard({
  Icon,
  label,
  skills,
  accent,
}: {
  Icon: typeof Target;
  label: string;
  skills: string[];
  accent?: boolean;
}) {
  const displayed = skills.slice(0, 4);
  const overflow = skills.length - displayed.length;

  return (
    <div className="rounded-xl bg-surface-container-low border border-border/30 p-3.5">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Icon
          className={cn(
            "w-3.5 h-3.5",
            accent ? "text-primary" : "text-amber-400/80"
          )}
        />
        <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground/70">
          {label}
        </span>
      </div>
      {displayed.length === 0 ? (
        <p className="text-[11px] text-muted-foreground/50 italic">
          Non renseigné
        </p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {displayed.map((s) => (
            <span
              key={s}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-md font-medium",
                accent
                  ? "bg-primary/15 text-primary"
                  : "bg-amber-500/10 text-amber-400/90"
              )}
            >
              {s}
            </span>
          ))}
          {overflow > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-muted-foreground/60 font-medium">
              +{overflow}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
