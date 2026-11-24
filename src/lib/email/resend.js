/**
 * Email delivery through Resend's REST API (https://resend.com/docs/api-reference/emails/send-email).
 * Server only: the API key, the recipient and the sender come from environment
 * variables and never reach the browser.
 *
 * Plain fetch instead of the `resend` SDK: the SDK pulls React Email and
 * Prettier into the server bundle for templates this project doesn't use.
 *
 * Sending is switched on only when all three settings are present, so leaving
 * one out (for example in Vercel until the recipient is confirmed) keeps
 * production from sending anything.
 */

const DEFAULT_API_URL = "https://api.resend.com";

/**
 * @typedef {object} EmailConfig
 * @property {string} apiKey  RESEND_API_KEY
 * @property {string} to      CONTACT_EMAIL: the only recipient; visitors can't change it.
 * @property {string} from    RESEND_FROM_EMAIL: a sender Resend has approved.
 * @property {string} apiUrl  RESEND_BASE_URL (tests only; defaults to Resend's API).
 */

/** @param {NodeJS.ProcessEnv} [env] @returns {EmailConfig} */
export function emailConfig(env = process.env) {
  return {
    apiKey: env.RESEND_API_KEY?.trim() ?? "",
    to: env.CONTACT_EMAIL?.trim() ?? "",
    from: env.RESEND_FROM_EMAIL?.trim() ?? "",
    apiUrl: (env.RESEND_BASE_URL?.trim() || DEFAULT_API_URL).replace(/\/+$/, ""),
  };
}

/** @param {EmailConfig} config */
export const isEmailConfigured = (config) => Boolean(config.apiKey && config.to && config.from);

/** Raised when Resend doesn't accept a message. Carries no secrets or content. */
export class EmailError extends Error {
  /**
   * @param {string} message  Resend's error name (e.g. "validation_error"), or "network_error" / "timeout".
   * @param {number | undefined} status  Resend's HTTP status, when there was a response.
   */
  constructor(message, status) {
    super(message);
    this.name = "EmailError";
    this.status = status;
  }
}

/**
 * Send one email. Resolves with Resend's message id once Resend has accepted
 * the message (accepted, not yet delivered: delivery happens afterwards).
 *
 * @param {EmailConfig} config
 * @param {{ subject: string, text: string, html: string, replyTo: string, idempotencyKey: string, timeoutMs?: number }} email
 * @returns {Promise<{ id: string | undefined }>}
 */
export async function sendEmail(config, { subject, text, html, replyTo, idempotencyKey, timeoutMs = 15_000 }) {
  let response;
  try {
    response = await fetch(`${config.apiUrl}/emails`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
        // Resend keeps an idempotency key for 24 hours and won't send the same
        // request twice, across every server instance.
        "idempotency-key": idempotencyKey,
      },
      body: JSON.stringify({ from: config.from, to: [config.to], reply_to: replyTo, subject, text, html }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new EmailError(timedOut ? "timeout" : "network_error", undefined);
  }

  /** @type {{ id?: string, name?: string } | null} */
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new EmailError(typeof data?.name === "string" ? data.name : "resend_error", response.status);
  return { id: typeof data?.id === "string" ? data.id : undefined };
}
