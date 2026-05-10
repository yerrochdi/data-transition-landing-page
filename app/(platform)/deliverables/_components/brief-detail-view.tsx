"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  AlertTriangle,
  Crown,
  CheckCircle2,
  XCircle,
  Send,
  Save,
  Share2,
  ListChecks,
  FileText,
  Bot,
  Award,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  startDeliverable,
  saveDraft,
  submitForReview,
  togglePublic,
  generateFirstDraft,
  type BriefDetail,
} from "@/lib/deliverables/actions";

// ─── Markdown lite renderer (the brief content) ───────────────────
// We don't want to pull a markdown lib for this MVP — render with
// simple line-based parsing for headings + bullets + bold.

function renderMarkdownLite(text: string): React.ReactNode {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      out.push(
        <ul key={`ul-${out.length}`} className="list-disc pl-5 space-y-1 my-2 text-sm text-muted-foreground">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) {
      flushList();
      out.push(
        <h3 key={out.length} className="font-headline text-lg font-bold text-foreground mt-5 mb-2">
          {line.replace("## ", "")}
        </h3>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      out.push(
        <h4 key={out.length} className="font-headline text-base font-bold text-foreground mt-4 mb-1.5">
          {line.replace("### ", "")}
        </h4>
      );
    } else if (line.startsWith("- ")) {
      listBuffer.push(line.replace("- ", ""));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      out.push(
        <p key={out.length} className="text-sm text-muted-foreground leading-relaxed my-2">
          {renderInline(line)}
        </p>
      );
    }
  }
  flushList();
  return out;
}

function renderInline(text: string): React.ReactNode {
  // Bold **xxx**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground font-bold">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

// ─── AI Review panel ───────────────────────────────────────────────

type AiReviewShape = {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestion: string;
  verdict: "validated" | "needs_work";
};

function AiReviewPanel({ review }: { review: AiReviewShape }) {
  const validated = review.verdict === "validated";
  return (
    <div
      className={cn(
        "p-5 rounded-2xl space-y-4",
        validated
          ? "bg-emerald-500/5 border border-emerald-500/20"
          : "bg-amber-500/5 border border-amber-500/20"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {validated ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
          <h3 className="font-headline font-bold text-foreground">
            {validated ? "Livrable validé" : "À retravailler"}
          </h3>
        </div>
        <div
          className={cn(
            "font-headline text-2xl font-black",
            validated ? "text-emerald-400" : "text-amber-400"
          )}
        >
          {review.score}/100
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-2">
            Points forts
          </p>
          <ul className="space-y-1.5">
            {review.strengths.map((s, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2">
            Axes d'amélioration
          </p>
          <ul className="space-y-1.5">
            {review.improvements.map((s, i) => (
              <li key={i} className="text-xs text-foreground flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {review.suggestion && (
        <div className="pt-3 border-t border-border/50">
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">
            Prochaine étape
          </p>
          <p className="text-sm text-foreground">{review.suggestion}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────

export function BriefDetailView({
  brief,
  error,
}: {
  brief: BriefDetail;
  error?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(brief.userDeliverable?.content ?? "");
  const [externalUrl, setExternalUrl] = useState(
    brief.userDeliverable?.externalUrl ?? ""
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");

  const deliverable = brief.userDeliverable;
  const isStarted = !!deliverable;
  const isSubmitted = deliverable?.status === "SUBMITTED";
  const isReviewed = deliverable?.status === "REVIEWED";
  const isValidated = deliverable?.status === "VALIDATED";
  const review = deliverable?.aiReview as AiReviewShape | null | undefined;
  const isTextOnly = brief.submissionMode === "TEXT_ONLY";
  const minChars = isTextOnly ? 200 : 100;

  const showFeedback = (msg: string, type: "success" | "error" = "success") => {
    setFeedback(msg);
    setFeedbackType(type);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleStart = () => {
    startTransition(async () => {
      const result = await startDeliverable(brief.slug);
      if (!result.ok) {
        showFeedback(result.error ?? "Erreur", "error");
      } else {
        router.refresh();
      }
    });
  };

  const handleSave = () => {
    if (!deliverable) return;
    startTransition(async () => {
      const result = await saveDraft(deliverable.id, { content, externalUrl });
      if (result.ok) {
        showFeedback("Brouillon sauvegardé.");
      } else {
        showFeedback(result.error ?? "Erreur", "error");
      }
    });
  };

  const handleSubmit = () => {
    if (!deliverable) return;
    startTransition(async () => {
      // Save first, then submit
      await saveDraft(deliverable.id, { content, externalUrl });
      const result = await submitForReview(deliverable.id);
      if (!result.ok) {
        showFeedback(result.error ?? "Erreur", "error");
      } else {
        router.refresh();
      }
    });
  };

  const handleTogglePublic = () => {
    if (!deliverable) return;
    startTransition(async () => {
      const result = await togglePublic(deliverable.id);
      if (result.ok) {
        showFeedback(
          result.shareableSlug
            ? "Livrable rendu public — partage le lien sur LinkedIn !"
            : "Livrable repassé en privé."
        );
        router.refresh();
      }
    });
  };

  const handleGenerateDraft = () => {
    if (!deliverable) return;
    if (
      content.trim().length > 0 &&
      !window.confirm(
        "Générer un nouveau premier jet va remplacer ton contenu actuel. Continuer ?"
      )
    ) {
      return;
    }
    startTransition(async () => {
      showFeedback("Génération en cours… 15-30 secondes.", "success");
      const result = await generateFirstDraft(deliverable.id);
      if (result.ok && result.draft) {
        setContent(result.draft);
        showFeedback(
          "Premier jet généré ! Retravaille-le, puis soumets pour correction."
        );
      } else {
        showFeedback(result.error ?? "Erreur", "error");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <Link
        href="/deliverables"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour au catalogue
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
            {brief.sector}
          </span>
          {brief.useFromProfile && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              <Wand2 className="w-3 h-3" />
              IA-assisté
            </span>
          )}
          {brief.isPremium && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {brief.estimatedDays} jours · Niveau {brief.difficulty}/5
          </span>
        </div>
        <h1 className="font-headline text-2xl md:text-3xl font-black text-foreground">
          {brief.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {brief.shortDescription}
        </p>
        {brief.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {brief.tools.map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* "How it works" — only when not started yet, to onboard the user */}
      {!isStarted && (
        <div className="bg-surface-container-lowest rounded-2xl p-5 ghost-border">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-4 h-4 text-primary" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
              Comment ça marche
            </span>
          </div>
          <ol className="grid md:grid-cols-4 gap-3 text-xs">
            {[
              {
                step: 1,
                icon: FileText,
                title: "Lis le brief",
                desc: "Énoncé + critères d'évaluation IA juste en dessous.",
              },
              {
                step: 2,
                icon: Sparkles,
                title: isTextOnly ? "Rédige ton livrable" : "Construis ton livrable",
                desc: isTextOnly
                  ? `Directement ici dans l'éditeur. ${brief.estimatedDays} jours conseillés.`
                  : `Sur Notion, GitHub, Figma… ${brief.estimatedDays} jours conseillés.`,
              },
              {
                step: 3,
                icon: Bot,
                title: "Soumets pour correction",
                desc: isTextOnly
                  ? "L'IA évalue ton texte selon les critères du brief en 30s."
                  : "Lien + description courte. L'IA évalue en 30s.",
              },
              {
                step: 4,
                icon: Award,
                title: "Validé → Portfolio",
                desc: "Score ≥ 70 = livrable validé. Rends-le public, partage sur LinkedIn.",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.step}
                  className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">
                      {s.step}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="font-bold text-foreground text-xs">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {s.desc}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Error banner from server action redirect */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Inline feedback toast */}
      {feedback && (
        <div
          className={cn(
            "rounded-xl p-3 text-sm flex items-center gap-2",
            feedbackType === "success"
              ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/5 border border-red-500/20 text-red-400"
          )}
        >
          {feedbackType === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {feedback}
        </div>
      )}

      {/* AI review (if any) */}
      {review && <AiReviewPanel review={review} />}

      {/* Brief content */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 ghost-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
            Énoncé du brief
          </span>
        </div>
        <div className="prose-custom">{renderMarkdownLite(brief.fullBrief)}</div>

        {brief.templateUrl && (
          <a
            href={brief.templateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-sm font-bold text-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ouvrir le template
          </a>
        )}
      </div>

      {/* Evaluation criteria */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 ghost-border">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">
            Critères d'évaluation IA
          </span>
        </div>
        <div className="prose-custom">{renderMarkdownLite(brief.evaluationCriteria)}</div>
      </div>

      {/* CTA / Editor */}
      {!isStarted ? (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
          <h3 className="font-headline text-lg font-bold text-foreground">
            Prêt à attaquer ?
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Une fois lancé, tu peux travailler à ton rythme — soumettre en 1 jour ou en 7. Tu auras une correction IA dès la soumission.
          </p>
          <button
            onClick={handleStart}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Commencer ce livrable
          </button>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl p-6 ghost-border space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-headline text-lg font-bold text-foreground">
                Ton livrable
              </h3>
              {!isValidated && !isSubmitted && (
                <p className="text-xs text-muted-foreground mt-1">
                  {isTextOnly
                    ? "Rédige ton livrable directement dans l'éditeur. Quand tu es prêt, soumets pour correction IA."
                    : "Construis ton livrable sur Notion / GitHub / Figma. Colle le lien ici + une courte description avant de soumettre."}
                </p>
              )}
            </div>
            {isSubmitted && (
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Correction IA en cours…
              </span>
            )}
            {isValidated && (
              <button
                onClick={handleTogglePublic}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold disabled:opacity-50"
              >
                <Share2 className="w-3.5 h-3.5" />
                {deliverable?.isPublic ? "Rendre privé" : "Rendre public"}
              </button>
            )}
          </div>

          {/* External URL — only for LINK_REQUIRED briefs (RAG, dashboard…) */}
          {!isTextOnly && (
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-1.5">
                Lien vers ton livrable (Notion, GitHub, Figma, Drive…) *
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                disabled={isValidated}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-surface-container border border-border text-sm focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Pour ce brief, ton livrable vit sur Notion / GitHub / Figma. Colle le
                lien public ici.
              </p>
            </div>
          )}

          {/* "Generate first draft" — only for briefs that support it */}
          {brief.useFromProfile && !isValidated && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <Wand2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground mb-0.5">
                  Pas envie de partir d'une page blanche ?
                </p>
                <p className="text-xs text-muted-foreground mb-2.5">
                  L'IA peut rédiger un premier jet à partir de ton onboarding (poste,
                  réalisations, secteur). Tu n'as plus qu'à retravailler.
                </p>
                <button
                  onClick={handleGenerateDraft}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  {content.trim().length > 0
                    ? "Regénérer un premier jet"
                    : "Générer un premier jet IA"}
                </button>
              </div>
            </div>
          )}

          {/* Content — main editor */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground block mb-1.5">
              {isTextOnly
                ? "Ton livrable (markdown supporté) *"
                : "Description de ta démarche (markdown supporté) *"}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isValidated}
              rows={brief.useFromProfile || isTextOnly ? 18 : 10}
              placeholder={
                isTextOnly
                  ? `Rédige ton ${brief.title.toLowerCase()} directement ici. Min ${minChars} caractères.`
                  : `Décris tes choix, tes hypothèses, ce que ton livrable montre… (min ${minChars} caractères)`
              }
              className="w-full px-3 py-2 rounded-lg bg-surface-container border border-border text-sm focus:outline-none focus:border-primary disabled:opacity-50 font-mono"
            />
            <div className="text-[10px] text-muted-foreground mt-1 text-right">
              {content.length} / {minChars} caractères min
            </div>
          </div>

          {/* Action buttons */}
          {!isValidated && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-sm font-bold disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                Sauvegarder
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || isSubmitted}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {isReviewed ? "Resoumettre pour correction" : "Soumettre pour correction IA"}
              </button>
            </div>
          )}

          {isValidated && deliverable?.isPublic && deliverable?.shareableSlug && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-sm">
              <p className="text-emerald-400 font-bold mb-1 text-xs uppercase tracking-widest">
                Lien public
              </p>
              <code className="text-xs text-foreground break-all">
                {typeof window !== "undefined" ? window.location.origin : ""}
                /portfolio/{deliverable.shareableSlug}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
