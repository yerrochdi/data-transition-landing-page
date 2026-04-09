"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  RefreshCw,
  Lightbulb,
  Target,
  BookOpen,
  Shield,
  Briefcase,
  Zap,
  MessageCircle,
  ArrowDown,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { renderInlineMarkdown } from "@/lib/utils/render-markdown";

// ─── Types ────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface SuggestionData {
  icon: string;
  label: string;
  prompt: string;
  color: string;
}

interface CopilotChatProps {
  suggestions: SuggestionData[];
  userName: string;
  initialQuery?: string | null;
}

// ─── Icon Map ─────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Target,
  BookOpen,
  Shield,
  Briefcase,
  Zap,
  Lightbulb,
  GraduationCap,
  TrendingUp,
  Sparkles,
};

// ─── Message Bubble ───────────────────────────────────────────────

function MessageBubble({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 max-w-[85%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser
          ? "bg-primary/20 text-primary"
          : "bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={cn(
        "rounded-2xl px-4 py-3",
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-surface-container-low ghost-border rounded-tl-sm"
      )}>
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed space-y-2">
            {message.content.split("\n").filter(l => l.trim()).map((line, i) => {
              const trimmed = line.trim();

              if (/^\*\*[^*]+\*\*\s*:?\s*$/.test(trimmed)) {
                const title = trimmed.replace(/\*\*/g, "").replace(/:$/, "").trim();
                return (
                  <h4 key={i} className="font-headline text-xs font-bold text-primary uppercase tracking-wider mt-3 first:mt-0">
                    {title}
                  </h4>
                );
              }

              if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
                return (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                    <span className="text-muted-foreground">{renderInlineMarkdown(trimmed.substring(2))}</span>
                  </div>
                );
              }

              if (/^\d+[\.\)]\s/.test(trimmed)) {
                const num = trimmed.match(/^(\d+)/)?.[1] || "1";
                const content = trimmed.replace(/^\d+[\.\)]\s*/, "");
                return (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {num}
                    </span>
                    <span className="text-muted-foreground">{renderInlineMarkdown(content)}</span>
                  </div>
                );
              }

              return (
                <p key={i} className="text-muted-foreground">{renderInlineMarkdown(trimmed)}</p>
              );
            })}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse rounded-sm ml-0.5" />
            )}
          </div>
        )}

        <p className={cn(
          "text-[9px] mt-1.5 tabular-nums",
          isUser ? "text-primary-foreground/50" : "text-muted-foreground/50"
        )}>
          {message.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function CopilotChat({ suggestions, userName, initialQuery }: CopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [input]);

  // Auto-send initial query from URL param (e.g., from Journey "Ask Copilot")
  const hasAutoSent = useRef(false);
  useEffect(() => {
    if (initialQuery && !hasAutoSent.current && messages.length === 0) {
      hasAutoSent.current = true;
      // Small delay to let the component mount
      const timer = setTimeout(() => sendMessage(initialQuery), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    setError(null);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const assistantId = crypto.randomUUID();
    setMessages([...newMessages, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erreur ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Pas de stream disponible");

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m))
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.length > 0));
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, -1));
      sendMessage(lastUserMsg.content);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <header className="shrink-0 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-headline text-xl font-extrabold tracking-tight text-foreground">
              Copilot IA
            </h1>
            <p className="text-xs text-muted-foreground">
              Ton coach personnel de transition carrière — disponible 24/7
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-6">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-headline text-lg font-bold text-foreground mb-2 text-center">
              Salut {userName}, comment puis-je t&apos;aider ?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
              Je connais ton profil, tes objectifs et tes freins. Choisis un sujet ou pose ta propre question.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
              {suggestions.map((suggestion, i) => {
                const Icon = ICON_MAP[suggestion.icon] || Sparkles;
                return (
                  <button
                    key={i}
                    onClick={() => sendMessage(suggestion.prompt)}
                    className="group text-left p-4 rounded-xl bg-surface-container-low ghost-border hover:bg-surface-container hover:border-primary/20 transition-all hover:scale-[1.02]"
                  >
                    <Icon className={cn("w-5 h-5 mb-2", suggestion.color)} />
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {suggestion.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4 px-1">
            {messages.map((message, i) => (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={isStreaming && i === messages.length - 1 && message.role === "assistant"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-surface-container-high shadow-lg flex items-center justify-center ghost-border hover:bg-primary/20 transition-all"
          >
            <ArrowDown className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {error && (
        <div className="shrink-0 mx-1 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
          <p className="text-xs text-red-400">{error}</p>
          <button onClick={handleRetry} className="flex items-center gap-1.5 text-xs text-red-400 font-bold hover:underline">
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="shrink-0 mt-3">
        <div className="flex items-end gap-2 bg-surface-container-low rounded-2xl ghost-border p-2 focus-within:border-primary/30 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose ta question..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none px-3 py-2 max-h-[150px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
              input.trim() && !isStreaming
                ? "gradient-primary text-primary-foreground hover:scale-105 shadow-lg shadow-primary/20"
                : "bg-surface-container text-muted-foreground cursor-not-allowed"
            )}
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground/40 text-center mt-1.5">
          Copilot NextMove — propulsé par Moonshot AI · Les réponses peuvent contenir des erreurs
        </p>
      </form>
    </div>
  );
}
