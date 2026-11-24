import { CHAT_LIMITS } from "@/constants/chat";
import { createStore } from "@/lib/state/createStore";

/**
 * The assistant conversation, kept in memory for the page's lifetime. It lives
 * outside React, so closing and reopening the panel (or opening a source from
 * an answer) doesn't lose it; reloading the page starts fresh. Nothing is
 * stored in the browser or on the server.
 */

/**
 * @typedef {object} ChatSource
 * @property {string} id       Knowledge chunk id, e.g. "project:monster-runner".
 * @property {string} title
 * @property {string} section  Portfolio panel that shows this information.
 */

/**
 * @typedef {object} ChatEntry
 * @property {string} id
 * @property {"user" | "assistant"} role
 * @property {string} content
 * @property {ChatSource[]} [sources]
 */

/**
 * @typedef {object} ChatState
 * @property {ChatEntry[]} messages
 * @property {boolean} pending                       An answer is on its way.
 * @property {{ message: string, retryable: boolean } | null} error  Shown under the last question.
 */

/** @type {ChatState} */
const INITIAL = { messages: [], pending: false, error: null };

export const chatStore = createStore(INITIAL);

let counter = 0;
const nextId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

/** @type {AbortController | null} */
let inFlight = null;

/** @param {string} value */
export const normaliseQuestion = (value) => value.replace(/\s+/g, " ").trim();

/**
 * Ask a question. Ignored while another answer is pending (no double sends).
 * @param {string} text
 * @returns {boolean} Whether the question was sent.
 */
export function sendChatMessage(text) {
  const message = normaliseQuestion(text);
  const { pending, error } = chatStore.getState();
  let { messages } = chatStore.getState();
  if (!message || pending) return false;
  // A new question replaces one that failed, so no question is left unanswered.
  if (error?.retryable && messages[messages.length - 1]?.role === "user") messages = messages.slice(0, -1);
  if (message.length > CHAT_LIMITS.messageChars) {
    chatStore.setState({ error: { message: `Please keep questions under ${CHAT_LIMITS.messageChars} characters.`, retryable: false } });
    return false;
  }

  const history = messages.slice(-CHAT_LIMITS.historyTurns).map(({ role, content }) => ({ role, content }));
  chatStore.setState({ messages: [...messages, { id: nextId(), role: "user", content: message }], pending: true, error: null });
  void request(message, history);
  return true;
}

/**
 * @param {string} message
 * @param {{ role: "user" | "assistant", content: string }[]} history
 */
async function request(message, history) {
  const controller = new AbortController();
  inFlight = controller;
  const timer = setTimeout(() => controller.abort(), CHAT_LIMITS.timeoutMs);
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (inFlight !== controller) return; // the conversation was cleared meanwhile
    if (!response.ok || typeof data?.reply !== "string") {
      const fallback = response.status === 429 ? "You're asking a little fast. Please wait a moment and try again." : "Something went wrong. Please try again.";
      chatStore.setState({
        pending: false,
        error: { message: typeof data?.error === "string" ? data.error : fallback, retryable: response.status !== 400 && response.status !== 413 },
      });
      return;
    }
    chatStore.setState((state) => ({
      pending: false,
      messages: [
        ...state.messages,
        { id: nextId(), role: "assistant", content: data.reply, sources: Array.isArray(data.sources) ? data.sources : [] },
      ],
    }));
  } catch {
    if (inFlight !== controller) return;
    chatStore.setState({
      pending: false,
      error: {
        message: controller.signal.aborted
          ? "The answer is taking too long. Please try again."
          : "Couldn't reach the assistant. Check your connection and try again.",
        retryable: true,
      },
    });
  } finally {
    clearTimeout(timer);
    if (inFlight === controller) inFlight = null;
  }
}

/** Send the last question again after an error. */
export function retryLastQuestion() {
  const { messages, pending } = chatStore.getState();
  const last = messages[messages.length - 1];
  if (pending || !last || last.role !== "user") return;
  chatStore.setState({ messages: messages.slice(0, -1), error: null });
  sendChatMessage(last.content);
}

/** Start a new conversation (cancels an answer in progress). */
export function clearChat() {
  inFlight?.abort();
  inFlight = null;
  chatStore.setState(INITIAL);
}
