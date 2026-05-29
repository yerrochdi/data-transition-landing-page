"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Linkedin,
  Upload,
  Loader2,
  Check,
  AlertCircle,
  ArrowRight,
  FileText,
  Sparkles,
  Zap,
  Compass,
  Target,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Diagnostic narratif retourné par /api/onboarding/parse-linkedin.
 * Ces champs permettent à NextMove de prouver à l'utilisateur·rice que
 * son CV a vraiment été LU (pas juste parsé), via une lecture de
 * consultant senior. Optionnel pour la rétro-compat avec d'anciennes
 * réponses qui ne contenaient que les champs factuels.
 */
export interface LinkedInDiagnostic {
  synthesis: string;
  deduced_specialty: string;
  real_skills_deduced: string[];
  hidden_patterns: string[];
  transition_angle: string;
  questions_to_clarify: string[];
}

interface LinkedInProfile {
  currentRole: string | null;
  currentCompany: string | null;
  currentSector: string | null;
  experienceYears: number | null;
  educationLevel: string | null;
  certifications: string[];
  topSkills: string[];
  experiences: {
    role: string;
    company: string;
    duration: string;
    highlights: string;
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  summary: string | null;
  hasDataExperience: boolean;
  /** Nouveau : diagnostic narratif du consultant senior IA. */
  diagnostic?: LinkedInDiagnostic;
}

interface StepLinkedInProps {
  onProfileParsed: (profile: LinkedInProfile) => void;
  onSkip: () => void;
  /**
   * Callback appelé quand l'utilisateur·rice répond à une question de
   * clarification posée par l'IA. Sert à enrichir le contexte propagé
   * vers les prompts suivants (Ambitions, Skills, Summary).
   */
  onClarificationAnswer?: (question: string, answer: string) => void;
}

type Mode = "quick" | "pdf";

const SECTORS = [
  "Tech / IT",
  "Finance",
  "Industrie",
  "Conseil",
  "Marketing / Communication",
  "Santé",
  "Retail / Distribution",
  "Énergie",
  "Immobilier",
  "Éducation",
  "Secteur public",
  "Autre",
];

export function StepLinkedIn({
  onProfileParsed,
  onSkip,
  onClarificationAnswer,
}: StepLinkedInProps) {
  const [mode, setMode] = useState<Mode>("quick");
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Quick mode form state
  const [quickRole, setQuickRole] = useState("");
  const [quickCompany, setQuickCompany] = useState("");
  const [quickSector, setQuickSector] = useState("");
  const [quickYears, setQuickYears] = useState("");
  const [quickLinkedin, setQuickLinkedin] = useState("");

  const submitQuick = () => {
    if (!quickRole.trim() || !quickCompany.trim() || !quickSector || !quickYears) {
      setError("Remplis au moins le poste, l'entreprise, le secteur et tes années d'expérience.");
      return;
    }
    setError(null);

    const yearsNum = parseInt(quickYears, 10);
    const minimalProfile: LinkedInProfile = {
      currentRole: quickRole.trim(),
      currentCompany: quickCompany.trim(),
      currentSector: quickSector,
      experienceYears: isNaN(yearsNum) ? null : yearsNum,
      educationLevel: null,
      certifications: [],
      topSkills: [],
      experiences: [],
      education: [],
      summary: null,
      hasDataExperience: false,
    };
    setProfile(minimalProfile);
    setStatus("done");
    onProfileParsed(minimalProfile);
  };

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés. Exportez votre profil LinkedIn en PDF.");
      setStatus("error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 5MB.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setError(null);

    try {
      setStatus("analyzing");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/onboarding/parse-linkedin", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de l'analyse");
      }

      const data: LinkedInProfile = await res.json();
      setProfile(data);
      setStatus("done");
      onProfileParsed(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
      setStatus("error");
    }
  }, [onProfileParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-surface-container-high/70 backdrop-blur-sm p-5 rounded-2xl light-streak">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#0077B5]/10 flex items-center justify-center">
            <Linkedin className="w-5 h-5 text-[#0077B5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Renseigne ton profil</h3>
            <p className="text-[10px] text-muted-foreground">Optionnel — accélère ton diagnostic</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Choisis la méthode qui te convient&nbsp;: saisie rapide en 30 secondes ou import PDF complet pour une analyse IA approfondie.
        </p>
      </div>

      {/* Mode toggle */}
      {status === "idle" || status === "error" ? (
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-lowest rounded-xl ghost-border">
          <button
            onClick={() => { setMode("quick"); setError(null); }}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all",
              mode === "quick"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            Saisie rapide (30s)
          </button>
          <button
            onClick={() => { setMode("pdf"); setError(null); }}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all",
              mode === "pdf"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Import PDF (analyse IA)
          </button>
        </div>
      ) : null}

      {/* Quick mode form */}
      {mode === "quick" && (status === "idle" || status === "error") ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 block">
                Poste actuel *
              </label>
              <input
                type="text"
                value={quickRole}
                onChange={(e) => setQuickRole(e.target.value)}
                placeholder="ex: Director Marketing"
                className="w-full bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 block">
                Entreprise actuelle *
              </label>
              <input
                type="text"
                value={quickCompany}
                onChange={(e) => setQuickCompany(e.target.value)}
                placeholder="ex: L'Oréal"
                className="w-full bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 block">
                Secteur *
              </label>
              <select
                value={quickSector}
                onChange={(e) => setQuickSector(e.target.value)}
                className="w-full bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">Sélectionne…</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 block">
                Années d&apos;expérience *
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={quickYears}
                onChange={(e) => setQuickYears(e.target.value)}
                placeholder="ex: 12"
                className="w-full bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 block">
              Profil LinkedIn (optionnel)
            </label>
            <input
              type="url"
              value={quickLinkedin}
              onChange={(e) => setQuickLinkedin(e.target.value)}
              placeholder="https://www.linkedin.com/in/ton-profil"
              className="w-full bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={submitQuick}
            className="w-full gradient-primary text-primary-foreground py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
          >
            <Check className="w-4 h-4" />
            Valider et continuer
          </button>

          <p className="text-[10px] text-muted-foreground/70 text-center">
            Tu pourras compléter ton profil à tout moment depuis tes paramètres.
          </p>
        </div>
      ) : null}

      {/* PDF mode — How to export */}
      {mode === "pdf" && (status === "idle" || status === "error") ? (
        <div className="bg-surface-container-lowest p-4 rounded-xl ghost-border">
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">
            Comment exporter ton profil LinkedIn en PDF
          </p>
          <ol className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
              <span>Va sur ton profil LinkedIn</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
              <span>Clique sur <strong className="text-foreground">Plus</strong> (bouton &quot;...&quot;) en haut de ton profil</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
              <span>Sélectionne <strong className="text-foreground">Enregistrer au format PDF</strong></span>
            </li>
          </ol>
        </div>
      ) : null}

      {/* Upload zone (PDF mode only, idle/error states) */}
      {mode === "pdf" && (status === "idle" || status === "error") ? (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
              dragOver
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border/30 hover:border-primary/50 hover:bg-surface-container-lowest"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={handleInputChange}
              className="hidden"
            />
            <Upload className={cn(
              "w-10 h-10 mx-auto mb-3 transition-colors",
              dragOver ? "text-primary" : "text-muted-foreground/40"
            )} />
            <p className="text-sm font-bold text-foreground mb-1">
              {dragOver ? "Déposez le fichier ici" : "Glissez votre PDF LinkedIn ici"}
            </p>
            <p className="text-xs text-muted-foreground">
              ou cliquez pour sélectionner un fichier (PDF, max 5MB)
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </>
      ) : null}

      {/* Loading state — analyse approfondie avec messages progressifs.
          On simule le travail du consultant senior : lecture, identification,
          diagnostic. Donne du poids perçu au temps d'attente (15-30s). */}
      {status === "uploading" || status === "analyzing" ? (
        <DeepAnalysisLoader status={status} />
      ) : null}

      {/* Success / done state */}
      {status === "done" && profile ? (
        <div className="space-y-4">
          {/* Success banner */}
          <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <Check className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-bold text-primary">Profil analysé avec succès</p>
              <p className="text-[10px] text-muted-foreground">
                Les informations ci-dessous ont été pré-remplies. Vous pourrez les modifier aux étapes suivantes.
              </p>
            </div>
          </div>

          {/* Extracted data preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.currentRole && (
              <PreviewCard label="Poste actuel" value={profile.currentRole} sub={profile.currentCompany || undefined} />
            )}
            {profile.currentSector && (
              <PreviewCard label="Secteur" value={profile.currentSector} />
            )}
            {profile.experienceYears && (
              <PreviewCard label="Expérience" value={`${profile.experienceYears} ans`} />
            )}
            {profile.educationLevel && (
              <PreviewCard label="Formation" value={profile.educationLevel} />
            )}
          </div>

          {/* Skills detected */}
          {profile.topSkills.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                Compétences détectées
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.topSkills.slice(0, 10).map((skill) => (
                  <span key={skill} className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experiences */}
          {profile.experiences.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                Parcours ({profile.experiences.length} postes)
              </p>
              <div className="space-y-2">
                {profile.experiences.slice(0, 3).map((exp, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-surface-container-lowest rounded-xl ghost-border">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-foreground">{exp.role}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {exp.company} · {exp.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DIAGNOSTIC NARRATIF — la "lecture senior" du parcours.
              C'est le bloc le plus important du step : il prouve à
              l'utilisateur·rice que NextMove a vraiment LU son CV
              (pas juste parsé). Si le diagnostic n'est pas dispo (vieux
              format ou erreur partielle), on retombe sur le summary brut. */}
          {profile.diagnostic ? (
            <DiagnosticBlock
              diagnostic={profile.diagnostic}
              onClarificationAnswer={onClarificationAnswer}
            />
          ) : profile.summary ? (
            <div className="p-4 bg-surface-container-high/70 rounded-xl light-streak">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                  Synthèse IA
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{profile.summary}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Skip button */}
      {status !== "done" && (
        <button
          onClick={onSkip}
          className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-3"
        >
          Passer cette étape — je remplirai manuellement
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function PreviewCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-3 bg-surface-container-lowest rounded-xl ghost-border">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/**
 * Loader "consultant en pleine lecture" — affiche 3 étapes successives
 * pour donner du poids perçu au temps d'attente de l'IA (15-30s) :
 *   1) Lecture du PDF
 *   2) Identification du parcours
 *   3) Diagnostic en cours
 * Bien plus engageant qu'un Loader2 muet, et cohérent avec la promesse
 * "vrai coach IA".
 */
function DeepAnalysisLoader({ status }: { status: "uploading" | "analyzing" }) {
  const [stage, setStage] = useState(0);

  const stages = [
    { icon: FileText, label: "Lecture de votre profil", delay: 0 },
    { icon: Compass, label: "Identification de votre parcours", delay: 4000 },
    { icon: Sparkles, label: "Rédaction du diagnostic", delay: 9000 },
  ];

  useEffect(() => {
    if (status === "uploading") {
      setStage(0);
      return;
    }
    // Cascade automatique pendant l'analyse — chaque étape s'éclaire
    // après son délai. La dernière reste active jusqu'à la fin.
    const timeouts = stages.slice(1).map((s, i) =>
      window.setTimeout(() => setStage(i + 1), s.delay)
    );
    return () => timeouts.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="border border-primary/30 rounded-2xl p-6 md:p-8 bg-gradient-to-br from-primary/5 to-surface-container-lowest/40">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
          Analyse approfondie en cours
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-6">
        Notre consultant IA lit votre profil. Cela prend généralement entre 15
        et 30 secondes — le temps d&apos;une vraie lecture senior.
      </p>

      <div className="space-y-3">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === stage;
          const isDone = i < stage;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                isActive && "bg-primary/10 border border-primary/30",
                isDone && "opacity-60",
                !isActive && !isDone && "opacity-40"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all",
                  isActive && "bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                  isDone && "bg-primary/20 text-primary",
                  !isActive && !isDone && "bg-surface-container-lowest text-muted-foreground"
                )}
              >
                {isDone ? (
                  <Check className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <p
                className={cn(
                  "text-sm font-bold",
                  isActive && "text-primary",
                  isDone && "text-foreground",
                  !isActive && !isDone && "text-muted-foreground"
                )}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Bloc "Lecture senior" — affiche le diagnostic narratif du parcours :
 *   - Synthèse + spécialité déduite (le "qui vous êtes")
 *   - Patterns invisibles (les "clins d'œil" non-évidents)
 *   - Angle de transition (ce qui distingue d'un wrapper ChatGPT)
 *   - Questions de clarification (montre qu'on creuse, pas qu'on diagnostique sans nuance)
 * Le tout en vouvoiement, ton consultant senior, pas vendeur.
 */
function DiagnosticBlock({
  diagnostic,
  onClarificationAnswer,
}: {
  diagnostic: LinkedInDiagnostic;
  onClarificationAnswer?: (question: string, answer: string) => void;
}) {
  // Réponses locales aux questions de clarification.
  // On stocke côté composant pour debouncer la propagation vers le parent.
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const handleAnswerBlur = (question: string) => {
    // Propage la réponse au parent seulement quand l'utilisateur·rice
    // a fini d'écrire (onBlur) — évite de spammer le state global.
    const answer = answers[question];
    if (answer !== undefined && onClarificationAnswer) {
      onClarificationAnswer(question, answer.trim());
    }
  };

  const handleSkip = (question: string) => {
    setAnswers((prev) => ({ ...prev, [question]: "__skip__" }));
    if (onClarificationAnswer) {
      onClarificationAnswer(question, "__skip__");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
          Lecture senior de votre parcours
        </span>
      </div>

      {/* Synthèse principale + spécialité déduite */}
      <div className="p-5 bg-gradient-to-br from-primary/10 to-surface-container-lowest/40 border border-primary/20 rounded-2xl space-y-3">
        <p className="text-sm leading-relaxed text-foreground/90">
          {diagnostic.synthesis}
        </p>
        {diagnostic.deduced_specialty && (
          <p className="text-xs text-primary font-bold italic">
            {diagnostic.deduced_specialty}
          </p>
        )}
      </div>

      {/* Patterns invisibles — pastilles */}
      {diagnostic.hidden_patterns?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1.5">
            <Target className="w-3 h-3" />
            Ce que votre CV révèle (et que vous n&apos;avez pas écrit)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {diagnostic.hidden_patterns.map((p, i) => (
              <span
                key={i}
                className="px-2.5 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium rounded-lg"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Compétences déduites (différent du auto-déclaratif) */}
      {diagnostic.real_skills_deduced?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
            Vos compétences réelles (déduites de vos missions)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {diagnostic.real_skills_deduced.map((s, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-surface-container-lowest border border-border/30 text-foreground/80 text-[10px] font-medium rounded-md"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Angle de transition — l'observation stratégique clé */}
      {diagnostic.transition_angle && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-bold mb-2 flex items-center gap-1.5">
            <Compass className="w-3 h-3" />
            Votre angle d&apos;attaque naturel
          </p>
          <p className="text-xs leading-relaxed text-foreground/90">
            {diagnostic.transition_angle}
          </p>
        </div>
      )}

      {/* Questions ouvertes — INTERACTIVES.
          La candidate peut répondre directement ou marquer "pas pertinent".
          Les réponses sont propagées au parent pour enrichir les prompts
          des étapes suivantes (Ambitions, Skills, Summary). */}
      {diagnostic.questions_to_clarify?.length > 0 && (
        <div className="p-4 md:p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-400/80 font-bold mb-1">
                Aidez-nous à creuser
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vos réponses ne sont pas obligatoires — elles affineront le
                bilan final.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {diagnostic.questions_to_clarify.map((q, i) => {
              const value = answers[q] ?? "";
              const isSkipped = value === "__skip__";
              return (
                <div
                  key={i}
                  className={cn(
                    "space-y-2 transition-opacity",
                    isSkipped && "opacity-40"
                  )}
                >
                  <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                    {q}
                  </p>
                  {!isSkipped && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <textarea
                        value={value === "__skip__" ? "" : value}
                        onChange={(e) => handleAnswerChange(q, e.target.value)}
                        onBlur={() => handleAnswerBlur(q)}
                        placeholder="Votre réponse (1-2 phrases suffisent)…"
                        rows={2}
                        className="flex-1 bg-surface-container-lowest border border-amber-500/15 rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-500/40 transition-colors resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSkip(q)}
                        className="text-[10px] text-muted-foreground/70 hover:text-amber-400/80 transition-colors px-3 py-1 self-start"
                      >
                        Pas pertinent
                      </button>
                    </div>
                  )}
                  {isSkipped && (
                    <p className="text-[10px] text-muted-foreground/60 italic">
                      Marqué comme non pertinent.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
