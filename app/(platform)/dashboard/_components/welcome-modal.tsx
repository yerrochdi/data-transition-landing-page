"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Target, BookOpen, MessageSquare, X } from "lucide-react";

interface WelcomeModalProps {
  userName: string;
  targetRole: string | null;
  careerScore: number;
  readinessScore: number;
}

const STORAGE_KEY = "nextmove_welcome_dismissed";

export function WelcomeModal({ userName, targetRole, careerScore, readinessScore }: WelcomeModalProps) {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  };

  const goTo = (path: string) => {
    dismiss();
    router.push(path);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-container-high rounded-3xl border border-border/10 shadow-2xl overflow-hidden animate-fade-up">
        {/* Close */}
        <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
          <X className="w-5 h-5" />
        </button>

        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h2 className="font-headline text-2xl font-extrabold text-foreground text-center mb-2">
            Bravo {userName} !
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Votre diagnostic est termine. NextMove a prepare votre parcours personnalise.
          </p>

          {/* Score summary */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <p className="text-3xl font-headline font-black text-primary">{careerScore}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Career Score</p>
            </div>
            <div className="w-px h-10 bg-border/20" />
            <div className="text-center">
              <p className="text-3xl font-headline font-black text-foreground">{readinessScore}%</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Readiness</p>
            </div>
          </div>

          {/* What we prepared */}
          <div className="space-y-3 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
              Ce qui vous attend
            </p>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest">
              <Target className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Parcours vers {targetRole || "votre objectif"}</p>
                <p className="text-[10px] text-muted-foreground">5 phases avec des taches concretes et actionnables</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest">
              <MessageSquare className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Copilot IA personnel</p>
                <p className="text-[10px] text-muted-foreground">Un coach IA qui connait votre profil et vous guide</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest">
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Ressources personnalisees</p>
                <p className="text-[10px] text-muted-foreground">Formations, articles et outils adaptes a vos gaps</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => goTo("/journey")}
              className="w-full gradient-primary text-primary-foreground py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              Commencer mon parcours
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={dismiss}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Explorer le dashboard d&apos;abord
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
