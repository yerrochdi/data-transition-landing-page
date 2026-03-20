"use client";

import { useState } from "react";
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resources } from "@/lib/mock-data";
import type { ResourceType } from "@/lib/types";

const typeIcons: Record<ResourceType, React.ElementType> = {
  article: FileText,
  guide: BookOpen,
  video: Video,
  template: Download,
  case_study: Users,
};

const typeLabels: Record<ResourceType, string> = {
  article: "Article",
  guide: "Guide",
  video: "Vidéo",
  template: "Template",
  case_study: "Success Story",
};

export default function ResourcesPage() {
  const [filter, setFilter] = useState<ResourceType | "all">("all");

  const categories = Array.from(new Set(resources.map((r) => r.category)));
  const filtered = filter === "all" ? resources : resources.filter((r) => r.type === filter);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground mb-2">
          Resources & Community
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Curated content to accelerate your transition. Guides, templates, and real success stories.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(["all", "guide", "article", "video", "template", "case_study"] as const).map((type) => (
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
            {type === "all" ? "Tout" : typeLabels[type]}
          </button>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-5 rounded-2xl light-streak mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Recommended for you</span>
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          Based on your current phase (Positionnement) and skill gaps, we recommend starting with the <strong>AWS Solutions Architect certification guide</strong> and the <strong>FinTech interview prep</strong> resources.
        </p>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((resource) => {
          const TypeIcon = typeIcons[resource.type];
          return (
            <div
              key={resource.id}
              className="bg-surface-container-low p-6 rounded-2xl ghost-border hover-glow group transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                      {typeLabels[resource.type]}
                    </span>
                    {resource.isNew && (
                      <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">{resource.description}</p>
                  <div className="flex items-center gap-3">
                    {resource.readTime && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {resource.readTime}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground bg-surface-container-lowest px-2 py-0.5 rounded-full ghost-border">
                      {resource.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground text-sm">No resources match your filter.</p>
        </div>
      )}
    </div>
  );
}
