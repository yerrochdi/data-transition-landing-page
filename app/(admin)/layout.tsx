import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Admin Topbar */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-14 bg-surface-container/60 backdrop-blur-xl ghost-border">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">N</span>
            </div>
            <span className="font-headline font-bold text-sm text-primary">Admin</span>
          </Link>
          <AdminNav />
        </div>
        <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          ← Back to app
        </Link>
      </nav>
      <main className="pt-20 pb-12 px-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
