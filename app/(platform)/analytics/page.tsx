import { getAnalyticsData } from "@/lib/analytics/actions";
import { redirect } from "next/navigation";
import { AnalyticsView } from "./_components/analytics-view";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  if (!data) {
    redirect("/login");
  }

  return <AnalyticsView data={data} />;
}
