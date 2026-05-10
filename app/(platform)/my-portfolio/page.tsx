import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  ExternalLink,
  Share2,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { getMyPortfolio } from "@/lib/deliverables/actions";
import { cn } from "@/lib/utils";

const SECTOR_COLORS: Record<string, string> = {
  finance: "text-blue-400 bg-blue-500/10",
  tech: "text-emerald-400 bg-emerald-500/10",
  generic: "text-amber-400 bg-amber-500/10",
};

export default async function PortfolioPage() {
  const items = await getMyPortfolio();
  if (!items) {
    redirect("/login");
  }

  const validated = items.filter((i) => i.validatedAt);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Award className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-widest font-bold">
            Portfolio
          </span>
        </div>
        <h1 className="font-headline text-2xl md:text-3xl font-black text-foreground">
          Tes preuves de compétence data
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Tous tes livrables validés. Rends-en un public et copie le lien dans ton
          profil LinkedIn pour montrer ta progression au monde.
        </p>
      </div>

      {validated.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-10 text-center ghost-border space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-headline text-lg font-bold text-foreground">
            Pas encore de livrable validé
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Pioche un brief, livre-le en 3 à 7 jours et reçois ta première
            correction IA. Premier livrable validé = première ligne LinkedIn.
          </p>
          <Link
            href="/deliverables"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
          >
            Voir le catalogue
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validated.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest p-5 rounded-2xl ghost-border space-y-3"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    SECTOR_COLORS[item.sector] ?? SECTOR_COLORS.generic
                  )}
                >
                  {item.sector}
                </span>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.score}/100
                </div>
              </div>

              <h3 className="font-headline text-base font-bold text-foreground">
                {item.title}
              </h3>

              {item.validatedAt && (
                <p className="text-[10px] text-muted-foreground">
                  Validé le{" "}
                  {new Date(item.validatedAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Link
                  href={`/deliverables/${item.briefSlug}`}
                  className="flex-1 text-center text-xs font-bold py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high"
                >
                  Voir le détail
                </Link>
                {item.isPublic && item.shareableSlug ? (
                  <a
                    href={`/portfolio/${item.shareableSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  >
                    <Share2 className="w-3 h-3" />
                    Public
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold py-1.5 px-3 rounded-lg bg-surface-container text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    Privé
                  </span>
                )}
                {item.externalUrl && (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold py-1.5 px-2 rounded-lg bg-surface-container hover:bg-surface-container-high"
                    aria-label="Lien externe"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
