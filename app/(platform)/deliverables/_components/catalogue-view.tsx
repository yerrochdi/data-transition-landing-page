"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileCheck,
  Clock,
  Crown,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogueData, BriefCard } from "@/lib/deliverables/actions";

// ─── Sector config ─────────────────────────────────────────────────

const SECTOR_CONFIG: Record<string, { label: string; color: string }> = {
  finance: { label: "Finance / Assurance", color: "text-blue-400 bg-blue-500/10" },
  tech: { label: "Tech / Conseil", color: "text-emerald-400 bg-emerald-500/10" },
  generic: { label: "Tous secteurs", color: "text-amber-400 bg-amber-500/10" },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  DRAFT: { label: "En cours", icon: Loader2, color: "text-amber-400" },
  SUBMITTED: { label: "Soumis", icon: Clock, color: "text-blue-400" },
  REVIEWED: { label: "À retravailler", icon: ArrowRight, color: "text-orange-400" },
  VALIDATED: { label: "Validé", icon: CheckCircle2, color: "text-emerald-400" },
};

// ─── Difficulty bar ────────────────────────────────────────────────

function Difficulty({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1 h-3 rounded-full",
            i <= level ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

// ─── Brief card ────────────────────────────────────────────────────

function BriefCardComponent({
  brief,
  locked,
  isFreeUser,
}: {
  brief: BriefCard;
  locked: boolean;
  isFreeUser: boolean;
}) {
  const sector = SECTOR_CONFIG[brief.sector] ?? SECTOR_CONFIG.generic;
  const status = brief.userStatus ? STATUS_CONFIG[brief.userStatus] : null;
  const StatusIcon = status?.icon;

  const premiumBlocked = brief.isPremium && isFreeUser;

  return (
    <Link
      href={premiumBlocked ? "/upgrade" : `/deliverables/${brief.slug}`}
      className={cn(
        "group bg-surface-container-low p-5 rounded-2xl ghost-border transition-all flex flex-col gap-3",
        locked
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-surface-container hover:border-primary/20 cursor-pointer"
      )}
      aria-disabled={locked}
      onClick={(e) => {
        if (locked) e.preventDefault();
      }}
    >
      {/* Top row : sector badge + premium */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            sector.color
          )}
        >
          {sector.label}
        </span>
        {brief.isPremium && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            <Crown className="w-3 h-3" />
            Pro
          </span>
        )}
      </div>

      {/* Title + description */}
      <div className="flex-1 space-y-1.5">
        <h3 className="font-headline text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {brief.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {brief.shortDescription}
        </p>
      </div>

      {/* Tools */}
      {brief.tools.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {brief.tools.slice(0, 3).map((tool) => (
            <span
              key={tool}
              className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-muted-foreground"
            >
              {tool}
            </span>
          ))}
          {brief.tools.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 text-muted-foreground">
              +{brief.tools.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom row : difficulty + duration + status */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Niveau
            </span>
            <Difficulty level={brief.difficulty} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {brief.estimatedDays}j
          </div>
        </div>

        {status && StatusIcon ? (
          <span
            className={cn("flex items-center gap-1 text-[10px] font-bold", status.color)}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        ) : (
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </Link>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "finance", label: "Finance" },
  { key: "tech", label: "Tech" },
  { key: "generic", label: "Tous secteurs" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

// ─── Main view ────────────────────────────────────────────────────

export function CatalogueView({ data }: { data: CatalogueData }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered =
    filter === "all"
      ? data.briefs
      : data.briefs.filter((b) => b.sector === filter);

  const isFreeUser = data.plan === "FREE";
  const quotaReached =
    data.monthlyLimit !== null && data.startedThisMonth >= data.monthlyLimit;

  // Already-started briefs are always accessible (no lock).
  const isLocked = (b: BriefCard) =>
    quotaReached && !b.userStatus && !b.isPremium;

  const completedCount = data.briefs.filter(
    (b) => b.userStatus === "VALIDATED"
  ).length;
  const inProgressCount = data.briefs.filter(
    (b) => b.userStatus && b.userStatus !== "VALIDATED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <FileCheck className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-widest font-bold">
            Livrables concrets
          </span>
        </div>
        <h1 className="font-headline text-2xl md:text-3xl font-black text-foreground">
          Construis ton portfolio data, brief par brief.
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Pioche un brief, livre en 3 à 7 jours, reçois une correction IA et ajoute le résultat à ton LinkedIn dès qu'il est validé. Pas besoin d'attendre la fin du parcours.
        </p>
      </div>

      {/* Stats / quota */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-2xl ghost-border">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Validés
            </span>
          </div>
          <div className="font-headline text-2xl font-bold text-foreground">
            {completedCount}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl ghost-border">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              En cours
            </span>
          </div>
          <div className="font-headline text-2xl font-bold text-foreground">
            {inProgressCount}
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-2xl ghost-border">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Quota mensuel
            </span>
          </div>
          <div className="font-headline text-2xl font-bold text-foreground">
            {data.monthlyLimit === null
              ? "∞"
              : `${data.startedThisMonth}/${data.monthlyLimit}`}
          </div>
        </div>
      </div>

      {/* Quota banner */}
      {quotaReached && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              Tu as atteint ta limite de {data.monthlyLimit} livrable
              {data.monthlyLimit === 1 ? "" : "s"} ce mois-ci.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Passe au plan Boost (5/mois) ou Pro (illimité) pour piocher d'autres
              briefs immédiatement.
            </p>
          </div>
          <Link
            href="/upgrade"
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
          >
            Voir les plans
          </Link>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-surface-container-low text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Aucun brief dans cette catégorie pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <BriefCardComponent
              key={b.id}
              brief={b}
              locked={isLocked(b)}
              isFreeUser={isFreeUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}
