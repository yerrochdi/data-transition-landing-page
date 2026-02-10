import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Target,
  CheckCircle2,
  Calendar,
  Tag,
  Sparkles,
  User,
  Database,
  Users,
  Compass,
} from "lucide-react";

const miniCards = [
  {
    icon: Calendar,
    title: "6 semaines",
    description: "Cadre court et structur\u00e9",
  },
  {
    icon: Target,
    title: "4 livrables",
    description: "Diagnostic, positionnement, CV/discours, feuille de route",
  },
  {
    icon: CheckCircle2,
    title: "S\u00e9lection",
    description: "\u00c9change 15 min pour v\u00e9rifier l\u2019alignement",
  },
];

const roadmapItems = [
  { label: "Diagnostic", done: true },
  { label: "Positionnement", done: true },
  { label: "Traduction CV", done: false },
  { label: "Feuille de route", done: false },
];

const tags = ["Data Analyst", "AMOA Data", "PO Data", "BI Lead"];

const credentialBadges = [
  { icon: Database, label: "+10 ans d\u2019exp\u00e9rience data & syst\u00e8mes r\u00e9els" },
  { icon: Users, label: "Profils RH / SIRH / AMOA / IT" },
  { icon: Compass, label: "Mentorat & architecture de carri\u00e8re" },
];

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-background pb-20 pt-12 lg:pb-28 lg:pt-20">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Accent glow */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-start lg:gap-20 lg:px-8">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-6 animate-fade-up">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="rounded-full border-accent/30 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent"
            >
              <Sparkles className="mr-1.5 h-3 w-3" />
              {"Mentorat senior"}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              {"6 semaines"}
            </span>
          </div>

          <h1 className="font-display text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {"\u00c9voluer vers la data "}
            <span className="relative">
              <span className="relative z-10">{"sans repartir"}</span>
              <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-accent/15 lg:bottom-2 lg:h-4" />
            </span>
            {" de z\u00e9ro."}
          </h1>

          <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
            {"Un accompagnement structur\u00e9 pour les profils fonctionnels exp\u00e9riment\u00e9s (RH/SIRH/AMOA/IT) qui veulent un r\u00f4le data "}
            <strong className="font-semibold text-foreground">{"cr\u00e9dible"}</strong>
            {"."}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-accent px-7 text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30"
            >
              <a href="#contact">
                {"Demander un \u00e9change de 15 min"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full bg-transparent"
            >
              <a href="#methode">{"Voir la m\u00e9thode"}</a>
            </Button>
          </div>

          {/* Personal credibility block */}
          <div className="mt-2 rounded-2xl border border-border/60 bg-card p-5 shadow-sm animate-fade-up animation-delay-200">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-accent/20 bg-accent/5">
                <User className="h-7 w-7 text-accent/50" />
              </div>
              <div>
                <p className="font-display text-base font-bold text-foreground">
                  {"Yassine"}
                  <span className="ml-2 text-sm font-medium text-muted-foreground">
                    {"Mentor & Architecte Data"}
                  </span>
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {"J\u2019accompagne des profils m\u00e9tier et fonctionnels exp\u00e9riment\u00e9s dans leur \u00e9volution vers des r\u00f4les data cr\u00e9dibles, sans repartir de z\u00e9ro."}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {credentialBadges.map((cred) => (
                <span
                  key={cred.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground"
                >
                  <cred.icon className="h-3 w-3 text-accent" />
                  {cred.label}
                </span>
              ))}
            </div>
          </div>

          {/* Mini cards */}
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            {miniCards.map((card, i) => (
              <div
                key={card.title}
                className={`group flex flex-1 items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:border-accent/30 hover:shadow-md animate-fade-up animation-delay-${(i + 3) * 100}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 transition-colors group-hover:bg-accent/20">
                  <card.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{card.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column - Mockup card */}
        <div className="flex flex-1 justify-center animate-slide-in-right lg:justify-end lg:pt-8">
          <div className="w-full max-w-sm">
            <div className="relative rounded-3xl border border-border/60 bg-card p-1 shadow-2xl shadow-foreground/5">
              {/* Card header bar */}
              <div className="flex items-center gap-1.5 rounded-t-2xl bg-secondary/50 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                <span className="ml-3 text-xs font-medium text-muted-foreground">
                  {"Votre roadmap data"}
                </span>
              </div>

              <div className="flex flex-col gap-5 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">
                    {"Aper\u00e7u du programme"}
                  </p>
                  <Badge className="rounded-full bg-accent/10 text-xs font-semibold text-accent">
                    {"En cours"}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-1/2 rounded-full bg-accent transition-all" />
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-3">
                  {roadmapItems.map((item, i) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          item.done
                            ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
                            : "border-2 border-dashed border-border text-muted-foreground"
                        }`}
                      >
                        {item.done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          item.done
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </p>
                      {item.done && (
                        <span className="ml-auto text-[10px] font-medium text-accent">
                          {"Termin\u00e9"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {"R\u00f4les cibles"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next session */}
                <div className="flex items-center gap-3 rounded-xl bg-accent/5 p-3">
                  <Calendar className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {"Prochaine session"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {"Lundi 14h \u2014 Positionnement"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
