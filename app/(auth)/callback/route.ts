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
        const email = data.user.email || "";

        // Check if a user with this email already exists (possibly with a different supabaseId)
        const existingByEmail = await prisma.user.findUnique({ where: { email } });

        if (existingByEmail && existingByEmail.supabaseId !== data.user.id) {
          // New Supabase account with same email — reset user to fresh state
          // Clean up old data first
          await prisma.journeyTaskProgress.deleteMany({
            where: { journeyProgress: { userId: existingByEmail.id } },
          });
          await prisma.journeyProgress.deleteMany({ where: { userId: existingByEmail.id } });
          await prisma.taskSession.deleteMany({ where: { userId: existingByEmail.id } });
          await prisma.activity.deleteMany({ where: { userId: existingByEmail.id } });
          await prisma.userProfile.deleteMany({ where: { userId: existingByEmail.id } });
          await prisma.onboardingResponse.deleteMany({ where: { userId: existingByEmail.id } });

          await prisma.user.update({
            where: { email },
            data: {
              supabaseId: data.user.id,
              lastActiveAt: new Date(),
              firstName: meta?.first_name || meta?.full_name?.split(" ")[0] || existingByEmail.firstName,
              lastName: meta?.last_name || meta?.full_name?.split(" ").slice(1).join(" ") || existingByEmail.lastName,
              avatarUrl: meta?.avatar_url || null,
              plan: "FREE",
              onboardingCompleted: false,
            },
          });
        } else {
          await prisma.user.upsert({
            where: { supabaseId: data.user.id },
            update: {
              email,
              lastActiveAt: new Date(),
            },
            create: {
              supabaseId: data.user.id,
              email,
              firstName: meta?.first_name || meta?.full_name?.split(" ")[0] || "",
              lastName: meta?.last_name || meta?.full_name?.split(" ").slice(1).join(" ") || "",
              avatarUrl: meta?.avatar_url || null,
            },
          });
        }
      } catch (e) {
        console.error("Failed to sync user:", e);
      }

      // Check if onboarding is completed
      const dbUser = await prisma.user.findUnique({
        where: { supabaseId: data.user.id },
        select: { onboardingCompleted: true },
      });

      // Pass chosen plan from signup (stored in user_metadata or URL param)
      const chosenPlan = searchParams.get("plan") || data.user.user_metadata?.chosen_plan;
      const planParam = chosenPlan === "pro" ? "?plan=pro" : "";

      if (dbUser && !dbUser.onboardingCompleted) {
        return NextResponse.redirect(`${origin}/onboarding${planParam}`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Auth error — redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
