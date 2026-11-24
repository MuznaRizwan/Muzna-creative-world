import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { CONTACT_LIMITS, CONTACT_MESSAGES } from "@/constants/contact";
import { buildContactEmail } from "@/lib/contact/emailTemplate";
import { validateContact } from "@/lib/contact/validation";
import { EmailError, emailConfig, isEmailConfigured, sendEmail } from "@/lib/email/resend";
import { clientKey, rateLimit } from "@/lib/server/rateLimit";

/**
 * POST /api/contact — the Contact Station form.
 *
 * Body: { name, email, subject, message, website, elapsedMs, submissionId }
 *   website       honeypot: a hidden field people leave empty
 *   elapsedMs     how long the form was open before sending
 *   submissionId  random id per filled-in form, for duplicate protection
 * Reply: { ok: true } or { error, code, fieldErrors? }
 *
 * The recipient is always CONTACT_EMAIL; any other field in the body is
 * ignored. Visitors never see provider details; logs never contain the
 * message, names or addresses.
 */

export const runtime = "nodejs";

/**
 * Per-visitor limits, kept in server memory (see lib/server/rateLimit.js).
 * Each Vercel instance counts separately and forgets on restart, so these
 * stop bursts from one visitor rather than enforce an exact global quota.
 */
const LIMITS = {
  requests: { limit: 20, windowMs: 10 * 60_000 }, // any request, valid or not
  sendsShort: { limit: 3, windowMs: 10 * 60_000 },
  sendsDay: { limit: 10, windowMs: 24 * 60 * 60_000 },
};

/**
 * Messages this instance sent recently, by idempotency key and by content.
 * Best effort only: other instances don't share it. Resend's idempotency key
 * is the protection that holds across instances.
 * @type {Map<string, number>}
 */
const recentlySent = new Map();
const DUPLICATE_WINDOW_MS = 10 * 60_000;

/** @param {string} key */
function sentRecently(key) {
  const now = Date.now();
  for (const [entry, time] of recentlySent) if (now - time > DUPLICATE_WINDOW_MS) recentlySent.delete(entry);
  return recentlySent.has(key);
}

/**
 * @param {number} status
 * @param {string} error   Shown to the visitor.
 * @param {string} code    For the form (e.g. to show field errors).
 * @param {Record<string, unknown>} [extra]
 * @param {Record<string, string>} [headers]
 */
const fail = (status, error, code, extra = {}, headers) => NextResponse.json({ error, code, ...extra }, { status, headers });

/** What spam checks answer: the same as a real success, so bots learn nothing. */
const pretendSuccess = () => NextResponse.json({ ok: true });

/** @param {string} value */
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

/**
 * @param {string} scope
 * @param {string} visitor
 * @param {{ limit: number, windowMs: number }} window
 */
function limited(scope, visitor, window) {
  const result = rateLimit(`contact:${scope}:${visitor}`, window);
  return result.ok ? null : fail(429, CONTACT_MESSAGES.tooMany, "rate_limited", {}, { "Retry-After": String(result.retryAfterSeconds) });
}

/** @param {import("next/server").NextRequest} request */
export async function POST(request) {
  const visitor = clientKey(request.headers);
  const flood = limited("requests", visitor, LIMITS.requests);
  if (flood) return flood;

  // ---- request shape and size
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return fail(415, CONTACT_MESSAGES.error, "bad_request");
  }
  if (Number(request.headers.get("content-length") ?? 0) > CONTACT_LIMITS.bodyBytes) {
    return fail(413, "That message is too long to send.", "too_long");
  }
  const raw = await request.text().catch(() => "");
  if (raw.length > CONTACT_LIMITS.bodyBytes) return fail(413, "That message is too long to send.", "too_long");
  /** @type {unknown} */
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, CONTACT_MESSAGES.error, "bad_request");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400, CONTACT_MESSAGES.error, "bad_request");
  const input = /** @type {Record<string, unknown>} */ (body);

  // ---- validation (the browser checks too, but is never trusted)
  const checked = validateContact(input);
  if (!checked.ok) return fail(400, CONTACT_MESSAGES.invalid, "invalid", { fieldErrors: checked.errors });

  // ---- spam: a filled honeypot, or a form sent faster than a person could
  const honeypot = typeof input.website === "string" && input.website.trim() !== "";
  const elapsed = Number(input.elapsedMs);
  const tooFast = !Number.isFinite(elapsed) || elapsed < CONTACT_LIMITS.minFillMs;
  if (honeypot || tooFast) {
    console.warn(`[contact] spam check: ${honeypot ? "honeypot" : "too fast"}`);
    return pretendSuccess();
  }

  // ---- per-visitor sending limits
  const burst = limited("sends-short", visitor, LIMITS.sendsShort) ?? limited("sends-day", visitor, LIMITS.sendsDay);
  if (burst) return burst;

  // ---- configuration: sending is off until all three settings exist
  const config = emailConfig();
  if (!isEmailConfigured(config)) {
    console.error("[contact] not configured: RESEND_API_KEY, CONTACT_EMAIL or RESEND_FROM_EMAIL is missing");
    return fail(503, CONTACT_MESSAGES.error, "not_configured");
  }

  // ---- duplicates: the same form sent twice, or the same text again
  const { values } = checked;
  const contentHash = sha256(`${values.email.toLowerCase()}\n${values.subject}\n${values.message}`);
  const submissionId =
    typeof input.submissionId === "string" && /^[A-Za-z0-9-]{8,64}$/.test(input.submissionId) ? input.submissionId : "anon";
  // Tied to the content as well, so a corrected form after a failure is a new request.
  const idempotencyKey = `contact-${submissionId}-${contentHash.slice(0, 32)}`;
  if (sentRecently(idempotencyKey) || sentRecently(contentHash)) return NextResponse.json({ ok: true, duplicate: true });

  try {
    const email = buildContactEmail(values);
    await sendEmail(config, { ...email, replyTo: values.email, idempotencyKey });
    const now = Date.now();
    recentlySent.set(idempotencyKey, now);
    recentlySent.set(contentHash, now);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof EmailError) {
      console.error(`[contact] Resend refused the message: ${error.message} (${error.status ?? "no response"})`);
      return fail(error.status === 429 ? 503 : 502, CONTACT_MESSAGES.error, "send_failed");
    }
    console.error(`[contact] unexpected error: ${error instanceof Error ? error.name : "unknown"}`);
    return fail(500, CONTACT_MESSAGES.error, "server_error");
  }
}
