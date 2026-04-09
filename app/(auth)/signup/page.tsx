"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, Mail, CheckCircle } from "lucide-react";
import { signUp, signInWithGoogle } from "@/lib/auth/actions";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.confirmEmail) {
      setConfirmEmail(true);
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

  if (confirmEmail) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
          <Mail className="w-8 h-8" />
        </div>
        <h1 className="font-headline text-2xl font-extrabold text-foreground mb-3">
          Vérifiez votre email
        </h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Un lien de confirmation a été envoyé à votre adresse email. Cliquez dessus pour activer votre compte.
        </p>
        <div className="bg-surface-container-lowest p-4 rounded-xl ghost-border inline-flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">Après confirmation, vous serez redirigé vers l&apos;onboarding</span>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-primary font-bold hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">Commencez gratuitement</span>
        </div>
        <h1 className="font-headline text-3xl font-extrabold text-foreground mb-2">
          Créer votre compte
        </h1>
        <p className="text-sm text-muted-foreground">
          Lancez votre diagnostic IA en 5 minutes
        </p>
      </div>

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
          S&apos;inscrire avec Google
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
              Prénom
            </label>
            <input
              type="text"
              name="firstName"
              required
              placeholder="Prénom"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
              Nom
            </label>
            <input
              type="text"
              name="lastName"
              required
              placeholder="Nom"
              className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
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
            placeholder="Au moins 6 caractères"
            className="w-full bg-surface-container-lowest rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            placeholder="••••••••"
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
              Lancer mon diagnostic
              <Sparkles className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
