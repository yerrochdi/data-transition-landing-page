"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { createFoundingCheckout } from "@/lib/founding-members/actions";

export function ActivationActions({
  token,
  expectedEmail,
  loggedEmail,
  isMatched,
  firstName,
}: {
  token: string;
  expectedEmail: string;
  loggedEmail: string | null;
  isMatched: boolean;
  firstName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const goToCheckout = () => {
    setError(null);
    startTransition(async () => {
      const result = await createFoundingCheckout(token);
      if (result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error ?? "Erreur inattendue");
      }
    });
  };

  // Case 1 — user is logged in with the matching email → ready to checkout
  if (isMatched) {
    return (
      <div>
        <p className="text-sm text-muted-foreground mb-5">
          Tu es connecté avec <strong className="text-foreground">{loggedEmail}</strong>. Clique ci-dessous pour activer ton accès.
        </p>
        {error && (
          <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/30 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        <button
          onClick={goToCheckout}
          disabled={isPending}
          className="w-full gradient-primary text-primary-foreground px-7 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirection vers Stripe…
            </>
          ) : (
            <>
              Activer mon accès — 9€/mois
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  }

  // Case 2 — user is logged in but with the wrong email
  if (loggedEmail) {
    return (
      <div>
        <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/30 rounded-xl p-4 mb-5">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-300 font-bold mb-1">Email connecté différent</p>
            <p className="text-muted-foreground">
              Tu es connecté avec <strong>{loggedEmail}</strong>, mais ta candidature a été soumise avec <strong>{expectedEmail}</strong>.
            </p>
            <p className="text-muted-foreground mt-2">
              Déconnecte-toi et reconnecte-toi avec l&apos;email de ta candidature.
            </p>
          </div>
        </div>
        <Link
          href={`/login?next=${encodeURIComponent(`/founding-activate?token=${token}`)}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-surface-container-lowest ghost-border px-5 py-3 rounded-xl text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Changer de compte
        </Link>
      </div>
    );
  }

  // Case 3 — user is not logged in → must sign up or sign in with the matching email
  // Si la candidate clique "Créer mon compte" mais qu'un compte Supabase existe
  // déjà avec cet email (cas typique : tentative d'inscription antérieure
  // restée en suspens), le signup détecte le conflit et redirige
  // automatiquement vers /login avec un bandeau explicatif (cf signUp() dans
  // lib/auth/actions.ts qui renvoie { accountExists: true }).
  const nextUrl = `/founding-activate?token=${token}`;
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-5">
        Pour activer ton accès, connecte-toi ou crée ton compte avec l&apos;email <strong className="text-foreground">{expectedEmail}</strong>.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href={`/signup?next=${encodeURIComponent(nextUrl)}&email=${encodeURIComponent(expectedEmail)}&firstName=${encodeURIComponent(firstName)}`}
          className="inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform"
        >
          <UserPlus className="w-4 h-4" />
          Créer mon compte
        </Link>
        <Link
          href={`/login?next=${encodeURIComponent(nextUrl)}&email=${encodeURIComponent(expectedEmail)}`}
          className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest ghost-border px-5 py-3 rounded-xl text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
        >
          <LogIn className="w-4 h-4" />
          J&apos;ai déjà un compte
        </Link>
      </div>
    </div>
  );
}
