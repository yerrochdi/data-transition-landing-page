import { Topbar } from "@/components/platform/topbar";
import { AppSidebar } from "@/components/platform/app-sidebar";
import { MobileNav } from "@/components/platform/mobile-nav";
import { AiFab } from "@/components/platform/ai-fab";
import { getDashboardData } from "@/lib/dashboard/actions";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let data = await getDashboardData();

  // If no Prisma user but Auth session exists, auto-create the user
  if (!data) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      // Create missing Prisma user from Auth session
      try {
        const meta = authUser.user_metadata;
        const email = authUser.email || "";

        // Check if a user with this email already exists (possibly with a different supabaseId)
        const existingByEmail = await prisma.user.findUnique({ where: { email } });

        if (existingByEmail && existingByEmail.supabaseId !== authUser.id) {
          await prisma.user.update({
            where: { email },
            data: {
              supabaseId: authUser.id,
              avatarUrl: meta?.avatar_url || existingByEmail.avatarUrl,
            },
          });
        } else {
          await prisma.user.upsert({
            where: { supabaseId: authUser.id },
            update: {},
            create: {
              supabaseId: authUser.id,
              email,
              firstName: meta?.first_name || meta?.full_name?.split(" ")[0] || "Utilisateur",
              lastName: meta?.last_name || meta?.full_name?.split(" ").slice(1).join(" ") || "",
              avatarUrl: meta?.avatar_url || null,
            },
          });
        }
        // Re-fetch dashboard data
        data = await getDashboardData();
      } catch (e) {
        console.error("Failed to auto-create user:", e);
      }
    }

    if (!data) {
      // Sign out to break the redirect loop, then redirect to login
      const supabase2 = await createClient();
      await supabase2.auth.signOut();
      redirect("/login");
    }
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
