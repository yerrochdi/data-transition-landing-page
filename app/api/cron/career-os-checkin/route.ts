import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { careerOsCheckinEmail } from "@/lib/email/templates";

// Vercel Cron hits this on the 1st of every month at 09:00 UTC (see vercel.json).
// Sends a check-in email to every user who finished their onboarding —
// the rituel de revisit that keeps NextMove alive as a long-term Career OS
// rather than a one-shot transition tool.

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes — be generous, we may iterate over many users

const MONTH_LABELS: Record<number, string> = {
  0: "janvier",
  1: "février",
  2: "mars",
  3: "avril",
  4: "mai",
  5: "juin",
  6: "juillet",
  7: "août",
  8: "septembre",
  9: "octobre",
  10: "novembre",
  11: "décembre",
};

export async function GET(request: NextRequest) {
  // Vercel injects "Authorization: Bearer <CRON_SECRET>" on cron invocations.
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (expected && auth !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const monthLabel = MONTH_LABELS[now.getUTCMonth()];

  try {
    // Find every user who finished onboarding. We don't filter on
    // lastActiveAt — the whole point is to bring lapsed users back too.
    const users = await prisma.user.findMany({
      where: { onboardingCompleted: true },
      select: { email: true, firstName: true },
    });

    let sent = 0;
    let failed = 0;
    for (const u of users) {
      const html = careerOsCheckinEmail(u.firstName, monthLabel);
      const ok = await sendEmail(
        u.email,
        `Check-in NextMove — ${monthLabel}`,
        html
      );
      if (ok) sent += 1;
      else failed += 1;
    }

    return Response.json({
      ok: true,
      monthLabel,
      total: users.length,
      sent,
      failed,
    });
  } catch (err) {
    console.error("[cron] career-os-checkin failed:", err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
