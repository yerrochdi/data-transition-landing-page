"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Linkedin,
  ExternalLink,
  Check,
  X,
  RotateCcw,
  Mail,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { updateFoundingMemberStatus } from "@/lib/founding-members/actions";

type Application = {
  id: string;
  name: string;
  email: string;
  linkedinUrl: string;
  currentRole: string;
  currentCompany: string;
  situation: string;
  motivation: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewerNote: string | null;
};

type Stats = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  totalSeats: number;
  seatsRemaining: number;
};

type Filter = "ALL" | "PENDING" | "ACCEPTED" | "REJECTED";

export function FoundingMembersAdminView({
  applications,
  stats,
}: {
  applications: Application[];
  stats: Stats;
}) {
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = applications.filter((a) =>
    filter === "ALL" ? true : a.status === filter
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Admin · Founding Members
            </span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground">
            Candidatures Founding Members
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Places restantes" value={`${stats.seatsRemaining} / ${stats.totalSeats}`} primary />
          <StatCard label="En attente" value={stats.pending.toString()} />
          <StatCard label="Acceptées" value={stats.accepted.toString()} />
          <StatCard label="Refusées" value={stats.rejected.toString()} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["PENDING", "ACCEPTED", "REJECTED", "ALL"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-container-low text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "ALL" && "Toutes"}
              {f === "PENDING" && `En attente (${stats.pending})`}
              {f === "ACCEPTED" && `Acceptées (${stats.accepted})`}
              {f === "REJECTED" && `Refusées (${stats.rejected})`}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-surface-container-low p-10 rounded-2xl text-center text-muted-foreground">
            Aucune candidature dans cette catégorie.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => (
              <ApplicationRow
                key={app.id}
                app={app}
                expanded={expanded === app.id}
                onToggle={() => setExpanded(expanded === app.id ? null : app.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, primary }: { label: string; value: string; primary?: boolean }) {
  return (
    <div
      className={`p-5 rounded-2xl ${
        primary
          ? "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30"
          : "bg-surface-container-low ghost-border"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={`font-headline text-2xl font-extrabold ${primary ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function ApplicationRow({
  app,
  expanded,
  onToggle,
}: {
  app: Application;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const setStatus = (status: Application["status"]) => {
    startTransition(async () => {
      const result = await updateFoundingMemberStatus(app.id, status);
      if (!result.ok) {
        alert(result.error ?? "Erreur");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="bg-surface-container-low rounded-2xl ghost-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 text-left flex items-start gap-4 hover:bg-surface-container transition-colors"
      >
        <StatusBadge status={app.status} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-headline text-base font-bold text-foreground">{app.name}</h3>
            <span className="text-xs text-muted-foreground">
              {app.currentRole} · {app.currentCompany}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Soumise le {new Date(app.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
            {" · "}
            {app.email}
          </p>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border/20 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailField label="LinkedIn" value={
              <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5" />
                Voir le profil
                <ExternalLink className="w-3 h-3" />
              </a>
            } />
            <DetailField label="Email" value={
              <a href={`mailto:${app.email}`} className="text-primary hover:underline inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {app.email}
              </a>
            } />
          </div>

          <DetailField label="Situation actuelle" value={<p className="whitespace-pre-wrap text-foreground/90">{app.situation}</p>} />
          <DetailField label="Motivation" value={<p className="whitespace-pre-wrap text-foreground/90">{app.motivation}</p>} />

          {app.reviewedAt && (
            <p className="text-[11px] text-muted-foreground">
              Statut mis à jour le {new Date(app.reviewedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/20">
            {app.status !== "ACCEPTED" && (
              <button
                onClick={() => setStatus("ACCEPTED")}
                disabled={isPending}
                className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" />
                Accepter
              </button>
            )}
            {app.status !== "REJECTED" && (
              <button
                onClick={() => setStatus("REJECTED")}
                disabled={isPending}
                className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500/15 transition-colors disabled:opacity-60"
              >
                <X className="w-3.5 h-3.5" />
                Refuser
              </button>
            )}
            {app.status !== "PENDING" && (
              <button
                onClick={() => setStatus("PENDING")}
                disabled={isPending}
                className="inline-flex items-center gap-2 bg-surface-container-lowest ghost-border text-muted-foreground px-4 py-2 rounded-lg text-xs font-bold hover:text-foreground transition-colors disabled:opacity-60"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Repasser en attente
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Application["status"] }) {
  const config = {
    PENDING: { bg: "bg-amber-500/15 border-amber-500/30 text-amber-400", label: "En attente" },
    ACCEPTED: { bg: "bg-primary/15 border-primary/30 text-primary", label: "Acceptée" },
    REJECTED: { bg: "bg-red-500/10 border-red-500/30 text-red-400", label: "Refusée" },
  }[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shrink-0 ${config.bg}`}>
      {config.label}
    </span>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  );
}
