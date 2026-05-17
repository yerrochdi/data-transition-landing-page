import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getPublicBilan } from "@/lib/career-os/actions";
import { CareerOsBilan } from "@/components/career-os/bilan-renderer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPublicBilan(slug);
  if (!item) return { title: "Bilan introuvable | NextMove" };
  const fullName = `${item.authorFirstName} ${item.authorLastName.slice(0, 1)}.`;
  return {
    title: `Bilan Career OS — ${fullName} | NextMove`,
    description: `${fullName}, ${item.currentRole ?? "cadre"} → ${item.targetRole ?? "next move data"}. Bilan personnel rédigé par NextMove.`,
  };
}

export default async function PublicBilanPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPublicBilan(slug);
  if (!item) notFound();

  const fullName = `${item.authorFirstName} ${item.authorLastName.slice(0, 1)}.`;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top branding */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-primary hover:underline">
            NextMove
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Bilan Career OS · partagé publiquement
          </span>
        </div>

        {/* Author chip */}
        <div className="bg-surface-container-lowest border border-border/30 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {item.authorFirstName.slice(0, 1)}
          </div>
          <div className="flex-1">
            <p className="font-headline text-base font-bold text-foreground">
              Bilan de {fullName}
            </p>
            <p className="text-xs text-muted-foreground">
              {item.currentRole ?? "Cadre"}
              {item.targetRole ? ` → ${item.targetRole}` : ""}
              {" · "}
              {new Date(item.generatedAt).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* The bilan itself */}
        <CareerOsBilan content={item.aiSummary} />

        {/* CTA */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-bold">
              Construis le tien
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Cadre 35-50 ans, tu veux ton propre Career OS — un bilan personnel
            qui évolue avec toi ?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
          >
            Découvrir NextMove
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
