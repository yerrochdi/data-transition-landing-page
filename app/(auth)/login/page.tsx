"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Crown } from "lucide-react";
import { signIn, signInWithGoogle } from "@/lib/auth/actions";

function LoginForm() {
  const searchParams = useSearchParams();
  // Query params for pre-fill / Founding activation flow
  const prefilledEmail = searchParams.get("email") ?? "";
  const nextParam = searchParams.get("next") ?? "";
  const info = searchParams.get("info");
  const isExistingAccountFlow = info === "existing";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-headline text-3xl font-extrabold text-foreground mb-2">
          Bon retour
        </h1>
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour reprendre votre parcours
        </p>
      </div>

      {/* Bandeau "Compte déjà existant" — affiché quand l'utilisateur arrive
          ici depuis une tentative de signup avec un email déjà inscrit. */}
      {isExistingAccountFlow && (
        <div className="mb-6 flex items-start gap-3 bg-amber-500/5 border border-amber-500/30 rounded-xl p-4">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-300 shrink-0">
            <Crown className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-amber-200 mb-1">
              Vous avez déjà un compte
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Un compte existe déjà avec{" "}
              <strong className="text-foreground">{prefilledEmail}</strong>.
              Connectez-vous ci-dessous pour finaliser votre activation.
            </p>
          </div>
        </div>
      )}

      {/* Google OAuth */}
      <form action={handleGoogle}>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest p-4 rounded-xl ghost-border text-sm font-bold text-foreground hover:bg-surface-container transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuer avec Google
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border/20" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="flex-1 h-px bg-border/20" />
      </div>

      {/* Email form */}
      <form action={handleSubmit} className="space-y-4">
        {nextParam && <input type="hidden" name="next" value={nextParam} />}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue={prefilledEmail}
            placeholder="vous@example.com"
            className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            autoFocus={!!prefilledEmail}
            className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-xs font-bold p-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full gradient-primary text-primary-foreground p-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {isExistingAccountFlow ? "Finaliser mon activation" : "Se connecter"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Pas encore de compte ?{" "}
        <Link
          href={
            nextParam
              ? `/signup?next=${encodeURIComponent(nextParam)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
              : "/signup"
          }
          className="text-primary font-bold hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
