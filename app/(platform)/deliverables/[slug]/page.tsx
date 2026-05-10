import { notFound } from "next/navigation";
import { getBriefBySlug } from "@/lib/deliverables/actions";
import { BriefDetailView } from "../_components/brief-detail-view";

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

  return <BriefDetailView brief={brief} error={error} />;
}
