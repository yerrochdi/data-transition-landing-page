import { getDashboardData } from "@/lib/dashboard/actions";
import { redirect } from "next/navigation";
import { DashboardView } from "./_components/dashboard-view";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  return <DashboardView data={data} />;
}
