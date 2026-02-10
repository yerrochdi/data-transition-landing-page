import {
  Database,
  Users,
  Brain,
  User,
} from "lucide-react";

const credentials = [
  {
    icon: Database,
    label: "Architectures data & industrialisation de syst\u00e8mes complexes",
  },
  {
    icon: Brain,
    label: "Exp\u00e9rience senior data / IA en contexte r\u00e9el",
  },
  {
    icon: Users,
    label: "Accompagnement de profils RH / SIRH / AMOA / IT vers la data",
  },
];

export function MentorSection() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-14 max-w-xl">
          <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            {"L\u2019accompagnant"}
          </span>
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"Qui vous accompagne"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-14">
          {/* Left - Avatar */}
          <div className="flex flex-col items-center gap-4 lg:col-span-2">
            <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-accent/20 bg-accent/5 shadow-lg shadow-accent/5">
              <User className="h-20 w-20 text-accent/40" />
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">
                {"Yassine"}
              </p>
              <p className="text-sm text-muted-foreground">
                {"Architecte data & mentor senior"}
              </p>
            </div>
          </div>

          {/* Right - Bio + credentials */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            <p className="text-base leading-relaxed text-muted-foreground lg:text-lg">
              {"Je suis Yassine, architecte data et mentor senior. Mon r\u00f4le n\u2019est pas de former \u00e0 des outils, mais d\u2019aider des professionnels exp\u00e9riment\u00e9s \u00e0 structurer une trajectoire data coh\u00e9rente, cr\u00e9dible et align\u00e9e avec leur exp\u00e9rience r\u00e9elle et le march\u00e9."}
            </p>

            {/* Credentials grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {credentials.map((cred) => (
                <div
                  key={cred.label}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-accent/20 hover:shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <cred.icon className="h-4 w-4 text-accent" />
                  </div>
                  <p className="text-sm font-medium leading-snug text-foreground">
                    {cred.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Highlighted quote */}
            <div className="rounded-2xl border-2 border-accent/20 bg-accent/[0.03] p-5">
              <p className="font-display text-base font-semibold leading-relaxed text-foreground lg:text-lg">
                {"Vous \u00eates accompagn\u00e9 par une personne, pas par une plateforme."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
