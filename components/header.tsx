"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Probl\u00e8me", href: "#probleme" },
  { label: "Approche", href: "#approche" },
  { label: "M\u00e9thode", href: "#methode" },
  { label: "Offres", href: "#offres" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
        <a
          href="#hero"
          className="font-display text-xl font-extrabold tracking-tight text-foreground"
        >
          {"Data"}
          <span className="text-accent">{"."}</span>
          {"Transition"}
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button
            asChild
            size="sm"
            className="rounded-full bg-accent px-5 text-accent-foreground shadow-md shadow-accent/25 transition-all hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/30"
          >
            <a href="#contact">
              {"\u00c9change 15 min"}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <nav className="animate-fade-in border-t border-border/50 bg-background px-6 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <Button
              asChild
              size="sm"
              className="mt-3 w-full rounded-full bg-accent text-accent-foreground shadow-md shadow-accent/25 hover:bg-accent/90"
            >
              <a href="#contact" onClick={() => setMobileOpen(false)}>
                {"\u00c9change 15 min"}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
