"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const chosenPlan = formData.get("chosenPlan") as string | null;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const callbackUrl = chosenPlan === "pro"
    ? `${siteUrl}/callback?plan=pro`
    : `${siteUrl}/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, chosen_plan: chosenPlan || "free" },
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is required, user won't have a session yet
  if (data.user?.identities?.length === 0) {
    return { error: "Un compte existe déjà avec cet email" };
  }

  // Create user in our database
  if (data.user) {
    try {
      // Check if a user with this email already exists (possibly with a different supabaseId)
      const existingByEmail = await prisma.user.findUnique({ where: { email } });

      if (existingByEmail && existingByEmail.supabaseId !== data.user.id) {
        // New Supabase account with same email — reset to fresh state
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
            plan: "FREE",
            onboardingCompleted: false,
          },
        });
      } else {
        await prisma.user.upsert({
          where: { supabaseId: data.user.id },
          update: {},
          create: {
            supabaseId: data.user.id,
            email,
            firstName,
            lastName,
          },
        });
      }
    } catch (e) {
      console.error("Failed to create user in DB:", e);
    }
  }

  // If no session (email confirmation required), show success message
  if (!data.session) {
    return { success: true, confirmEmail: true };
  }

  redirect("/onboarding");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Google OAuth n'est pas configuré. Activez le provider Google dans Supabase Dashboard > Authentication > Providers." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/home");
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
