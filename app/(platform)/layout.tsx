import { Topbar } from "@/components/platform/topbar";
import { AppSidebar } from "@/components/platform/app-sidebar";
import { MobileNav } from "@/components/platform/mobile-nav";
import { AiFab } from "@/components/platform/ai-fab";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Topbar />
      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <AppSidebar />
        <section className="lg:col-span-9">{children}</section>
      </main>
      <MobileNav />
      <AiFab />
    </div>
  );
}
