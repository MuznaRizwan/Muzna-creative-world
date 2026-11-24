-- =====================================================================
-- Portfolio assistant knowledge base (Phase 8)
--
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Safe to run again (it only creates what is missing and replaces the
-- search function).
--
-- The vector size (768) must match EMBEDDING_DIMENSIONS in .env.local.
-- =====================================================================

-- pgvector, installed in Supabase's "extensions" schema.
create extension if not exists vector with schema extensions;

-- One row per knowledge chunk, built from src/data/portfolioData.js by
-- `npm run ingest`. The id is a stable source id ("project:monster-runner"),
-- so re-running the ingest updates rows instead of duplicating them.
create table if not exists public.knowledge_chunks (
  id              text primary key,
  category        text not null,          -- profile, education, experience, achievements, contact, skills, projects
  doc_type        text not null,          -- project, skill-category, project-index, ...
  title           text not null,
  section         text not null,          -- portfolio panel where the information appears
  content         text not null,
  content_hash    text not null,          -- sha256 of model + size + content: unchanged chunks are not re-embedded
  embedding_model text not null,
  embedding       extensions.vector(768) not null,
  metadata        jsonb not null default '{}'::jsonb,
  updated_at      timestamptz not null default now()
);

-- Nearest-neighbour index for cosine similarity.
create index if not exists knowledge_chunks_embedding_idx
  on public.knowledge_chunks
  using hnsw (embedding extensions.vector_cosine_ops);

-- Row level security on, with no policies: the public (anon) and signed-in
-- roles can neither read nor write. Only the server, using the secret /
-- service-role key, can reach the table.
alter table public.knowledge_chunks enable row level security;
revoke all on table public.knowledge_chunks from anon, authenticated;

-- Newer Supabase projects don't give the API roles access to new tables
-- automatically, so grant the server role exactly what the ingest and the
-- search need.
grant usage on schema extensions to service_role;
grant select, insert, update, delete on table public.knowledge_chunks to service_role;

-- Similarity search used by /api/chat (called with the service-role key).
create or replace function public.match_knowledge_chunks(
  query_embedding extensions.vector(768),
  match_count     int   default 6,
  min_similarity  float default 0.5
)
returns table (
  id         text,
  category   text,
  doc_type   text,
  title      text,
  section    text,
  content    text,
  metadata   jsonb,
  similarity float
)
language sql
stable
set search_path = public, extensions
as $$
  select
    c.id, c.category, c.doc_type, c.title, c.section, c.content, c.metadata,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks c
  where 1 - (c.embedding <=> query_embedding) >= min_similarity
  order by c.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
$$;

revoke execute on function public.match_knowledge_chunks(extensions.vector, int, float) from public, anon, authenticated;
grant execute on function public.match_knowledge_chunks(extensions.vector, int, float) to service_role;
