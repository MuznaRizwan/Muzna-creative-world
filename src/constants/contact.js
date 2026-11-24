/**
 * Contact Station limits and visitor-facing messages, shared by the form and
 * /api/contact so both sides apply the same rules.
 */

export const CONTACT_LIMITS = Object.freeze({
  /** Characters per field. */
  name: 100,
  email: 254,
  subject: 150,
  message: 5000,
  /** Largest request body the route reads. */
  bodyBytes: 16_000,
  /** A form sent sooner than this after it appeared is treated as a bot. */
  minFillMs: 3000,
  /** The browser gives up waiting for the server after this long. */
  timeoutMs: 20_000,
});

export const CONTACT_MESSAGES = Object.freeze({
  success: "Thank you for reaching out! Your message has been submitted successfully.",
  error: "Something went wrong while sending your message. Please try again later or contact me through LinkedIn.",
  invalid: "Please check the highlighted fields.",
  tooMany: "You've sent several messages in a short time. Please wait a few minutes and try again.",
  timeout: "Sending is taking too long. Please try again later or contact me through LinkedIn.",
  offline: "Couldn't reach the server. Check your connection and try again, or contact me through LinkedIn.",
});
