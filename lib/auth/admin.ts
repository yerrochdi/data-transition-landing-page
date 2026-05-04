import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return false;
  return getAdminEmails().includes(user.email.toLowerCase());
}

/**
 * Server-side admin gate. Redirects non-admins:
 *   - to /login if not authenticated
 *   - to /dashboard if authenticated but not in ADMIN_EMAILS
 *
 * Use at the top of every admin page or server action that touches
 * sensitive data.
 */
export async function requireAdmin(): Promise<{ email: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const allowed = getAdminEmails();
  if (allowed.length === 0) {
    // Fail closed: if ADMIN_EMAILS is not configured, nobody is admin.
    console.warn("[admin] ADMIN_EMAILS env var not set — no admin can access /admin");
    redirect("/dashboard");
  }

  if (!user.email || !allowed.includes(user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  return { email: user.email };
}
