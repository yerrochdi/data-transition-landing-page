import { loadOnboardingProgress } from "@/lib/onboarding/actions";
import { OnboardingFlow } from "./_components/onboarding-flow";

export default async function OnboardingPage() {
  const { data } = await loadOnboardingProgress();

  return <OnboardingFlow initialData={data} />;
}
