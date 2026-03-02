-- Keyword Queue Table Schema
-- Central orchestration layer connecting keyword research to content generation pipelines

-- Create the keyword_queue table
CREATE TABLE IF NOT EXISTS keyword_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL,
    priority_score INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'generated', 'failed', 'published')),
    pipeline_type TEXT CHECK (pipeline_type IN ('paper', 'qa', 'topic')),
    cluster_id TEXT,
    search_volume INTEGER,
    keyword_difficulty INTEGER CHECK (keyword_difficulty BETWEEN 0 AND 100),
    retry_count INTEGER DEFAULT 0,
    generated_content_id UUID,
    requires_human_review BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries and performance
CREATE INDEX IF NOT EXISTS idx_keyword_queue_status ON keyword_queue(status);
CREATE INDEX IF NOT EXISTS idx_keyword_queue_cluster_id ON keyword_queue(cluster_id);
CREATE INDEX IF NOT EXISTS idx_keyword_queue_priority_score ON keyword_queue(priority_score);
CREATE INDEX IF NOT EXISTS idx_keyword_queue_pipeline_type ON keyword_queue(pipeline_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_keyword_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS trigger_keyword_queue_updated_at ON keyword_queue;
CREATE TRIGGER trigger_keyword_queue_updated_at
    BEFORE UPDATE ON keyword_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_keyword_queue_updated_at();

-- Enable Row Level Security
ALTER TABLE keyword_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role full access
CREATE POLICY "Service role full access keyword_queue"
    ON keyword_queue
    FOR ALL
    USING (auth.role() = 'service_role');

-- RLS Policy: Authenticated users can read all keywords
CREATE POLICY "Authenticated users can read keyword_queue"
    ON keyword_queue
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Authenticated users can insert keywords
CREATE POLICY "Authenticated users can insert keyword_queue"
    ON keyword_queue
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Authenticated users can update keywords
CREATE POLICY "Authenticated users can update keyword_queue"
    ON keyword_queue
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE keyword_queue IS 'Central queue for keyword-driven content generation, prioritizes keywords from research';
COMMENT ON COLUMN keyword_queue.id IS 'Unique identifier for the keyword queue entry';
COMMENT ON COLUMN keyword_queue.keyword IS 'Target keyword phrase for content generation';
COMMENT ON COLUMN keyword_queue.priority_score IS 'Calculated priority score (search_volume × (100 - keyword_difficulty))';
COMMENT ON COLUMN keyword_queue.status IS 'Processing status: pending, generating, generated, failed, or published';
COMMENT ON COLUMN keyword_queue.pipeline_type IS 'Content pipeline to use: paper, qa, or topic';
COMMENT ON COLUMN keyword_queue.cluster_id IS 'Semantic grouping reference for related keywords';
COMMENT ON COLUMN keyword_queue.search_volume IS 'Monthly search volume from keyword research';
COMMENT ON COLUMN keyword_queue.keyword_difficulty IS 'SEO difficulty score (0-100) from keyword research';
COMMENT ON COLUMN keyword_queue.retry_count IS 'Number of failed generation attempts';
COMMENT ON COLUMN keyword_queue.generated_content_id IS 'Polymorphic reference to generated content (papers.id, qa_candidates.id, or consumer_topics.id)';
COMMENT ON COLUMN keyword_queue.requires_human_review IS 'Flag for 20% spot-check review system';
COMMENT ON COLUMN keyword_queue.created_at IS 'Timestamp when the keyword was added to queue';
COMMENT ON COLUMN keyword_queue.updated_at IS 'Timestamp when the keyword queue entry was last modified';
