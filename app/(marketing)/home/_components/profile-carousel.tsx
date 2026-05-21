"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Users,
  Briefcase,
  Calculator,
  ArrowRight,
  Quote,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Section 5 — "Reconnaissez-vous ?"
 *
 * Carrousel à onglets de 3 profils-types de la cible (Karim SIRH /
 * Sophie Conseil / Marc Finance). L'user clique sur celui qui lui
 * ressemble → la carte se déplie avec sa trajectoire complète
 * (aujourd'hui → angoisse → next move → résultat). Projection
 * directe dans son cas. L'unexpected move de la landing.
 */

type Profile = {
  id: string;
  tabLabel: string;
  Icon: typeof Users;
  name: string;
  role: string;
  sector: string;
  age: number;
  today: string;
  fear: string;
  nextMove: string;
  result: string;
};

const profiles: Profile[] = [
  {
    id: "karim",
    tabLabel: "RH / SIRH",
    Icon: Users,
    name: "Karim",
    role: "Chef de projet SIRH",
    sector: "Ressources Humaines",
    age: 41,
    today:
      "Il pilote des projets SIRH depuis 12 ans — Workday, SAP SuccessFactors. Il connaît la donnée RH par cœur, mais ne l'exploite pas.",
    fear: "Mon DRH parle People Analytics, prédiction du turnover, IA de recrutement. Et moi je gère encore des tickets de paie.",
    nextMove: "People Analytics Lead / Responsable Data RH",
    result:
      "Il a déjà la donnée. Il lui manquait la couche analytique. En 4 mois, il pilote les dashboards RH du CODIR au lieu de subir les outils.",
  },
  {
    id: "sophie",
    tabLabel: "Conseil",
    Icon: Briefcase,
    name: "Sophie",
    role: "Consultante senior",
    sector: "Conseil en transformation",
    age: 44,
    today:
      "15 ans en cabinet. Elle vend des missions de transformation, mais voit les cabinets pousser l'IA dans toutes les propositions.",
    fear: "Les juniors arrivent avec des POC GenAI, les clients réclament de la data, et moi je vends encore du PowerPoint.",
    nextMove: "Manager Data & AI Transformation / Lead Consultant Data",
    result:
      "Son expertise métier et sectorielle est rare — c'est exactement ce qui manque aux profils techniques purs. Elle facture désormais les missions data les plus stratégiques.",
  },
  {
    id: "marc",
    tabLabel: "Finance",
    Icon: Calculator,
    name: "Marc",
    role: "DAF",
    sector: "Industrie / ETI",
    age: 47,
    today:
      "Il dirige la finance d'une ETI. Il maîtrise les chiffres mieux que personne — mais tout passe par Excel.",
    fear: "Le board veut du forecasting prédictif, du temps réel. Et je dépends entièrement d'un cabinet externe pour ça.",
    nextMove: "Chief Data Officer Finance / Head of FinTech Data",
    result:
      "Il pense déjà en données, il lui manquait les outils. Il devient le DAF qui parle data au board — et qui n'a plus besoin de sous-traiter sa propre intelligence financière.",
  },
];

export function ProfileCarousel() {
  const [active, setActive] = useState(0);
  const profile = profiles[active];

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Reconnaissez-vous ?
            </span>
            <span className="w-8 h-px bg-primary/40" />
          </div>
          <h2 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground text-balance">
            Choisissez le profil qui vous ressemble.
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted-foreground/90 leading-relaxed text-pretty">
            Trois cadres, trois métiers, une même bascule. Cliquez sur le vôtre.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {profiles.map((p, i) => {
            const Icon = p.Icon;
            const isActive = i === active;
            return (
              <button
                key={p.id}
                onClick={() => setActive(i)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]"
                    : "bg-surface-container-lowest border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/20"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{p.name}</span>
                <span className="hidden sm:inline opacity-70 font-normal">
                  · {p.tabLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Carte profil active */}
        <div className="relative min-h-[28rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
              className="bg-surface-container-lowest border border-border/40 rounded-3xl p-7 md:p-10 overflow-hidden relative"
            >
              {/* Glow vert top-right */}
              <div
                className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
                  filter: "blur(50px)",
                }}
              />

              {/* En-tête profil */}
              <div className="relative flex items-center gap-4 mb-8 pb-8 border-b border-border/30">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                  <profile.Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-extrabold text-foreground">
                    {profile.name}, {profile.age} ans
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.role} · {profile.sector}
                  </p>
                </div>
              </div>

              {/* Trajectoire en 4 temps */}
              <div className="relative space-y-6">
                {/* Aujourd'hui */}
                <TrajectoryRow
                  label="Aujourd'hui"
                  color="text-muted-foreground"
                >
                  {profile.today}
                </TrajectoryRow>

                {/* Angoisse — en citation */}
                <div className="relative pl-4 border-l-2 border-amber-500/40">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-amber-400/80 mb-1.5">
                    Son angoisse
                  </p>
                  <p className="text-sm md:text-base text-foreground/90 italic leading-relaxed flex gap-2">
                    <Quote className="w-4 h-4 text-amber-400/60 shrink-0 mt-1" />
                    {profile.fear}
                  </p>
                </div>

                {/* Next move */}
                <div className="relative bg-primary/5 border border-primary/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <p className="text-[10px] uppercase tracking-widest font-bold text-primary">
                      Son next move avec NextMove
                    </p>
                  </div>
                  <p className="text-base md:text-lg font-bold text-foreground mb-3">
                    {profile.nextMove}
                  </p>
                  <p className="text-sm text-muted-foreground/90 leading-relaxed">
                    {profile.result}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA sous le carrousel */}
        <div className="text-center mt-10">
          <Link
            href="/founding-members"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]"
          >
            Mon profil n&apos;est pas là ? Candidatez quand même
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrajectoryRow({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-[10px] uppercase tracking-widest font-bold mb-1.5",
          color
        )}
      >
        {label}
      </p>
      <p className="text-sm md:text-base text-muted-foreground/90 leading-relaxed">
        {children}
      </p>
    </div>
  );
}
