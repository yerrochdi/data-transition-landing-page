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
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Immersive Path", href: "/journey", icon: "GitBranch" },
  { label: "Copilot IA", href: "/agents", icon: "Bot" },
  { label: "Skill Roadmap", href: "/analytics", icon: "TrendingUp" },
  { label: "Job Market", href: "/opportunities", icon: "Briefcase" },
  { label: "Resources", href: "/resources", icon: "BookOpen" },
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
          <div>
            <p className="font-headline font-bold text-primary text-sm">
              {user.targetRole || "Career Architect"}
            </p>
            <p className="text-xs text-muted-foreground">
              NextMove {user.plan === "PREMIUM" ? "Premium" : user.plan === "ENTERPRISE" ? "Enterprise" : "Free"}
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = pathname === item.href || pathname.startsWith(item.href);
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
      </div>

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
