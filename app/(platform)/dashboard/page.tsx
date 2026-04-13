import { getDashboardData } from "@/lib/dashboard/actions";
import { redirect } from "next/navigation";
import { DashboardView } from "./_components/dashboard-view";
import { UpgradeSuccess } from "./_components/upgrade-success";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  const params = await searchParams;
  const justUpgraded = params.upgraded === "true";

  return (
    <>
      {justUpgraded && <UpgradeSuccess />}
      <DashboardView data={data} />
    </>
  );
}
