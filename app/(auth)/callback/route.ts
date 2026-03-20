import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sync user to our database
      try {
        const meta = data.user.user_metadata;
        await prisma.user.upsert({
          where: { supabaseId: data.user.id },
          update: {
            email: data.user.email || "",
            lastActiveAt: new Date(),
          },
          create: {
            supabaseId: data.user.id,
            email: data.user.email || "",
            firstName: meta?.first_name || meta?.full_name?.split(" ")[0] || "",
            lastName: meta?.last_name || meta?.full_name?.split(" ").slice(1).join(" ") || "",
            avatarUrl: meta?.avatar_url || null,
          },
        });
      } catch (e) {
        console.error("Failed to sync user:", e);
      }

      // Check if onboarding is completed
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: data.user.id },
        select: { onboardingCompleted: true },
      });

      if (dbUser && !dbUser.onboardingCompleted) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
