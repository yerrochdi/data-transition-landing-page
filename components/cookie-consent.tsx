"use client";

/**
 * Bannière de consentement cookies (CNIL/RGPD).
 *
 * Principe :
 *   - Les cookies d'authentification Supabase sont "strictement nécessaires"
 *     (exemptés de consentement) — ils ne sont jamais gérés ici.
 *   - Les cookies de MESURE D'AUDIENCE (Vercel Analytics) requièrent un
 *     consentement explicite préalable. Tant que l'utilisateur n'a pas
 *     accepté, <AnalyticsGate> ne charge pas le script.
 *
 * Le choix est stocké dans localStorage (`nextmove_cookie_consent` =
 * "granted" | "denied"). La bannière ne réapparaît pas après un choix.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "nextmove_cookie_consent";

export type ConsentState = "granted" | "denied" | "unset";

/** Lit l'état de consentement courant (côté client uniquement). */
export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : "unset";
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>("unset");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getConsent());
  }, []);

  const choose = (value: "granted" | "denied") => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
    setConsent(value);
    // Notifie le reste de l'app (AnalyticsGate écoute) sans reload.
    window.dispatchEvent(new CustomEvent("nextmove-consent-change", { detail: value }));
  };

  // Rien tant qu'on n'est pas monté (évite le flash SSR) ou si un choix existe.
  if (!mounted || consent !== "unset") return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-fade-up-fast"
    >
      <div className="max-w-3xl mx-auto bg-surface-container-high/95 backdrop-blur-xl border border-border/30 rounded-2xl p-5 md:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground mb-1">
              Cookies & mesure d&apos;audience
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Les cookies nécessaires au fonctionnement (connexion, sécurité)
              sont toujours actifs. Vous pouvez accepter ou refuser la mesure
              d&apos;audience anonyme qui nous aide à améliorer NextMove. Détails
              dans notre{" "}
              <Link
                href="/legal/cookies"
                className="text-primary hover:underline font-medium"
              >
                politique cookies
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => choose("denied")}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-container-lowest border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={() => choose("granted")}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-bold gradient-primary text-primary-foreground hover:scale-[1.02] transition-transform"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
