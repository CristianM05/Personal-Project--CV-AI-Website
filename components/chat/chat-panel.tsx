"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "./chat-provider";
import { HologramHead } from "./hologram-head";
import { Button } from "@/components/ui/button";
import { X, Send, MessageCircle, Zap, Search, BookOpen, Volume2, VolumeX } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: { title: string; url?: string }[];
}

type Emotion =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "surprised"
  | "thinking"
  | "talking";

function inferEmotion(answer: string): Emotion {
  const lower = answer.toLowerCase();
  if (lower.includes("excited") || lower.includes("great") || lower.includes("happy")) {
    return "happy";
  }
  if (lower.includes("sorry") || lower.includes("unfortunately") || lower.includes("difficult")) {
    return "sad";
  }
  if (lower.includes("frustrating") || lower.includes("angry")) {
    return "angry";
  }
  if (lower.includes("surprising") || lower.includes("wow")) {
    return "surprised";
  }
  if (lower.includes("think") || lower.includes("approach") || lower.includes("design")) {
    return "thinking";
  }
  return "neutral";
}

export function ChatPanel() {
  const { isOpen, close } = useChat();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm Cristian's virtual CV. Ask me anything about my skills, projects, or experience. Try the quick buttons below!",
      citations: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [emotion, setEmotion] = useState<Emotion>("neutral");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeAudioUrlRef = useRef<string | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const stopSpeaking = useCallback(() => {
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }

    if (activeAudioUrlRef.current) {
      URL.revokeObjectURL(activeAudioUrlRef.current);
      activeAudioUrlRef.current = null;
    }

    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (!voiceEnabled) {
      stopSpeaking();
    }
  }, [voiceEnabled, stopSpeaking]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  async function speakWithLocalTts(text: string) {
    if (typeof window === "undefined") return;
    if (!text.trim()) return;

    stopSpeaking();
    const abortController = new AbortController();
    ttsAbortRef.current = abortController;

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(errorText || `TTS request failed (${res.status})`);
      }

      const audioBlob = await res.blob();
      if (abortController.signal.aborted) return;

      const audioUrl = URL.createObjectURL(audioBlob);
      activeAudioUrlRef.current = audioUrl;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      const handleStop = () => {
        if (activeAudioRef.current === audio) {
          activeAudioRef.current = null;
        }
        if (activeAudioUrlRef.current) {
          URL.revokeObjectURL(activeAudioUrlRef.current);
          activeAudioUrlRef.current = null;
        }
        setIsSpeaking(false);
      };

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = handleStop;
      audio.onerror = handleStop;
      await audio.play();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.error("Local TTS playback failed:", error);
      }
      setIsSpeaking(false);
    } finally {
      if (ttsAbortRef.current === abortController) {
        ttsAbortRef.current = null;
      }
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setEmotion("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode: "normal" }),
      });
      const data = await res.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        citations: data.citations,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      const nextEmotion = inferEmotion(data.answer ?? "");
      setEmotion(nextEmotion);
      if (voiceEnabled && typeof data.answer === "string") {
        void speakWithLocalTts(data.answer);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again!" },
      ]);
      setEmotion("sad");
    } finally {
      setIsLoading(false);
    }
  }

  // When used inside the dedicated /chat page, we want the panel always visible.
  // When used from the global ChatProvider, we respect the open/close state.
  const shouldRender = typeof window === "undefined" ? isOpen : true;

  if (!shouldRender) return null;

  return (
    <div className="fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-border bg-background shadow-2xl sm:w-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <MessageCircle className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Ask my CV</p>
            <p className="text-xs text-muted-foreground">Chat with Cristian</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={voiceEnabled ? "Mute voice" : "Enable voice"}
            onClick={() => setVoiceEnabled((v) => !v)}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          {isOpen && (
            <Button variant="ghost" size="icon" onClick={close} aria-label="Close chat">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className="border-b border-border px-4 pb-3 pt-4">
        <HologramHead
          emotion={emotion === "talking" || isSpeaking ? "talking" : emotion}
          speaking={isSpeaking}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 border-t border-border/50 pt-2">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">References:</p>
                    <div className="flex flex-wrap gap-1">
                      {msg.citations.map((c, ci) => (
                        <span
                          key={ci}
                          className="inline-block rounded bg-background/50 px-1.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {c.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>
                    .
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                    .
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick buttons */}
      <div className="flex gap-2 border-t border-border px-4 py-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => sendMessage("Give me your 30-second pitch")}
          disabled={isLoading}
        >
          <Zap className="mr-1 h-3 w-3" />
          30s pitch
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => sendMessage("Deep dive into your experience")}
          disabled={isLoading}
        >
          <BookOpen className="mr-1 h-3 w-3" />
          Deep dive
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => sendMessage("Show me your evidence")}
          disabled={isLoading}
        >
          <Search className="mr-1 h-3 w-3" />
          Evidence
        </Button>
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
