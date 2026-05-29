"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getCurrentEnvUrl } from "@/lib/utils/env-url";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const chosenPlan = formData.get("chosenPlan") as string | null;
  const next = formData.get("next") as string | null;

  // Utilise l'URL du déploiement courant pour que le mail de confirmation
  // ramène l'utilisateur sur le même environnement (prod / Preview / local).
  const siteUrl = getCurrentEnvUrl();

  // Si l'utilisateur signe up depuis /founding-activate?token=XYZ (via
  // next=/founding-activate?token=XYZ), on extrait le token pour le stocker
  // dans le user_metadata Supabase. Le callback post-confirmation pourra
  // alors rediriger vers /founding-activate?token=XYZ au lieu de
  // /onboarding (sinon l'utilisateur saute l'étape de paiement et fait
  // l'onboarding en FREE alors qu'elle devait être en FOUNDING).
  const foundingTokenMatch = next?.match(/\/founding-activate\?token=([^&]+)/);
  const foundingToken = foundingTokenMatch ? foundingTokenMatch[1] : null;

  const validPaidPlans = ["boost", "pro", "sprint"];
  // Le callback URL préserve aussi le `next` (encodé) pour OAuth Google
  // qui ne passe pas par signUp() — c'est lu par /callback/route.ts.
  const callbackParams = new URLSearchParams();
  if (validPaidPlans.includes(chosenPlan ?? "")) {
    callbackParams.set("plan", chosenPlan!);
  }
  if (next && next.startsWith("/")) {
    callbackParams.set("next", next);
  }
  const callbackQuery = callbackParams.toString();
  const callbackUrl = callbackQuery
    ? `${siteUrl}/callback?${callbackQuery}`
    : `${siteUrl}/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        chosen_plan: chosenPlan || "free",
        // Stocker dans le metadata Supabase pour récupération côté callback
        // même si Google OAuth est utilisé (où on n'a pas accès au formData).
        ...(foundingToken ? { founding_token: foundingToken } : {}),
      },
      emailRedirectTo: callbackUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase ne renvoie PAS d'erreur quand l'email existe déjà (anti-énumération) :
  // il renvoie un user avec `identities` vide. On le détecte ici et on renvoie un
  // signal structuré pour que la page signup redirige proprement vers /login
  // (au lieu d'afficher une erreur brute que l'utilisateur ne comprend pas).
  if (data.user?.identities?.length === 0) {
    return { accountExists: true as const, email };
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

  // Honor `next` if it was passed (typically from /founding-activate),
  // otherwise default to onboarding. `next` est déjà extrait en début de
  // fonction (cf. signature pour le stockage du founding token).
  redirect(next && next.startsWith("/") ? next : "/onboarding");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next") as string | null;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Honor `next` if it was passed (typically from /founding-activate),
  // otherwise default to dashboard.
  redirect(next && next.startsWith("/") ? next : "/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  // URL du déploiement courant pour que Google OAuth ramène l'utilisateur
  // sur le bon environnement (prod / Preview / local).
  const siteUrl = getCurrentEnvUrl();

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
