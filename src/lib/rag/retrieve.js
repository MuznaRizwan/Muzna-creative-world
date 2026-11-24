/**
 * Retrieval: embed the visitor's question and fetch the closest knowledge
 * chunks from Supabase (pgvector cosine similarity).
 */

import { embedTexts } from "@/lib/ai/gemini";

/**
 * @typedef {object} RetrievedChunk
 * @property {string} id
 * @property {string} category
 * @property {string} doc_type
 * @property {string} title
 * @property {string} section
 * @property {string} content
 * @property {number} similarity
 */

/** Raised when the database can't be queried. */
export class RetrievalError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = "RetrievalError";
  }
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {import("@/lib/ai/gemini").GeminiConfig} config
 * @param {string} query
 * @param {{ count: number, minSimilarity: number }} options
 * @returns {Promise<RetrievedChunk[]>}
 */
export async function retrieveChunks(supabase, config, query, { count, minSimilarity }) {
  const [embedding] = await embedTexts(config, [{ text: query }], "query", { timeoutMs: 12000 });
  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: embedding,
    match_count: count,
    min_similarity: minSimilarity,
  });
  if (error) throw new RetrievalError(`match_knowledge_chunks failed (${error.code ?? "unknown"})`);
  return /** @type {RetrievedChunk[]} */ (Array.isArray(data) ? data : []);
}

/**
 * The project indexes list every project by category and by technology.
 * Similarity search returns only the closest few chunks, so list questions
 * ("what games has she made?") would otherwise miss projects.
 */
export const PROJECT_INDEX_IDS = Object.freeze(["projects:by-category", "projects:by-technology"]);

/**
 * Append the project indexes when the answer draws on projects or skills.
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {RetrievedChunk[]} chunks
 * @returns {Promise<RetrievedChunk[]>}
 */
export async function withProjectIndexes(supabase, chunks) {
  if (!chunks.some((chunk) => chunk.category === "projects" || chunk.category === "skills")) return chunks;
  const missing = PROJECT_INDEX_IDS.filter((id) => !chunks.some((chunk) => chunk.id === id));
  if (missing.length === 0) return chunks;
  const { data, error } = await supabase
    .from("knowledge_chunks")
    .select("id, category, doc_type, title, section, content, metadata")
    .in("id", missing);
  if (error) throw new RetrievalError(`loading the project indexes failed (${error.code ?? "unknown"})`);
  return [...chunks, ...(data ?? []).map((row) => ({ ...row, similarity: 0 }))];
}
