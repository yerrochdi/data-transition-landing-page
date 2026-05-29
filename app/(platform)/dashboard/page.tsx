import { getDashboardData } from "@/lib/dashboard/actions";
import { redirect } from "next/navigation";
import { DashboardView } from "./_components/dashboard-view";
import { UpgradeSuccess } from "./_components/upgrade-success";
import { getNextActionForCurrentUser } from "@/lib/orchestrator/actions";
import {
  getCareerOsEnrichment,
  getBilanSharingState,
} from "@/lib/career-os/actions";
import { getPendingFoundingActivation } from "@/lib/founding-members/actions";
import { FoundingActivationBanner } from "@/components/billing/founding-activation-banner";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const [data, nextAction, careerOs, bilanSharing, foundingPending] =
    await Promise.all([
      getDashboardData(),
      getNextActionForCurrentUser(),
      getCareerOsEnrichment(),
      getBilanSharingState(),
      getPendingFoundingActivation(),
    ]);

  if (!data) {
    redirect("/login");
  }

  const params = await searchParams;
  const justUpgraded = params.upgraded === "true";

  return (
    <>
      {justUpgraded && <UpgradeSuccess />}
      {/* Bannière de rappel : la candidate Founding n'a pas finalisé son
          paiement (ex: a fermé Stripe Checkout). Disparaît automatiquement
          dès que le webhook Stripe marque le compte comme FOUNDING. */}
      {foundingPending && (
        <FoundingActivationBanner
          activationToken={foundingPending.activationToken}
          firstName={foundingPending.firstName}
        />
      )}
      <DashboardView
        data={data}
        nextAction={nextAction}
        careerOs={careerOs}
        bilanSharing={bilanSharing}
      />
    </>
  );
}
