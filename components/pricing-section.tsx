import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShieldCheck, ArrowRight, Star, FlaskConical, User, Users, Sparkles } from "lucide-react";

const offers = [
  {
    name: "B\u00eata",
    icon: FlaskConical,
    badge: "S\u00e9lection",
    price: "Gratuit",
    priceSuffix: "(b\u00eata)",
    format: "Format : 1:1",
    description: "Pour les premiers profils s\u00e9lectionn\u00e9s \u2014 co-construction",
    features: [
      "Diagnostic \u00e9crit complet",
      "2 sessions de mentorat",
      "Positionnement initial",
      "Feedback sur votre CV",
    ],
    cta: "Candidater",
    highlighted: false,
    popular: false,
  },
  {
    name: "Individuel 1:1",
    icon: User,
    badge: "Populaire",
    price: "1 200 \u20ac",
    priceSuffix: "/ personne",
    format: "Dur\u00e9e : 6 semaines",
    description: "Accompagnement individuel complet",
    features: [
      "Tous les livrables inclus",
      "6 sessions de mentorat 1:1",
      "Positionnement + pitch professionnel",
      "CV + LinkedIn repositionn\u00e9s",
      "Feuille de route prioris\u00e9e",
      "Suivi personnalis\u00e9 entre sessions",
    ],
    cta: "Demander un \u00e9change",
    highlighted: true,
    popular: true,
  },
  {
    name: "Cohorte Standard",
    icon: Users,
    badge: "Groupe",
    price: "1 500 \u20ac",
    priceSuffix: "/ personne",
    format: "Groupe : 6 \u00e0 10 personnes",
    description: "Sessions collectives + dynamique de groupe",
    features: [
      "Tous les livrables inclus",
      "Sessions collectives hebdomadaires",
      "Feedback crois\u00e9 entre pairs",
      "Dynamique de groupe motivante",
      "R\u00e9seau de professionnels data",
    ],
    cta: "Voir si c\u2019est adapt\u00e9",
    highlighted: false,
    popular: false,
  },
  {
    name: "Cohorte Premium",
    icon: Sparkles,
    badge: "Exclusif",
    price: "2 000 \u20ac",
    priceSuffix: "/ personne",
    format: "Cohorte + 1 session individuelle incluse",
    description: "Le meilleur des deux formats",
    features: [
      "Tout le programme Cohorte",
      "1 session individuelle incluse",
      "Simulation d\u2019entretien data",
      "Suivi post-programme (4 sem.)",
      "Acc\u00e8s prioritaire aux \u00e9v\u00e9nements",
      "Relecture CV/LinkedIn (jusqu\u2019\u00e0 2 it\u00e9rations)",
    ],
    cta: "Demander un \u00e9change",
    highlighted: false,
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="offres" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14 max-w-xl">
          <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            {"Les offres"}
          </span>
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"Choisissez le format adapt\u00e9 \u00e0 votre situation."}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((offer) => (
            <div
              key={offer.name}
              className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all ${
                offer.highlighted
                  ? "border-accent bg-card shadow-xl shadow-accent/10"
                  : "border-border/60 bg-card hover:border-accent/20 hover:shadow-md"
              }`}
            >
              {offer.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground shadow-md shadow-accent/30">
                    <Star className="mr-1 h-3 w-3" />
                    {"Recommand\u00e9"}
                  </Badge>
                </div>
              )}

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <offer.icon className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    {offer.name}
                  </h3>
                </div>
                {!offer.popular && (
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs font-medium"
                  >
                    {offer.badge}
                  </Badge>
                )}
              </div>

              <p className="mb-1 text-sm text-muted-foreground">
                {offer.description}
              </p>
              <p className="mb-4 text-xs font-medium text-accent">
                {offer.format}
              </p>

              <div className="mb-6 flex items-baseline gap-1">
                <p className="font-display text-3xl font-extrabold text-foreground">
                  {offer.price}
                </p>
                {offer.priceSuffix && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {offer.priceSuffix}
                  </span>
                )}
              </div>

              <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                {offer.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Check className="h-3 w-3 text-accent" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full rounded-full ${
                  offer.highlighted
                    ? "bg-accent text-accent-foreground shadow-md shadow-accent/25 hover:bg-accent/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                <a href="#contact">
                  {offer.cta}
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          ))}
        </div>

        {/* Global pricing note */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              <strong className="text-foreground">{"S\u00e9lection \u00e0 l\u2019entr\u00e9e"}</strong>
              {" : cet accompagnement n\u2019est pas ouvert \u00e0 tous. Nous \u00e9changeons avant pour v\u00e9rifier que le programme vous convient."}
            </p>
          </div>
          <p className="text-center text-xs font-medium text-muted-foreground">
            {"Tous les tarifs sont exprim\u00e9s par personne. S\u00e9lection \u00e0 l\u2019entr\u00e9e."}
          </p>
        </div>
      </div>
    </section>
  );
}
