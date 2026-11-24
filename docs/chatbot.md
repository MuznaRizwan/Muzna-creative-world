# Portfolio assistant (RAG chatbot)

The AI Station's question desk (and **Menu › Portfolio assistant**) opens a chat
that answers questions about Muzna from her portfolio data only. It retrieves
the relevant portfolio information first, then asks the language model to
answer from it. When nothing relevant is found, it says so instead of guessing.

## How it works

```
src/data/portfolioData.js
        │  npm run ingest   (src/lib/rag/knowledge.js → ~37 chunks)
        ▼
Gemini embeddings (gemini-embedding-001, 768 numbers per chunk)
        ▼
Supabase table knowledge_chunks (pgvector, row level security on)

Visitor question ─▶ POST /api/chat
   1. validate (1–500 characters, ≤ 8 earlier turns, ≤ 32 KB) and rate-limit
   2. greetings / thanks → fixed reply
   3. embed the question → match_knowledge_chunks() → top 6 above the similarity threshold
      (a short follow-up that points back, e.g. "what tools did that use?", is searched together
      with the previous question; any other question that matches nothing is retried that way)
      → if projects or skills matched, the two project indexes are added, so list questions
      ("what games has she made?") see every project
   4. nothing relevant → fixed "not in the portfolio" reply (the model is not called)
   5. otherwise Gemini (gemini-3.5-flash-lite) answers from the retrieved chunks,
      under the rules in src/lib/rag/prompt.js
   6. reply + the portfolio sections it came from (shown as clickable chips)
```

| File | Role |
|---|---|
| `src/lib/rag/knowledge.js` | Turns the portfolio data into chunks. One per project, one per skill area, one each for profile, education, experience, achievements and contact, plus two project indexes (by category, by technology). Gaps are written as "not listed", so the model can say so. |
| `src/lib/ai/gemini.js` | Gemini embeddings and generation over `fetch` (no SDK). Server only. |
| `src/lib/rag/retrieve.js` | Question embedding + pgvector search. |
| `src/lib/rag/prompt.js` | The assistant's identity and rules, and the fixed replies. |
| `src/app/api/chat/route.js` | The API route (validation, rate limit, retrieval, answer, errors). |
| `src/lib/server/rateLimit.js` | In-memory rate limiter (per server instance). |
| `src/lib/chat/chatStore.js` | The conversation in the browser (kept while the page is open). |
| `src/components/portfolio/sections/AssistantSection.jsx` | The chat interface inside the existing portfolio panel. |
| `scripts/ingest-knowledge.mjs` | Builds the chunks and syncs them to Supabase. |
| `supabase/migrations/001_knowledge_chunks.sql` | Table, index, row level security, grants for the server role and the search function. |

## One-time setup

### 1. Supabase (free plan)

1. Create a project at [supabase.com](https://supabase.com) (any region close to your visitors).
2. **SQL Editor › New query**: paste all of `supabase/migrations/001_knowledge_chunks.sql` and run it.
3. **Project Settings › API keys**: copy the **Project URL** and a **secret key**
   (`sb_secret_…`; the legacy `service_role` key also works).

Free projects pause after about a week without activity. While paused, the
assistant shows "isn't available right now"; resume the project from the
Supabase dashboard.

### 2. Gemini API key (free tier)

Create a key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
On the free tier Google may use the content sent to the API (visitors'
questions and the portfolio text) to improve its products, and rate limits
apply. A paid key removes both.

### 3. `.env.local`

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...      # server only, never NEXT_PUBLIC_
GEMINI_API_KEY=...                 # server only
```

`.env.local` is git-ignored. On Vercel, add the same three variables under
**Project › Settings › Environment Variables**.

### 4. Load the knowledge base

```
npm run ingest:preview   # writes knowledge-preview.md: read what the assistant will know
npm run ingest           # embeds and uploads it
```

## Keeping it up to date

Edit `src/data/portfolioData.js`, then run `npm run ingest` again. Only new or
changed chunks are embedded; chunks that no longer exist are deleted. After
changing the embedding model or its size, run `npm run ingest -- --force`.

Projects whose details are not confirmed are listed in
`UNCONFIRMED_PROJECT_IDS` (`src/lib/rag/knowledge.js`). The assistant only says
their details aren't available yet. Moral Triage is there until its text is
confirmed; remove its id and re-run the ingest once it is.

## Settings (optional, in `.env.local`)

| Variable | Default | Meaning |
|---|---|---|
| `GEMINI_CHAT_MODEL` | `gemini-3.5-flash-lite` | Model that writes answers. |
| `GEMINI_EMBEDDING_MODEL` | `gemini-embedding-001` | Embedding model (also supports `gemini-embedding-2`). |
| `EMBEDDING_DIMENSIONS` | `768` | Must match `vector(768)` in the migration. |
| `GEMINI_THINKING_LEVEL` | (unset) | Passed to the model only when set. |
| `RAG_MATCH_COUNT` | `6` | Chunks given to the model. |
| `RAG_MIN_SIMILARITY` | `0.58` | Relevance threshold (0–1). Raise it if off-topic questions get answers; lower it if real questions get "not in the portfolio". |
| `CHAT_RATE_LIMIT_PER_MINUTE` / `_PER_HOUR` | `8` / `60` | Per visitor, per server instance. |

## Safety measures

- API keys and the Supabase secret key are read only on the server. The browser only talks to `/api/chat`.
- The table has row level security with no public policies. The search function is executable by the service role only.
- Questions are limited to 500 characters; requests are size-limited and rate-limited.
- Retrieved text is wrapped as `<portfolio_context>` data, and the rules tell the model to ignore instructions inside it and in visitor messages.
- Off-topic or unknown questions that match nothing never reach the model.
- Errors are logged by type and HTTP status only. Questions, answers and IP addresses are not logged or stored.
- Answers are rendered as plain text; only `http(s)` links and email addresses become links.

Known limits: the rate limiter is per server instance (resets when Vercel
restarts an instance); the conversation is not saved after a page reload.
