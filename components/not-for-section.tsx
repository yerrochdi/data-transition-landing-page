import { X } from "lucide-react";

const exclusions = [
  {
    title: "Reconversion rapide",
    description: "Personnes en reconversion rapide cherchant un raccourci",
  },
  {
    title: "Profils juniors",
    description: "Profils juniors sans exp\u00e9rience m\u00e9tier significative",
  },
  {
    title: "Formation technique",
    description: "Recherche d\u2019une formation technique (SQL, Python, etc.)",
  },
  {
    title: "Promesse d\u2019emploi",
    description: "Attente d\u2019une promesse d\u2019emploi ou de placement",
  },
  {
    title: "Coaching motivationnel",
    description: "Recherche de coaching motivationnel ou de d\u00e9veloppement personnel",
  },
];

export function NotForSection() {
  return (
    <section className="bg-secondary/50 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <span className="mb-3 inline-block rounded-full bg-destructive/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-destructive">
            {"Filtrage"}
          </span>
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"Cet accompagnement n\u2019est volontairement pas fait pour tout le monde"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exclusions.map((item) => (
            <div
              key={item.title}
              className="group flex items-start gap-4 rounded-2xl border-2 border-destructive/10 bg-card p-5 transition-all hover:border-destructive/20 hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <X className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-8 flex items-center justify-center">
          <p className="rounded-full border border-border/60 bg-card px-6 py-3 text-sm font-medium text-muted-foreground shadow-sm">
            {"Le filtrage fait partie de la valeur de l\u2019accompagnement."}
          </p>
        </div>
      </div>
    </section>
  );
}
