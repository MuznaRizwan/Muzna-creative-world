/**
 * A small Gemini API client (embeddings and text generation) built on fetch,
 * so no SDK dependency is needed. Server-side only: it reads GEMINI_API_KEY,
 * which must never reach the browser. Used by the chat route and by the
 * knowledge ingest script (so no path aliases here).
 *
 * Model names are settings, not code: Google renames and retires models, and
 * a change only needs a new value in .env.local (and, for the embedding
 * model, a re-run of `npm run ingest`).
 */

const API_ROOT = "https://generativelanguage.googleapis.com/v1beta";
const BATCH_SIZE = 100;

export const GEMINI_DEFAULTS = Object.freeze({
  embeddingModel: "gemini-embedding-001",
  chatModel: "gemini-3.5-flash-lite",
  /** Must match the vector size in supabase/migrations (vector(768)). */
  dimensions: 768,
});

/**
 * @typedef {object} GeminiConfig
 * @property {string} apiKey
 * @property {string} embeddingModel
 * @property {string} chatModel
 * @property {number} dimensions
 * @property {string} thinkingLevel  Optional, passed through only when set.
 */

/** @returns {GeminiConfig} */
export function geminiConfig(env = process.env) {
  return {
    apiKey: env.GEMINI_API_KEY ?? "",
    embeddingModel: env.GEMINI_EMBEDDING_MODEL || GEMINI_DEFAULTS.embeddingModel,
    chatModel: env.GEMINI_CHAT_MODEL || GEMINI_DEFAULTS.chatModel,
    dimensions: Number(env.EMBEDDING_DIMENSIONS) || GEMINI_DEFAULTS.dimensions,
    thinkingLevel: env.GEMINI_THINKING_LEVEL ?? "",
  };
}

/** An API failure. `status` is the HTTP status (0 for network errors and timeouts). */
export class GeminiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {string} [detail]  Google's error message; fine for the CLI, never sent to visitors.
   */
  constructor(message, status, detail) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * @param {GeminiConfig} config
 * @param {string} path
 * @param {unknown} body
 * @param {number} timeoutMs
 */
async function post(config, path, body, timeoutMs) {
  if (!config.apiKey) throw new GeminiError("GEMINI_API_KEY is not set", 0);
  let response;
  try {
    response = await fetch(`${API_ROOT}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": config.apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new GeminiError(timedOut ? "Gemini request timed out" : "Could not reach the Gemini API", 0);
  }
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const method = path.split(":").pop();
    throw new GeminiError(`Gemini ${method} failed (HTTP ${response.status})`, response.status, json?.error?.message);
  }
  return json;
}

/** Scale a vector to length 1 (cosine distance assumes it; shortened Gemini vectors are not). @param {number[]} values */
function normalise(values) {
  const length = Math.hypot(...values);
  return length > 0 ? values.map((value) => value / length) : values;
}

/**
 * Embed texts for retrieval.
 *
 * gemini-embedding-001 takes a task type (document vs query). Newer models
 * (gemini-embedding-2) reject it and expect the task written into the text.
 *
 * @param {GeminiConfig} config
 * @param {{ text: string, title?: string }[]} items
 * @param {"document" | "query"} kind
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<number[][]>}
 */
export async function embedTexts(config, items, kind, { timeoutMs = 20000 } = {}) {
  const model = config.embeddingModel;
  const usesTaskType = model.startsWith("gemini-embedding-001");
  /** @type {number[][]} */
  const vectors = [];

  for (let start = 0; start < items.length; start += BATCH_SIZE) {
    const batch = items.slice(start, start + BATCH_SIZE);
    const requests = batch.map(({ text, title }) => ({
      model: `models/${model}`,
      content: {
        parts: [
          {
            text: usesTaskType
              ? text
              : kind === "query"
                ? `task: search result | query: ${text}`
                : `title: ${title || "none"} | text: ${text}`,
          },
        ],
      },
      ...(usesTaskType ? { taskType: kind === "query" ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT" } : {}),
      outputDimensionality: config.dimensions,
    }));
    const json = await post(config, `models/${model}:batchEmbedContents`, { requests }, timeoutMs);
    const embeddings = Array.isArray(json?.embeddings) ? json.embeddings : [];
    if (embeddings.length !== batch.length) throw new GeminiError("Gemini returned an unexpected number of embeddings", 502);
    for (const embedding of embeddings) {
      const values = embedding?.values;
      if (!Array.isArray(values) || values.length !== config.dimensions) {
        throw new GeminiError(`Gemini returned embeddings of the wrong size (expected ${config.dimensions})`, 502);
      }
      vectors.push(normalise(values));
    }
  }
  return vectors;
}

/**
 * @typedef {object} GeminiTurn
 * @property {"user" | "model"} role
 * @property {string} text
 */

/**
 * Generate an answer.
 * @param {GeminiConfig} config
 * @param {{ system: string, turns: GeminiTurn[], maxOutputTokens?: number, timeoutMs?: number }} request
 * @returns {Promise<{ text: string, finishReason: string, blocked: boolean }>}
 */
export async function generateText(config, { system, turns, maxOutputTokens = 1024, timeoutMs = 25000 }) {
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: turns.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
    generationConfig: {
      maxOutputTokens,
      ...(config.thinkingLevel ? { thinkingConfig: { thinkingLevel: config.thinkingLevel } } : {}),
    },
  };
  const json = await post(config, `models/${config.chatModel}:generateContent`, body, timeoutMs);
  const candidate = json?.candidates?.[0];
  const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
  const answer = parts
    .filter((/** @type {any} */ part) => typeof part?.text === "string" && !part.thought)
    .map((/** @type {any} */ part) => part.text)
    .join("")
    .trim();
  return {
    text: answer,
    finishReason: String(candidate?.finishReason ?? ""),
    blocked: Boolean(json?.promptFeedback?.blockReason) || candidate?.finishReason === "SAFETY",
  };
}
