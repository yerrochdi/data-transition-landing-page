import Link from "next/link";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-surface/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">N</span>
          </div>
          <span className="font-headline font-black text-xl text-primary tracking-tight text-glow">
            NextMove AI
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors font-headline font-bold"
        >
          Accueil
        </Link>
      </nav>

      <article className="pt-32 pb-24 px-6 md:px-12 max-w-3xl mx-auto">
        <header className="mb-10 pb-6 border-b border-border/20">
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour : {lastUpdated}
          </p>
        </header>

        <div className="legal-content">{children}</div>

        <footer className="mt-16 pt-8 border-t border-border/20 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link href="/legal/mentions-legales" className="hover:text-primary transition-colors">
            Mentions légales
          </Link>
          <Link href="/legal/cgv" className="hover:text-primary transition-colors">
            CGV
          </Link>
          <Link href="/legal/confidentialite" className="hover:text-primary transition-colors">
            Politique de confidentialité
          </Link>
          <Link href="/legal/cookies" className="hover:text-primary transition-colors">
            Cookies
          </Link>
        </footer>
      </article>
    </div>
  );
}
