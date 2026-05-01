"use client";

import { useState } from "react";
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Users,
  Clock,
  Sparkles,
  Star,
  ExternalLink,
  Gift,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResourcesData, ResourceType } from "@/lib/resources/actions";

// ─── Constants ────────────────────────────────────────────────────

const TYPE_ICONS: Record<ResourceType, React.ElementType> = {
  article: FileText,
  guide: BookOpen,
  video: Video,
  template: Download,
  case_study: Users,
};

const TYPE_LABELS: Record<ResourceType, string> = {
  article: "Article",
  guide: "Guide",
  video: "Vidéo",
  template: "Template",
  case_study: "Témoignage",
};

// ─── Main View ────────────────────────────────────────────────────

export function ResourcesView({ data }: { data: ResourcesData }) {
  const [filter, setFilter] = useState<ResourceType | "all" | "recommended">("all");

  const filtered =
    filter === "all"
      ? data.resources
      : filter === "recommended"
        ? data.resources.filter((r) => r.isRecommended)
        : data.resources.filter((r) => r.type === filter);

  const recommendedCount = data.resources.filter((r) => r.isRecommended).length;
  const categories = Array.from(new Set(data.resources.map((r) => r.category)));

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
              Ressources
            </h1>
            <p className="text-xs text-muted-foreground">
              {data.targetRole
                ? `Sélection personnalisée pour votre transition vers ${data.targetRole}`
                : "Contenus curatés pour accélérer votre transition"}
            </p>
          </div>
        </div>
      </header>

      {/* AI Recommendation */}
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-5 rounded-2xl light-streak mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
            Recommandé pour vous
          </span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">{data.recommendation}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold transition-all",
            filter === "all"
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-surface-container-lowest text-muted-foreground ghost-border hover:bg-surface-container"
          )}
        >
          Tout ({data.resources.length})
        </button>
        <button
          onClick={() => setFilter("recommended")}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
            filter === "recommended"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-surface-container-lowest text-muted-foreground ghost-border hover:bg-surface-container"
          )}
        >
          <Star className="w-3 h-3" /> Prioritaires ({recommendedCount})
        </button>
        {(["guide", "article", "video", "template", "case_study"] as ResourceType[]).map((type) => (
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
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Skill Gaps context */}
      {data.skillGaps.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider self-center mr-1">
            Vos gaps :
          </span>
          {data.skillGaps.map((gap) => (
            <span
              key={gap}
              className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full"
            >
              {gap}
            </span>
          ))}
        </div>
      )}

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((resource) => {
          const TypeIcon = TYPE_ICONS[resource.type];
          return (
            <a
              key={resource.id}
              href={resource.url !== "#" ? resource.url : undefined}
              target={resource.url !== "#" ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={cn(
                "bg-surface-container-low p-5 rounded-2xl ghost-border group transition-all",
                resource.url !== "#" && "hover:bg-surface-container hover:border-primary/20 cursor-pointer",
                resource.isRecommended && "ring-1 ring-primary/10"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  resource.isRecommended ? "bg-primary/20 text-primary" : "bg-surface-container text-muted-foreground"
                )}>
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                      {TYPE_LABELS[resource.type]}
                    </span>
                    {resource.isRecommended && (
                      <span className="flex items-center gap-0.5 bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5" /> Prioritaire
                      </span>
                    )}
                    {resource.isFree && (
                      <span className="flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        <Gift className="w-2.5 h-2.5" /> Gratuit
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {resource.title}
                    {resource.url !== "#" && (
                      <ExternalLink className="w-3 h-3 inline ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{resource.description}</p>

                  {resource.aiReason && (
                    <div className="flex items-start gap-1.5 mb-2 bg-primary/5 border border-primary/10 rounded-lg px-2.5 py-1.5">
                      <Info className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                      <span className="text-[11px] text-primary/80 leading-snug">{resource.aiReason}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    {resource.readTime && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {resource.readTime}
                      </span>
                    )}
                    {resource.platform && (
                      <span className="text-[10px] text-muted-foreground bg-surface-container-lowest px-2 py-0.5 rounded-full ghost-border">
                        {resource.platform}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground bg-surface-container-lowest px-2 py-0.5 rounded-full ghost-border">
                      {resource.category}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-sm">Aucune ressource ne correspond à ce filtre.</p>
        </div>
      )}
    </div>
  );
}
