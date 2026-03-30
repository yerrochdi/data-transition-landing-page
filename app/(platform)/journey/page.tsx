import { getJourneyData } from "@/lib/journey/actions";
import { redirect } from "next/navigation";
import { JourneyView } from "./_components/journey-view";

export default async function JourneyPage() {
  const data = await getJourneyData();

  if (!data) {
    redirect("/login");
  }

  return <JourneyView initialData={data} />;
}
