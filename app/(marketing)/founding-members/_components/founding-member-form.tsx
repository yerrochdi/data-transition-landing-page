"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { submitFoundingMemberApplication } from "@/lib/founding-members/actions";

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

const fieldClasses =
  "w-full bg-surface-container-lowest border border-border/30 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors";

export function FoundingMemberForm() {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    setState({ status: "submitting" });
    startTransition(async () => {
      const result = await submitFoundingMemberApplication(formData);
      if (result.ok) {
        setState({ status: "success" });
      } else {
        setState({
          status: "error",
          message: result.error,
          fieldErrors: "fieldErrors" in result ? result.fieldErrors : undefined,
        });
      }
    });
  };

  if (state.status === "success") {
    return (
      <div className="bg-primary/5 border border-primary/30 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="font-headline text-xl font-bold text-foreground mb-2">
          Candidature envoyée ✨
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Merci. Tu vas recevoir un email de confirmation dans quelques instants. Je relis chaque candidature personnellement et te réponds sous 48h.
        </p>
      </div>
    );
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-foreground mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={120}
            placeholder="Yassine Errochdi"
            className={fieldClasses}
            aria-invalid={!!fieldErrors?.name}
          />
          {fieldErrors?.name && (
            <p className="text-xs text-red-400 mt-1.5">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            maxLength={180}
            placeholder="ton@email.com"
            className={fieldClasses}
            aria-invalid={!!fieldErrors?.email}
          />
          {fieldErrors?.email && (
            <p className="text-xs text-red-400 mt-1.5">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="linkedinUrl" className="block text-sm font-bold text-foreground mb-2">
          Profil LinkedIn (URL) *
        </label>
        <input
          type="url"
          id="linkedinUrl"
          name="linkedinUrl"
          required
          maxLength={300}
          placeholder="https://www.linkedin.com/in/..."
          className={fieldClasses}
          aria-invalid={!!fieldErrors?.linkedinUrl}
        />
        {fieldErrors?.linkedinUrl && (
          <p className="text-xs text-red-400 mt-1.5">{fieldErrors.linkedinUrl}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="currentRole" className="block text-sm font-bold text-foreground mb-2">
            Poste actuel *
          </label>
          <input
            type="text"
            id="currentRole"
            name="currentRole"
            required
            maxLength={160}
            placeholder="Director Marketing, CFO, Product Manager..."
            className={fieldClasses}
            aria-invalid={!!fieldErrors?.currentRole}
          />
          {fieldErrors?.currentRole && (
            <p className="text-xs text-red-400 mt-1.5">{fieldErrors.currentRole}</p>
          )}
        </div>

        <div>
          <label htmlFor="currentCompany" className="block text-sm font-bold text-foreground mb-2">
            Entreprise actuelle *
          </label>
          <input
            type="text"
            id="currentCompany"
            name="currentCompany"
            required
            maxLength={160}
            placeholder="Nom de ton entreprise"
            className={fieldClasses}
            aria-invalid={!!fieldErrors?.currentCompany}
          />
          {fieldErrors?.currentCompany && (
            <p className="text-xs text-red-400 mt-1.5">{fieldErrors.currentCompany}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="situation" className="block text-sm font-bold text-foreground mb-2">
          Ta situation actuelle *
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Où tu en es professionnellement, tes contraintes, ce qui te bloque ou t&apos;intéresse dans la data/IA. 3-5 lignes.
        </p>
        <textarea
          id="situation"
          name="situation"
          required
          minLength={20}
          maxLength={2000}
          rows={4}
          className={fieldClasses}
          aria-invalid={!!fieldErrors?.situation}
        />
        {fieldErrors?.situation && (
          <p className="text-xs text-red-400 mt-1.5">{fieldErrors.situation}</p>
        )}
      </div>

      <div>
        <label htmlFor="motivation" className="block text-sm font-bold text-foreground mb-2">
          Pourquoi tu veux rejoindre la bêta *
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          Qu&apos;est-ce qui te motive concrètement, ce que tu attends de NextMove. 3-5 lignes.
        </p>
        <textarea
          id="motivation"
          name="motivation"
          required
          minLength={20}
          maxLength={2000}
          rows={4}
          className={fieldClasses}
          aria-invalid={!!fieldErrors?.motivation}
        />
        {fieldErrors?.motivation && (
          <p className="text-xs text-red-400 mt-1.5">{fieldErrors.motivation}</p>
        )}
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/30 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{state.message}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <p className="text-xs text-muted-foreground max-w-sm">
          En soumettant, j&apos;accepte d&apos;être contacté par email à propos de ma candidature et du programme.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="gradient-primary text-primary-foreground px-7 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Envoi…
            </>
          ) : (
            <>Envoyer ma candidature</>
          )}
        </button>
      </div>
    </form>
  );
}
