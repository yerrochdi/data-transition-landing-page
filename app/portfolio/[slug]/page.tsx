import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { getPublicDeliverable } from "@/lib/deliverables/actions";
import { cn } from "@/lib/utils";

const SECTOR_LABEL: Record<string, string> = {
  finance: "Finance / Assurance",
  tech: "Tech / Conseil",
  generic: "Tous secteurs",
};

export default async function PublicDeliverablePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPublicDeliverable(slug);
  if (!item) notFound();

  const fullName = `${item.authorFirstName} ${item.authorLastName.slice(0, 1)}.`;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top branding */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-bold text-primary hover:underline"
          >
            NextMove
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Livrable publié
          </span>
        </div>

        {/* Hero */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 ghost-border space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {SECTOR_LABEL[item.sector] ?? "Livrable"}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Niveau {item.difficulty}/5 · {item.estimatedDays} jours
            </span>
          </div>

          <h1 className="font-headline text-3xl md:text-4xl font-black text-foreground">
            {item.title}
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            {item.shortDescription}
          </p>

          {/* Author + score */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50 flex-wrap gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Réalisé par
              </p>
              <p className="font-headline text-base font-bold text-foreground">
                {fullName}
              </p>
              {item.validatedAt && (
                <p className="text-[10px] text-muted-foreground">
                  {new Date(item.validatedAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl",
                item.score >= 70
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              )}
            >
              <Award className="w-4 h-4" />
              <div>
                <div className="font-headline text-xl font-black leading-none">
                  {item.score}/100
                </div>
                <div className="text-[9px] uppercase tracking-widest leading-none mt-0.5">
                  Score IA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* External link */}
        {item.externalUrl && (
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-primary/5 border border-primary/20 hover:border-primary/40 rounded-2xl p-5 transition-all"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
                  Voir le livrable complet
                </p>
                <p className="text-sm text-foreground break-all">
                  {item.externalUrl}
                </p>
              </div>
            </div>
          </a>
        )}

        {/* Strengths from AI review */}
        {item.strengths.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 ghost-border space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary">
                Évaluation IA — Points forts
              </span>
            </div>
            <ul className="space-y-2">
              {item.strengths.map((s, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        {item.content && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 ghost-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">
              Description / démarche
            </p>
            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-body">
              {item.content}
            </pre>
          </div>
        )}

        {/* Footer CTA */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Cadre 35-50 ans, tu veux toi aussi construire un portfolio data ?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
          >
            Découvrir NextMove
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getPublicDeliverable(slug);
  if (!item) return { title: "Livrable introuvable | NextMove" };
  const fullName = `${item.authorFirstName} ${item.authorLastName.slice(0, 1)}.`;
  return {
    title: `${item.title} — par ${fullName} | NextMove Portfolio`,
    description: item.shortDescription,
  };
}
