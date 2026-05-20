"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, X, Crown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section 3 — "Les 2 fausses pistes + la 3e voie".
 *
 * Layout 3 colonnes type pricing-table : les 2 mauvaises options
 * (ignorer / se reconvertir junior) en gris atténué, la 3e (NextMove)
 * verte lumineuse surélevée avec badge "Recommandé". L'œil va direct
 * au gagnant. Pattern conversion classique et lisible.
 */

type Path = {
  badge: string;
  title: string;
  subtitle: string;
  points: { label: string; ok: boolean }[];
  highlight?: boolean;
  cta?: { label: string; href: string };
};

const paths: Path[] = [
  {
    badge: "Option 1",
    title: "Ignorer la vague",
    subtitle: "« Ça ne me concerne pas, je suis trop senior. »",
    points: [
      { label: "Aucun effort à court terme", ok: true },
      { label: "Déclassement progressif et silencieux", ok: false },
      { label: "Obsolescence en 24-36 mois", ok: false },
      { label: "Vous subissez au lieu de choisir", ok: false },
    ],
  },
  {
    badge: "Option 2",
    title: "Redevenir junior",
    subtitle: "« Je reprends un bootcamp data de zéro. »",
    points: [
      { label: "Vous apprenez la technique", ok: true },
      { label: "Salaire divisé par 2 au départ", ok: false },
      { label: "ROI sur 2-3 ans minimum", ok: false },
      { label: "15 ans d'expérience jetés à la poubelle", ok: false },
    ],
  },
  {
    badge: "La 3e voie",
    title: "NextMove",
    subtitle: "Capitaliser sur votre expérience, y greffer la data.",
    highlight: true,
    points: [
      { label: "Vous gardez votre séniorité et votre salaire", ok: true },
      { label: "Vous devenez le cadre qui maîtrise la data", ok: true },
      { label: "Premiers résultats visibles en quelques semaines", ok: true },
      { label: "Votre expérience devient votre avantage", ok: true },
    ],
    cta: { label: "Découvrir la 3e voie", href: "/founding-members" },
  },
];

export function ThreePaths() {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="max-w-3xl mb-12 md:mb-16"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Face à l&apos;IA, vos options
            </span>
          </div>
          <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground text-balance">
            On vous a vendu 2 mauvaises options.
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground/90 leading-relaxed text-pretty max-w-2xl">
            Subir ou tout recommencer. Aucune des deux ne respecte ce que vous
            avez construit en 15 ans.{" "}
            <span className="text-foreground font-semibold">
              Il en existe une troisième.
            </span>
          </p>
        </motion.div>

        {/* 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {paths.map((path, i) => (
            <PathCard key={path.title} path={path} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PathCard({ path, index }: { path: Path; index: number }) {
  const { badge, title, subtitle, points, highlight, cta } = path;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={cn(
        "relative rounded-2xl p-6 md:p-7 flex flex-col",
        highlight
          ? "bg-gradient-to-b from-primary/10 to-surface-container-lowest border-2 border-primary/40 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.4)] md:-translate-y-4"
          : "bg-surface-container-lowest border border-border/40 opacity-90"
      )}
    >
      {/* Badge "Recommandé" pour la card highlight */}
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/30">
            <Crown className="w-3 h-3" />
            Recommandé
          </span>
        </div>
      )}

      {/* Badge option */}
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-[0.2em] mb-3",
          highlight ? "text-primary" : "text-muted-foreground/60"
        )}
      >
        {badge}
      </span>

      {/* Titre */}
      <h3
        className={cn(
          "font-headline text-2xl font-extrabold mb-2 leading-tight",
          highlight ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {title}
      </h3>

      {/* Sous-titre / citation */}
      <p
        className={cn(
          "text-sm leading-relaxed mb-6 italic",
          highlight ? "text-muted-foreground/90" : "text-muted-foreground/70"
        )}
      >
        {subtitle}
      </p>

      {/* Liste des points */}
      <ul className="space-y-3 flex-1">
        {points.map((point, j) => (
          <li key={j} className="flex items-start gap-2.5">
            <span
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                point.ok
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/40 text-muted-foreground/50"
              )}
            >
              {point.ok ? (
                <Check className="w-2.5 h-2.5" strokeWidth={3} />
              ) : (
                <X className="w-2.5 h-2.5" strokeWidth={3} />
              )}
            </span>
            <span
              className={cn(
                "text-sm leading-snug",
                point.ok
                  ? highlight
                    ? "text-foreground"
                    : "text-muted-foreground"
                  : "text-muted-foreground/60"
              )}
            >
              {point.label}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA — uniquement sur la card highlight */}
      {cta && (
        <Link
          href={cta.href}
          className="group mt-7 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]"
        >
          {cta.label}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </motion.div>
  );
}
