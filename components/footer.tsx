import { Mail, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-xl font-extrabold tracking-tight">
              {"Data"}
              <span className="text-accent">{"."}</span>
              {"Transition"}
            </p>
            <p className="mt-2 max-w-xs text-sm text-background/60">
              {"Mentorat senior pour votre transition data. Pas une formation, un repositionnement."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-background/40">
              {"Contact"}
            </p>
            <a
              href="mailto:contact@datatransition.fr"
              className="flex items-center gap-2 text-sm text-background/70 transition-colors hover:text-background"
              aria-label="Envoyer un email"
            >
              <Mail className="h-4 w-4" />
              {"contact@datatransition.fr"}
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-background/70 transition-colors hover:text-background"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
              {"LinkedIn"}
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-background/10 pt-6">
          <div className="flex flex-col gap-3 text-xs text-background/40 md:flex-row md:items-center md:justify-between">
            <p>{"\u00a9 2026 Data Transition. Tous droits r\u00e9serv\u00e9s."}</p>
            <div className="flex gap-6">
              <a href="#" className="transition-colors hover:text-background/60">
                {"Mentions l\u00e9gales"}
              </a>
              <a href="#" className="transition-colors hover:text-background/60">
                {"Politique de confidentialit\u00e9"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
