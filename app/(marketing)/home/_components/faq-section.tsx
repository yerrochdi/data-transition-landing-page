"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, ShieldCheck, XCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section 8 — Garanties + FAQ (clôture de la landing).
 *
 * 3 garanties qui lèvent les dernières objections, puis une FAQ
 * accordéon qui répond aux questions concrètes des cadres 35-50.
 */

const guarantees = [
  {
    Icon: XCircle,
    title: "Sans engagement",
    desc: "Vous arrêtez quand vous voulez, en 1 clic depuis vos paramètres.",
  },
  {
    Icon: Zap,
    title: "Résultats dès la 1re semaine",
    desc: "Premier livrable validé en quelques jours — pas dans 6 mois.",
  },
  {
    Icon: ShieldCheck,
    title: "Vos données vous appartiennent",
    desc: "Export à tout moment. On ne revend rien. RGPD strict.",
  },
];

const faqs = [
  {
    q: "Je ne sais pas coder. C'est un problème ?",
    a: "Non. NextMove s'adapte à votre appétence technique. Si vous ne voulez pas coder, on vous oriente vers les outils visuels (Power BI, Looker, Make) et les rôles business/stratégie. La data ne se résume pas à Python.",
  },
  {
    q: "En quoi c'est différent d'un bootcamp type Le Wagon ou DataScientest ?",
    a: "Un bootcamp vous forme à devenir data analyst junior — vous repartez de zéro. NextMove fait l'inverse : on capitalise sur vos 15 ans d'expérience et on y greffe une couche data pour augmenter votre valeur. Vous restez senior, vous ne redevenez pas junior.",
  },
  {
    q: "J'ai 47 ans. N'est-il pas trop tard ?",
    a: "C'est exactement l'inverse. Votre expérience métier est ce qui manque aux profils techniques purs. Un DAF qui comprend la data vaut plus qu'un data analyst qui ne comprend pas la finance. Votre âge est un atout, pas un frein.",
  },
  {
    q: "Combien de temps par semaine faut-il y consacrer ?",
    a: "Le parcours s'adapte à votre disponibilité — de 3h à 10h par semaine. On vous propose la prochaine action utile selon votre rythme réel, pas un programme rigide impossible à tenir avec un poste à plein temps.",
  },
  {
    q: "C'est quoi exactement le programme Founding Member ?",
    a: "Les 30 premiers membres obtiennent l'accès Pro complet à 9€/mois, gelé à vie. En échange, vous façonnez le produit : 1 retour par semaine pendant 3 mois et 1 call mensuel avec le fondateur. Sélection sur candidature, sous 48h.",
  },
  {
    q: "Que se passe-t-il après ma transition ?",
    a: "NextMove reste votre Career OS à vie. Après votre pivot, le produit vous accompagne dans votre installation (100 premiers jours) puis votre croissance (radar marché, salary intelligence, network). Ce n'est pas un outil jetable.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Garanties */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="grid sm:grid-cols-3 gap-4 mb-20"
        >
          {guarantees.map((g) => (
            <div
              key={g.title}
              className="bg-surface-container-lowest border border-border/40 rounded-2xl p-5 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <g.Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-bold text-foreground text-sm mb-1.5">
                {g.title}
              </p>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                {g.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* FAQ header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-center mb-10"
        >
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Les questions qu&apos;on nous pose.
          </h2>
        </motion.div>

        {/* FAQ accordéon */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="bg-surface-container-lowest border border-border/40 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-bold text-foreground text-sm md:text-base">
                    {faq.q}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 w-7 h-7 rounded-full bg-surface-container flex items-center justify-center transition-transform duration-300",
                      isOpen && "rotate-45 bg-primary/15"
                    )}
                  >
                    <Plus
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isOpen ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-muted-foreground/90 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
