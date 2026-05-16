import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 px-6 md:px-12 max-w-6xl mx-auto border-t border-border/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">N</span>
            </div>
            <span className="font-headline font-bold text-base text-foreground">NextMove AI</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Le Career OS des cadres qui intègrent la data et l&apos;IA à leur expertise.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-3">
            Plateforme
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/founding-members" className="hover:text-primary transition-colors">
                Founding Members
              </Link>
            </li>
            <li>
              <Link href="/roadmap" className="hover:text-primary transition-colors">
                Roadmap
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-primary transition-colors">
                Se connecter
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-foreground mb-3">
            Légal
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <Link href="/legal/mentions-legales" className="hover:text-primary transition-colors">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/legal/cgv" className="hover:text-primary transition-colors">
                CGV
              </Link>
            </li>
            <li>
              <Link href="/legal/confidentialite" className="hover:text-primary transition-colors">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link href="/legal/cookies" className="hover:text-primary transition-colors">
                Cookies
              </Link>
            </li>
            <li>
              <a href="mailto:contact@nextmove.sh" className="hover:text-primary transition-colors">
                contact@nextmove.sh
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-6 border-t border-border/10 text-xs text-muted-foreground text-center">
        &copy; 2026 Datakeai · NextMove AI. Tous droits réservés.
      </div>
    </footer>
  );
}
