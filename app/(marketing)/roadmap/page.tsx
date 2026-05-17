import Link from "next/link";
import type { Metadata } from "next";
import {
  Sparkles,
  ArrowRight,
  Check,
  Clock,
  Lock,
  Compass,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Roadmap — Le Career OS qui reste collé à ta carrière",
  description:
    "NextMove n'est pas une formation. C'est un Career OS à 3 phases qui t'accompagne pendant ta transition, ton installation et toute la croissance de ta carrière data-augmentée.",
  alternates: { canonical: "/roadmap" },
};

const PHASES = [
  {
    id: "phase-1",
    label: "Phase 1",
    title: "Transition",
    period: "Mois 1 à 6",
    status: "available" as const,
    icon: Compass,
    intro:
      "Tu pivotes vers un profil data-augmenté. Diagnostic, parcours sur-mesure, livrables concrets et opportunités matchées.",
    features: [
      { label: "Diagnostic IA personnalisé", done: true },
      { label: "Parcours sectoriel adapté (Finance ou Tech)", done: true },
      { label: "Livrables concrets — portfolio de preuves de compétence", done: true },
      { label: "Job matching réel — France Travail + scraping légal", done: true },
      { label: "Network leverage LinkedIn — IA matche tes contacts pertinents", done: true },
      { label: "Préparation entretiens automatique sur les offres matchées", done: true },
    ],
  },
  {
    id: "phase-2",
    label: "Phase 2",
    title: "Installation",
    period: "Mois 6 à 12",
    status: "soon" as const,
    icon: Rocket,
    intro:
      "Tu as décroché. Maintenant, tu réussis tes 100 premiers jours. 30% des recrutements cadres ratent — pas le tien.",
    features: [
      { label: "Plan d'attaque personnalisé pour tes 30 premiers jours", done: false },
      { label: "Tracker de quick wins à présenter à ton manager", done: false },
      { label: "Préparation 1:1 manager — points + questions à poser", done: false },
      { label: "Détection de signaux faibles (politique interne, friction)", done: false },
      { label: "Bibliothèque de cas d'usage data/IA prêts pour ton poste", done: false },
    ],
  },
  {
    id: "phase-3",
    label: "Phase 3",
    title: "Croissance",
    period: "Mois 12 et au-delà",
    status: "soon" as const,
    icon: TrendingUp,
    intro:
      "Tu es installé. NextMove devient ton compagnon de carrière permanent. Career radar, network compounding, salary intelligence en continu.",
    features: [
      { label: "Career radar — alertes sur les skills émergentes de ton secteur", done: false },
      { label: "Network compounding — actions hebdo pour entretenir ton réseau", done: false },
      { label: "Salary intelligence — surveillance continue de ta valeur marché", done: false },
      { label: "Next move radar — détection 6 mois avant que tu te lasses", done: false },
      { label: "Coaching stratégique sur les choix de carrière (interne / externe / freelance)", done: false },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div>
      <PageNav />

      {/* Header */}
      <section className="pt-32 pb-12 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">Roadmap produit</span>
        </div>
        <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.05]">
          Pas une formation.
          <br />
          <span className="text-primary text-glow">Un Career OS.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          NextMove ne s&apos;arrête pas quand tu décroches ton poste. La couche IA reste collée à ta carrière, à travers 3 phases pensées pour la durée.
        </p>
      </section>

      {/* Timeline */}
      <section className="pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="space-y-6">
          {PHASES.map((phase, index) => (
            <PhaseCard key={phase.id} phase={phase} index={index} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-6 md:px-12 max-w-3xl mx-auto text-center">
        <div className="bg-surface-container-high p-10 md:p-12 rounded-3xl light-streak surface-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-foreground mb-3 relative z-10">
            Démarre par la Phase 1
          </h2>
          <p className="text-muted-foreground mb-7 max-w-md mx-auto relative z-10">
            Diagnostic gratuit en 5 minutes. Pas de CB requise. Tu vois immédiatement où tu en es et où tu peux aller.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <Link
              href="/signup"
              className="gradient-primary text-primary-foreground px-7 py-3.5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_10px_40px_rgba(75,226,119,0.3)]"
            >
              Faire mon diagnostic gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/founding-members"
              className="bg-surface-container-lowest ghost-border px-7 py-3.5 rounded-xl text-sm font-bold text-foreground inline-flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
            >
              Programme Founding Members
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PhaseCard({
  phase,
  index,
}: {
  phase: (typeof PHASES)[number];
  index: number;
}) {
  const Icon = phase.icon;
  const isAvailable = phase.status === "available";

  return (
    <div className="relative">
      {/* Connector line to next phase */}
      {index < PHASES.length - 1 && (
        <div className="absolute left-[27px] top-16 bottom-0 w-px bg-gradient-to-b from-primary/30 via-border/30 to-transparent" />
      )}

      <div
        className={`relative flex gap-5 p-6 md:p-8 rounded-2xl transition-all ${
          isAvailable
            ? "bg-gradient-to-br from-surface-container-low to-primary/5 border-2 border-primary/30"
            : "bg-surface-container-low ghost-border"
        }`}
      >
        {/* Icon column */}
        <div className="shrink-0">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isAvailable
                ? "bg-primary/15 text-primary shadow-[0_0_30px_rgba(75,226,119,0.2)]"
                : "bg-surface-container-lowest text-muted-foreground/60"
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
            <span
              className={`text-[10px] font-headline font-bold uppercase tracking-[0.2em] ${
                isAvailable ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {phase.label} · {phase.period}
            </span>
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 bg-primary/15 border border-primary/30 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                Bientôt
              </span>
            )}
          </div>

          <h3 className="font-headline text-2xl md:text-3xl font-extrabold text-foreground mb-3 leading-tight">
            {phase.title}
          </h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
            {phase.intro}
          </p>

          <ul className="space-y-2.5">
            {phase.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5">
                {feature.done ? (
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                )}
                <span
                  className={`text-sm leading-relaxed ${
                    feature.done ? "text-foreground/90" : "text-muted-foreground/70"
                  }`}
                >
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
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
      <div className="flex items-center gap-4">
        <Link
          href="/about"
          className="hidden md:block text-sm text-muted-foreground hover:text-primary transition-colors font-headline font-bold"
        >
          À propos
        </Link>
        <Link
          href="/signup"
          className="gradient-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
        >
          Commencer
        </Link>
      </div>
    </nav>
  );
}
