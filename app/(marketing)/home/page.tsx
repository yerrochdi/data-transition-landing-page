"use client";

import Link from "next/link";
import Image from "next/image";
import { FoundingBanner } from "@/components/marketing/founding-banner";
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
      <FoundingBanner />
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
            href="/about"
            className="hidden md:block text-sm text-muted-foreground hover:text-primary transition-colors font-headline font-bold"
          >
            À propos
          </Link>
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
          <span className="text-xs font-bold text-primary">Pour les cadres en évolution</span>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
          Les cadres qui maîtrisent
          <br />
          <span className="text-primary text-glow">la data valent 2x plus.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Découvre comment intégrer la data et l&apos;IA à ton expertise — sans tout recommencer. Diagnostic personnalisé en 3 minutes.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="gradient-primary text-primary-foreground px-8 py-4 rounded-xl text-base font-bold flex items-center gap-3 hover:scale-105 transition-transform shadow-[0_10px_40px_rgba(75,226,119,0.3)]"
          >
            Faire mon diagnostic gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#pricing"
            className="bg-surface-container-lowest px-8 py-4 rounded-xl text-base font-bold text-muted-foreground ghost-border hover:text-foreground transition-colors"
          >
            Voir les formules
          </a>
        </div>
      </section>

      {/* Chiffres marché */}
      <section className="pb-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            Chiffres marché
          </span>
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-foreground max-w-3xl mx-auto leading-tight">
            Le marché valorise massivement les cadres qui intègrent la data et l&apos;IA
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              role: "Marketing senior",
              before: "65 – 80 k€",
              after: "85 – 110 k€",
              uplift: "+30%",
            },
            {
              role: "Product Manager",
              before: "60 – 75 k€",
              after: "85 – 115 k€",
              uplift: "+45%",
            },
            {
              role: "Finance / Contrôle",
              before: "70 – 90 k€",
              after: "90 – 125 k€",
              uplift: "+35%",
            },
          ].map((item) => (
            <div
              key={item.role}
              className="bg-surface-container-low p-6 rounded-2xl ghost-border hover-glow group transition-all"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                {item.role}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Profil classique</span>
                  <span className="text-sm font-headline font-bold text-foreground/70">
                    {item.before}
                  </span>
                </div>

                <div className="h-px bg-border/30" />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-bold">+ Data &amp; IA</span>
                  <span className="text-base font-headline font-extrabold text-primary text-glow">
                    {item.after}
                  </span>
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-[11px] font-bold text-primary">
                  {item.uplift} en moyenne
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/60 text-center mt-6 max-w-2xl mx-auto leading-relaxed">
          Ranges indicatifs basés sur APEC Baromètre cadres 2025, LinkedIn Economic Graph 2025 et France Travail. Les rémunérations effectives dépendent de la séniorité, du secteur et de la zone géographique.
        </p>
      </section>

      {/* Pour qui ça marche — 3 archétypes */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            Pour qui ça marche
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Trois façons d&apos;intégrer la data à ta carrière
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            La plateforme s&apos;adapte à ton profil. Voici trois trajectoires types selon ton point de départ et ton ambition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              tag: "Le Pivoteur Tech",
              transition: "Director Marketing → AI Product Manager",
              persona:
                "Marc, 42 ans, 15 ans en marketing dans la grande conso. Sent que son métier classique est bouleversé par l'IA. Veut pivoter sans repartir junior.",
              steps: [
                "Diagnostic complet du profil",
                "Identification AI Product Manager comme cible",
                "Upskilling produit + IA",
                "Repositionnement LinkedIn",
                "Opportunités matchées en scale-up",
              ],
              icon: Zap,
            },
            {
              tag: "L'Upgrader Data-Driven",
              transition: "CFO classique → CFO data-driven",
              persona:
                "Sophie, 45 ans, DAF d'une PME industrielle. Ne veut pas changer de métier mais sent qu'il faut maîtriser la data pour rester compétitive.",
              steps: [
                "Diagnostic du gap data finance",
                "Upskilling outils data finance",
                "Projet interne data-driven",
                "Repositionnement comme CFO moderne",
                "Évolution interne ou externe",
              ],
              icon: TrendingUp,
            },
            {
              tag: "L'Hybrideur Stratégique",
              transition: "Product Manager → Senior PM spécialisé IA",
              persona:
                "Thomas, 38 ans, PM dans la fintech. Veut prendre de l'avance sur l'IA sans devenir technique pur.",
              steps: [
                "Diagnostic du gap IA",
                "Formation produit IA + portfolio",
                "Construction de cas concrets",
                "Networking ciblé scale-ups IA",
                "Passage à un rôle Senior AI PM",
              ],
              icon: Star,
            },
          ].map((archetype) => (
            <div
              key={archetype.tag}
              className="bg-surface-container-low p-7 rounded-2xl ghost-border hover-glow group transition-all flex flex-col"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                <archetype.icon className="w-5 h-5" />
              </div>

              <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-2">
                {archetype.tag}
              </p>
              <h3 className="font-headline text-lg font-bold text-foreground mb-4 leading-snug">
                {archetype.transition}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">
                {archetype.persona}
              </p>

              <div className="border-t border-border/20 pt-4 mt-auto">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Parcours type
                </p>
                <ul className="space-y-2">
                  {archetype.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/60 text-center mt-8 max-w-2xl mx-auto">
          Exemples de parcours types — vos résultats dépendent de votre profil et de votre engagement.
        </p>
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
      <section id="pricing" className="py-24 px-6 md:px-12 max-w-5xl mx-auto scroll-mt-20">
        <div className="text-center mb-16">
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
            Tarifs
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Choisissez votre rythme d&apos;évolution
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Diagnostic gratuit pour découvrir, Boost pour avancer, Pro pour accélérer, Sprint pour des résultats express. Sans engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Free */}
          <div className="bg-surface-container-low p-7 rounded-2xl ghost-border">
            <h3 className="font-headline text-xl font-bold text-foreground mb-2">Free</h3>
            <p className="text-sm text-muted-foreground mb-6">Découvrir la plateforme</p>
            <div className="mb-8">
              <span className="text-4xl font-headline font-black text-foreground">0€</span>
              <span className="text-muted-foreground"> /mois</span>
              <p className="text-xs text-muted-foreground mt-1">Sans CB requise</p>
            </div>
            <div className="space-y-3 mb-8">
              {[
                { text: "Diagnostic IA complet", ok: true },
                { text: "Phase 1 — Diagnostic", ok: true },
                { text: "3 sessions IA / jour", ok: true },
                { text: "5 messages Copilot / jour", ok: true },
                { text: "Top 3 opportunités", ok: true },
                { text: "Phases 2 à 5 du parcours", ok: false },
                { text: "Feed communautaire", ok: false },
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

          {/* Boost — Recommandé */}
          <div className="relative bg-gradient-to-br from-surface-container-low to-primary/5 p-7 rounded-2xl border-2 border-primary/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="gradient-primary text-primary-foreground text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/20">
                Recommandé
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Boost
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Avancer sereinement</p>
            <div className="mb-8">
              <span className="text-4xl font-headline font-black text-foreground">19€</span>
              <span className="text-muted-foreground"> /mois</span>
              <p className="text-xs text-muted-foreground mt-1">Garantie 14 jours satisfait ou remboursé</p>
            </div>
            <div className="space-y-3 mb-8">
              {[
                { text: "Tout le plan Free", highlight: false },
                { text: "Parcours complet (5 phases)", highlight: true },
                { text: "20 sessions IA / jour", highlight: true },
                { text: "30 messages Copilot / jour", highlight: true },
                { text: "Top 10 opportunités matchées", highlight: false },
                { text: "Feed communautaire", highlight: false },
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
              href="/signup?plan=boost"
              className="block text-center gradient-primary text-primary-foreground px-6 py-3.5 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Démarrer le Boost — 19€
              </span>
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-surface-container-low p-7 rounded-2xl ghost-border">
            <h3 className="font-headline text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Pro
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Accélérer au maximum</p>
            <div className="mb-8">
              <span className="text-4xl font-headline font-black text-foreground">49€</span>
              <span className="text-muted-foreground"> /mois</span>
              <p className="text-xs text-muted-foreground mt-1">ou 390€/an (-33%)</p>
            </div>
            <div className="space-y-3 mb-8">
              {[
                { text: "Tout le plan Boost", highlight: false },
                { text: "Sessions IA illimitées", highlight: true },
                { text: "Copilot illimité 24/7", highlight: true },
                { text: "Toutes les opportunités", highlight: true },
                { text: "Support prioritaire", highlight: false },
                { text: "Garantie 14 jours", highlight: false },
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
              href="/signup?plan=pro"
              className="block text-center bg-surface-container-lowest ghost-border px-6 py-3.5 rounded-xl text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
            >
              Démarrer le Pro — 49€
            </Link>
          </div>

          {/* Sprint — Résultat express */}
          <div className="relative bg-surface-container-low p-7 rounded-2xl ghost-border">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-4 py-1.5 rounded-full">
                Résultat express
              </span>
            </div>
            <h3 className="font-headline text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Sprint
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Boost intensif sur 30 jours</p>
            <div className="mb-8">
              <span className="text-4xl font-headline font-black text-foreground">149€</span>
              <span className="text-muted-foreground"> unique</span>
              <p className="text-xs text-muted-foreground mt-1">Garantie 7 jours satisfait ou remboursé</p>
            </div>
            <div className="space-y-3 mb-8">
              {[
                { text: "Tout le plan Pro pendant 30 jours", highlight: true },
                { text: "Plan d'attaque personnalisé", highlight: true },
                { text: "Préparation accélérée entretiens", highlight: false },
                { text: "Suivi quotidien intensif Copilot", highlight: false },
                { text: "Sans abonnement", highlight: false },
                { text: "Sans reconduction", highlight: false },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className={`w-4 h-4 shrink-0 ${f.highlight ? "text-amber-400" : "text-emerald-400"}`} />
                  <span className={`text-sm ${f.highlight ? "text-foreground font-bold" : "text-foreground"}`}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/signup?plan=sprint"
              className="block text-center bg-amber-500/10 border border-amber-500/30 text-amber-400 px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-amber-500/15 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Démarrer le Sprint — 149€
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Qui suis-je */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-14 items-center">
          {/* Photo */}
          <div className="relative mx-auto md:mx-0">
            <div className="absolute inset-0 gradient-primary opacity-20 blur-2xl rounded-full" />
            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden ghost-border">
              <Image
                src="/founder.png"
                alt="Yassine Errochdi, fondateur de NextMove AI"
                width={512}
                height={512}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
              Qui suis-je
            </span>
            <h2 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground mb-6">
              Pourquoi j&apos;ai créé NextMove
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Je suis Yassine Errochdi, expert data &amp; IA. J&apos;ai accompagné des grands groupes français — Crédit Agricole Assurances, Total, EDF, Sopra, Catalina — sur leurs transformations data, et formé leurs équipes sur ces sujets.
              </p>
              <p>
                Au fil de ces missions, un constat partout le même : trop de cadres talentueux pensent qu&apos;ils sont condamnés à l&apos;obsolescence face à l&apos;IA. <span className="text-foreground font-bold">C&apos;est faux.</span>
              </p>
              <p>
                Les cadres qui intègrent la data et l&apos;IA à leur expertise existante deviennent les profils les plus recherchés du marché. Pas les juniors qui repartent de zéro — ceux qui capitalisent sur leurs années d&apos;expérience.
              </p>
              <p>
                NextMove existe pour leur donner le plan, les outils et les opportunités. Mon objectif : accompagner 1000 cadres FR dans cette évolution en 3 ans.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 bg-surface-container-lowest ghost-border px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
              >
                En savoir plus
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
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
