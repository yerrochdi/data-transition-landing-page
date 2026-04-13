"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, CheckCircle, Loader2 } from "lucide-react";
import { verifyAndActivatePremium } from "@/lib/billing/actions";

export function UpgradeSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    verifyAndActivatePremium().then((result) => {
      if (result.activated || result.plan === "PREMIUM") {
        setStatus("success");
        // Refresh the page data after 3 seconds to show updated limits
        setTimeout(() => {
          router.replace("/dashboard");
          router.refresh();
        }, 3000);
      } else {
        setStatus("error");
      }
    });
  }, [router]);

  if (status === "verifying") {
    return (
      <div className="mb-6 bg-primary/10 border border-primary/30 rounded-2xl p-6 flex items-center gap-4 animate-fade-up">
        <Loader2 className="w-6 h-6 text-primary animate-spin shrink-0" />
        <div>
          <p className="text-sm font-bold text-foreground">Activation en cours...</p>
          <p className="text-xs text-muted-foreground">Vérification de votre paiement auprès de Stripe</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 flex items-center gap-4 animate-fade-up">
        <Crown className="w-6 h-6 text-yellow-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-foreground">Paiement en cours de traitement</p>
          <p className="text-xs text-muted-foreground">Votre plan sera activé sous quelques minutes. Rafraîchissez la page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/30 rounded-2xl p-6 flex items-center gap-4 animate-fade-up">
      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
        <CheckCircle className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="text-base font-bold text-foreground flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          Bienvenue dans le plan Pro !
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Accès illimité au Copilot, sessions IA, parcours complet en 5 phases et toutes les opportunités.
        </p>
      </div>
    </div>
  );
}
