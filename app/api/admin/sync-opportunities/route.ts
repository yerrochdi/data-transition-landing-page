import { syncFranceTravailOffers } from "@/lib/opportunities/sync";
import { isAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Manual trigger of the France Travail sync. Restricted to admins so
 * a logged-in non-admin can't rate-limit our quota by spamming it.
 */
export async function POST() {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await syncFranceTravailOffers();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[admin] sync-opportunities failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
