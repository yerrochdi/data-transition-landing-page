import { getDashboardData } from "@/lib/dashboard/actions";
import { redirect } from "next/navigation";
import { DashboardView } from "./_components/dashboard-view";
import { UpgradeSuccess } from "./_components/upgrade-success";
import { getNextActionForCurrentUser } from "@/lib/orchestrator/actions";
import {
  getCareerOsEnrichment,
  getBilanSharingState,
} from "@/lib/career-os/actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const [data, nextAction, careerOs, bilanSharing] = await Promise.all([
    getDashboardData(),
    getNextActionForCurrentUser(),
    getCareerOsEnrichment(),
    getBilanSharingState(),
  ]);

  if (!data) {
    redirect("/login");
  }

  const params = await searchParams;
  const justUpgraded = params.upgraded === "true";

  return (
    <>
      {justUpgraded && <UpgradeSuccess />}
      <DashboardView
        data={data}
        nextAction={nextAction}
        careerOs={careerOs}
        bilanSharing={bilanSharing}
      />
    </>
  );
}
