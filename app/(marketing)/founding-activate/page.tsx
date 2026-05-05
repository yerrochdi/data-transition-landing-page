import Link from "next/link";
import type { Metadata } from "next";
import { Crown, AlertCircle, CheckCircle2 } from "lucide-react";
import { lookupFoundingActivation } from "@/lib/founding-members/actions";
import { createClient } from "@/lib/supabase/server";
import { ActivationActions } from "./_components/activation-actions";
import { Footer as SiteFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Activer mon accès Founding Member",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FoundingActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorView message="Lien d'activation manquant. Vérifie le lien dans ton email." />;
  }

  const lookup = await lookupFoundingActivation(token);
  if (!lookup.ok) {
    return <ErrorView message={lookup.error} />;
  }

  if (lookup.alreadyActivated) {
    return (
      <SuccessView
        title="Accès déjà activé"
        message="Ton accès Founding Member est déjà actif. Connecte-toi pour accéder à ton parcours."
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const expectedEmail = lookup.application.email.toLowerCase();
  const loggedEmail = authUser?.email?.toLowerCase() ?? null;
  const isMatched = loggedEmail === expectedEmail;
  const firstName = lookup.application.name.split(" ")[0] ?? lookup.application.name;

  return (
    <div>
      <PageNav />
      <section className="pt-32 pb-12 px-6 md:px-12 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-6">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">Founding Member · 9€/mois à vie</span>
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-[1.1]">
          Bienvenue {firstName} 👋
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Tu fais partie des premiers Founding Members de NextMove. Active ton accès en finalisant ton paiement.
        </p>
      </section>

      <section className="pb-24 px-6 md:px-12 max-w-2xl mx-auto">
        <div className="bg-surface-container-low p-7 md:p-9 rounded-2xl ghost-border">
          <div className="space-y-3 mb-6 pb-6 border-b border-border/20">
            <DetailRow label="Tarif" value="9€ / mois" highlight />
            <DetailRow label="Engagement" value="Aucun — résiliable à tout moment" />
            <DetailRow label="Accès" value="Identique au plan Pro complet" />
            <DetailRow label="En contrepartie" value="1 retour hebdo + 1 call/mois" />
          </div>

          <ActivationActions
            token={token}
            expectedEmail={expectedEmail}
            loggedEmail={loggedEmail}
            isMatched={isMatched}
            firstName={firstName}
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={
          highlight
            ? "font-headline text-lg font-extrabold text-primary"
            : "text-sm font-bold text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div>
      <PageNav />
      <section className="pt-32 pb-24 px-6 md:px-12 max-w-2xl mx-auto">
        <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h1 className="font-headline text-xl font-bold text-foreground mb-2">
            Lien invalide
          </h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Link
            href="/founding-members"
            className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest ghost-border px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
          >
            Voir le programme
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function SuccessView({ title, message }: { title: string; message: string }) {
  return (
    <div>
      <PageNav />
      <section className="pt-32 pb-24 px-6 md:px-12 max-w-2xl mx-auto">
        <div className="bg-primary/5 border border-primary/30 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="font-headline text-xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
          >
            Se connecter
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function PageNav() {
  return (
    <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-surface/80 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">N</span>
        </div>
        <span className="font-headline font-black text-xl text-primary tracking-tight text-glow">
          NextMove AI
        </span>
      </Link>
    </nav>
  );
}

