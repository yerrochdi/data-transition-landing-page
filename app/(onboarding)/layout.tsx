import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Fixed top bar */}
      <nav className="fixed top-0 w-full z-50 flex items-center px-6 md:px-12 h-16 bg-surface/80 backdrop-blur-xl border-b border-border/10">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">N</span>
          </div>
          <span className="font-headline font-black text-xl text-primary tracking-tight text-glow">
            {APP_NAME}
          </span>
        </Link>
      </nav>

      {/* max-w-7xl pour laisser respirer la grille 12-col en grand écran.
          La sidebar reste 3 cols (250px env.), le contenu prend le reste. */}
      <main className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
