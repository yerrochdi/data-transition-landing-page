import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Briefcase,
  MapPin,
  Euro,
  MessageCircle,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { generateInterviewPrep } from "@/lib/opportunities/interview-prep";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function InterviewPrepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    select: { id: true },
  });
  if (!dbUser) redirect("/login");

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
  });
  if (!opportunity) notFound();

  const prep = await generateInterviewPrep(dbUser.id, id);

  return (
    <div className="space-y-6">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour aux opportunités
      </Link>

      {/* Offer summary */}
      <header className="bg-surface-container-low rounded-2xl ghost-border p-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mb-3">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Préparation entretien IA
          </span>
        </div>
        <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-foreground mb-2">
          {opportunity.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            {opportunity.company}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {opportunity.location}
          </span>
          {opportunity.salary && (
            <span className="inline-flex items-center gap-1.5">
              <Euro className="w-3.5 h-3.5" />
              {opportunity.salary}
            </span>
          )}
        </div>
      </header>

      {!prep ? (
        <div className="bg-surface-container-low rounded-2xl ghost-border p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            La génération de la préparation a échoué. Réessaie dans quelques secondes.
          </p>
          <Link
            href={`/opportunities/${id}/interview`}
            className="inline-flex items-center gap-2 bg-surface-container-lowest ghost-border px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-surface-container transition-colors"
          >
            Réessayer
          </Link>
        </div>
      ) : (
        <>
          {/* Pitch */}
          <section className="bg-gradient-to-br from-surface-container-low to-primary/5 rounded-2xl border border-primary/20 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-primary">
                Ton pitch d&apos;ouverture (30 secondes)
              </h2>
            </div>
            <p className="text-base text-foreground/95 leading-relaxed">{prep.pitchOpening}</p>
          </section>

          {/* Questions */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-primary" />
              <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-primary">
                Les {prep.questions.length} questions probables
              </h2>
            </div>
            <div className="space-y-3">
              {prep.questions.map((q, i) => (
                <details
                  key={i}
                  className="group bg-surface-container-low rounded-2xl ghost-border overflow-hidden"
                >
                  <summary className="cursor-pointer p-5 flex items-start gap-3 hover:bg-surface-container transition-colors list-none">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-foreground leading-relaxed">
                      {q.question}
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pl-[3.75rem] space-y-3 border-t border-border/20 pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        Pourquoi cette question
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{q.why}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                        Suggestion de réponse
                      </p>
                      <p className="text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap">
                        {q.suggestedAnswer}
                      </p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Salary advice */}
          <section className="bg-surface-container-low rounded-2xl ghost-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <Euro className="w-4 h-4 text-primary" />
              <h2 className="font-headline text-sm font-bold uppercase tracking-widest text-primary">
                Négociation salariale
              </h2>
            </div>
            <p className="text-sm text-foreground/95 leading-relaxed whitespace-pre-wrap">
              {prep.salaryAdvice}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
