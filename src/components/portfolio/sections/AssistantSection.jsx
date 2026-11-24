"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowUp, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useWorld } from "@/components/world/WorldContext";
import { CHAT_LIMITS } from "@/constants/chat";
import { useStore } from "@/hooks/useStore";
import { chatStore, clearChat, retryLastQuestion, sendChatMessage } from "@/lib/chat/chatStore";

const WELCOME =
  "Hi! I'm the AI assistant for Muzna's Creative World. Ask me about her projects, education, skills, experience, or creative work.";

/** Button label → the question it asks. */
const SUGGESTIONS = [
  { label: "Explore my projects", question: "What projects has Muzna worked on?" },
  { label: "My technical skills", question: "What are Muzna's technical skills?" },
  { label: "My education", question: "What is Muzna's educational background?" },
  { label: "My creative experience", question: "What creative work and experience does Muzna have?" },
];

/** URLs and email addresses in answers become links (http(s) and mailto only). */
const LINK_PATTERN = /(https?:\/\/[^\s<>"')]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** @param {{ text: string }} props */
function RichText({ text }) {
  const parts = text.split(LINK_PATTERN);
  return parts.map((part, index) => {
    if (index % 2 === 0) return part;
    const trailing = part.match(/[.,;:!?]+$/)?.[0] ?? "";
    const target = trailing ? part.slice(0, -trailing.length) : part;
    const isEmail = !target.startsWith("http");
    return (
      <span key={index}>
        <a
          href={isEmail ? `mailto:${target}` : target}
          target={isEmail ? undefined : "_blank"}
          rel={isEmail ? undefined : "noopener noreferrer"}
          className="break-all text-lamp underline decoration-lamp/40 underline-offset-2 hover:decoration-lamp"
        >
          {target}
        </a>
        {trailing}
      </span>
    );
  });
}

function AssistantAvatar() {
  return (
    <span
      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-lavender/40 bg-lavender/15 text-lavender"
      aria-hidden="true"
    >
      <Sparkles className="h-3.5 w-3.5" />
    </span>
  );
}

/**
 * AI Station: the portfolio assistant. Answers come from /api/chat, which
 * retrieves matching portfolio information before the model writes a reply.
 * The conversation lives in chatStore, so it survives closing the panel.
 */
export function AssistantSection() {
  const { state } = useWorld();
  const messages = useStore(chatStore, (s) => s.messages);
  const pending = useStore(chatStore, (s) => s.pending);
  const error = useStore(chatStore, (s) => s.error);
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState("");
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const endRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages.length, pending, error, reduceMotion]);

  // Ready to type on desktop (on phones this would pop the keyboard up at once).
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
  }, []);

  /** @param {string} text */
  const ask = (text) => {
    if (sendChatMessage(text)) setDraft("");
  };

  /** @param {import("react").FormEvent<HTMLFormElement>} event */
  const onSubmit = (event) => {
    event.preventDefault();
    ask(draft);
  };

  /** @param {import("@/lib/chat/chatStore").ChatSource} source */
  const openSource = (source) => {
    const projectId = source.id.startsWith("project:") ? source.id.slice("project:".length) : undefined;
    state.openPanel(/** @type {any} */ (source.section), { params: projectId ? { projectId } : {} });
  };

  const bubbleMotion = reduceMotion ? {} : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.22 } };
  const remaining = CHAT_LIMITS.messageChars - draft.length;

  return (
    <div className="flex min-h-[55dvh] flex-col md:min-h-full">
      {/* Identity */}
      <div className="flex items-start justify-between gap-3 pb-4">
        <div className="flex items-center gap-2.5">
          <AssistantAvatar />
          <div>
            <p className="text-sm font-semibold text-fg">Muzna&apos;s portfolio assistant</p>
            <p className="text-xs text-muted">Answers only from this portfolio</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearChat();
              setDraft("");
              inputRef.current?.focus({ preventScroll: true });
            }}
            className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted hover:bg-raised hover:text-fg"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>
        )}
      </div>

      {/* Conversation */}
      <div className="flex-1 space-y-3" aria-live="polite" aria-relevant="additions" aria-busy={pending}>
        <div className="flex gap-2.5">
          <AssistantAvatar />
          <p className="max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-raised/70 px-3.5 py-2.5 text-sm leading-relaxed text-fg/95">
            {WELCOME}
          </p>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-[2.375rem]">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.label}
                type="button"
                disabled={pending}
                onClick={() => ask(suggestion.question)}
                className="rounded-full border border-lavender/40 bg-lavender/10 px-3 py-1.5 text-xs font-medium text-lavender transition-colors hover:border-lavender hover:bg-lavender/20 disabled:opacity-50"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) =>
            message.role === "user" ? (
              <motion.div key={message.id} className="flex justify-end" {...bubbleMotion}>
                <p className="max-w-[85%] whitespace-pre-line break-words rounded-2xl rounded-tr-sm bg-linear-to-br from-lavender to-rose px-3.5 py-2.5 text-sm leading-relaxed text-ink">
                  <span className="sr-only">You: </span>
                  {message.content}
                </p>
              </motion.div>
            ) : (
              <motion.div key={message.id} className="flex gap-2.5" {...bubbleMotion}>
                <AssistantAvatar />
                <div className="max-w-[85%] space-y-2">
                  <p className="whitespace-pre-line break-words rounded-2xl rounded-tl-sm border border-line bg-raised/70 px-3.5 py-2.5 text-sm leading-relaxed text-fg/95">
                    <span className="sr-only">Assistant: </span>
                    <RichText text={message.content} />
                  </p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                      <span>From the portfolio:</span>
                      {message.sources.map((source) => (
                        <button
                          key={source.id}
                          type="button"
                          onClick={() => openSource(source)}
                          className="rounded-full border border-line px-2 py-0.5 hover:border-lavender/60 hover:text-fg"
                        >
                          {source.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {pending && (
          <div className="flex gap-2.5" role="status">
            <AssistantAvatar />
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-line bg-raised/70 px-3.5 py-3">
              <span className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-lavender motion-reduce:animate-none"
                    style={{ animationDelay: `${dot * 140}ms` }}
                  />
                ))}
              </span>
              <span className="text-xs text-muted">Searching the portfolio…</span>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose/40 bg-rose/10 px-3.5 py-3 text-sm text-fg">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden="true" />
            <div className="flex-1 space-y-2">
              <p>{error.message}</p>
              {error.retryable && (
                <button
                  type="button"
                  onClick={retryLastQuestion}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs text-fg hover:bg-raised"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
                </button>
              )}
            </div>
          </div>
        )}
        {/* Scroll target; the margin keeps the newest message clear of the pinned input. */}
        <div ref={endRef} className="scroll-mb-36" />
      </div>

      {/* Input, pinned to the bottom of the panel while the conversation scrolls.
          -bottom-5 offsets the panel's bottom padding, which sticky positioning
          respects; with bottom-0 the answers showed through a strip below it. */}
      <form onSubmit={onSubmit} className="sticky -bottom-5 -mx-5 -mb-5 mt-4 border-t border-line bg-glass/95 px-5 pb-5 pt-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <label htmlFor="assistant-question" className="sr-only">
            Ask a question about Muzna&apos;s portfolio
          </label>
          <input
            ref={inputRef}
            id="assistant-question"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={CHAT_LIMITS.messageChars}
            placeholder="Ask about Muzna's work…"
            autoComplete="off"
            enterKeyHint="send"
            className="min-w-0 flex-1 rounded-xl border border-line bg-raised/70 px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:border-lavender/70 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending || !draft.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender text-ink transition-opacity hover:bg-lavender/90 disabled:opacity-40"
            aria-label="Send question"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 flex justify-between gap-3 text-[11px] text-muted">
          <span>AI answers can be incomplete. Details are drawn from the portfolio only.</span>
          {remaining <= 100 && <span className={remaining <= 20 ? "text-rose" : undefined}>{remaining}</span>}
        </p>
      </form>
    </div>
  );
}
