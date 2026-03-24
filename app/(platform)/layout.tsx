import { Topbar } from "@/components/platform/topbar";
import { AppSidebar } from "@/components/platform/app-sidebar";
import { MobileNav } from "@/components/platform/mobile-nav";
import { AiFab } from "@/components/platform/ai-fab";
import { getDashboardData } from "@/lib/dashboard/actions";
import { redirect } from "next/navigation";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  const userInfo = {
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    avatarUrl: data.user.avatarUrl,
    plan: data.user.plan,
    targetRole: data.profile?.targetRole ?? null,
    readinessScore: data.profile?.readinessScore ?? 0,
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Topbar user={userInfo} />
      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <AppSidebar user={userInfo} />
        <section className="lg:col-span-9">{children}</section>
      </main>
      <MobileNav />
      <AiFab />
    </div>
  );
}
