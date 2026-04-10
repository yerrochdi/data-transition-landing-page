import { getJourneyData } from "@/lib/journey/actions";
import { getDashboardData } from "@/lib/dashboard/actions";
import { getPlanLimits } from "@/lib/billing/plans";
import { redirect } from "next/navigation";
import { JourneyView } from "./_components/journey-view";

export default async function JourneyPage() {
  const [data, dashData] = await Promise.all([
    getJourneyData(),
    getDashboardData(),
  ]);

  if (!data || !dashData) {
    redirect("/login");
  }

  const limits = getPlanLimits(dashData.user.plan);

  return (
    <JourneyView
      initialData={data}
      maxPhases={limits.journeyPhases}
      plan={dashData.user.plan}
    />
  );
}
