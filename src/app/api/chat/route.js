import { NextResponse } from "next/server";

import { CHAT_LIMITS } from "@/constants/chat";
import { GeminiError, generateText, geminiConfig } from "@/lib/ai/gemini";
import { REPLIES, SYSTEM_PROMPT, contextBlock, smallTalkReply } from "@/lib/rag/prompt";
import { RetrievalError, retrieveChunks, withProjectIndexes } from "@/lib/rag/retrieve";
import { clientKey, rateLimit } from "@/lib/server/rateLimit";
import { createAdminClient, hasSupabaseConfig } from "@/lib/supabase/server";

/**
 * POST /api/chat — the portfolio assistant.
 *
 * Body: { message: string, history?: { role: "user" | "assistant", content: string }[] }
 * Reply: { reply: string, sources: { id, title, section }[], grounded: boolean }
 *
 * Flow: validate → rate limit → retrieve portfolio chunks (pgvector) → if
 * nothing is relevant enough, answer "not in the portfolio" without calling
 * the model → otherwise generate an answer grounded in those chunks.
 *
 * Keys stay on the server. Visitor messages and IP addresses are never logged;
 * errors are logged by type and status only.
 */

export const runtime = "nodejs";

const numberSetting = (/** @type {string | undefined} */ value, /** @type {number} */ fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

function settings() {
  return {
    matchCount: Math.min(12, numberSetting(process.env.RAG_MATCH_COUNT, 6)),
    minSimilarity: numberSetting(process.env.RAG_MIN_SIMILARITY, 0.58),
    perMinute: numberSetting(process.env.CHAT_RATE_LIMIT_PER_MINUTE, 8),
    perHour: numberSetting(process.env.CHAT_RATE_LIMIT_PER_HOUR, 60),
  };
}

/** Words that point back at the previous answer ("that", "it", "those"). */
const REFERS_BACK = /\b(it|its|that|this|those|these|they|them|their|one|ones)\b/i;

/** A short question that leans on the previous one. @param {string} message */
const isFollowUp = (message) => REFERS_BACK.test(message) && message.split(" ").length <= 12;

/**
 * @param {number} status
 * @param {string} error   Shown to the visitor.
 * @param {string} code    For the interface (e.g. to offer a retry).
 * @param {Record<string, string>} [headers]
 */
const fail = (status, error, code, headers) => NextResponse.json({ error, code }, { status, headers });

/**
 * @param {unknown} body
 * @returns {{ ok: true, message: string, history: { role: "user" | "assistant", content: string }[] } | { ok: false, error: string }}
 */
function validate(body) {
  if (!body || typeof body !== "object") return { ok: false, error: "Send a question as JSON." };
  const { message, history } = /** @type {{ message?: unknown, history?: unknown }} */ (body);
  if (typeof message !== "string") return { ok: false, error: "Type a question first." };
  const trimmed = message.replace(/\s+/g, " ").trim();
  if (!trimmed) return { ok: false, error: "Type a question first." };
  if (trimmed.length > CHAT_LIMITS.messageChars) {
    return { ok: false, error: `Please keep questions under ${CHAT_LIMITS.messageChars} characters.` };
  }

  /** @type {{ role: "user" | "assistant", content: string }[]} */
  const turns = [];
  if (Array.isArray(history)) {
    for (const turn of history.slice(-CHAT_LIMITS.historyTurns)) {
      if (!turn || typeof turn !== "object") continue;
      const { role, content } = /** @type {{ role?: unknown, content?: unknown }} */ (turn);
      if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) continue;
      turns.push({ role, content: content.trim().slice(0, CHAT_LIMITS.historyChars) });
    }
  }
  return { ok: true, message: trimmed, history: turns };
}

/** @param {import("next/server").NextRequest} request */
export async function POST(request) {
  // ---- request shape and size
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return fail(415, "Send the question as JSON.", "bad_request");
  }
  if (Number(request.headers.get("content-length") ?? 0) > CHAT_LIMITS.bodyBytes) {
    return fail(413, "That message is too long.", "too_long");
  }
  const raw = await request.text().catch(() => "");
  if (raw.length > CHAT_LIMITS.bodyBytes) return fail(413, "That message is too long.", "too_long");
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "Send the question as JSON.", "bad_request");
  }
  const input = validate(body);
  if (!input.ok) return fail(400, input.error, "invalid");

  // ---- rate limits (per visitor, per server instance)
  const config = settings();
  const visitor = clientKey(request.headers);
  for (const window of [
    { limit: config.perMinute, windowMs: 60_000, scope: "minute" },
    { limit: config.perHour, windowMs: 3_600_000, scope: "hour" },
  ]) {
    const result = rateLimit(`${window.scope}:${visitor}`, window);
    if (!result.ok) {
      return fail(429, "You're asking a little fast. Please wait a moment and try again.", "rate_limited", {
        "Retry-After": String(result.retryAfterSeconds),
      });
    }
  }

  // ---- greetings and thanks need no retrieval
  const quick = smallTalkReply(input.message);
  if (quick) return NextResponse.json({ reply: quick, sources: [], grounded: false });

  // ---- configuration
  const gemini = geminiConfig();
  if (!gemini.apiKey || !hasSupabaseConfig()) {
    console.error("[chat] not configured: GEMINI_API_KEY or Supabase variables are missing");
    return fail(503, REPLIES.unavailable, "not_configured");
  }

  try {
    const supabase = createAdminClient();
    const options = { count: config.matchCount, minSimilarity: config.minSimilarity };

    // Short follow-ups that point back ("what tools did that use?") are
    // searched together with the previous question. Other questions are
    // searched on their own, and retried with the previous question if
    // nothing matches.
    const previousQuestion = [...input.history].reverse().find((turn) => turn.role === "user")?.content;
    const combined = previousQuestion ? `${previousQuestion}\n${input.message}` : input.message;
    const refersBack = Boolean(previousQuestion) && isFollowUp(input.message);
    let chunks = await retrieveChunks(supabase, gemini, refersBack ? combined : input.message, options);
    if (chunks.length === 0 && previousQuestion && !refersBack) {
      chunks = await retrieveChunks(supabase, gemini, combined, options);
    }
    chunks = await withProjectIndexes(supabase, chunks);

    // Nothing relevant: say so instead of letting the model improvise.
    if (chunks.length === 0) return NextResponse.json({ reply: REPLIES.notFound, sources: [], grounded: false });

    // Earlier turns (for follow-ups), then the question with its context. The
    // conversation must start with the user and alternate, so consecutive
    // turns from the same side (e.g. after a failed request) are merged.
    /** @type {import("@/lib/ai/gemini").GeminiTurn[]} */
    const turns = [];
    for (const turn of [
      ...input.history.map((entry) => ({ role: entry.role === "assistant" ? "model" : "user", text: entry.content })),
      { role: "user", text: `${contextBlock(chunks)}\n\nVisitor's question: ${input.message}` },
    ]) {
      const role = /** @type {"user" | "model"} */ (turn.role);
      if (turns.length === 0 && role !== "user") continue;
      const last = turns[turns.length - 1];
      if (last && last.role === role) last.text = `${last.text}\n\n${turn.text}`;
      else turns.push({ role, text: turn.text });
    }

    const answer = await generateText(gemini, { system: SYSTEM_PROMPT, turns, maxOutputTokens: 1024 });
    if (answer.blocked) return NextResponse.json({ reply: REPLIES.blocked, sources: [], grounded: false });
    if (!answer.text) return NextResponse.json({ reply: REPLIES.empty, sources: [], grounded: false });

    const sources = [];
    const seen = new Set();
    for (const chunk of chunks) {
      if (chunk.doc_type === "project-index" || seen.has(chunk.title)) continue;
      seen.add(chunk.title);
      sources.push({ id: chunk.id, title: chunk.title, section: chunk.section });
    }
    return NextResponse.json({ reply: answer.text.slice(0, 4000), sources: sources.slice(0, 4), grounded: true });
  } catch (error) {
    if (error instanceof GeminiError) {
      console.error(`[chat] Gemini error: ${error.message}`);
      if (error.status === 429) return fail(503, REPLIES.busy, "busy");
      return fail(502, REPLIES.unavailable, "provider_error");
    }
    if (error instanceof RetrievalError) {
      console.error(`[chat] retrieval error: ${error.message}`);
      return fail(503, REPLIES.unavailable, "retrieval_error");
    }
    console.error(`[chat] unexpected error: ${error instanceof Error ? error.name : "unknown"}`);
    return fail(500, REPLIES.unavailable, "server_error");
  }
}
