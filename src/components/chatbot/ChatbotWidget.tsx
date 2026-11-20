"use client";

import React, { useState } from "react";
import { Bot, X, Send } from "lucide-react";
import { ChatMessage } from "@/types/chat";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hi! I'm Muzna's AI portfolio assistant. Ask me anything about my projects, background, 3D work, or technical skills!",
      createdAt: new Date(),
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply || "Thinking...",
          createdAt: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error connecting to the AI assistant.",
          createdAt: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 transition-all hover:scale-105"
          aria-label="Open AI Chatbot"
        >
          <Bot className="w-7 h-7" />
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Muzna AI Assistant</h3>
                <span className="text-[11px] text-emerald-400">RAG Vector Enabled</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-neutral-800 text-neutral-200 rounded-bl-none border border-neutral-700/50"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-neutral-800 flex items-center gap-2 bg-neutral-950/60"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Muzna..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
