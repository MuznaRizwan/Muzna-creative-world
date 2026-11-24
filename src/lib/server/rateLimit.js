/**
 * A small sliding-window rate limiter kept in server memory.
 *
 * Limits: on Vercel every running instance has its own memory, and it is
 * cleared when an instance restarts, so this stops bursts and casual abuse
 * rather than enforcing an exact global quota. The AI provider's own quota
 * (and a spending cap, on paid plans) is the outer limit.
 */

/** @type {Map<string, number[]>} */
const hits = new Map();
const MAX_TRACKED = 5000;

/**
 * @param {string} key       Who is asking (an IP address; never logged).
 * @param {{ limit: number, windowMs: number }} options
 * @returns {{ ok: boolean, retryAfterSeconds: number }}
 */
export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000)) };
  }
  recent.push(now);
  hits.set(key, recent);

  // Forget idle visitors so the map cannot grow without bound.
  if (hits.size > MAX_TRACKED) {
    for (const [entry, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) hits.delete(entry);
    }
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/**
 * The client's IP, from the proxy headers Vercel (and most hosts) set.
 * @param {Headers} headers
 */
export function clientKey(headers) {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
