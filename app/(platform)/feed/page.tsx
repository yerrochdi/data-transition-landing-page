import { getDashboardData } from "@/lib/dashboard/actions";
import { getCommunityFeed } from "@/lib/feed/actions";
import { getPlanLimits } from "@/lib/billing/plans";
import { redirect } from "next/navigation";
import { FeedView } from "./_components/feed-view";
import { FeedLockedView } from "./_components/feed-locked-view";

export default async function FeedPage() {
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  const limits = getPlanLimits(data.user.plan);

  // FREE users see a teaser blurred view encouraging upgrade
  if (!limits.hasFeedAccess) {
    return <FeedLockedView userName={data.user.firstName} />;
  }

  const feed = await getCommunityFeed();
  return <FeedView feed={feed} userName={data.user.firstName} />;
}
