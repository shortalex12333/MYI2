-- Consumer Topics Table Schema
-- Educational content pages for insurance topics

-- Create the consumer_topics table
CREATE TABLE IF NOT EXISTS consumer_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    category TEXT CHECK (category IN (
        'Coverage Basics',
        'Cost & Quotes',
        'Claims',
        'Policy Types',
        'Florida & Hurricane',
        'General'
    )),
    faqs JSONB DEFAULT '[]'::jsonb,
    related_papers JSONB DEFAULT '[]'::jsonb,
    related_cluster TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_consumer_topics_slug ON consumer_topics(slug);
CREATE INDEX IF NOT EXISTS idx_consumer_topics_category ON consumer_topics(category);
CREATE INDEX IF NOT EXISTS idx_consumer_topics_status ON consumer_topics(status);
CREATE INDEX IF NOT EXISTS idx_consumer_topics_related_cluster ON consumer_topics(related_cluster);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_consumer_topics_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update last_updated timestamp
DROP TRIGGER IF EXISTS trigger_consumer_topics_last_updated ON consumer_topics;
CREATE TRIGGER trigger_consumer_topics_last_updated
    BEFORE UPDATE ON consumer_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_consumer_topics_last_updated();

-- Enable Row Level Security
ALTER TABLE consumer_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access for published topics
CREATE POLICY "Public can read published topics"
    ON consumer_topics
    FOR SELECT
    USING (status = 'published');

-- RLS Policy: Authenticated users can read all topics (for admin/preview)
CREATE POLICY "Authenticated users can read all topics"
    ON consumer_topics
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Authenticated users can insert topics
CREATE POLICY "Authenticated users can insert topics"
    ON consumer_topics
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Authenticated users can update topics
CREATE POLICY "Authenticated users can update topics"
    ON consumer_topics
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policy: Authenticated users can delete topics
CREATE POLICY "Authenticated users can delete topics"
    ON consumer_topics
    FOR DELETE
    TO authenticated
    USING (true);

-- Comments for documentation
COMMENT ON TABLE consumer_topics IS 'Educational content pages for insurance topics';
COMMENT ON COLUMN consumer_topics.id IS 'Unique identifier for the topic';
COMMENT ON COLUMN consumer_topics.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN consumer_topics.title IS 'Display title for the topic';
COMMENT ON COLUMN consumer_topics.summary IS 'Short description for previews and meta';
COMMENT ON COLUMN consumer_topics.content IS 'HTML body content, approximately 500 words';
COMMENT ON COLUMN consumer_topics.category IS 'Topic category for organization';
COMMENT ON COLUMN consumer_topics.faqs IS 'Array of {question, answer} objects for FAQ schema markup';
COMMENT ON COLUMN consumer_topics.related_papers IS 'Array of {title, slug} for linking to /papers/ routes';
COMMENT ON COLUMN consumer_topics.related_cluster IS 'Cluster ID for internal linking between related content';
COMMENT ON COLUMN consumer_topics.status IS 'Publication status: draft or published';
COMMENT ON COLUMN consumer_topics.created_at IS 'Timestamp when the topic was created';
COMMENT ON COLUMN consumer_topics.last_updated IS 'Timestamp when the topic was last modified';
