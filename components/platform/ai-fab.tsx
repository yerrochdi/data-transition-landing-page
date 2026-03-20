"use client";

import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentMessages } from "@/lib/mock-data";

export function AiFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const latestMessages = agentMessages.slice(0, 3);

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-28 md:right-12 w-[360px] max-h-[480px] z-50 bg-surface-container-high rounded-2xl ghost-border shadow-ambient overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 light-streak">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-headline font-bold text-sm text-primary">NextMove Copilot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-surface-container-highest transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 max-h-[320px] overflow-y-auto">
            {latestMessages.map((msg) => (
              <div key={msg.id} className="bg-surface-container-lowest/80 rounded-xl p-3 ghost-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                    {msg.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{msg.timestamp.split("T")[1]?.slice(0, 5)}</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{msg.content}</p>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/10">
            <div className="flex items-center gap-2 bg-surface-container-lowest rounded-xl p-2">
              <input
                type="text"
                placeholder="Ask your AI Career Coach..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none px-2"
              />
              <button className="p-2 rounded-lg gradient-primary text-primary-foreground hover:scale-105 transition-transform">
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-24 right-6 md:bottom-12 md:right-12 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-[0_10px_40px_rgba(75,226,119,0.3)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 group",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        )}
        {!isOpen && (
          <div className="absolute right-full mr-4 bg-surface-container-high px-3 py-1.5 rounded-lg ghost-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="text-xs font-bold text-primary">Ask AI Career Coach</span>
          </div>
        )}
      </button>
    </>
  );
}
