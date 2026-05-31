"use client";

/**
 * Sprint 3C — Module Ikigai MARCHÉ.
 *
 * Affiche un snapshot marché RÉEL pour le rôle cible identifié à
 * l'étape Ambitions (data France Travail) + une lecture IA des chiffres.
 *
 * UX : pas de question textarea ici — on lui montre les chiffres et
 * l'IA les commente. La candidate peut quand même changer le rôle ciblé.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Globe,
  Sparkles,
  TrendingUp,
  MapPin,
  Wallet,
  Briefcase,
} from "lucide-react";
import type { OnboardingFormData } from "@/lib/onboarding/types";
import type { IkigaiMarketSnapshot } from "@/lib/ikigai/market";
import { getMarketSnapshotForRole } from "@/lib/ikigai/market";
import { AiThinkingLoader, AiErrorState, renderInsightText } from "./ai-thinking";

interface StepIkigaiMarketProps {
  formData: OnboardingFormData;
  onTargetRoleChange: (value: string) => void;
  onSnapshotChange: (snapshot: IkigaiMarketSnapshot | null) => void;
  onInsightChange: (insight: string) => void;
}

export function StepIkigaiMarket({
  formData,
  onTargetRoleChange,
  onSnapshotChange,
  onInsightChange,
}: StepIkigaiMarketProps) {
  // Si la candidate a déjà passé l'étape Ambitions, on pré-remplit le rôle.
  const presetRole = formData.ikigai.market.targetRole || formData.targetRole;
  const [editing, setEditing] = useState(false);
  const [draftRole, setDraftRole] = useState(presetRole);
  const [fetching, setFetching] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiAbortRef = useRef<AbortController | null>(null);
  const fetchedFor = useRef<string>("");

  const snapshot = formData.ikigai.market.snapshot;
  const insight = formData.ikigai.market.aiInsight;
  const role = formData.ikigai.market.targetRole;

  // Auto-fetch du snapshot quand on a un rôle et qu'il a changé
  useEffect(() => {
    if (!role || role.trim().length < 3) return;
    if (fetchedFor.current === role) return;
    fetchedFor.current = role;
    setFetching(true);
    getMarketSnapshotForRole(role, {
      years: formData.experienceYears,
      sector: formData.currentSector,
    })
      .then((snap) => {
        onSnapshotChange(snap);
      })
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Si pas de rôle pré-rempli, on l'initialise avec presetRole au mount
  useEffect(() => {
    if (!role && presetRole) {
      onTargetRoleChange(presetRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-trigger IA quand snapshot dispo
  useEffect(() => {
    if (!snapshot || insight || aiLoading) return;
    const t = window.setTimeout(() => generateInsight(), 800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  const generateInsight = useCallback(async () => {
    aiAbortRef.current?.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;
    setAiLoading(true);
    setAiError(null);
    setAiStreaming(false);
    onInsightChange("");

    try {
      const res = await fetch("/api/onboarding/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "ikigai-market",
          data: formData,
          mode: "ikigai",
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Erreur du service IA");
      if (!res.body) throw new Error("Pas de réponse streaming");
      setAiStreaming(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        acc += decoder.decode(chunk, { stream: true });
        onInsightChange(acc);
      }
      setAiStreaming(false);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setAiError(e instanceof Error ? e.message : "Erreur inattendue");
      setAiStreaming(false);
    } finally {
      setAiLoading(false);
    }
  }, [formData, onInsightChange]);

  const applyRoleEdit = () => {
    const trimmed = draftRole.trim();
    if (trimmed.length < 3) return;
    onTargetRoleChange(trimmed);
    onSnapshotChange(null);
    onInsightChange("");
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex items-start gap-3 p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-surface-container-lowest/40 border border-primary/15">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
          <Globe className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-foreground">
            Le marché — données réelles France Travail
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Avant de viser un rôle, regardons ce qu&apos;il en est vraiment :
            volume d&apos;offres, salaires, compétences clés. Données fraîches
            du marché français.
          </p>
        </div>
      </div>

      {/* Rôle ciblé — éditable */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Rôle observé
          </span>
          {!editing && role && (
            <button
              type="button"
              onClick={() => {
                setDraftRole(role);
                setEditing(true);
              }}
              className="text-[10px] text-primary/80 hover:text-primary"
            >
              Modifier
            </button>
          )}
        </div>
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={draftRole}
              onChange={(e) => setDraftRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyRoleEdit())}
              placeholder="Ex : Head of People Analytics"
              className="flex-1 bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="button"
              onClick={applyRoleEdit}
              disabled={draftRole.trim().length < 3}
              className="px-4 py-2 rounded-xl text-sm font-bold gradient-primary text-primary-foreground disabled:opacity-40"
            >
              Analyser
            </button>
          </div>
        ) : role ? (
          <p className="text-base font-bold text-foreground">{role}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucun rôle ciblé pour le moment.
          </p>
        )}
      </div>

      {/* Snapshot */}
      {fetching && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-surface-container-lowest ghost-border animate-pulse h-24"
            />
          ))}
        </div>
      )}

      {!fetching && snapshot && (
        <SnapshotCards snapshot={snapshot} />
      )}

      {!fetching && !snapshot && role && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-muted-foreground">
          Données marché indisponibles pour ce rôle. L&apos;IA va vous donner
          une lecture qualitative générale.
        </div>
      )}

      {/* AI insight — lecture des chiffres */}
      {aiError && <AiErrorState onRetry={generateInsight} />}
      {!aiError && aiLoading && !aiStreaming && <AiThinkingLoader />}
      {!aiError && (aiStreaming || insight) && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-surface-container-lowest/60 border border-primary/20"
          role="status"
          aria-live="polite"
        >
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 text-[13px] leading-relaxed text-foreground/90">
            {renderInsightText(insight ?? "")}
            {aiStreaming && (
              <span
                aria-hidden
                className="inline-block w-1 h-3.5 bg-primary ml-0.5 align-middle animate-pulse"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SnapshotCards({ snapshot }: { snapshot: IkigaiMarketSnapshot }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Briefcase}
          label="Offres actives"
          value={snapshot.totalOffers.toString()}
          sub={`${snapshot.recentOffers} récentes (30j)`}
        />
        <StatCard
          icon={Wallet}
          label={snapshot.medianSalary?.estimated ? "Salaire estimé" : "Salaire médian"}
          value={
            snapshot.medianSalary
              ? `${Math.round(snapshot.medianSalary.min / 1000)}k - ${Math.round(snapshot.medianSalary.max / 1000)}k`
              : "—"
          }
          sub={snapshot.medianSalary?.estimated ? "estimation · brut/an" : "brut/an"}
        />
        <StatCard
          icon={TrendingUp}
          label="Top compétences"
          value={snapshot.topSkills[0] ?? "—"}
          sub={`+${Math.max(0, snapshot.topSkills.length - 1)} autres`}
        />
        <StatCard
          icon={MapPin}
          label="Top région"
          value={snapshot.topRegions[0] ?? "—"}
          sub={`+${Math.max(0, snapshot.topRegions.length - 1)} autres`}
        />
      </div>

      {/* Détail compétences si on en a */}
      {snapshot.topSkills.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
            Top 5 compétences citées
          </p>
          <div className="flex flex-wrap gap-1.5">
            {snapshot.topSkills.map((s) => (
              <span
                key={s}
                className="px-2.5 py-1 bg-primary/10 text-primary text-[11px] font-medium rounded-md border border-primary/15"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/60 italic">
        Source : {snapshot.source}. Mis à jour à chaque consultation.
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-lowest ghost-border">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
          {label}
        </span>
      </div>
      <p className="text-lg font-headline font-extrabold text-foreground leading-none mb-1">
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

