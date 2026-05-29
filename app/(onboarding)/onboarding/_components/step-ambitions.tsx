"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, RefreshCw, Loader2, Check, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingFormData } from "@/lib/onboarding/types";

interface SuggestedRole {
  title: string;
  sector: string;
  description: string;
  match: number;
  /** "short" = 1-2 ans, "mid" = 3-5 ans, "long" = 5-7 ans.
   * Optionnel pour la rétro-compat avec d'anciennes réponses qui
   * ne contenaient pas ce champ. */
  horizon?: "short" | "mid" | "long";
}

interface StepAmbitionsProps {
  targetRole: string;
  targetSector: string;
  formData: Partial<OnboardingFormData>;
  aiContent: string | null;
  onFieldChange: (field: string, value: string) => void;
  onAiUpdate: (content: string) => void;
}

const VERTICAL_OPTIONS = [
  { value: "FINANCE", label: "Finance / Assurance", desc: "DAF, contrôleur, finance d'entreprise" },
  { value: "TECH", label: "Tech / Conseil", desc: "Product, projet, ESN, scale-up" },
  { value: "OTHER", label: "Autre secteur", desc: "Marketing, RH, industrie, santé..." },
] as const;

const TRANSITION_TYPES = [
  { value: "PIVOT", label: "Pivot complet", desc: "Changer de métier vers la data/IA" },
  { value: "UPSKILL", label: "Upskill dans mon poste", desc: "Intégrer la data sans changer de métier" },
  { value: "INTERNAL_EVOLUTION", label: "Évolution interne", desc: "Monter en grade en interne" },
] as const;

const HORIZONS = [
  { value: "THREE_MONTHS", label: "3 mois", desc: "Sprint" },
  { value: "SIX_MONTHS", label: "6 mois", desc: "Rythme soutenu" },
  { value: "TWELVE_MONTHS", label: "12 mois", desc: "Étalé" },
] as const;

const SUCCESS_INDICATORS = [
  { value: "NEW_JOB", label: "Décrocher un nouveau poste data-augmenté" },
  { value: "DATA_PROJECTS", label: "Livrer X projets data dans mon poste actuel" },
  { value: "SALARY_INCREASE", label: "Obtenir une augmentation de salaire" },
] as const;

export function StepAmbitions({
  targetRole,
  targetSector,
  formData,
  aiContent,
  onFieldChange,
  onAiUpdate,
}: StepAmbitionsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<SuggestedRole[]>([]);
  const hasTriggered = useRef(false);

  // Parse roles from AI content — handles markdown code blocks and surrounding text
  useEffect(() => {
    if (!aiContent) {
      setRoles([]);
      return;
    }
    try {
      let cleaned = aiContent.trim();
      // Strip markdown code block if present (```json ... ```)
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
      // Try to extract JSON array from surrounding text
      const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleaned = arrayMatch[0];
      }
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setRoles(parsed);
      }
    } catch {
      // Still streaming or invalid JSON — ignore
    }
  }, [aiContent]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRoles([]);
    onAiUpdate("");

    // Le step ambitions exige un JSON valide en sortie. Kimi rend parfois
    // un JSON cassé (markdown, caractères asiatiques résiduels) → la route
    // renvoie 502. On retry silencieusement jusqu'à 3 tentatives avant
    // d'afficher l'erreur. Backoff léger pour laisser Kimi respirer.
    const MAX_ATTEMPTS = 3;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch("/api/onboarding/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: "ambitions", data: formData }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const text = await res.text();
        // Tentative de parse pour valider que le JSON est exploitable
        // avant de pousser au reducer (sinon on accepte une réponse vide
        // qui passe en .ok mais ne donne rien à afficher).
        const cleaned = text
          .trim()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```\s*$/, "");
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        const candidate = arrayMatch ? arrayMatch[0] : cleaned;
        const parsed = JSON.parse(candidate);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error("Réponse IA vide");
        }

        onAiUpdate(text);
        setLoading(false);
        return; // succès → stop retry
      } catch (e) {
        lastError = e;
        // backoff progressif (400ms, 900ms) — laisse Kimi se reprendre
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 400 * attempt + 100));
        }
      }
    }

    setError(lastError instanceof Error ? lastError.message : "Erreur inattendue");
    setLoading(false);
  }, [formData, onAiUpdate]);

  // Auto-trigger when we have enough data
  useEffect(() => {
    if (
      !hasTriggered.current &&
      !aiContent &&
      !loading &&
      formData.currentRole &&
      formData.currentSector
    ) {
      hasTriggered.current = true;
      generate();
    }
  }, [formData.currentRole, formData.currentSector, aiContent, loading, generate]);

  const selectRole = (role: SuggestedRole) => {
    onFieldChange("targetRole", role.title);
    onFieldChange("targetSector", role.sector);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Basé sur votre profil de <strong className="text-foreground">{formData.currentRole || "—"}</strong> dans le secteur <strong className="text-foreground">{formData.currentSector || "—"}</strong>, voici les rôles data/IA qui valorisent votre expérience :
      </p>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-xs text-primary font-bold">
              Analyse de votre profil en cours...
            </span>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-xl p-5 ghost-border animate-pulse"
            >
              <div className="h-4 bg-surface-container rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface-container rounded w-full mb-2" />
              <div className="h-3 bg-surface-container rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-surface-container-high/70 p-4 rounded-xl light-streak">
          <p className="text-xs text-muted-foreground mb-3">
            L&apos;analyse IA est temporairement indisponible.
          </p>
          <button
            onClick={() => {
              hasTriggered.current = false;
              setError(null);
              generate();
            }}
            className="flex items-center gap-2 text-xs text-primary font-bold hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
          {/* Fallback: manual input */}
          <div className="mt-4 space-y-3 pt-4 border-t border-border/10">
            <p className="text-xs text-muted-foreground">Ou saisissez manuellement :</p>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => onFieldChange("targetRole", e.target.value)}
              placeholder="Rôle cible"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={targetSector}
              onChange={(e) => onFieldChange("targetSector", e.target.value)}
              placeholder="Secteur cible"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {/* Role cards */}
      {!loading && !error && roles.length > 0 && (
        <div className="space-y-3">
          {roles.map((role, i) => {
            const isSelected = targetRole === role.title;
            return (
              <button
                key={i}
                onClick={() => selectRole(role)}
                className={cn(
                  "w-full text-left p-5 rounded-xl transition-all",
                  isSelected
                    ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                    : "bg-surface-container-lowest ghost-border hover:bg-surface-container hover:scale-[1.01]"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-container text-muted-foreground"
                      )}
                    >
                      {isSelected ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Target className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-headline font-bold text-sm",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {role.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {role.sector}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {role.horizon && (
                      <div className={cn(
                        "px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider",
                        role.horizon === "short" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                        role.horizon === "mid" && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                        role.horizon === "long" && "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      )}>
                        {role.horizon === "short" && "1-2 ans"}
                        {role.horizon === "mid" && "3-5 ans"}
                        {role.horizon === "long" && "5-7 ans"}
                      </div>
                    )}
                    <div className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold",
                      role.match >= 85
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-container text-muted-foreground"
                    )}>
                      {role.match}% match
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ml-13 pl-13">
                  {role.description}
                </p>
              </button>
            );
          })}

          {/* Regenerate button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                hasTriggered.current = false;
                onAiUpdate("");
                setRoles([]);
                generate();
              }}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Proposer d&apos;autres rôles
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-primary">
              <Sparkles className="w-3 h-3" />
              Analyse IA basée sur votre profil
            </div>
          </div>

          {/* Selected role confirmation */}
          {targetRole && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 animate-fade-up">
              <p className="text-xs text-foreground">
                <span className="text-primary font-bold">Objectif sélectionné :</span>{" "}
                {targetRole} dans le secteur {targetSector}
              </p>
            </div>
          )}

          {/* Career goal — 3 imposed dimensions */}
          {targetRole && (
            <div className="space-y-5 pt-2 border-t border-border/20 mt-4">
              <p className="text-xs font-headline font-bold uppercase tracking-widest text-primary">
                Cadre ton objectif
              </p>

              {/* Vertical */}
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">
                  Ta verticale principale
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {VERTICAL_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={formData.vertical === opt.value}
                      label={opt.label}
                      desc={opt.desc}
                      onClick={() => onFieldChange("vertical", opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Transition type */}
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">
                  Type de transition
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TRANSITION_TYPES.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={formData.transitionType === opt.value}
                      label={opt.label}
                      desc={opt.desc}
                      onClick={() => onFieldChange("transitionType", opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Horizon */}
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">
                  Horizon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {HORIZONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      selected={formData.horizon === opt.value}
                      label={opt.label}
                      desc={opt.desc}
                      onClick={() => onFieldChange("horizon", opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Success indicator */}
              <div>
                <label className="text-sm font-bold text-foreground mb-2 block">
                  Comment tu mesureras le succès
                </label>
                <div className="space-y-2">
                  {SUCCESS_INDICATORS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onFieldChange("successIndicator", opt.value)}
                      className={cn(
                        "w-full p-3 rounded-xl text-left transition-all text-sm",
                        formData.successIndicator === opt.value
                          ? "bg-primary/10 border-2 border-primary/40 text-primary font-bold"
                          : "bg-surface-container-lowest ghost-border hover:bg-surface-container text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI responded but JSON parse failed — show fallback */}
      {!loading && !error && roles.length === 0 && aiContent && (
        <div className="bg-surface-container-high/70 p-4 rounded-xl light-streak space-y-4">
          <p className="text-xs text-muted-foreground">
            Les suggestions IA n&apos;ont pas pu être chargées. Vous pouvez réessayer ou saisir manuellement.
          </p>
          <button
            onClick={() => {
              hasTriggered.current = false;
              onAiUpdate("");
              setRoles([]);
              generate();
            }}
            className="flex items-center gap-2 text-xs text-primary font-bold hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
          <div className="space-y-3 pt-3 border-t border-border/10">
            <p className="text-xs text-muted-foreground">Ou saisissez manuellement :</p>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => onFieldChange("targetRole", e.target.value)}
              placeholder="Ex: Data Analyst Finance"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              value={targetSector}
              onChange={(e) => onFieldChange("targetSector", e.target.value)}
              placeholder="Ex: FinTech"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}

      {/* No data state */}
      {!loading && !error && roles.length === 0 && !aiContent && (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground">
            Remplissez votre métier et secteur à l&apos;étape précédente pour obtenir des suggestions personnalisées.
          </p>
        </div>
      )}
    </div>
  );
}

function OptionButton({
  selected,
  label,
  desc,
  onClick,
}: {
  selected: boolean;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl text-left transition-all",
        selected
          ? "bg-primary/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
          : "bg-surface-container-lowest ghost-border hover:bg-surface-container"
      )}
    >
      <p className={cn("text-xs font-bold", selected ? "text-primary" : "text-foreground")}>
        {label}
      </p>
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{desc}</p>
    </button>
  );
}
