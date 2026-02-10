"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { getBookingUrlWithUtm } from "@/lib/booking";
import { track } from "@vercel/analytics";

export function StickyCta() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show after scrolling past hero section (roughly 600px)
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't render on desktop or if dismissed
  if (isDismissed) return null;

  const handleClick = () => {
    track("cta_click", { location: "sticky_mobile" });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-2">
        <Button
          asChild
          className="flex-1 rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/90"
          size="lg"
          onClick={handleClick}
        >
          <a href={getBookingUrlWithUtm()} target="_blank" rel="noopener noreferrer">
            <Calendar className="mr-2 h-4 w-4" />
            {"Réserver 15 min"}
          </a>
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
