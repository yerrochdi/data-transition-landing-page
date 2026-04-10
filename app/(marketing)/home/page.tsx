"use client";

import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  GitBranch,
  Target,
  Brain,
  Briefcase,
  TrendingUp,
  Bot,
  CheckCircle,
  Zap,
  Star,
  ChevronRight,
  Users,
  Check,
  Lock,
  Crown,
  Infinity,
} from "lucide-react";

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface-container-low p-6 rounded-2xl ghost-border hover-glow group transition-all">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-headline text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function AgentShowcase({
  name,
  role,
  color,
}: {
  name: string;
  role: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl ghost-border hover:bg-surface-container transition-colors">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Bot className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Floating Nav */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-surface/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">N</span>
          </div>
          <span className="font-headline font-black text-xl text-primary tracking-tight text-glow">
            NextMove AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden md:block text-sm text-muted-foreground hover:text-primary transition-colors font-headline font-bold"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="gradient-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-transform"
          >
            Commencer
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">AI-Powered Career Evolution</span>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
          Votre transition
          <br />
          <span className="text-primary text-glow">professionnelle,</span>
          <br />
          pilotée par l&apos;IA
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          NextMove est la plateforme tout-en-un qui accélère votre évolution de carrière grâce à des agents IA spécialisés, un parcours structuré et un accompagnement intelligent.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="gradient-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-[0_10px_40px_rgba(75,226,119,0.3)]"
          >
            Lancer mon diagnostic gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="bg-surface-container-lowest px-8 py-4 rounded-xl text-base font-bold text-muted-foreground ghost-border hover:text-foreground transition-colors"
          >
            Voir la démo
          </Link>
        </div>

        {/* Social Proof */}
        <div className="mt-16 flex items-center justify-center gap-8 text-muted-foreground">
          <div className="text-center">
            <p className="text-2xl font-headline font-extrabold text-foreground">2,400+</p>
            <p className="text-xs">Transitions accompagnées</p>
          </div>
          <div className="w-px h-10 bg-border/20" />
          <div className="text-center">
            <p className="text-2xl font-headline font-extrabold text-foreground">94%</p>
            <p className="text-xs">Taux de satisfaction</p>
          </div>
          <div className="w-px h-10 bg-border/20" />
          <div className="text-center">
            <p className="text-2xl font-headline font-extrabold text-foreground">6 mois</p>
            <p className="text-xs">Durée moyenne</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            Comment ça marche
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground">
            Un parcours structuré en 5 phases
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { n: "01", title: "Diagnostic", desc: "Analyse complète de votre profil", icon: Brain },
            { n: "02", title: "Vision", desc: "Définition de votre objectif", icon: Target },
            { n: "03", title: "Positionnement", desc: "Construction de votre narrative", icon: Star },
            { n: "04", title: "Exécution", desc: "Candidature et négociation", icon: Briefcase },
            { n: "05", title: "Accélération", desc: "Premiers 90 jours", icon: TrendingUp },
          ].map((phase) => (
            <div key={phase.n} className="bg-surface-container-low p-5 rounded-2xl ghost-border text-center hover-glow group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3 group-hover:scale-110 transition-transform">
                <phase.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-primary font-bold">{phase.n}</span>
              <h3 className="font-headline text-sm font-bold text-foreground mt-1">{phase.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-1">{phase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            Plateforme
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground">
            Tout ce dont vous avez besoin
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={GitBranch}
            title="Parcours immersif"
            description="Un chemin structuré phase par phase, avec des objectifs clairs et un suivi en temps réel de votre progression."
          />
          <FeatureCard
            icon={Bot}
            title="Agents IA spécialisés"
            description="6 agents dédiés qui analysent, recommandent et agissent pour accélérer chaque aspect de votre transition."
          />
          <FeatureCard
            icon={Briefcase}
            title="Opportunités curatées"
            description="Des offres filtrées par l'IA, avec un score de matching et une explication personnalisée pour chaque proposition."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Analytics de progression"
            description="Visualisez votre évolution, identifiez vos gaps et suivez votre Career Score en temps réel."
          />
          <FeatureCard
            icon={Sparkles}
            title="Copilot intelligent"
            description="Un assistant global qui coordonne tous les agents et vous guide proactivement tout au long du parcours."
          />
          <FeatureCard
            icon={Users}
            title="Communauté & Ressources"
            description="Accédez à des guides, templates, success stories et à une communauté de professionnels en transition."
          />
        </div>
      </section>

      {/* Agent Showcase */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
              IA Agentique
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground mb-6">
              Une équipe d&apos;agents IA à votre service
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Chaque agent est spécialisé dans un domaine précis de votre transition. Ils collaborent entre eux et sont orchestrés par le Copilot pour vous offrir un accompagnement cohérent et proactif.
            </p>
            <Link
              href="/agents"
              className="gradient-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Découvrir les agents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            <AgentShowcase name="Career Coach" role="Strategic Career Advisor" color="#4be277" />
            <AgentShowcase name="Strategist" role="Market Intelligence Analyst" color="#0566d9" />
            <AgentShowcase name="Opportunity Scout" role="Opportunity Discovery Engine" color="#d1bdff" />
            <AgentShowcase name="CV Optimizer" role="Personal Branding Specialist" color="#22c55e" />
            <AgentShowcase name="Mindset Coach" role="Performance & Confidence Advisor" color="#f59e0b" />
            <AgentShowcase name="NextMove Copilot" role="Global Orchestrator" color="#4be277" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            Tarifs
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Commencez gratuitement, évoluez à votre rythme
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Le diagnostic et la Phase 1 sont entièrement gratuits. Passez au Pro quand vous êtes prêt à accélérer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-surface-container-low p-8 rounded-2xl ghost-border">
            <h3 className="font-headline text-xl font-bold text-foreground mb-2">Free</h3>
            <p className="text-sm text-muted-foreground mb-6">Idéal pour découvrir la plateforme</p>
            <div className="mb-8">
              <span className="text-4xl font-headline font-black text-foreground">0€</span>
              <span className="text-muted-foreground"> /mois</span>
            </div>
            <div className="space-y-3 mb-8">
              {[
                { text: "Diagnostic IA complet", ok: true },
                { text: "Phase 1 — Diagnostic", ok: true },
                { text: "3 sessions IA / jour", ok: true },
                { text: "5 messages Copilot / jour", ok: true },
                { text: "Top 3 opportunités", ok: true },
                { text: "Phases 2 à 5 du parcours", ok: false },
                { text: "IA illimitée", ok: false },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {f.ok ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  )}
                  <span className={f.ok ? "text-sm text-foreground" : "text-sm text-muted-foreground/40 line-through"}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/signup"
              className="block text-center bg-surface-container-lowest ghost-border px-6 py-3.5 rounded-xl text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-gradient-to-br from-surface-container-low to-primary/5 p-8 rounded-2xl border-2 border-primary/30">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="gradient-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
                Recommandé
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Pro
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Accès complet pour accélérer votre transition</p>
            <div className="mb-8">
              <span className="text-4xl font-headline font-black text-foreground">19€</span>
              <span className="text-muted-foreground"> /mois</span>
            </div>
            <div className="space-y-3 mb-8">
              {[
                { text: "Tout le plan Free", highlight: false },
                { text: "Parcours complet (5 phases)", highlight: true },
                { text: "Sessions IA illimitées", highlight: true },
                { text: "Copilot illimité 24/7", highlight: true },
                { text: "Toutes les opportunités matchées", highlight: true },
                { text: "Feed communautaire", highlight: false },
                { text: "Support prioritaire", highlight: false },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className={`w-4 h-4 shrink-0 ${f.highlight ? "text-primary" : "text-emerald-400"}`} />
                  <span className={`text-sm ${f.highlight ? "text-foreground font-bold" : "text-foreground"}`}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/signup"
              className="block text-center gradient-primary text-primary-foreground px-6 py-3.5 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Démarrer le Pro — 19€/mois
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
        <div className="bg-surface-container-high p-12 md:p-16 rounded-3xl light-streak surface-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground mb-4 relative z-10">
            Prêt à accélérer votre transition ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto relative z-10">
            Commencez par un diagnostic gratuit. En 5 minutes, découvrez votre Career Score et recevez vos premières recommandations IA.
          </p>
          <Link
            href="/signup"
            className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl text-base font-bold inline-flex items-center gap-3 hover:scale-105 transition-transform shadow-[0_10px_40px_rgba(75,226,119,0.3)] relative z-10"
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
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
