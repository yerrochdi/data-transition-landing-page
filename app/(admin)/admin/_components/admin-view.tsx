"use client";

import {
  Users,
  TrendingUp,
  Crown,
  Zap,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminData } from "@/lib/admin/actions";

// ─── Stat Card ────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-surface-container-low p-5 rounded-2xl ghost-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-headline font-extrabold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────

export function AdminView({ data }: { data: AdminData }) {
  const { stats, users } = data;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground mb-1">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">Vue d&apos;ensemble de la plateforme et gestion des utilisateurs.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Utilisateurs" value={stats.totalUsers} icon={Users} />
        <StatCard label="Actifs (48h)" value={stats.activeUsers} icon={TrendingUp} />
        <StatCard label="Premium" value={stats.premiumUsers} icon={Crown} />
        <StatCard label="Readiness moy." value={`${stats.avgReadiness}%`} icon={Zap} />
        <StatCard label="Nouveaux (7j)" value={stats.newUsersThisWeek} icon={UserPlus} />
        <StatCard label="Onboarding fait" value={stats.completedOnboarding} icon={CheckCircle} />
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-low rounded-2xl ghost-border overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-headline text-sm font-bold text-foreground">
            Utilisateurs ({users.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border/10">
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Nom</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Plan</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Objectif</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Readiness</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Score</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Statut</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isActive = (Date.now() - new Date(user.lastActiveAt).getTime()) < 48 * 60 * 60 * 1000;
                return (
                  <tr key={user.id} className="border-t border-border/5 hover:bg-surface-container transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-foreground">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-full",
                        user.plan === "PREMIUM" ? "bg-primary/20 text-primary" :
                        user.plan === "ENTERPRISE" ? "bg-purple-500/20 text-purple-400" :
                        "bg-surface-container text-muted-foreground"
                      )}>
                        {user.plan === "PREMIUM" ? "Premium" : user.plan === "ENTERPRISE" ? "Enterprise" : "Free"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground">
                      {user.targetRole || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              user.readinessScore >= 70 ? "bg-emerald-500" :
                              user.readinessScore >= 40 ? "bg-primary" :
                              "bg-amber-500"
                            )}
                            style={{ width: `${user.readinessScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{user.readinessScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-primary tabular-nums">
                      {user.careerScore}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                        !user.onboardingCompleted ? "bg-amber-500/20 text-amber-400" :
                        isActive ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-surface-container text-muted-foreground"
                      )}>
                        {!user.onboardingCompleted ? "Onboarding" : isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(user.lastActiveAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
