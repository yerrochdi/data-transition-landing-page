import { prisma } from "@/lib/db/prisma";
import { TOTAL_SEATS } from "@/lib/founding-members/actions";
import { FoundingMembersAdminView } from "./_components/admin-view";

export const dynamic = "force-dynamic";

export default async function AdminFoundingMembersPage() {
  const [applications, accepted] = await Promise.all([
    prisma.foundingMemberApplication.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.foundingMemberApplication.count({ where: { status: "ACCEPTED" } }),
  ]);

  return (
    <FoundingMembersAdminView
      applications={applications.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        reviewedAt: a.reviewedAt?.toISOString() ?? null,
      }))}
      stats={{
        total: applications.length,
        pending: applications.filter((a) => a.status === "PENDING").length,
        accepted,
        rejected: applications.filter((a) => a.status === "REJECTED").length,
        totalSeats: TOTAL_SEATS,
        seatsRemaining: Math.max(0, TOTAL_SEATS - accepted),
      }}
    />
  );
}
