import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <span className="text-lg font-bold text-primary-foreground">N</span>
        </div>
        <span className="font-headline font-black text-2xl text-primary tracking-tight text-glow">
          NextMove AI
        </span>
      </Link>

      <div className="w-full max-w-md">{children}</div>

      <p className="mt-12 text-xs text-muted-foreground">
        &copy; 2026 NextMove AI. Tous droits réservés.
      </p>
    </div>
  );
}
