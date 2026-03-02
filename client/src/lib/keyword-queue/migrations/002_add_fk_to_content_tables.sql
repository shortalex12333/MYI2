-- Add keyword_queue_id foreign keys to content tables
-- Links papers, Q&A, and topics back to the keyword that triggered their generation

-- Add foreign key to papers table
ALTER TABLE papers
  ADD COLUMN IF NOT EXISTS keyword_queue_id UUID REFERENCES keyword_queue(id);

CREATE INDEX IF NOT EXISTS idx_papers_keyword_queue ON papers(keyword_queue_id);

COMMENT ON COLUMN papers.keyword_queue_id IS 'Reference to the keyword that triggered this paper generation';

-- Add foreign key to qa_candidates table (conditional, as it may have been created manually)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'qa_candidates') THEN
    ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS keyword_queue_id UUID REFERENCES keyword_queue(id);
    CREATE INDEX IF NOT EXISTS idx_qa_candidates_keyword_queue ON qa_candidates(keyword_queue_id);

    -- Add comment if column was added
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'qa_candidates' AND column_name = 'keyword_queue_id'
    ) THEN
      COMMENT ON COLUMN qa_candidates.keyword_queue_id IS 'Reference to the keyword that triggered this Q&A generation';
    END IF;
  END IF;
END $$;

-- Add foreign key to consumer_topics table
ALTER TABLE consumer_topics
  ADD COLUMN IF NOT EXISTS keyword_queue_id UUID REFERENCES keyword_queue(id);

CREATE INDEX IF NOT EXISTS idx_consumer_topics_keyword_queue ON consumer_topics(keyword_queue_id);

COMMENT ON COLUMN consumer_topics.keyword_queue_id IS 'Reference to the keyword that triggered this topic generation';
