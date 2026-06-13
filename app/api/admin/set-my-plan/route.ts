import { isAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { Plan } from "@/lib/generated/prisma/enums";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Test-only endpoint for the admin to flip their own plan from the browser.
 *
 * Usage:
 *   GET /api/admin/set-my-plan?plan=PREMIUM
 *   GET /api/admin/set-my-plan?plan=BOOST
 *   GET /api/admin/set-my-plan?plan=FOUNDING
 *   GET /api/admin/set-my-plan?plan=FREE
 *   GET /api/admin/set-my-plan?sprint=30      → grants a 30-day Sprint
 *   GET /api/admin/set-my-plan?sprint=clear   → clears sprintExpiresAt
 *
 * Combine: ?plan=FREE&sprint=30 is the typical "Sprint pass on top of Free" test.
 */
const VALID_PLANS = ["FREE", "BOOST", "PREMIUM", "FOUNDING", "ENTERPRISE"] as const;

export async function GET(request: NextRequest) {
  // Double barrière (défense en profondeur) :
  // 1. isAdmin() — l'email doit être dans ADMIN_EMAILS (fail-closed).
  // 2. Un secret partagé ADMIN_ACTION_SECRET passé en ?key=... — empêche
  //    qu'une simple fuite de session admin suffise à muter un plan.
  // Si ADMIN_ACTION_SECRET n'est pas configuré, l'endpoint est désactivé
  // (fail-closed) : c'est un outil de test, son absence = pas d'accès.
  const adminSecret = process.env.ADMIN_ACTION_SECRET;
  const providedKey = new URL(request.url).searchParams.get("key");
  if (!adminSecret || providedKey !== adminSecret) {
    return Response.json(
      { ok: false, error: "Forbidden" },
      { status: 403 }
    );
  }
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

  const url = new URL(request.url);
  const planParam = url.searchParams.get("plan");
  const sprintParam = url.searchParams.get("sprint");

  if (!planParam && !sprintParam) {
    return Response.json(
      {
        ok: false,
        error:
          "Provide ?plan=FREE|BOOST|PREMIUM|FOUNDING|ENTERPRISE and/or ?sprint=30 (days) | ?sprint=clear",
      },
      { status: 400 }
    );
  }

  const data: { plan?: Plan; sprintExpiresAt?: Date | null } = {};

  if (planParam) {
    const upper = planParam.toUpperCase();
    if (!VALID_PLANS.includes(upper as (typeof VALID_PLANS)[number])) {
      return Response.json(
        { ok: false, error: `Invalid plan. Must be one of ${VALID_PLANS.join(", ")}` },
        { status: 400 }
      );
    }
    data.plan = upper as Plan;
  }

  if (sprintParam) {
    if (sprintParam === "clear") {
      data.sprintExpiresAt = null;
    } else {
      const days = parseInt(sprintParam, 10);
      if (Number.isNaN(days) || days < 1 || days > 365) {
        return Response.json(
          { ok: false, error: "sprint must be 'clear' or an integer between 1 and 365" },
          { status: 400 }
        );
      }
      const expires = new Date();
      expires.setDate(expires.getDate() + days);
      data.sprintExpiresAt = expires;
    }
  }

  const updated = await prisma.user.update({
    where: { supabaseId: authUser.id },
    data,
    select: { email: true, plan: true, sprintExpiresAt: true },
  });

  return Response.json({
    ok: true,
    user: updated,
    note: "Hard-refresh the dashboard (Cmd+Shift+R) to see the new plan applied.",
  });
}
