import { Users, Award, Briefcase, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50+",
    label: "Profils accompagn\u00e9s",
  },
  {
    icon: Award,
    value: "92%",
    label: "Taux de satisfaction",
  },
  {
    icon: Briefcase,
    value: "6",
    label: "Semaines de programme",
  },
  {
    icon: TrendingUp,
    value: "85%",
    label: "R\u00e9ussite \u00e0 6 mois",
  },
];

export function TrustSection() {
  return (
    <section className="border-y border-border/60 bg-card py-14">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <stat.icon className="h-6 w-6 text-accent" />
              </div>
              <p className="font-display text-3xl font-extrabold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
