import { computeMatchesForUser } from "@/lib/opportunities/scoring";
import { isAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Force-recompute opportunity matches for the *current* admin user.
 * Useful after changing the scoring prompt to validate results without
 * waiting for the 7-day staleness window.
 */
export async function POST() {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return Response.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    select: { id: true },
  });
  if (!dbUser) {
    return Response.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  // Drop existing matches for this user so computeMatchesForUser refreshes them all.
  await prisma.opportunityMatch.deleteMany({ where: { userId: dbUser.id } });

  try {
    const result = await computeMatchesForUser(dbUser.id);
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[admin] recompute-matches failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
