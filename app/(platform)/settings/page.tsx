import { getSettingsData } from "@/lib/settings/actions";
import { redirect } from "next/navigation";
import { SettingsView } from "./_components/settings-view";

export default async function SettingsPage() {
  const data = await getSettingsData();

  if (!data) {
    redirect("/login");
  }

  return <SettingsView data={data} />;
}
