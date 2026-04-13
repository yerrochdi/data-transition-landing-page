"use client";

import { useState } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  Star,
  Sparkles,
  Globe,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  Zap,
  ExternalLink,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpportunitiesData, OpportunityType, Opportunity } from "@/lib/opportunities/actions";

// ─── Config ───────────────────────────────────────────────────────

const TYPE_CONFIG: Record<OpportunityType, { label: string; icon: React.ElementType; color: string }> = {
  job: { label: "CDI", icon: Briefcase, color: "text-primary" },
  freelance: { label: "Freelance", icon: Globe, color: "text-blue-400" },
  formation: { label: "Formation", icon: GraduationCap, color: "text-amber-400" },
  transition: { label: "Transition", icon: ArrowRight, color: "text-emerald-400" },
};

// ─── Match Badge ──────────────────────────────────────────────────

function MatchBadge({ score }: { score: number }) {
  return (
    <div className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1",
      score >= 90 ? "bg-emerald-500/15 text-emerald-400" :
      score >= 80 ? "bg-primary/15 text-primary" :
      score >= 70 ? "bg-blue-500/15 text-blue-400" :
      "bg-surface-container text-muted-foreground"
    )}>
      <Star className="w-2.5 h-2.5" />
      {score}% match
    </div>
  );
}

// ─── Opportunity Card ─────────────────────────────────────────────

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const typeInfo = TYPE_CONFIG[opportunity.type];
  const TypeIcon = typeInfo.icon;

  return (
    <div className="bg-surface-container-low p-5 rounded-2xl ghost-border hover:bg-surface-container hover:border-primary/10 transition-all group">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className={cn("flex items-center gap-1", typeInfo.color)}>
              <TypeIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {typeInfo.label}
              </span>
            </div>
            <MatchBadge score={opportunity.matchScore} />
            {opportunity.remote && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] font-bold">
                Remote
              </span>
            )}
          </div>
          <h3 className="font-headline text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {opportunity.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-bold">{opportunity.company}</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {opportunity.location}
            </span>
          </div>
        </div>
        {opportunity.salary && (
          <span className="text-sm font-headline font-bold text-foreground shrink-0">
            {opportunity.salary}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{opportunity.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {opportunity.tags.map((tag) => (
          <span
            key={tag}
            className="bg-surface-container-lowest px-2.5 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground ghost-border"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* AI Reason */}
      <div className="bg-surface-container-high/50 p-3 rounded-xl mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[9px] uppercase tracking-widest text-primary font-bold">Pourquoi ce match</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{opportunity.aiReason}</p>
      </div>

      {/* Search button */}
      <a
        href={opportunity.searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        {opportunity.type === "formation" ? "Voir sur Coursera" : "Rechercher sur LinkedIn"}
      </a>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────

export function OpportunitiesView({ data }: { data: OpportunitiesData }) {
  const [filter, setFilter] = useState<OpportunityType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = data.opportunities.filter((opp) => {
    if (filter !== "all" && opp.type !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return opp.title.toLowerCase().includes(q) ||
        opp.company.toLowerCase().includes(q) ||
        opp.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const typeCounts = data.opportunities.reduce((acc, o) => {
    acc[o.type] = (acc[o.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
              Opportunités
            </h1>
            <p className="text-xs text-muted-foreground">
              {data.targetRole
                ? `${data.opportunities.length} opportunités pour votre transition vers ${data.targetRole}`
                : `${data.opportunities.length} opportunités personnalisées`}
            </p>
          </div>
        </div>
      </header>

      {/* AI Suggestions banner */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 rounded-xl p-4 mb-6">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ces opportunités sont des <span className="text-primary font-bold">suggestions IA personnalisées</span> basées sur votre profil.
          Cliquez sur &quot;Rechercher sur LinkedIn&quot; pour trouver des offres similaires sur le marché.
        </p>
      </div>

      {/* Readiness context */}
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-5 rounded-2xl light-streak mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
            Votre profil
          </span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Readiness:</span>
            <span className={cn(
              "text-sm font-bold",
              data.readinessScore >= 70 ? "text-emerald-400" :
              data.readinessScore >= 50 ? "text-primary" :
              "text-amber-400"
            )}>
              {data.readinessScore}%
            </span>
          </div>
          {data.currentRole && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{data.currentRole}</span>
              <ArrowRight className="w-3 h-3 text-primary" />
              <span className="text-xs font-bold text-primary">{data.targetRole}</span>
            </div>
          )}
          {data.skillGaps.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground">Gaps:</span>
              {data.skillGaps.slice(0, 3).map((gap) => (
                <span key={gap} className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {gap}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une opportunité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ghost-border"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all",
              filter === "all"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-surface-container-lowest text-muted-foreground ghost-border hover:bg-surface-container"
            )}
          >
            Tout ({data.opportunities.length})
          </button>
          {(["job", "freelance", "formation", "transition"] as OpportunityType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all",
                filter === type
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-surface-container-lowest text-muted-foreground ghost-border hover:bg-surface-container"
              )}
            >
              {TYPE_CONFIG[type].label} ({typeCounts[type] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filtered.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-sm">Aucune opportunité ne correspond à votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
