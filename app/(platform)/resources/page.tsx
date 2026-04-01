import { getResourcesData } from "@/lib/resources/actions";
import { redirect } from "next/navigation";
import { ResourcesView } from "./_components/resources-view";

export default async function ResourcesPage() {
  const data = await getResourcesData();

  if (!data) {
    redirect("/login");
  }

  return <ResourcesView data={data} />;
}
