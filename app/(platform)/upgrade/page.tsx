import { getDashboardData } from "@/lib/dashboard/actions";
import { redirect } from "next/navigation";
import { UpgradeView } from "./_components/upgrade-view";

export default async function UpgradePage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  return (
    <UpgradeView
      currentPlan={data.user.plan}
      userName={data.user.firstName}
    />
  );
}
