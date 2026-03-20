"use client";

import { useState } from "react";
import {
  Brain,
  Target,
  Search,
  FileText,
  Heart,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Zap,
  Activity,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { agents, agentMessages } from "@/lib/mock-data";
import type { Agent } from "@/lib/types";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as Record<string, React.ElementType>)[name];
  return Icon ? <Icon className={className} /> : null;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "text-primary", dot: "bg-primary" },
  working: { label: "Working...", color: "text-secondary", dot: "bg-secondary" },
  idle: { label: "Idle", color: "text-muted-foreground", dot: "bg-muted-foreground" },
  unavailable: { label: "Unavailable", color: "text-destructive", dot: "bg-destructive" },
};

function AgentCard({
  agent,
  isSelected,
  onSelect,
}: {
  agent: Agent;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const status = statusConfig[agent.status];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-5 rounded-2xl transition-all hover-glow group",
        isSelected
          ? "bg-surface-container-high border border-primary/20 shadow-xl shadow-primary/5"
          : "bg-surface-container-low ghost-border hover:bg-surface-container"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${agent.color}15` }}
        >
          <DynamicIcon name={agent.icon} className="w-6 h-6" style={{ color: agent.color } as React.CSSProperties} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-headline text-sm font-bold text-foreground">{agent.name}</h3>
            <div className="flex items-center gap-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", status.dot, agent.status === "working" && "animate-pulse")} />
              <span className={cn("text-[10px] font-bold", status.color)}>{status.label}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{agent.role}</p>
          {agent.insightCount && (
            <div className="flex items-center gap-1 mt-2">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-primary font-bold">{agent.insightCount} insights</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function AgentDetail({ agent }: { agent: Agent }) {
  const relatedMessages = agentMessages.filter((m) => m.agentId === agent.id);

  return (
    <div className="bg-surface-container-high rounded-2xl ghost-border light-streak overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${agent.color}15` }}
          >
            <DynamicIcon name={agent.icon} className="w-8 h-8" style={{ color: agent.color } as React.CSSProperties} />
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold text-foreground">{agent.name}</h2>
            <p className="text-sm text-muted-foreground">{agent.role}</p>
            {agent.lastActivity && (
              <p className="text-[10px] text-primary mt-1">{agent.lastActivity}</p>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
      </div>

      {/* Capabilities */}
      <div className="px-6 pb-4">
        <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Capabilities
        </h4>
        <div className="space-y-2">
          {agent.capabilities.map((cap) => (
            <div key={cap.id} className="bg-surface-container-lowest p-3 rounded-xl ghost-border">
              <p className="text-xs font-bold text-foreground">{cap.label}</p>
              <p className="text-[10px] text-muted-foreground">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-4">
        <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Quick Actions
        </h4>
        <div className="flex flex-wrap gap-2">
          {agent.quickActions.map((action) => (
            <button
              key={action.id}
              className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-full ghost-border text-xs font-bold text-foreground hover:bg-surface-container transition-colors group"
            >
              <DynamicIcon name={action.icon} className="w-3.5 h-3.5 text-primary" />
              {action.label}
              <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Insights */}
      {relatedMessages.length > 0 && (
        <div className="px-6 pb-6">
          <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Recent Insights
          </h4>
          <div className="space-y-2">
            {relatedMessages.map((msg) => (
              <div key={msg.id} className="bg-surface-container-lowest/80 p-3 rounded-xl ghost-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{msg.type}</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat CTA */}
      <div className="p-4 border-t border-border/10">
        <button className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
          <MessageCircle className="w-4 h-4" />
          Start Conversation
        </button>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [selectedId, setSelectedId] = useState(agents[0].id);
  const selectedAgent = agents.find((a) => a.id === selectedId) || agents[0];

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-primary" />
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground">
            AI Control Center
          </h1>
        </div>
        <p className="text-muted-foreground text-sm max-w-xl">
          Your fleet of specialized AI agents working in concert to accelerate your career evolution.
        </p>
      </header>

      {/* Agent Grid + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-2 space-y-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedId === agent.id}
              onSelect={() => setSelectedId(agent.id)}
            />
          ))}
        </div>

        {/* Agent Detail */}
        <div className="lg:col-span-3">
          <AgentDetail agent={selectedAgent} />
        </div>
      </div>
    </div>
  );
}
