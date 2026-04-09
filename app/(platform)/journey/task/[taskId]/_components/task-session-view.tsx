"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  GraduationCap,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { renderInlineMarkdown } from "@/lib/utils/render-markdown";
import {
  saveSessionProgress,
  completeTaskSession,
} from "@/lib/journey/actions";
import type { TaskWithContext } from "@/lib/journey/actions";

// ─── Section Icons ────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ElementType> = {
  "pourquoi": Target,
  "important": Target,
  "essentiel": BookOpen,
  "retenir": BookOpen,
  "pratique": Zap,
  "action": Zap,
  "conseil": Sparkles,
  "expert": Sparkles,
  "astuce": Sparkles,
};

const SECTION_COLORS: Record<string, string> = {
  "pourquoi": "from-blue-500/15 to-indigo-500/10 border-blue-500/20",
  "important": "from-blue-500/15 to-indigo-500/10 border-blue-500/20",
  "essentiel": "from-purple-500/15 to-violet-500/10 border-purple-500/20",
  "retenir": "from-purple-500/15 to-violet-500/10 border-purple-500/20",
  "pratique": "from-emerald-500/15 to-green-500/10 border-emerald-500/20",
  "action": "from-emerald-500/15 to-green-500/10 border-emerald-500/20",
  "conseil": "from-amber-500/15 to-orange-500/10 border-amber-500/20",
  "expert": "from-amber-500/15 to-orange-500/10 border-amber-500/20",
  "astuce": "from-amber-500/15 to-orange-500/10 border-amber-500/20",
};

const SECTION_ICON_COLORS: Record<string, string> = {
  "pourquoi": "text-blue-400",
  "important": "text-blue-400",
  "essentiel": "text-purple-400",
  "retenir": "text-purple-400",
  "pratique": "text-emerald-400",
  "action": "text-emerald-400",
  "conseil": "text-amber-400",
  "expert": "text-amber-400",
  "astuce": "text-amber-400",
};

function getSectionMeta(title: string) {
  const lower = title.toLowerCase();
  for (const key of Object.keys(SECTION_ICONS)) {
    if (lower.includes(key)) {
      return {
        Icon: SECTION_ICONS[key],
        color: SECTION_COLORS[key],
        iconColor: SECTION_ICON_COLORS[key],
      };
    }
  }
  return {
    Icon: BookOpen,
    color: "from-primary/10 to-primary/5 border-primary/20",
    iconColor: "text-primary",
  };
}

// ─── Lesson Content Renderer ──────────────────────────────────────

function renderLessonContent(text: string): React.ReactNode {
  // Split content into sections by **Title** patterns
  // Match both standalone **Title** and inline **Title** at start of text
  const sectionPattern = /\*\*([^*]+)\*\*\s*:?\s*/g;
  const sections: { title: string; content: string }[] = [];
  let lastIndex = 0;
  let lastTitle = "";
  const matches = [...text.matchAll(sectionPattern)];

  if (matches.length === 0) {
    // No sections found, render as plain text
    return (
      <div className="bg-surface-container rounded-2xl border border-border/30 p-5">
        {text.split("\n").filter(l => l.trim()).map((line, i) => (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-2">
            {renderInlineMarkdown(line.trim())}
          </p>
        ))}
      </div>
    );
  }

  for (const match of matches) {
    if (lastTitle && match.index !== undefined) {
      const content = text.slice(lastIndex, match.index).trim();
      if (content) {
        sections.push({ title: lastTitle, content });
      }
    }
    lastTitle = match[1].trim();
    lastIndex = (match.index ?? 0) + match[0].length;
  }
  // Last section
  if (lastTitle) {
    const content = text.slice(lastIndex).trim();
    if (content) {
      sections.push({ title: lastTitle, content });
    }
  }

  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const { Icon, color, iconColor } = getSectionMeta(section.title);
        return (
          <div
            key={i}
            className={cn(
              "rounded-2xl border bg-gradient-to-br p-5",
              color
            )}
          >
            {/* Section Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={cn("w-7 h-7 rounded-lg bg-background/50 flex items-center justify-center", iconColor)}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-headline text-sm font-bold text-foreground">
                {section.title}
              </h3>
            </div>

            {/* Section Content */}
            <div className="space-y-2 pl-[38px]">
              {section.content.split("\n").filter(l => l.trim()).map((line, j) => {
                const trimmed = line.trim();

                // Numbered items
                if (/^\d+[\.\)]\s/.test(trimmed)) {
                  const num = trimmed.match(/^(\d+)/)?.[1] || "1";
                  const content = trimmed.replace(/^\d+[\.\)]\s*/, "");
                  return (
                    <div key={j} className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-background/60 text-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {num}
                      </span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {renderInlineMarkdown(content)}
                      </span>
                    </div>
                  );
                }

                // List items
                if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
                  return (
                    <div key={j} className="flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-2 shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {renderInlineMarkdown(trimmed.substring(2))}
                      </span>
                    </div>
                  );
                }

                // Regular paragraph
                return (
                  <p key={j} className="text-sm text-muted-foreground leading-relaxed">
                    {renderInlineMarkdown(trimmed)}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

type SessionStep = "lesson" | "quiz" | "feedback";

// ─── Lesson Step ──────────────────────────────────────────────────

function LessonStep({
  content,
  isStreaming,
  onContinue,
  onRetry,
  error,
}: {
  content: string;
  isStreaming: boolean;
  onContinue: () => void;
  onRetry: () => void;
  error: string | null;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && isStreaming) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="font-headline text-lg font-bold text-foreground">
            Micro-leçon
          </h2>
          <p className="text-xs text-muted-foreground">
            Personnalisée pour votre profil
          </p>
        </div>
        {isStreaming && (
          <div className="ml-auto flex items-center gap-2 text-xs text-primary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Génération en cours...
          </div>
        )}
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto p-1 mb-4"
      >
        {content ? (
          renderLessonContent(content)
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <XCircle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Réessayer
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-xs text-muted-foreground">
              L&apos;IA prépare votre leçon...
            </p>
          </div>
        )}

        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse rounded-sm ml-0.5" />
        )}
      </div>

      {/* Actions */}
      {!isStreaming && content && (
        <button
          onClick={onContinue}
          className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl text-sm font-bold hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
        >
          Passer au quiz
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Quiz Step ────────────────────────────────────────────────────

function QuizStep({
  questions,
  isLoading,
  onSubmit,
  error,
  onRetry,
}: {
  questions: QuizQuestion[];
  isLoading: boolean;
  onSubmit: (answers: number[]) => void;
  error: string | null;
  onRetry: () => void;
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const question = questions[currentQ];
  const isLast = currentQ === questions.length - 1;
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === question?.correctIndex;

  const handleSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = index;
      return next;
    });
  };

  const handleNext = () => {
    if (isLast) {
      onSubmit(answers.filter((a): a is number => a !== null));
    } else {
      setCurrentQ((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Brain className="w-12 h-12 text-purple-400 mb-4 animate-pulse" />
        <p className="text-sm font-bold text-foreground mb-1">
          Préparation du quiz...
        </p>
        <p className="text-xs text-muted-foreground">
          Questions personnalisées en cours de génération
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <XCircle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-sm text-red-400 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Réessayer
        </button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-headline text-lg font-bold text-foreground">
              Quiz
            </h2>
            <p className="text-xs text-muted-foreground">
              Validez votre compréhension
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                i === currentQ
                  ? "bg-purple-400 scale-125"
                  : i < currentQ
                  ? answers[i] === questions[i].correctIndex
                    ? "bg-emerald-500"
                    : "bg-red-400"
                  : "bg-surface-container"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1">
        <div className="bg-surface-container-low rounded-2xl ghost-border p-6 mb-4">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 block">
            Question {currentQ + 1}/{questions.length}
          </span>
          <p className="text-sm font-bold text-foreground leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => {
            const isSelected = selectedOption === i;
            const isCorrectOption = i === question.correctIndex;
            const showResult = showExplanation;

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showExplanation}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all",
                  !showResult &&
                    !isSelected &&
                    "border-transparent bg-surface-container-low hover:bg-surface-container hover:border-primary/20",
                  !showResult &&
                    isSelected &&
                    "border-primary bg-primary/10",
                  showResult &&
                    isCorrectOption &&
                    "border-emerald-500 bg-emerald-500/10",
                  showResult &&
                    isSelected &&
                    !isCorrectOption &&
                    "border-red-400 bg-red-400/10",
                  showResult &&
                    !isSelected &&
                    !isCorrectOption &&
                    "border-transparent bg-surface-container-low opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0",
                      showResult && isCorrectOption
                        ? "bg-emerald-500 text-white"
                        : showResult && isSelected && !isCorrectOption
                        ? "bg-red-400 text-white"
                        : "bg-surface-container text-muted-foreground"
                    )}
                  >
                    {showResult && isCorrectOption ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : showResult && isSelected && !isCorrectOption ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-sm leading-relaxed",
                      showResult && isCorrectOption
                        ? "text-emerald-400 font-bold"
                        : showResult && isSelected && !isCorrectOption
                        ? "text-red-400"
                        : "text-foreground"
                    )}
                  >
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div
            className={cn(
              "mt-4 p-4 rounded-xl border",
              isCorrect
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-amber-500/5 border-amber-500/20"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Zap className="w-4 h-4 text-amber-400" />
              )}
              <span
                className={cn(
                  "text-xs font-bold",
                  isCorrect ? "text-emerald-400" : "text-amber-400"
                )}
              >
                {isCorrect ? "Bonne réponse !" : "Pas tout à fait..."}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Continue button */}
      {showExplanation && (
        <button
          onClick={handleNext}
          className="w-full mt-4 gradient-primary text-primary-foreground py-3.5 rounded-xl text-sm font-bold hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
        >
          {isLast ? "Voir mon résultat" : "Question suivante"}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── Feedback Step ────────────────────────────────────────────────

function FeedbackStep({
  score,
  totalQuestions,
  content,
  isStreaming,
  passed,
  onRetry,
  onContinue,
  error,
}: {
  score: number;
  totalQuestions: number;
  content: string;
  isStreaming: boolean;
  passed: boolean;
  onRetry: () => void;
  onContinue: () => void;
  error: string | null;
}) {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div className="flex flex-col h-full">
      {/* Score Header */}
      <div className="text-center mb-6">
        <div
          className={cn(
            "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
            passed
              ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20"
              : "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
          )}
        >
          {passed ? (
            <Trophy className="w-10 h-10 text-emerald-400" />
          ) : (
            <RefreshCw className="w-10 h-10 text-amber-400" />
          )}
        </div>
        <h2 className="font-headline text-2xl font-black text-foreground mb-1">
          {score}/{totalQuestions}
        </h2>
        <p
          className={cn(
            "text-sm font-bold",
            passed ? "text-emerald-400" : "text-amber-400"
          )}
        >
          {passed ? "Bravo, tâche validée !" : "Presque... réessaye !"}
        </p>

        {/* Score bar */}
        <div className="w-48 h-2 bg-surface-container rounded-full mx-auto mt-3">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              passed ? "bg-emerald-500" : "bg-amber-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          {percentage}% — {passed ? "≥ 60% requis" : "60% requis pour valider"}
        </p>
      </div>

      {/* Feedback content */}
      <div className="flex-1 overflow-y-auto bg-surface-container-low rounded-2xl ghost-border p-6 mb-4">
        {content ? (
          <div className="space-y-2">
            {content.split("\n").filter(l => l.trim()).map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {renderInlineMarkdown(line.trim())}
              </p>
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 text-center">{error}</p>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse rounded-sm ml-0.5" />
        )}
      </div>

      {/* Actions */}
      {!isStreaming && content && (
        <div className="flex gap-3">
          {!passed && (
            <button
              onClick={onRetry}
              className="flex-1 bg-surface-container-low ghost-border text-foreground py-3.5 rounded-xl text-sm font-bold hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Revoir la leçon
            </button>
          )}
          <button
            onClick={onContinue}
            className={cn(
              "flex-1 gradient-primary text-primary-foreground py-3.5 rounded-xl text-sm font-bold hover:scale-[1.01] transition-transform flex items-center justify-center gap-2",
              !passed && "opacity-70"
            )}
          >
            {passed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Continuer le parcours
              </>
            ) : (
              <>
                Continuer quand même
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function TaskSessionView({ task }: { task: TaskWithContext }) {
  const router = useRouter();

  // Determine initial step from saved session
  const getInitialStep = (): SessionStep => {
    if (!task.session) return "lesson";
    if (task.session.status === "COMPLETED") return "lesson"; // Re-do
    if (task.session.status === "FEEDBACK") return "feedback";
    if (task.session.status === "QUIZ") return "quiz";
    return "lesson";
  };

  const [currentStep, setCurrentStep] = useState<SessionStep>(getInitialStep);
  const [lessonContent, setLessonContent] = useState(
    task.session?.lessonContent || ""
  );
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    (task.session?.quizQuestions as QuizQuestion[]) || []
  );
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState(task.session?.quizScore ?? 0);
  const [feedbackContent, setFeedbackContent] = useState(
    task.session?.feedbackContent || ""
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-start lesson if no content
  const hasStarted = useRef(false);
  useEffect(() => {
    if (!hasStarted.current && currentStep === "lesson" && !lessonContent) {
      hasStarted.current = true;
      fetchLesson();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Fetch Lesson ───────────────────────────────────

  const fetchLesson = useCallback(async () => {
    setError(null);
    setIsStreaming(true);
    setLessonContent("");

    try {
      const response = await fetch("/api/task-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "lesson", taskId: task.id }),
      });

      if (!response.ok) throw new Error(await response.text());

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Pas de stream");

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setLessonContent(accumulated);
      }

      // Save lesson to DB
      await saveSessionProgress(task.id, {
        status: "LESSON",
        lessonContent: accumulated,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la leçon"
      );
    } finally {
      setIsStreaming(false);
    }
  }, [task.id]);

  // ─── Fetch Quiz ─────────────────────────────────────

  const fetchQuiz = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/task-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "quiz",
          taskId: task.id,
          lessonContent,
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      const text = await response.text();

      // Parse quiz JSON — handle potential surrounding text
      let questions: QuizQuestion[];
      try {
        questions = JSON.parse(text);
      } catch {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) {
          questions = JSON.parse(match[0]);
        } else {
          throw new Error("Format de quiz invalide");
        }
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Quiz vide");
      }

      setQuizQuestions(questions);

      // Save quiz to DB
      await saveSessionProgress(task.id, {
        status: "QUIZ",
        lessonContent,
        quizQuestions: questions,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du quiz"
      );
    } finally {
      setIsLoading(false);
    }
  }, [task.id, lessonContent]);

  // ─── Fetch Feedback ─────────────────────────────────

  const fetchFeedback = useCallback(
    async (answers: number[], questions: QuizQuestion[]) => {
      setError(null);
      setIsStreaming(true);
      setFeedbackContent("");

      const correctCount = answers.filter(
        (a, i) => a === questions[i]?.correctIndex
      ).length;
      const scorePercent = Math.round(
        (correctCount / questions.length) * 100
      );
      setQuizScore(correctCount);

      const wrongAnswers = answers
        .map((a, i) => {
          if (a === questions[i].correctIndex) return null;
          return {
            question: questions[i].question,
            userAnswer: questions[i].options[a],
            correctAnswer: questions[i].options[questions[i].correctIndex],
            explanation: questions[i].explanation,
          };
        })
        .filter(Boolean) as {
        question: string;
        userAnswer: string;
        correctAnswer: string;
        explanation: string;
      }[];

      try {
        const response = await fetch("/api/task-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: "feedback",
            taskId: task.id,
            score: scorePercent,
            totalQuestions: questions.length,
            wrongAnswers,
          }),
        });

        if (!response.ok) throw new Error(await response.text());

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("Pas de stream");

        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setFeedbackContent(accumulated);
        }

        // Save feedback + answers to DB
        const quizAnswerData = answers.map((a, i) => ({
          questionIndex: i,
          selectedIndex: a,
          correct: a === questions[i].correctIndex,
        }));

        await saveSessionProgress(task.id, {
          status: "FEEDBACK",
          lessonContent,
          quizQuestions: questions,
          quizAnswers: quizAnswerData,
          quizScore: correctCount,
          feedbackContent: accumulated,
        });

        // Auto-complete if passed
        if (scorePercent >= 60) {
          await completeTaskSession(task.id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du feedback"
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [task.id, lessonContent]
  );

  // ─── Handlers ───────────────────────────────────────

  const handleLessonContinue = () => {
    setCurrentStep("quiz");
    if (quizQuestions.length === 0) {
      fetchQuiz();
    }
  };

  const handleQuizSubmit = (answers: number[]) => {
    setQuizAnswers(answers);
    setCurrentStep("feedback");
    fetchFeedback(answers, quizQuestions);
  };

  const handleRetryLesson = () => {
    setCurrentStep("lesson");
    setQuizQuestions([]);
    setQuizAnswers([]);
    setFeedbackContent("");
    fetchLesson();
  };

  const handleContinue = () => {
    router.push("/journey");
    router.refresh();
  };

  // ─── Step Progress Bar ──────────────────────────────

  const steps: { key: SessionStep; label: string; icon: React.ElementType }[] =
    [
      { key: "lesson", label: "Leçon", icon: BookOpen },
      { key: "quiz", label: "Quiz", icon: Brain },
      { key: "feedback", label: "Résultat", icon: Trophy },
    ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Bar */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push("/journey")}
            className="w-8 h-8 rounded-lg bg-surface-container-low ghost-border flex items-center justify-center hover:bg-surface-container transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Phase {task.phase.number} — {task.phase.title}
            </p>
            <h1 className="font-headline text-base font-bold text-foreground truncate">
              {task.title}
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold text-primary">
              +5 XP
            </span>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentIndex;
            const isDone = i < currentIndex;

            return (
              <div key={step.key} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex items-center gap-2 flex-1 py-2 px-3 rounded-lg transition-all",
                    isActive &&
                      "bg-primary/10 border border-primary/20",
                    isDone && "bg-emerald-500/10",
                    !isActive && !isDone && "bg-surface-container-low"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5",
                      isActive && "text-primary",
                      isDone && "text-emerald-400",
                      !isActive && !isDone && "text-muted-foreground/40"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      isActive && "text-primary",
                      isDone && "text-emerald-400",
                      !isActive && !isDone && "text-muted-foreground/40"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-4 h-px",
                      isDone ? "bg-emerald-500" : "bg-border/30"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 min-h-0">
        {currentStep === "lesson" && (
          <LessonStep
            content={lessonContent}
            isStreaming={isStreaming}
            onContinue={handleLessonContinue}
            onRetry={fetchLesson}
            error={error}
          />
        )}

        {currentStep === "quiz" && (
          <QuizStep
            questions={quizQuestions}
            isLoading={isLoading}
            onSubmit={handleQuizSubmit}
            error={error}
            onRetry={fetchQuiz}
          />
        )}

        {currentStep === "feedback" && (
          <FeedbackStep
            score={quizScore}
            totalQuestions={quizQuestions.length}
            content={feedbackContent}
            isStreaming={isStreaming}
            passed={
              quizQuestions.length > 0 &&
              Math.round(
                (quizScore / quizQuestions.length) * 100
              ) >= 60
            }
            onRetry={handleRetryLesson}
            onContinue={handleContinue}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
