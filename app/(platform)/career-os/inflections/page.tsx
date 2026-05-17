import { redirect } from "next/navigation";
import { getCareerOsEnrichment } from "@/lib/career-os/actions";
import { InflectionsForm } from "./_components/inflections-form";

export const metadata = {
  title: "Trajectoire longue · Career OS",
};

export default async function InflectionsPage() {
  const data = await getCareerOsEnrichment();
  if (!data) {
    redirect("/login");
  }

  return <InflectionsForm initial={data.inflections} />;
}
