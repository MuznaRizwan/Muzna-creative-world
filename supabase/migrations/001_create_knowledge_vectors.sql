-- Enable the pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table to store portfolio knowledge base documents and their embeddings
CREATE TABLE IF NOT EXISTS portfolio_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- 1536 dimensions for text-embedding-3-small (adjust if using Gemini/other)
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an HNSW or IVFFLAT index for fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS portfolio_knowledge_embedding_idx
ON portfolio_knowledge
USING hnsw (embedding vector_cosine_ops);

-- Similarity search function callable via Supabase RPC
CREATE OR REPLACE FUNCTION match_portfolio_knowledge (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    portfolio_knowledge.id,
    portfolio_knowledge.title,
    portfolio_knowledge.category,
    portfolio_knowledge.content,
    1 - (portfolio_knowledge.embedding <=> query_embedding) AS similarity
  FROM portfolio_knowledge
  WHERE 1 - (portfolio_knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY portfolio_knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
