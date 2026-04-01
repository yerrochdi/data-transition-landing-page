import { getAdminData } from "@/lib/admin/actions";
import { AdminView } from "./_components/admin-view";

export default async function AdminPage() {
  const data = await getAdminData();
  return <AdminView data={data} />;
}
