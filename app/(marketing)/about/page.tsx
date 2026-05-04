"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Linkedin, Target, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div>
      {/* Floating Nav */}
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
            href="/signup"
            className="gradient-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
          >
            Commencer
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">Le fondateur</span>
        </div>
        <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4 leading-[1.1]">
          Pourquoi j&apos;ai créé
          <br />
          <span className="text-primary text-glow">NextMove</span>
        </h1>
      </section>

      {/* Bio */}
      <section className="pb-16 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 items-start">
          {/* Photo */}
          <div className="relative mx-auto md:mx-0 md:sticky md:top-24">
            <div className="absolute inset-0 gradient-primary opacity-20 blur-2xl rounded-full" />
            <div className="relative w-56 h-56 md:w-60 md:h-60 rounded-2xl overflow-hidden ghost-border">
              <Image
                src="/founder.png"
                alt="Yassine Errochdi, fondateur de NextMove AI"
                width={512}
                height={512}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="mt-4 text-center md:text-left">
              <p className="font-headline text-lg font-bold text-foreground">Yassine Errochdi</p>
              <p className="text-sm text-muted-foreground">Fondateur · Expert data &amp; IA</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 text-muted-foreground leading-relaxed text-base md:text-lg">
            <p>
              Pendant plus de 10 ans, j&apos;ai accompagné des grands groupes français sur leurs transformations data &amp; IA — <span className="text-foreground font-semibold">Crédit Agricole Assurances, Total, EDF, Sopra, Catalina</span> — en construisant des solutions concrètes et en formant leurs équipes.
            </p>

            <p>
              Sur le terrain, j&apos;ai vu une réalité partout la même : trop de cadres talentueux pensent qu&apos;ils sont condamnés à l&apos;obsolescence face à l&apos;IA. <span className="text-foreground font-bold">C&apos;est faux.</span>
            </p>

            <p>
              Les cadres qui intègrent la data et l&apos;IA à leur expertise existante deviennent les profils les plus recherchés du marché. Pas les juniors qui repartent de zéro — ceux qui capitalisent sur leurs années d&apos;expérience pour devenir <span className="text-foreground font-semibold">irremplaçables</span>.
            </p>

            <p>
              Le problème, c&apos;est qu&apos;ils n&apos;ont ni le plan, ni les bons outils, ni un accès clair aux opportunités qui leur correspondent. Les bootcamps à 8 000€ leur disent de tout plaquer. Les coachs carrière généralistes ne maîtrisent pas la tech. Les formations en ligne sont génériques et déconnectées du marché.
            </p>

            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-2xl my-8">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <p className="text-foreground font-bold mb-2">Ma mission</p>
                  <p className="text-muted-foreground">
                    Accompagner 1 000 cadres français à intégrer la data et l&apos;IA à leur carrière en 3 ans, sans qu&apos;ils aient besoin de tout recommencer.
                  </p>
                </div>
              </div>
            </div>

            <p>
              NextMove est ma réponse à ce constat. Une plateforme qui combine diagnostic IA personnalisé, parcours sur-mesure phase par phase, et opportunités matchées à ton profil. Pas une formation. Pas un coaching. Un accompagnement intelligent qui s&apos;adapte à <span className="text-foreground font-semibold">ton</span> expertise et <span className="text-foreground font-semibold">ton</span> rythme.
            </p>

            <p>
              Si tu te reconnais dans cette vision, parlons-en.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a
                href="https://www.linkedin.com/in/yassineerrochdi/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest ghost-border px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                Connectons-nous sur LinkedIn
              </a>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
              >
                Faire mon diagnostic gratuit
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 max-w-6xl mx-auto border-t border-border/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">N</span>
            </div>
            <span className="font-headline font-bold text-sm text-muted-foreground">NextMove AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 NextMove AI. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
