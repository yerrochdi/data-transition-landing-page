"use client";

import {
  Users,
  TrendingUp,
  Crown,
  Zap,
  UserPlus,
  Bot,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminUsers, adminStats } from "@/lib/mock-data";

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

const statusStyles = {
  active: "bg-primary/20 text-primary",
  inactive: "bg-muted text-muted-foreground",
  onboarding: "bg-accent/20 text-accent",
};

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground mb-1">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">Platform overview and user management.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={adminStats.totalUsers} icon={Users} />
        <StatCard label="Active Users" value={adminStats.activeUsers} icon={TrendingUp} />
        <StatCard label="Premium" value={adminStats.premiumUsers} icon={Crown} />
        <StatCard label="Avg Progress" value={`${adminStats.avgProgress}%`} icon={TrendingUp} />
        <StatCard label="New This Week" value={adminStats.newUsersThisWeek} icon={UserPlus} />
        <StatCard label="AI Today" value={adminStats.agentInteractionsToday} icon={Bot} />
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-low rounded-2xl ghost-border overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-headline text-sm font-bold text-foreground">Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border/10">
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Name</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Plan</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Progress</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Status</th>
                <th className="text-left px-6 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Last Active</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((user) => (
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
                      user.plan === "Premium" ? "bg-primary/20 text-primary" :
                      user.plan === "Enterprise" ? "bg-accent/20 text-accent" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${user.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{user.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase", statusStyles[user.status])}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    <button className="p-1 rounded hover:bg-surface-container-high transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
