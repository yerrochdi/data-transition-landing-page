"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  TrendingUp,
  Briefcase,
  Brain,
  Bot,
  BookOpen,
  Settings,
  Crown,
  Zap,
  Users,
  FileCheck,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  GitBranch,
  TrendingUp,
  Briefcase,
  Brain,
  Bot,
  BookOpen,
  Settings,
  Users,
  FileCheck,
  Award,
};

// Sidebar groups (Phase A step 5). Order matters: top = daily work,
// bottom = secondary / settings. Inside each group, the order reflects
// the user journey through the product.
type NavGroup = {
  label: string | null; // null = no group header rendered
  items: { label: string; href: string; icon: string }[];
};

const navGroups: NavGroup[] = [
  {
    label: null, // primary
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Copilot IA", href: "/agents", icon: "Bot" },
    ],
  },
  {
    label: "Travailler",
    items: [
      { label: "Parcours", href: "/journey", icon: "GitBranch" },
      { label: "Livrables", href: "/deliverables", icon: "FileCheck" },
    ],
  },
  {
    label: "Valoriser",
    items: [
      { label: "Portfolio", href: "/my-portfolio", icon: "Award" },
      { label: "Opportunités", href: "/opportunities", icon: "Briefcase" },
    ],
  },
  {
    label: "Aller plus loin",
    items: [
      { label: "Communauté", href: "/feed", icon: "Users" },
      { label: "Analytics", href: "/analytics", icon: "TrendingUp" },
      { label: "Ressources", href: "/resources", icon: "BookOpen" },
    ],
  },
  {
    label: null,
    items: [
      { label: "Paramètres", href: "/settings", icon: "Settings" },
    ],
  },
];

interface AppSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    plan: string;
    targetRole: string | null;
    readinessScore: number;
  };
}

const PLAN_BADGE: Record<string, { label: string; className: string }> = {
  FREE: {
    label: "Free",
    className: "bg-muted/40 text-muted-foreground",
  },
  BOOST: {
    label: "Boost",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  PREMIUM: {
    label: "Pro",
    className:
      "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30",
  },
  FOUNDING: {
    label: "Founding",
    className:
      "bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-400 border border-amber-500/30",
  },
  ENTERPRISE: {
    label: "Enterprise",
    className: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  },
};

function PlanBadge({ plan }: { plan: string }) {
  const config = PLAN_BADGE[plan] ?? PLAN_BADGE.FREE;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-0.5",
        config.className
      )}
    >
      {(plan === "PREMIUM" || plan === "FOUNDING") && (
        <Crown className="w-2.5 h-2.5" />
      )}
      {config.label}
    </span>
  );
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
      {/* Nav Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
        {/* User Badge */}
        <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Brain className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline font-bold text-primary text-sm truncate">
              {user.targetRole || "Career Architect"}
            </p>
            <PlanBadge plan={user.plan} />
          </div>
        </div>

        {/* Nav groups */}
        <div className="space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi} className="space-y-1">
              {group.label && (
                <p className="px-3 mb-1 text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard;
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      isActive
                        ? "bg-surface-container text-primary border-l-4 border-primary shadow-lg shadow-primary/5 font-bold"
                        : "text-muted-foreground hover:bg-surface-container"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-headline text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      {user.plan === "FREE" && (
        <Link
          href="/upgrade"
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 rounded-2xl hover:border-primary/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Crown className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-foreground">Passer au Pro</p>
            <p className="text-[10px] text-muted-foreground">Parcours complet + IA illimitée</p>
          </div>
          <Zap className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
        </Link>
      )}

      {/* Progress Card */}
      <div className="glass-panel p-6 rounded-2xl light-streak">
        <h4 className="font-headline text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Readiness Score
        </h4>
        <div className="relative h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-green-500 shadow-[0_0_10px_hsl(var(--primary))]"
            style={{ width: `${user.readinessScore}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground font-medium uppercase">
            {user.targetRole || "En cours de diagnostic"}
          </span>
          <span className="text-xs font-bold text-primary">{user.readinessScore}%</span>
        </div>
      </div>
    </aside>
  );
}
