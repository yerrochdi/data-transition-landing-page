"use client";

import { Layers, EyeOff, HelpCircle, MessageCircleOff } from "lucide-react";

const problems = [
  {
    icon: Layers,
    title: "Trop d\u2019outils, pas assez de strat\u00e9gie",
    bullets: [
      "Certifications accumul\u00e9es sans fil conducteur",
      "Aucun recruteur ne voit votre logique",
    ],
  },
  {
    icon: EyeOff,
    title: "Exp\u00e9rience effac\u00e9e",
    bullets: [
      "Vos 10+ ans d\u2019exp\u00e9rience ne ressortent pas",
      "Votre CV ressemble \u00e0 celui d\u2019un junior data",
    ],
  },
  {
    icon: HelpCircle,
    title: "Profil flou sur le march\u00e9",
    bullets: [
      "Vous ne savez pas quel r\u00f4le data viser",
      "Votre pitch ne convainc pas les d\u00e9cideurs",
    ],
  },
  {
    icon: MessageCircleOff,
    title: "Pas de feedback senior",
    bullets: [
      "Personne dans votre entourage ne conna\u00eet la data",
      "Vous avancez seul, sans retour structur\u00e9",
    ],
  },
];

export function ProblemSection() {
  return (
    <section id="probleme" className="relative bg-secondary/50 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14 max-w-xl">
          <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            {"Le probl\u00e8me"}
          </span>
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"Pourquoi votre transition data stagne."}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {problems.map((problem, i) => (
            <div
              key={problem.title}
              className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-accent/30 hover:shadow-lg animate-fade-up animation-delay-${i * 100}`}
            >
              {/* Accent corner */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/5 transition-all group-hover:bg-accent/10" />

              <div className="relative flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 transition-colors group-hover:bg-accent/15">
                  <problem.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                    {problem.title}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {problem.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/40" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
