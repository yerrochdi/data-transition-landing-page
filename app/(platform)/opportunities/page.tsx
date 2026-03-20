"use client";

import { useState } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  Star,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Sparkles,
  Filter,
  Globe,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { opportunities } from "@/lib/mock-data";
import type { Opportunity, OpportunityType } from "@/lib/types";

const typeConfig: Record<OpportunityType, { label: string; icon: React.ElementType; color: string }> = {
  job: { label: "CDI", icon: Briefcase, color: "text-primary" },
  freelance: { label: "Freelance", icon: Globe, color: "text-accent" },
  transition: { label: "Transition", icon: ArrowRight, color: "text-secondary" },
  formation: { label: "Formation", icon: GraduationCap, color: "text-amber-400" },
};

function MatchBadge({ score }: { score: number }) {
  return (
    <div
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1",
        score >= 90
          ? "bg-primary/20 text-primary"
          : score >= 80
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      )}
    >
      <Star className="w-3 h-3" />
      {score}% match
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const [bookmarked, setBookmarked] = useState(opportunity.isBookmarked);
  const typeInfo = typeConfig[opportunity.type];
  const TypeIcon = typeInfo.icon;

  return (
    <div className="bg-surface-container-low p-6 rounded-2xl ghost-border hover-glow group transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TypeIcon className={cn("w-4 h-4", typeInfo.color)} />
            <span className={cn("text-[10px] uppercase tracking-widest font-bold", typeInfo.color)}>
              {typeInfo.label}
            </span>
            <MatchBadge score={opportunity.matchScore} />
          </div>
          <h3 className="font-headline text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {opportunity.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-bold">{opportunity.company}</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {opportunity.location}
            </span>
            {opportunity.remote && (
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                Remote
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setBookmarked(!bookmarked)}
          className="p-2 rounded-lg hover:bg-surface-container transition-colors"
        >
          {bookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{opportunity.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {opportunity.tags.map((tag) => (
          <span
            key={tag}
            className="bg-surface-container-lowest px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground ghost-border"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* AI Reason */}
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-4 rounded-xl light-streak mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Why this match</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">{opportunity.aiReason}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {opportunity.salary && (
          <span className="text-sm font-bold text-foreground">{opportunity.salary}</span>
        )}
        <button className="gradient-primary text-primary-foreground px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:scale-105 transition-transform ml-auto">
          View Details
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const [filter, setFilter] = useState<OpportunityType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = opportunities.filter((opp) => {
    if (filter !== "all" && opp.type !== filter) return false;
    if (searchQuery && !opp.title.toLowerCase().includes(searchQuery.toLowerCase()) && !opp.company.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Opportunities
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          AI-curated opportunities matching your profile and career objectives. Sorted by relevance.
        </p>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "job", "freelance", "formation"] as const).map((type) => (
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
              {type === "all" ? "All" : typeConfig[type].label}
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
            <p className="text-muted-foreground text-sm">No opportunities match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
