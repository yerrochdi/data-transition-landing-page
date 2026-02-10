"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Est-ce une formation technique ?",
    answer:
      "Non. Il ne s\u2019agit pas d\u2019une formation technique. C\u2019est un accompagnement de positionnement et de trajectoire. L\u2019objectif est de structurer votre transition vers un r\u00f4le data cr\u00e9dible en partant de votre exp\u00e9rience, pas d\u2019apprendre un outil.",
  },
  {
    question: "Dois-je d\u00e9j\u00e0 \u00eatre data analyst pour postuler ?",
    answer:
      "Non. L\u2019accompagnement s\u2019adresse \u00e0 des profils fonctionnels exp\u00e9riment\u00e9s (RH, SIRH, AMOA, IT) qui travaillent d\u00e9j\u00e0 avec de la donn\u00e9e ou des syst\u00e8mes d\u2019information, m\u00eame sans titre \u00ab data \u00bb.",
  },
  {
    question: "Combien de temps par semaine faut-il pr\u00e9voir ?",
    answer:
      "Comptez 1 \u00e0 2 heures de travail personnel par semaine, en plus d\u2019une session hebdomadaire d\u2019environ 1 heure. Le programme dure 6 semaines et est con\u00e7u pour \u00eatre compatible avec un poste \u00e0 temps plein.",
  },
  {
    question: "Puis-je suivre le programme en parall\u00e8le de mon travail ?",
    answer:
      "Oui, absolument. Le format a \u00e9t\u00e9 pens\u00e9 pour des professionnels en poste. Les sessions sont planifi\u00e9es \u00e0 des horaires compatibles et la charge de travail reste l\u00e9g\u00e8re entre les sessions.",
  },
  {
    question: "Est-ce que vous garantissez un emploi ?",
    answer:
      "Non. Ce programme ne garantit pas un emploi. En revanche, il vous donne de la clart\u00e9 sur votre positionnement, un discours professionnel structur\u00e9, un CV adapt\u00e9 au march\u00e9 data et une feuille de route r\u00e9aliste.",
  },
  {
    question: "Quelle est la diff\u00e9rence entre le format 1:1 et la cohorte ?",
    answer:
      "Le 1:1 offre un accompagnement enti\u00e8rement personnalis\u00e9 et adapt\u00e9 \u00e0 votre rythme. La cohorte apporte une dynamique collective avec des retours crois\u00e9s entre pairs, un cadre plus soutenu et un r\u00e9seau de professionnels en transition.",
  },
  {
    question: "Comment se passe la s\u00e9lection ?",
    answer:
      "Un \u00e9change de 15 minutes (visio ou t\u00e9l\u00e9phone) permet de v\u00e9rifier l\u2019alignement entre votre situation et le programme. Il n\u2019y a aucun engagement \u00e0 ce stade \u2014 c\u2019est un \u00e9change franc pour d\u00e9cider ensemble.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-secondary/50 py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            {"FAQ"}
          </span>
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {"Tout ce que vous devez savoir."}
          </h2>
        </div>

        <Accordion type="single" collapsible className="flex w-full flex-col gap-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={faq.question}
              value={`item-${i}`}
              className="rounded-xl border border-border/60 bg-card px-5 shadow-sm data-[state=open]:border-accent/30 data-[state=open]:shadow-md"
            >
              <AccordionTrigger className="py-4 text-left text-sm font-semibold text-foreground hover:no-underline data-[state=open]:text-accent">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
