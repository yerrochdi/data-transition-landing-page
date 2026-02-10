import { Check, X, Quote } from "lucide-react";

const whatItIs = [
  "Un mentorat strat\u00e9gique individuel",
  "Un cadre structur\u00e9 pour repositionner votre parcours",
  "Un accompagnement par un professionnel de la data",
  "Un travail sur votre positionnement march\u00e9",
  "Une feuille de route actionnable en 6 semaines",
];

const whatItIsNot = [
  "Une formation SQL, Python ou Power BI",
  "Un bootcamp intensif ou un cours en ligne",
  "Un service de placement ou d\u2019outplacement",
  "Un coaching de vie ou de d\u00e9veloppement personnel",
  "Une solution miracle sans effort de votre part",
];

export function ApproachSection() {
  return (
    <section id="approche" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14 max-w-xl">
          <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            {"L\u2019approche"}
          </span>
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"Un mentorat, pas une formation."}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Ce que c'est */}
          <div className="rounded-2xl border-2 border-accent/20 bg-accent/[0.03] p-6 lg:p-8">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15">
                <Check className="h-4 w-4 text-accent" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {"Ce que c\u2019est"}
              </h3>
            </div>
            <ul className="flex flex-col gap-3.5">
              {whatItIs.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-sm leading-relaxed text-foreground/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ce que ce n'est pas */}
          <div className="rounded-2xl border-2 border-destructive/15 bg-destructive/[0.02] p-6 lg:p-8">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                <X className="h-4 w-4 text-destructive" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {"Ce que ce n\u2019est pas"}
              </h3>
            </div>
            <ul className="flex flex-col gap-3.5">
              {whatItIsNot.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                    <X className="h-3 w-3 text-destructive" />
                  </div>
                  <span className="text-sm leading-relaxed text-foreground/80">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Principle card */}
        <div className="mt-8 rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
              <Quote className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-accent">
                {"Principe"}
              </p>
              <p className="font-display text-lg font-semibold leading-relaxed text-foreground lg:text-xl">
                {"La data n\u2019est pas une reconversion : c\u2019est souvent une \u00e9volution mal positionn\u00e9e."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
