"use client";

/**
 * Charge Vercel Analytics UNIQUEMENT après consentement explicite (CNIL).
 *
 * Tant que l'utilisateur n'a pas cliqué "Accepter" dans <CookieConsent>,
 * le script de mesure d'audience n'est pas monté. Réagit en direct au
 * changement de consentement (event `nextmove-consent-change`) sans reload.
 */
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { getConsent } from "./cookie-consent";

export function AnalyticsGate() {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    setGranted(getConsent() === "granted");
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setGranted(detail === "granted");
    };
    window.addEventListener("nextmove-consent-change", onChange);
    return () => window.removeEventListener("nextmove-consent-change", onChange);
  }, []);

  if (!granted) return null;
  return <Analytics />;
}
