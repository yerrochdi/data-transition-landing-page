import { notFound } from "next/navigation";
import { getBriefBySlug } from "@/lib/deliverables/actions";
import { gateBriefStart } from "@/lib/orchestrator/gates";
import { BriefDetailView } from "../_components/brief-detail-view";
import { LockedPage } from "@/components/platform/locked-page";

export default async function BriefDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;

  const brief = await getBriefBySlug(slug);
  if (!brief) {
    notFound();
  }

  // Gate ambitious briefs (difficulty ≥ 3) behind a first validated
  // deliverable. If the user already started this brief, let them
  // continue — only the entry is gated, not in-flight work.
  if (!brief.userDeliverable) {
    const gate = await gateBriefStart(brief.difficulty);
    if (!gate.ok) {
      return (
        <LockedPage
          title={brief.title}
          reason={gate.reason}
          requirement={gate.requirement}
          suggestedHref={gate.suggestedHref}
          suggestedCta={gate.suggestedCta}
        />
      );
    }
  }

  return <BriefDetailView brief={brief} error={error} />;
}
