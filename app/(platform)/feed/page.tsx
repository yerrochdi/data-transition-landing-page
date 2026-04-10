import { getDashboardData } from "@/lib/dashboard/actions";
import { getCommunityFeed } from "@/lib/feed/actions";
import { redirect } from "next/navigation";
import { FeedView } from "./_components/feed-view";

export default async function FeedPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  const feed = await getCommunityFeed();

  return <FeedView feed={feed} userName={data.user.firstName} />;
}
