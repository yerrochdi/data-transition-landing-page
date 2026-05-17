import { HeroNarrative } from "./_components/hero-narrative";

/**
 * Landing v2 — work-in-progress.
 *
 * Sections are added one by one, each validated by the founder.
 * When the whole page is approved, we swap it with /home in a single
 * commit so the live landing is replaced atomically.
 *
 * Public URL: https://nextmove.sh/home-v2
 */
export default function HomeV2Page() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <HeroNarrative />
    </main>
  );
}
