"use client";

import { useState, useCallback, useRef } from "react";
import { Linkedin, Upload, Loader2, Check, AlertCircle, ArrowRight, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

interface StepLinkedInProps {
  onProfileParsed: (profile: LinkedInProfile) => void;
  onSkip: () => void;
}

export function StepLinkedIn({ onProfileParsed, onSkip }: StepLinkedInProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "analyzing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
            <h3 className="text-sm font-bold text-foreground">Importez votre profil LinkedIn</h3>
            <p className="text-[10px] text-muted-foreground">Optionnel — accélère votre diagnostic</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          L&apos;IA analysera votre parcours pour <strong className="text-foreground">pré-remplir automatiquement</strong> votre profil :
          postes, compétences, formations, secteur. Vous pourrez tout vérifier et corriger ensuite.
        </p>
      </div>

      {/* How to export */}
      <div className="bg-surface-container-lowest p-4 rounded-xl ghost-border">
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">
          Comment exporter votre profil LinkedIn en PDF
        </p>
        <ol className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
            <span>Allez sur votre profil LinkedIn</span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
            <span>Cliquez sur <strong className="text-foreground">Plus</strong> (bouton &quot;...&quot;) en haut de votre profil</span>
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
            <span>Sélectionnez <strong className="text-foreground">Enregistrer au format PDF</strong></span>
          </li>
        </ol>
      </div>

      {/* Upload zone */}
      {status === "idle" || status === "error" ? (
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
      ) : status === "uploading" || status === "analyzing" ? (
        <div className="border-2 border-primary/30 rounded-2xl p-10 text-center bg-primary/5">
          <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-sm font-bold text-primary mb-1">
            {status === "uploading" ? "Upload en cours..." : "Analyse IA de votre profil..."}
          </p>
          <p className="text-xs text-muted-foreground">
            L&apos;IA extrait vos postes, compétences et formations
          </p>
        </div>
      ) : status === "done" && profile ? (
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

          {/* AI summary of profile */}
          {profile.summary && (
            <div className="p-4 bg-surface-container-high/70 rounded-xl light-streak">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                  Synthèse IA
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{profile.summary}</p>
            </div>
          )}
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
