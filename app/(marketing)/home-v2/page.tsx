import { BackgroundPaths } from "./_components/background-paths";
import { AnxietyBento } from "./_components/anxiety-bento";
import { ThreePaths } from "./_components/three-paths";
import { CareerOsSteps } from "./_components/career-os-steps";
import { ProfileCarousel } from "./_components/profile-carousel";
import { BilanShowcase } from "./_components/bilan-showcase";
import { FoundingSection } from "./_components/founding-section";
import { FaqSection } from "./_components/faq-section";
import { getFoundingPlacesStatus } from "@/lib/founding-members/places";
import { getLandingPhase } from "@/lib/landing/phase";

// La page lit le statut des places Founding en DB à chaque requête —
// on force le rendu dynamique pour éviter que Next tente un pré-rendu
// statique au build (où la DB n'est pas joignable).
export const dynamic = "force-dynamic";

/**
 * Landing v2 — work-in-progress.
 *
 * Sections are added one by one, each validated by the founder.
 * When the whole page is approved, we swap it with /home in a single
 * commit so the live landing is replaced atomically.
 *
 * Public URL: https://nextmove.sh/home-v2
 */
export default async function HomeV2Page() {
  // Server-side fetch of Founding program slot status (count of ACCEPTED
  // applications). Read by AnxietyBento → FoundingPlacesGrid for the
  // public-facing "X/30 places restantes" with hover tooltips.
  const foundingPlaces = await getFoundingPlacesStatus();
  const phase = getLandingPhase(foundingPlaces);

  return (
    <main className="bg-background text-foreground min-h-screen">
      <BackgroundPaths phase={phase} />
      <AnxietyBento foundingPlaces={foundingPlaces} />
      <ThreePaths />
      <CareerOsSteps />
      <ProfileCarousel />
      <BilanShowcase />
      <FoundingSection foundingPlaces={foundingPlaces} />
      <FaqSection />
    </main>
  );
}
