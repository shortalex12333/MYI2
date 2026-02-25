-- Schema for Intelligence Briefs / Case Studies
-- Follows INTELLIGENCE_BRIEF_STRUCTURE_v2.1

-- Main intelligence briefs table
CREATE TABLE IF NOT EXISTS intelligence_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metadata (Section 0)
  cluster TEXT NOT NULL,
  cluster_slug TEXT NOT NULL,
  brief_title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  primary_query TEXT NOT NULL,
  secondary_queries TEXT[] DEFAULT '{}',
  entity_requirements JSONB DEFAULT '{}',
  min_entities INT DEFAULT 3,
  author_mode TEXT DEFAULT 'editorial' CHECK (author_mode IN ('editorial', 'person')),

  -- Content sections
  h1_title TEXT,                    -- Section 1: Primary title
  tldr TEXT,                        -- Section 2: TL;DR (max 120 words)
  trigger_conditions JSONB,         -- Section 3: Structured table
  underwriter_checklist TEXT[],     -- Section 4: Bullet list (6+ items)
  wording_traps JSONB,              -- Section 5: Clause failures
  operational_reality TEXT,         -- Section 6: Experience block (max 180 words)
  related_risks JSONB,              -- Section 7: Cluster reinforcement links
  broker_questions TEXT[],          -- Section 8: Questions to ask (5+ items)

  -- Citation tracking
  citation_needs JSONB,             -- Model outputs needs, not actual citations
  selected_refs TEXT[],             -- Backend-selected ref_ids from registry

  -- Quality metrics
  word_count INT,
  entity_count INT,
  numerical_anchor_count INT,

  -- Pipeline status
  publish_status TEXT DEFAULT 'raw' CHECK (
    publish_status IN ('raw', 'generated', 'reviewed', 'published')
  ),
  review_notes TEXT,

  -- Generation metadata
  generation_model TEXT DEFAULT 'qwen3:32b',
  generation_prompt_version TEXT,
  generated_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT tldr_word_limit CHECK (
    tldr IS NULL OR array_length(regexp_split_to_array(tldr, '\s+'), 1) <= 130
  ),
  CONSTRAINT operational_reality_word_limit CHECK (
    operational_reality IS NULL OR array_length(regexp_split_to_array(operational_reality, '\s+'), 1) <= 200
  )
);

-- Brief to citation mapping (deterministic references)
CREATE TABLE IF NOT EXISTS brief_citation_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES intelligence_briefs(id) ON DELETE CASCADE,
  ref_id TEXT NOT NULL,
  relevance_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brief_id, ref_id)
);

-- Claim log for QA (prevents confident nonsense)
CREATE TABLE IF NOT EXISTS brief_claim_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES intelligence_briefs(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  claim_type TEXT NOT NULL CHECK (
    claim_type IN ('operational_note', 'general_principle', 'framework_backed')
  ),
  ref_id TEXT,  -- Required if claim_type = 'framework_backed'
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publish audit log (pre-publish checks)
CREATE TABLE IF NOT EXISTS brief_publish_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES intelligence_briefs(id) ON DELETE CASCADE,
  check_name TEXT NOT NULL,
  check_passed BOOLEAN NOT NULL,
  details TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_briefs_cluster ON intelligence_briefs(cluster);
CREATE INDEX IF NOT EXISTS idx_briefs_status ON intelligence_briefs(publish_status);
CREATE INDEX IF NOT EXISTS idx_briefs_slug ON intelligence_briefs(slug);
CREATE INDEX IF NOT EXISTS idx_brief_citations_brief ON brief_citation_map(brief_id);
CREATE INDEX IF NOT EXISTS idx_brief_claims_brief ON brief_claim_log(brief_id);

-- RLS policies
ALTER TABLE intelligence_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_citation_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_claim_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_publish_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access briefs" ON intelligence_briefs;
CREATE POLICY "Service role full access briefs" ON intelligence_briefs
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access citations" ON brief_citation_map;
CREATE POLICY "Service role full access citations" ON brief_citation_map
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access claims" ON brief_claim_log;
CREATE POLICY "Service role full access claims" ON brief_claim_log
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access audit" ON brief_publish_audit;
CREATE POLICY "Service role full access audit" ON brief_publish_audit
  FOR ALL USING (auth.role() = 'service_role');
