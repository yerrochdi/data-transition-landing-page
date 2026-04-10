import { loadOnboardingProgress } from "@/lib/onboarding/actions";
import { OnboardingFlow } from "./_components/onboarding-flow";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { data } = await loadOnboardingProgress();
  const params = await searchParams;
  const chosenPlan = params.plan === "pro" ? "pro" : "free";

  return <OnboardingFlow initialData={data} chosenPlan={chosenPlan} />;
}
