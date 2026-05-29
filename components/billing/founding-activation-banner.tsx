import Link from "next/link";
import { Crown, ArrowRight, Clock } from "lucide-react";

/**
 * Bannière affichée en haut du dashboard quand un user a été accepté
 * Founding Member mais n'a pas encore finalisé son paiement 9€/mois.
 *
 * Cas typique : la candidate a confirmé son email, atterri sur Stripe
 * Checkout, fermé la fenêtre avant de payer. Sans cette bannière, elle
 * n'a plus aucun moyen de retrouver son écran d'activation depuis le
 * dashboard — elle pense que son statut est "FREE" et qu'elle a perdu
 * sa place.
 *
 * La bannière est SERVER-fetched : si la candidature passe en activée
 * (paiement Stripe confirmé via webhook), elle disparaît au prochain refresh.
 */
export function FoundingActivationBanner({
  activationToken,
  firstName,
}: {
  activationToken: string;
  firstName?: string;
}) {
  const greeting = firstName ? `${firstName}, ` : "";

  return (
    <div className="mb-6 bg-gradient-to-br from-primary/15 via-primary/8 to-surface-container-lowest/40 border border-primary/30 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 animate-fade-up">
      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]">
        <Crown className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            Activation en attente
          </span>
        </div>
        <p className="font-headline text-base md:text-lg font-bold text-foreground mb-1 leading-snug">
          {greeting}votre place Founding Member vous attend
        </p>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Vous avez été accepté(e), mais votre paiement 9&nbsp;€/mois à vie
          n&apos;a pas encore été finalisé. Sans activation, votre profil reste
          au plan gratuit et votre siège peut être réattribué.
        </p>
      </div>
      <Link
        href={`/founding-activate?token=${activationToken}`}
        className="w-full md:w-auto inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 shrink-0"
      >
        Finaliser mon activation
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
