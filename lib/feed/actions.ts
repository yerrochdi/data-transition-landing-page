"use server";

import { prisma } from "@/lib/db";

export interface FeedItem {
  id: string;
  userName: string;
  userInitial: string;
  type: string;
  title: string;
  description: string | null;
  icon: string | null;
  createdAt: string; // ISO string for serialization
}

export async function getCommunityFeed(limit = 30): Promise<FeedItem[]> {
  const activities = await prisma.activity.findMany({
    where: {
      type: {
        in: ["TASK_COMPLETED", "PHASE_COMPLETED", "MILESTONE", "ONBOARDING_STEP"],
      },
    },
    include: {
      user: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return activities.map((a) => ({
    id: a.id,
    userName: a.user.firstName,
    userInitial: a.user.firstName.charAt(0).toUpperCase(),
    type: a.type,
    title: a.title,
    description: a.description,
    icon: a.icon,
    createdAt: a.createdAt.toISOString(),
  }));
}
