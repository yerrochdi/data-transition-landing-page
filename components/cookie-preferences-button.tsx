"use client";

/**
 * Bouton de révocation/modification du consentement cookies.
 * À placer sur la page politique cookies — la CNIL exige que le retrait
 * du consentement soit aussi simple que son octroi.
 */
import { useEffect, useState } from "react";
import { getConsent, type ConsentState } from "./cookie-consent";

const CONSENT_KEY = "nextmove_cookie_consent";

export function CookiePreferencesButton() {
  const [consent, setConsent] = useState<ConsentState>("unset");

  useEffect(() => {
    setConsent(getConsent());
  }, []);

  const set = (value: "granted" | "denied") => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* ignore */
    }
    setConsent(value);
    window.dispatchEvent(
      new CustomEvent("nextmove-consent-change", { detail: value })
    );
  };

  const label =
    consent === "granted"
      ? "Mesure d'audience : activée"
      : consent === "denied"
        ? "Mesure d'audience : refusée"
        : "Mesure d'audience : non choisie";

  return (
    <div className="not-prose my-6 p-4 rounded-xl border border-border/30 bg-surface-container-lowest">
      <p className="text-sm font-bold text-foreground mb-1">
        Gérer mon consentement
      </p>
      <p className="text-xs text-muted-foreground mb-3">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => set("granted")}
          className="px-4 py-2 rounded-lg text-xs font-bold gradient-primary text-primary-foreground hover:scale-[1.02] transition-transform"
        >
          Activer
        </button>
        <button
          type="button"
          onClick={() => set("denied")}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-surface-container border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
        >
          Refuser
        </button>
      </div>
    </div>
  );
}
