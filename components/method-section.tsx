import { Badge } from "@/components/ui/badge";
import { Search, Crosshair, FileText, Map, Clock, Users, GraduationCap } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Search,
    title: "Diagnostic",
    description:
      "Analyse approfondie de votre parcours, vos forces, vos zones floues et votre positionnement actuel.",
    deliverable: "Diagnostic \u00e9crit et partag\u00e9",
    color: "bg-accent",
  },
  {
    number: 2,
    icon: Crosshair,
    title: "Positionnement",
    description:
      "D\u00e9finition du r\u00f4le data cible coh\u00e9rent avec votre exp\u00e9rience et le march\u00e9.",
    deliverable: "R\u00f4le(s) cible(s) clairs + pitch professionnel",
    color: "bg-accent/80",
  },
  {
    number: 3,
    icon: FileText,
    title: "Traduction",
    description:
      "Reformulation de votre CV, LinkedIn et discours pour parler le langage data.",
    deliverable: "CV et discours professionnel restructur\u00e9s",
    color: "bg-accent/60",
  },
  {
    number: 4,
    icon: Map,
    title: "Feuille de route",
    description:
      "Plan d\u2019action concret avec les \u00e9tapes prioritaires.",
    deliverable: "Plan d\u2019action prioris\u00e9 et r\u00e9aliste",
    color: "bg-accent/40",
  },
];

const formatBadges = [
  { icon: Clock, label: "6 semaines" },
  { icon: Users, label: "1 session / semaine" },
  { icon: GraduationCap, label: "Mentorat (pas formation)" },
];

export function MethodSection() {
  return (
    <section id="methode" className="relative bg-secondary/50 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14 max-w-xl">
          <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            {"La m\u00e9thode"}
          </span>
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"4 \u00e9tapes, 6 semaines, un plan clair."}
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-accent/30 hover:shadow-lg"
            >
              {/* Step number + icon */}
              <div className="mb-5 flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${step.color} text-sm font-extrabold text-accent-foreground shadow-sm`}
                >
                  {step.number}
                </div>
                <step.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent" />
              </div>

              <h3 className="mb-2 font-display text-lg font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>

              {/* Deliverable */}
              <div className="rounded-xl bg-accent/5 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent">
                  {"Livrable"}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {step.deliverable}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Connecting line (desktop only) */}
        <div className="mt-10 hidden items-center justify-center lg:flex">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>

        {/* Format badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {formatBadges.map((badge) => (
            <Badge
              key={badge.label}
              variant="outline"
              className="rounded-full border-accent/20 bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm"
            >
              <badge.icon className="mr-2 h-4 w-4 text-accent" />
              {badge.label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
