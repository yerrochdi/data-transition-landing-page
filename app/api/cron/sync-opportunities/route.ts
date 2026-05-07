import { NextRequest } from "next/server";
import { syncFranceTravailOffers } from "@/lib/opportunities/sync";

// Vercel Cron hits this every Monday at 04:00 UTC (see vercel.json).
// Vercel signs cron requests with the CRON_SECRET env var; we verify it
// here so manual / hostile callers can't trigger the sync.

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes — France Travail can be slow

export async function GET(request: NextRequest) {
  // Vercel injects "Authorization: Bearer <CRON_SECRET>" on cron invocations.
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (expected && auth !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncFranceTravailOffers();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron] sync-opportunities failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
