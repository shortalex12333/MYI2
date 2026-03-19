-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding columns to content tables (768 dimensions for nomic-embed-text)
ALTER TABLE papers ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE consumer_topics ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE qa_entries ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create indexes for fast similarity search
CREATE INDEX IF NOT EXISTS idx_papers_embedding ON papers USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX IF NOT EXISTS idx_topics_embedding ON consumer_topics USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX IF NOT EXISTS idx_qa_embedding ON qa_entries USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- Create similarity search function
CREATE OR REPLACE FUNCTION match_content(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content_type text,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- Papers
    SELECT
      p.id,
      'paper'::text AS content_type,
      p.title,
      p.body_markdown AS content,
      1 - (p.embedding <=> query_embedding) AS similarity
    FROM papers p
    WHERE p.embedding IS NOT NULL
      AND p.review_status = 'published'
      AND 1 - (p.embedding <=> query_embedding) > match_threshold

    UNION ALL

    -- Topics
    SELECT
      t.id,
      'topic'::text AS content_type,
      t.title,
      t.content,
      1 - (t.embedding <=> query_embedding) AS similarity
    FROM consumer_topics t
    WHERE t.embedding IS NOT NULL
      AND t.status = 'published'
      AND 1 - (t.embedding <=> query_embedding) > match_threshold

    UNION ALL

    -- Q&A
    SELECT
      q.id,
      'qa'::text AS content_type,
      q.question AS title,
      q.answer AS content,
      1 - (q.embedding <=> query_embedding) AS similarity
    FROM qa_entries q
    WHERE q.embedding IS NOT NULL
      AND q.active = true
      AND 1 - (q.embedding <=> query_embedding) > match_threshold
  ) combined
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
