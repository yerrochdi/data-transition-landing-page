import { getOpportunitiesData } from "@/lib/opportunities/actions";
import { redirect } from "next/navigation";
import { OpportunitiesView } from "./_components/opportunities-view";

export default async function OpportunitiesPage() {
  const data = await getOpportunitiesData();

  if (!data) {
    redirect("/login");
  }

  return <OpportunitiesView data={data} />;
}
