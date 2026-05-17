"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Route,
  Compass,
  Anchor,
  Sparkles,
  ArrowRight,
  Check,
  Lock,
  Share2,
  Copy,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleBilanPublic } from "@/lib/career-os/actions";

interface CareerOsCardProps {
  hasFirstBilan: boolean;
  hasInflections: boolean;
  hasLongTermVision: boolean;
  hasAnchors: boolean;
  bilanIsPublic: boolean;
  bilanShareableSlug: string | null;
}

/**
 * Permanent dashboard card showing the state of the user's Career OS.
 * Reinforces the "career-long companion" narrative and pushes toward
 * enrichment modules that fuel richer bilan versions.
 */
export function CareerOsCard({
  hasFirstBilan,
  hasInflections,
  hasLongTermVision,
  hasAnchors,
  bilanIsPublic,
  bilanShareableSlug,
}: CareerOsCardProps) {
  const [isPending, startTransition] = useTransition();
  const [localPublic, setLocalPublic] = useState(bilanIsPublic);
  const [localSlug, setLocalSlug] = useState<string | null>(bilanShareableSlug);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleBilanPublic();
      if (result.ok) {
        setLocalPublic(result.isPublic ?? false);
        if (result.shareableSlug !== undefined) {
          setLocalSlug(result.shareableSlug ?? localSlug);
        }
      }
    });
  };

  const handleCopyLink = () => {
    if (!localSlug || typeof window === "undefined") return;
    const url = `${window.location.origin}/career-os-public/${localSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyHint("Lien copié");
      setTimeout(() => setCopyHint(null), 2000);
    });
  };
  const modules = [
    {
      key: "inflections",
      label: "Trajectoire longue",
      description: "3 inflexions clés de ta carrière",
      icon: Route,
      done: hasInflections,
      href: "/career-os/inflections",
      available: true,
    },
    {
      key: "vision",
      label: "Vision 5 / 10 ans",
      description: "Où tu te vois, tes non-négociables",
      icon: Compass,
      done: hasLongTermVision,
      href: "/career-os/vision",
      available: false, // V1.5
    },
    {
      key: "anchors",
      label: "Ancres & ruptures",
      description: "Géo, secteurs interdits, signaux burn-out",
      icon: Anchor,
      done: hasAnchors,
      href: "/career-os/anchors",
      available: false, // V1.5
    },
  ];

  const completedCount = modules.filter((m) => m.done).length;
  const totalModules = modules.length;
  const completion = hasFirstBilan
    ? Math.round(((completedCount + 1) / (totalModules + 1)) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-br from-primary/8 to-surface-container-lowest border border-primary/15 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary">
              Mon Career OS
            </p>
            <h2 className="font-headline text-base font-bold text-foreground">
              {hasFirstBilan ? "Version 1 active" : "Pas encore initialisé"}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Complétion
          </p>
          <p className="font-headline text-xl font-black text-primary">
            {completion}%
          </p>
        </div>
      </div>

      {/* Roadmap phases — Career OS lifecycle teaser */}
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center">
          <p className="font-bold text-primary uppercase tracking-wider">Aujourd&apos;hui</p>
          <p className="text-muted-foreground mt-0.5">Transition</p>
        </div>
        <div className="bg-surface-container rounded-lg p-2 text-center opacity-60">
          <p className="font-bold text-foreground uppercase tracking-wider">+6 mois</p>
          <p className="text-muted-foreground mt-0.5">Installation</p>
        </div>
        <div className="bg-surface-container rounded-lg p-2 text-center opacity-50">
          <p className="font-bold text-foreground uppercase tracking-wider">+12 mois</p>
          <p className="text-muted-foreground mt-0.5">Croissance</p>
        </div>
      </div>

      {/* Public share toggle — only when bilan exists */}
      {hasFirstBilan && (
        <div className="bg-surface-container-lowest rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-bold text-foreground">
                Partager mon bilan
              </p>
            </div>
            <button
              onClick={handleToggle}
              disabled={isPending}
              className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50",
                localPublic
                  ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-surface-container text-muted-foreground hover:bg-surface-container-high"
              )}
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin inline" />
              ) : localPublic ? (
                "Public — cliquer pour rendre privé"
              ) : (
                "Rendre public"
              )}
            </button>
          </div>
          {localPublic && localSlug && (
            <div className="flex items-center gap-2">
              <code className="text-[10px] text-muted-foreground bg-surface-container px-2 py-1 rounded flex-1 truncate">
                /career-os-public/{localSlug}
              </code>
              <button
                onClick={handleCopyLink}
                className="text-[10px] font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copyHint ?? "Copier"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Enrichment modules */}
      {hasFirstBilan && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            Enrichir mon Career OS
          </p>
          {modules.map((m) => {
            const Icon = m.icon;
            const card = (
              <div
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  m.available
                    ? "bg-surface-container-lowest hover:bg-surface-container cursor-pointer"
                    : "bg-surface-container-lowest opacity-50 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    m.done
                      ? "bg-emerald-500/15 text-emerald-400"
                      : m.available
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/40 text-muted-foreground"
                  )}
                >
                  {m.done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {m.done ? "Complété — enrichit ton bilan v2" : m.description}
                  </p>
                </div>
                {m.available ? (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <span className="flex items-center gap-1 text-[9px] text-muted-foreground flex-shrink-0">
                    <Lock className="w-2.5 h-2.5" />
                    Bientôt
                  </span>
                )}
              </div>
            );

            return m.available ? (
              <Link key={m.key} href={m.href} className="block">
                {card}
              </Link>
            ) : (
              <div key={m.key}>{card}</div>
            );
          })}
        </div>
      )}

      {!hasFirstBilan && (
        <div className="bg-surface-container-lowest rounded-xl p-3 text-xs text-muted-foreground leading-relaxed">
          Ton Career OS démarre dès que tu complètes ton diagnostic. Il évoluera
          ensuite avec toi — version après version.
          <Link
            href="/onboarding"
            className="block mt-2 text-primary font-bold hover:underline"
          >
            Compléter mon diagnostic →
          </Link>
        </div>
      )}
    </div>
  );
}
