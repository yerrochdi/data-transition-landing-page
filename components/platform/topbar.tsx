"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, LogOut, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { topNav } from "@/lib/mock-data";
import { signOut } from "@/lib/auth/actions";
import { APP_NAME } from "@/lib/constants";

interface TopbarProps {
  user: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    plan: string;
  };
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-surface-container/60 backdrop-blur-xl ghost-border shadow-ambient">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">N</span>
        </div>
        <span className="font-headline font-black text-xl text-primary tracking-tight text-glow">
          {APP_NAME}
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8">
        {topNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-headline font-bold tracking-wide transition-colors",
              pathname === item.href || pathname.startsWith(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {user.plan === "PREMIUM" && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Crown className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Pro</span>
          </div>
        )}
        <button className="p-2 rounded-full hover:bg-surface-container-high transition-all">
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>
        <form action={signOut}>
          <button
            type="submit"
            className="p-2 rounded-full hover:bg-surface-container-high transition-all"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </form>
        <Link
          href="/dashboard"
          className="h-8 w-8 rounded-full bg-surface-container-highest overflow-hidden ghost-border"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
          )}
        </Link>
      </div>
    </nav>
  );
}
