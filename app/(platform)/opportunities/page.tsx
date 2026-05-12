import { getOpportunitiesData } from "@/lib/opportunities/actions";
import { gateOpportunities } from "@/lib/orchestrator/gates";
import { redirect } from "next/navigation";
import { OpportunitiesView } from "./_components/opportunities-view";
import { LockedPage } from "@/components/platform/locked-page";

export default async function OpportunitiesPage() {
  const [data, gate] = await Promise.all([
    getOpportunitiesData(),
    gateOpportunities(),
  ]);

  if (!data) {
    redirect("/login");
  }

  if (!gate.ok) {
    return (
      <LockedPage
        title="Opportunités matchées"
        reason={gate.reason}
        requirement={gate.requirement}
        suggestedHref={gate.suggestedHref}
        suggestedCta={gate.suggestedCta}
      />
    );
  }

  return <OpportunitiesView data={data} />;
}
