"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bot, GitBranch, Users, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Copilot", href: "/agents", icon: Bot },
  { label: "Path", href: "/journey", icon: GitBranch },
  { label: "Feed", href: "/feed", icon: Users },
  { label: "Actus", href: "/resources", icon: Rss },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 w-full rounded-t-3xl z-50 bg-background/90 backdrop-blur-lg ghost-border shadow-ambient flex justify-around items-center h-20 px-4 pb-safe">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center transition-opacity",
              isActive
                ? "text-primary"
                : "text-muted-foreground opacity-60 hover:opacity-100"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive && "fill-current")} />
            <span className="text-[10px] uppercase tracking-widest mt-1 font-body">
              {item.label}
            </span>
            {isActive && (
              <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
