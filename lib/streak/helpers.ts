import { prisma } from "@/lib/db";

/**
 * Calculate the user's streak by counting consecutive days with activity.
 * Also updates lastActiveAt to now.
 * Returns the streak count.
 */
export async function updateStreak(userId: string): Promise<number> {
  const now = new Date();

  // Update lastActiveAt
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: now },
  }).catch(() => {});

  // Get distinct active dates from activities (last 60 days max)
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const activities = await prisma.activity.findMany({
    where: {
      userId,
      createdAt: { gte: sixtyDaysAgo },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (activities.length === 0) return 1; // First visit today counts as 1

  // Extract unique dates (YYYY-MM-DD)
  const uniqueDates = new Set<string>();
  for (const a of activities) {
    const d = a.createdAt;
    uniqueDates.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }

  // Add today
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  uniqueDates.add(todayStr);

  // Sort dates descending and count consecutive days from today
  const sortedDates = Array.from(uniqueDates).sort().reverse();
  let streak = 0;
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const expectedDate = new Date(current);
    expectedDate.setDate(expectedDate.getDate() - streak);

    if (date.getTime() === expectedDate.getTime()) {
      streak++;
    } else if (date.getTime() < expectedDate.getTime()) {
      break; // Gap found
    }
  }

  return Math.max(streak, 1);
}
