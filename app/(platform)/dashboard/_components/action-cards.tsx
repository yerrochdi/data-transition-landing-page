"use client";

import { BookOpen, Briefcase, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ActionCardsProps {
  targetRole: string | null;
  hasCompletedOnboarding: boolean;
}

export function ActionCards({ targetRole, hasCompletedOnboarding }: ActionCardsProps) {
  if (!hasCompletedOnboarding) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-8 text-center ghost-border bg-gradient-to-br from-primary/10 via-surface-container-low to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.1),transparent_60%)]" />
        <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
        <h3 className="font-headline text-xl font-extrabold text-foreground mb-2">
          Lancez votre diagnostic IA
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          En 5 minutes, obtenez une analyse personnalisée de votre potentiel de transition vers la data/IA.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20"
        >
          Commencer le diagnostic
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const actions = [
    {
      icon: BookOpen,
      title: "Se former",
      description: targetRole
        ? `Formations recommandées pour devenir ${targetRole}`
        : "Explorez les formations data/IA adaptées à votre profil",
      href: "/resources",
      gradient: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
    },
    {
      icon: Briefcase,
      title: "Explorer le marché",
      description: targetRole
        ? `Offres matching pour ${targetRole}`
        : "Découvrez les opportunités qui correspondent à votre profil",
      href: "/opportunities",
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-400",
    },
    {
      icon: Sparkles,
      title: "Parler au Copilot",
      description: "Obtenez des conseils personnalisés en temps réel",
      href: "/agents",
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
  ];

  return (
    <div>
      <h3 className="font-headline text-sm font-bold text-foreground mb-4">Actions rapides</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative overflow-hidden rounded-2xl p-5 ghost-border hover:scale-[1.02] transition-all hover:shadow-lg"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient}`} />
            <div className="relative">
              <action.icon className={`w-8 h-8 ${action.iconColor} mb-3 group-hover:scale-110 transition-transform`} />
              <h4 className="font-headline text-sm font-bold text-foreground mb-1">{action.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{action.description}</p>
              <span className="flex items-center gap-1 text-[10px] text-primary font-bold group-hover:gap-2 transition-all">
                Découvrir
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
