"use client";

import { FormEvent, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  citations?: string[];
}

interface StreamSessionEvent {
  type: "session";
  sessionId: string;
}

interface StreamChunkEvent {
  type: "chunk";
  text: string;
}

interface StreamCitationsEvent {
  type: "citations";
  citations: string[];
}

interface StreamDoneEvent {
  type: "done";
}

interface StreamErrorEvent {
  type: "error";
  message: string;
}

type StreamEvent = StreamSessionEvent | StreamChunkEvent | StreamCitationsEvent | StreamDoneEvent | StreamErrorEvent;

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}

function appendToLatestAssistant(messages: ChatMessage[], chunk: string): ChatMessage[] {
  const next = [...messages];
  const last = next[next.length - 1];

  if (!last || last.role !== "assistant") {
    next.push({ role: "assistant", content: chunk });
    return next;
  }

  next[next.length - 1] = {
    ...last,
    content: `${last.content}${chunk}`
  };

  return next;
}

function setLatestAssistantCitations(messages: ChatMessage[], citations: string[]): ChatMessage[] {
  const next = [...messages];
  const last = next[next.length - 1];

  if (!last || last.role !== "assistant") {
    return next;
  }

  next[next.length - 1] = {
    ...last,
    citations
  };

  return next;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask me about Thabiso's experience, technical skills, certifications, or project capabilities. I answer only from his profile data."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(createSessionId());
  const [hasStarted, setHasStarted] = useState(false);

  const quickPrompts = useMemo(
    () => [
      "What collaboration services does Thabiso offer?",
      "What is Thabiso's current experience with Java and Angular?",
      "Which certifications does Thabiso have?"
    ],
    []
  );

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();

    if (!trimmed || loading) {
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
      void trackEvent("chat_started", { source: "landing" });
    }

    void trackEvent("chat_message_sent", { source: "landing", length: trimmed.length });

    setLoading(true);
    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream"
        },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          source: "landing"
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamFinished = false;

      while (!streamFinished) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundaryIndex = buffer.indexOf("\n\n");
        while (boundaryIndex !== -1) {
          const frame = buffer.slice(0, boundaryIndex).trim();
          buffer = buffer.slice(boundaryIndex + 2);

          if (frame.length > 0) {
            const dataLines = frame
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim());

            for (const dataLine of dataLines) {
              const event = JSON.parse(dataLine) as StreamEvent;

              if (event.type === "session") {
                setSessionId(event.sessionId);
              } else if (event.type === "chunk") {
                setMessages((prev) => appendToLatestAssistant(prev, event.text));
              } else if (event.type === "citations") {
                setMessages((prev) => setLatestAssistantCitations(prev, event.citations));
              } else if (event.type === "error") {
                setError(event.message);
                setMessages((prev) => {
                  const last = prev[prev.length - 1];

                  if (last?.role === "assistant" && last.content.trim().length === 0) {
                    return appendToLatestAssistant(prev, event.message);
                  }

                  return prev;
                });
              } else if (event.type === "done") {
                streamFinished = true;
                break;
              }
            }
          }

          boundaryIndex = buffer.indexOf("\n\n");
        }
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unexpected error");
      setMessages((prev) => {
        const last = prev[prev.length - 1];

        if (last?.role === "assistant") {
          if (last.content.trim().length > 0) {
            return prev;
          }

          return appendToLatestAssistant(prev, "I couldn't process that right now. Please try again in a moment.");
        }

        return [...prev, { role: "assistant", content: "I couldn't process that right now. Please try again in a moment." }];
      });
      setSessionId(createSessionId());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  return (
    <section className="glass-dark relative overflow-hidden rounded-3xl p-6 shadow-panel lg:p-8" id="ask-thabiso">
      <div className="motion-orb pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-[#59a6ff]/20 blur-3xl" />
      <div className="motion-orb-reverse pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-[#2d78ff]/16 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90">
              <span className="h-2 w-2 rounded-full bg-mint" />
              Agent Online
            </div>
            <h3 className="mt-3 text-2xl text-white">Ask about Thabiso</h3>
            <p className="mt-2 text-sm text-white/75">
              The assistant is grounded in Thabiso&apos;s CV and curated site facts only.
            </p>
          </div>
        </div>

        <div className="mt-5 h-[360px] overflow-y-auto rounded-2xl border border-white/15 bg-[#0c1a2c]/85 p-4">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto bg-[#2b7fff] text-white"
                    : "mr-auto border border-white/10 bg-white/10 text-white"
                }`}
              >
                <p>{message.content || (loading ? "..." : "")}</p>
                {message.citations && message.citations.length > 0 ? (
                  <p className="mt-2 text-xs text-white/70">Sources: {message.citations.join(", ")}</p>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                void sendMessage(prompt);
              }}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:border-white/35"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={800}
            rows={3}
            placeholder="Ask a question about Thabiso's background, skills, or services..."
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-[#5ca0ff]"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-white/65">Chat logs are stored to improve assistant quality.</p>
            <button
              type="submit"
              disabled={loading || input.trim().length === 0}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#0b1a2e] transition hover:bg-[#e5edf8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Streaming..." : "Ask"}
            </button>
          </div>
        </form>

        {error ? <p className="mt-2 text-xs text-[#ffd0d0]">{error}</p> : null}
      </div>
    </section>
  );
}
