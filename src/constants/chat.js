/** Limits shared by the chat interface and /api/chat (the server enforces them). */
export const CHAT_LIMITS = Object.freeze({
  /** Longest question a visitor can send. */
  messageChars: 500,
  /** Earlier messages sent along for follow-up questions. */
  historyTurns: 8,
  /** Each earlier message is cut to this length. */
  historyChars: 2000,
  /** Largest request body the route accepts. */
  bodyBytes: 32_000,
  /** How long the interface waits for an answer. */
  timeoutMs: 45_000,
});
