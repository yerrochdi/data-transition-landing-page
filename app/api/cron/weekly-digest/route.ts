import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { weeklyDigestEmail } from "@/lib/email/templates";
import { getReadinessTrend } from "@/lib/dashboard/readiness";
import { refreshNextAction } from "@/lib/orchestrator/actions";
import { renderAction } from "@/lib/orchestrator/templates";

/**
 * Sprint 2 (QW-C) — LE POINT DU LUNDI.
 *
 * Cron Vercel chaque lundi 06:00 UTC (≈ 7-8h Paris, cf. vercel.json).
 * Pour chaque utilisateur ayant terminé l'onboarding :
 *   - delta de readiness sur 7 jours (readiness vivante, QW-A)
 *   - nombre d'événements de la semaine (journal d'événements)
 *   - prochaine action recommandée (orchestrateur existant)
 *   - meilleure opportunité matchée (matching existant)
 *
 * MODE CONCIERGE (bêta) : si DIGEST_CONCIERGE_EMAIL est défini, une copie
 * de chaque digest est envoyée à cette adresse — la fondatrice peut ainsi
 * suivre ce que reçoit chaque membre et compléter d'un message personnel
 * (l'accountability humaine double l'efficacité — cf. audit/06, Mohr 2011).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const conciergeEmail = process.env.DIGEST_CONCIERGE_EMAIL || null;

  try {
    const users = await prisma.user.findMany({
      where: { onboardingCompleted: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        profile: { select: { readinessScore: true } },
      },
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    let sent = 0;
    let failed = 0;

    for (const u of users) {
      try {
        // 1. Tendance readiness (QW-A)
        const trend = await getReadinessTrend(u.id);

        // 2. Événements de la semaine (hors appels IA techniques)
        const weekEvents = await prisma.activity.count({
          where: {
            userId: u.id,
            createdAt: { gte: weekAgo },
            type: { not: "AGENT_INTERACTION" },
          },
        });

        // 3. Prochaine action recommandée (orchestrateur)
        let nextAction: {
          title: string;
          why: string;
          href: string;
          estimatedMinutes: number;
        } | null = null;
        try {
          const row = await refreshNextAction(u.id);
          const rendered = renderAction(
            row.templateKey,
            (row.metadata as Record<string, string> | null) ?? null
          );
          nextAction = {
            title: rendered.title,
            why: rendered.why,
            href: rendered.href,
            estimatedMinutes: rendered.estimatedMinutes,
          };
        } catch {
          /* orchestrateur indisponible — le digest part sans action */
        }

        // 4. Meilleure opportunité matchée
        const match = await prisma.opportunityMatch.findFirst({
          where: { userId: u.id, matchScore: { gte: 60 } },
          orderBy: { matchScore: "desc" },
          select: {
            matchScore: true,
            opportunity: { select: { title: true, company: true } },
          },
        });

        // 5. Engagements pris auprès du coach (14 jours, 3 max)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const commitmentRows = await prisma.activity.findMany({
          where: {
            userId: u.id,
            type: "COMMITMENT_MADE",
            createdAt: { gte: twoWeeksAgo },
          },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { title: true },
        });

        const html = weeklyDigestEmail({
          firstName: u.firstName,
          readinessScore: u.profile?.readinessScore ?? 0,
          weeklyDelta: trend.weeklyDelta,
          weekEvents,
          nextAction,
          topOpportunity: match
            ? {
                title: match.opportunity.title,
                company: match.opportunity.company ?? "Entreprise non précisée",
                matchScore: match.matchScore,
              }
            : null,
          commitments: commitmentRows.map((c) => c.title),
        });

        const subject =
          trend.weeklyDelta > 0
            ? `Point du Lundi — +${trend.weeklyDelta} pts cette semaine`
            : "Votre Point du Lundi NextMove";

        const ok = await sendEmail(u.email, subject, html);
        if (ok) sent += 1;
        else failed += 1;

        // Mode concierge : copie à la fondatrice pour suivi bêta
        if (conciergeEmail && ok) {
          await sendEmail(
            conciergeEmail,
            `[COPIE ${u.email}] ${subject}`,
            html
          ).catch(() => {});
        }
      } catch (err) {
        console.error(`[cron] weekly-digest failed for ${u.email}:`, err);
        failed += 1;
      }
    }

    return Response.json({ ok: true, total: users.length, sent, failed });
  } catch (err) {
    console.error("[cron] weekly-digest failed:", err);
    return Response.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
