"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

const SESSION_KEY = "founding-banner-dismissed";

// Set to false to disable the banner globally (e.g. after Founding Members campaign ends).
const ENABLED = true;

export function FoundingBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ENABLED) return;
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  if (!ENABLED || !visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="relative z-[60] gradient-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
        <Link
          href="/founding-members"
          className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="text-xs md:text-sm font-bold truncate">
            Founding Members — 30 places à 9€/mois à vie
          </span>
          <span className="hidden md:inline-block text-xs font-bold underline underline-offset-2 shrink-0">
            Postuler →
          </span>
        </Link>
        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="p-1 hover:bg-black/10 rounded-md transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
