import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, Check, Calendar, Crown, Users, MessageSquare } from "lucide-react";
import { getFoundingMembersSeatStatus } from "@/lib/founding-members/actions";
import { FoundingMemberForm } from "./_components/founding-member-form";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Founding Members — 30 places à 9€/mois à vie",
  description:
    "Sois parmi les 30 premiers cadres à façonner NextMove. Tarif préférentiel à vie en échange de ton feedback.",
  alternates: {
    canonical: "/founding-members",
  },
};

export const dynamic = "force-dynamic";

export default async function FoundingMembersPage() {
  const seats = await getFoundingMembersSeatStatus();
  const isFull = seats.remaining <= 0;

  return (
    <div>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-surface/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">N</span>
          </div>
          <span className="font-headline font-black text-xl text-primary tracking-tight text-glow">
            NextMove AI
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="hidden md:block text-sm text-muted-foreground hover:text-primary transition-colors font-headline font-bold"
          >
            Accueil
          </Link>
          <Link
            href="/about"
            className="hidden md:block text-sm text-muted-foreground hover:text-primary transition-colors font-headline font-bold"
          >
            À propos
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">Programme exclusif — Phase de lancement</span>
        </div>
        <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
          Founding Members
          <br />
          <span className="text-primary text-glow">9€/mois à vie</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Sois parmi les 30 premiers cadres à façonner NextMove. Accès complet, tarif à vie, et contact direct avec le fondateur — en échange de ton feedback.
        </p>

        {/* Seat counter */}
        <div className="mt-10 inline-flex items-center gap-3 bg-surface-container-low border border-primary/20 px-5 py-3 rounded-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-headline font-bold text-foreground">
            {isFull ? (
              <>Programme complet — places épuisées</>
            ) : (
              <>
                <span className="text-primary text-2xl">{seats.remaining}</span>
                <span className="text-muted-foreground text-sm font-normal">
                  {" "}
                  places restantes sur {seats.total}
                </span>
              </>
            )}
          </span>
        </div>
      </section>

      {/* Détails programme */}
      <section className="pb-16 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Qui est éligible */}
          <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-lg font-bold text-foreground mb-3">
              Qui est éligible
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Cadre 35-50 ans</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Envie de pivoter ou d&apos;upgrader vers la data/IA</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Engagement à donner du feedback hebdo</span>
              </li>
            </ul>
          </div>

          {/* Ce qu'on attend */}
          <div className="bg-surface-container-low p-6 rounded-2xl ghost-border">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-lg font-bold text-foreground mb-3">
              Ce qu&apos;on attend de toi
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>1 retour structuré par semaine pendant 3 mois</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>1 call de 30 min/mois avec le fondateur</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Honnêteté : ce qui marche, ce qui cloche</span>
              </li>
            </ul>
          </div>

          {/* Ce qu'on offre */}
          <div className="relative bg-gradient-to-br from-surface-container-low to-primary/5 p-6 rounded-2xl border-2 border-primary/30">
            <div className="absolute -top-3 left-5">
              <span className="gradient-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                Tes avantages
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary mb-4">
              <Crown className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-lg font-bold text-foreground mb-3">
              Ce que tu reçois
            </h3>
            <ul className="space-y-2 text-sm text-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span><strong>9€/mois à vie</strong> (au lieu de 19€ ou 49€)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Accès complet illimité (équivalent Pro)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Statut <strong>Founding Member</strong> dans le produit</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Influence directe sur la roadmap</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Process */}
        <div className="mt-12 bg-surface-container-lowest border border-border/30 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-3 mb-5">
            <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-headline text-base font-bold text-foreground mb-1">
                Comment ça se passe
              </h3>
              <p className="text-sm text-muted-foreground">
                Sélection sous 48h, onboarding personnalisé en visio.
              </p>
            </div>
          </div>
          <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-1">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>Tu candidates via le formulaire ci-dessous (5 min)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>Je relis chaque candidature personnellement, réponse sous 48h</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>Si retenu : email avec lien d&apos;activation au tarif Founding Member (9€/mois)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                4
              </span>
              <span>Onboarding 1:1 en visio (30 min) pour démarrer dans les meilleures conditions</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Formulaire */}
      <section className="pb-24 px-6 md:px-12 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Postuler à la bêta privée
          </h2>
          <p className="text-muted-foreground">
            Toutes les candidatures sont relues personnellement. Réponse sous 48h.
          </p>
        </div>

        {isFull ? (
          <div className="bg-surface-container-low p-8 rounded-2xl ghost-border text-center">
            <p className="font-headline text-lg font-bold text-foreground mb-2">
              Toutes les places ont été attribuées 🙏
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Tu peux quand même découvrir NextMove avec un diagnostic gratuit, ou rejoindre la liste d&apos;attente en nous écrivant.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
              >
                Faire mon diagnostic gratuit
              </Link>
              <a
                href="mailto:contact@nextmove.sh"
                className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest ghost-border px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
              >
                Liste d&apos;attente
              </a>
            </div>
          </div>
        ) : (
          <FoundingMemberForm />
        )}
      </section>

      <Footer />
    </div>
  );
}
