-- Schema updates for Q&A surface layer pipeline
-- Run against Supabase

-- Add new columns to qa_candidates for tagging + generation
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS canonical_id UUID;
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS alias_of UUID REFERENCES qa_candidates(id);
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS intent_tier TEXT CHECK (intent_tier IN ('T1', 'T2', 'T3'));
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS risk_topic TEXT;
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS persona_guess TEXT;
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS scenario_stage TEXT;
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS jurisdiction_guess TEXT;
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS publish_status TEXT DEFAULT 'raw' CHECK (publish_status IN ('raw', 'tagged', 'drafted', 'reviewed', 'published'));
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS word_count INT;
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS generation_model TEXT;
ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ;

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_qa_candidates_intent_tier ON qa_candidates(intent_tier);
CREATE INDEX IF NOT EXISTS idx_qa_candidates_risk_topic ON qa_candidates(risk_topic);
CREATE INDEX IF NOT EXISTS idx_qa_candidates_publish_status ON qa_candidates(publish_status);
CREATE INDEX IF NOT EXISTS idx_qa_candidates_canonical ON qa_candidates(canonical_id);

-- Table for tracking question variants (deduplication)
CREATE TABLE IF NOT EXISTS qa_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_id UUID NOT NULL REFERENCES qa_candidates(id),
  variant_question TEXT NOT NULL,
  similarity_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_variants_canonical ON qa_variants(canonical_id);

-- RLS policies
ALTER TABLE qa_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access qa_variants" ON qa_variants;
CREATE POLICY "Service role full access qa_variants" ON qa_variants FOR ALL USING (auth.role() = 'service_role');
