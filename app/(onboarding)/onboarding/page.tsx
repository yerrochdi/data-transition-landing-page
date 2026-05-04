import { loadOnboardingProgress } from "@/lib/onboarding/actions";
import { OnboardingFlow } from "./_components/onboarding-flow";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { data } = await loadOnboardingProgress();
  const params = await searchParams;
  const validPlans = ["boost", "pro", "sprint"] as const;
  const chosenPlan = validPlans.includes(params.plan as typeof validPlans[number])
    ? (params.plan as "boost" | "pro" | "sprint")
    : "free";

  return <OnboardingFlow initialData={data} chosenPlan={chosenPlan} />;
}
