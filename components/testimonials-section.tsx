import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";

const testimonials = [
  {
    text: "Le diagnostic m\u2019a \u00e9vit\u00e9 une reconversion inutile.",
    initials: "K.B.",
    role: "AMOA senior",
  },
  {
    text: "J\u2019ai enfin un positionnement data coh\u00e9rent avec mon parcours.",
    initials: "S.L.",
    role: "Ex-Responsable SIRH",
  },
  {
    text: "Un accompagnement tr\u00e8s structurant et honn\u00eate.",
    initials: "M.R.",
    role: "Chef de projet IT",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            {"Retours"}
          </span>
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"Retours d\u2019accompagnement"}
          </h2>
          <Badge
            variant="outline"
            className="mt-4 rounded-full border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent"
          >
            {"Programme en phase b\u00eata"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.initials}
              className="group flex flex-col rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-accent/20 hover:shadow-lg lg:p-8"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Quote className="h-4 w-4 text-accent" />
              </div>
              <p className="flex-1 text-base font-medium leading-relaxed text-foreground">
                {`\u00ab ${t.text} \u00bb`}
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-foreground">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.initials}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
