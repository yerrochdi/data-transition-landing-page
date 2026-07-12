"use client";

/**
 * Sprint 2 — READINESS VIVANTE (UI).
 *
 * Remplace le MiniKpi statique "Readiness" par une carte qui montre le
 * MOUVEMENT : delta hebdomadaire ("+4 pts cette semaine") + sparkline des
 * 8 dernières semaines. Le progrès visible est le levier n°1 de rétention
 * pour cette cible (cf. audit/06 — pattern assessment → re-mesure).
 *
 * États :
 *  - Pas d'historique (nouvel utilisateur) → identique au MiniKpi classique.
 *  - Delta > 0 → badge vert "+X pts / 7j".
 *  - Delta = 0 avec historique → sparkline seule (pas de badge gris culpabilisant).
 */
import { TrendingUp } from "lucide-react";

export interface ReadinessTrendData {
  weeklyDelta: number;
  history: { date: string; score: number }[];
}

interface ReadinessKpiProps {
  score: number;
  trend: ReadinessTrendData | null;
}

export function ReadinessKpi({ score, trend }: ReadinessKpiProps) {
  const color = "hsl(var(--primary))";
  const hasHistory = (trend?.history?.length ?? 0) >= 2;
  const delta = trend?.weeklyDelta ?? 0;

  return (
    <div className="flex items-center gap-3 bg-surface-container-lowest/50 backdrop-blur-sm rounded-xl p-4 ghost-border hover:scale-[1.02] transition-transform">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <TrendingUp className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-lg font-headline font-extrabold text-foreground tabular-nums">
            {score > 0 ? `${score}%` : "—"}
          </p>
          {delta > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/15 text-primary whitespace-nowrap">
              +{delta} pts / 7j
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            Readiness
          </p>
          {hasHistory && <Sparkline history={trend!.history} />}
        </div>
      </div>
    </div>
  );
}

/**
 * Sparkline SVG minimaliste (pas de lib de charting pour 40×14 px).
 * Normalise les scores sur la hauteur disponible ; ligne + point final.
 */
function Sparkline({ history }: { history: { score: number }[] }) {
  const W = 44;
  const H = 14;
  const PAD = 2;

  const scores = history.map((h) => h.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = scores.map((s, i) => {
    const x = PAD + (i / (scores.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((s - min) / range) * (H - PAD * 2);
    return { x, y };
  });
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="shrink-0 opacity-80"
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="1.8" fill="hsl(var(--primary))" />
    </svg>
  );
}
