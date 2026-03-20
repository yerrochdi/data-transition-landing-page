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
import { mockUser, analyticsData, journeyPhases } from "@/lib/mock-data";

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
  { label: "AI Agents", href: "/agents", icon: "Bot" },
  { label: "Skill Roadmap", href: "/analytics", icon: "TrendingUp" },
  { label: "Job Market", href: "/opportunities", icon: "Briefcase" },
  { label: "Resources", href: "/resources", icon: "BookOpen" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const activePhase = journeyPhases.find((p) => p.status === "active");

  return (
    <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6">
      {/* Nav Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4">
        {/* User Badge */}
        <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="font-headline font-bold text-primary text-sm">Career Architect</p>
            <p className="text-xs text-muted-foreground">NextMove {mockUser.plan === "premium" ? "Premium" : "Free"}</p>
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
          Current Velocity
        </h4>
        <div className="relative h-2 w-full bg-surface-container-lowest rounded-full overflow-hidden mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-green-500 shadow-[0_0_10px_hsl(var(--primary))]"
            style={{ width: `${analyticsData.overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground font-medium uppercase">
            Phase: {activePhase?.title || "—"}
          </span>
          <span className="text-xs font-bold text-primary">{analyticsData.overallProgress}%</span>
        </div>
      </div>
    </aside>
  );
}
