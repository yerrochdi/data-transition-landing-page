"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

export function AiFab() {
  return (
    <Link
      href="/agents"
      className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-[0_10px_40px_rgba(75,226,119,0.3)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 group"
    >
      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      <div className="absolute right-full mr-4 bg-surface-container-high px-3 py-1.5 rounded-lg ghost-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-xs font-bold text-primary">Copilot IA</span>
      </div>
    </Link>
  );
}
