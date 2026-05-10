import { redirect } from "next/navigation";
import { getCatalogueData } from "@/lib/deliverables/actions";
import { CatalogueView } from "./_components/catalogue-view";

export default async function DeliverablesPage() {
  const data = await getCatalogueData();
  if (!data) {
    redirect("/login");
  }
  return <CatalogueView data={data} />;
}
