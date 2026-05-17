"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { saveCareerInflections } from "@/lib/career-os/actions";
import type { CareerInflection } from "@/lib/career-os/types";

const emptyInflection = (): CareerInflection => ({
  year: "",
  from: "",
  to: "",
  why: "",
  lesson: "",
});

interface InflectionsFormProps {
  initial: CareerInflection[];
}

export function InflectionsForm({ initial }: InflectionsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inflections, setInflections] = useState<CareerInflection[]>(
    initial.length > 0 ? initial : [emptyInflection(), emptyInflection(), emptyInflection()]
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const updateField = (
    index: number,
    field: keyof CareerInflection,
    value: string
  ) => {
    setInflections((prev) =>
      prev.map((inf, i) => (i === index ? { ...inf, [field]: value } : inf))
    );
  };

  const addInflection = () => {
    if (inflections.length >= 5) return;
    setInflections((prev) => [...prev, emptyInflection()]);
  };

  const removeInflection = (index: number) => {
    if (inflections.length <= 1) return;
    setInflections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveCareerInflections(inflections);
      if (result.ok) {
        setFeedback({
          type: "success",
          text: "Trajectoire enregistrée. Ton Career OS est plus riche.",
        });
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setFeedback({
          type: "error",
          text: result.error ?? "Erreur",
        });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour au dashboard
      </Link>

      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Route className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-widest font-bold">
            Career OS · enrichissement
          </span>
        </div>
        <h1 className="font-headline text-2xl md:text-3xl font-black text-foreground">
          Trajectoire longue
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Identifie les 3 moments où ta carrière a vraiment pivoté. Ce sont eux
          qui révèlent ton pattern de mouvement — et qui permettront à NextMove
          de te proposer les bons moves dans 18 mois, pas juste maintenant.
        </p>
      </header>

      {/* Intro panel */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-xs text-muted-foreground leading-relaxed">
        <p className="text-foreground font-bold mb-1">À quoi ça sert.</p>
        <p>
          Un consultant carrière humain ne te recommande pas un poste sans
          comprendre comment tu as bougé jusqu&apos;ici. Ce module apporte la même
          profondeur de lecture à ton Career OS. Tes inflexions enrichiront la
          version 2 de ton bilan automatiquement.
        </p>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div
          className={cn(
            "rounded-xl p-3 text-sm flex items-center gap-2",
            feedback.type === "success"
              ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/5 border border-red-500/20 text-red-400"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {feedback.text}
        </div>
      )}

      {/* Inflections list */}
      <div className="space-y-4">
        {inflections.map((inf, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-2xl p-5 ghost-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-headline text-sm font-bold text-primary">
                Inflexion #{i + 1}
              </span>
              {inflections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInflection(i)}
                  className="text-muted-foreground hover:text-red-400 transition-colors"
                  aria-label="Supprimer cette inflexion"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-1.5">
                  Année *
                </label>
                <input
                  type="text"
                  value={inf.year}
                  onChange={(e) => updateField(i, "year", e.target.value)}
                  placeholder="2019"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-border text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-1.5">
                  De *
                </label>
                <input
                  type="text"
                  value={inf.from}
                  onChange={(e) => updateField(i, "from", e.target.value)}
                  placeholder="Auditeur senior chez X"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-border text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-1.5">
                  Vers *
                </label>
                <input
                  type="text"
                  value={inf.to}
                  onChange={(e) => updateField(i, "to", e.target.value)}
                  placeholder="Manager finance chez Y"
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-border text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-1.5">
                Pourquoi ce mouvement ? *
              </label>
              <textarea
                value={inf.why}
                onChange={(e) => updateField(i, "why", e.target.value)}
                rows={2}
                placeholder="Le déclencheur, la motivation, le contexte..."
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-1.5">
                Ce que tu en as appris *
              </label>
              <textarea
                value={inf.lesson}
                onChange={(e) => updateField(i, "lesson", e.target.value)}
                rows={2}
                placeholder="L'enseignement clé pour la suite de ta carrière..."
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-border text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        ))}

        {inflections.length < 5 && (
          <button
            type="button"
            onClick={addInflection}
            className="w-full p-4 rounded-2xl border border-dashed border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une inflexion (max 5)
          </button>
        )}
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 bg-surface-container-lowest backdrop-blur-xl ghost-border rounded-2xl p-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Tu peux revenir compléter à tout moment.
        </p>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Enregistrer ma trajectoire
        </button>
      </div>
    </div>
  );
}
