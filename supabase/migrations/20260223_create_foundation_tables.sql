-- Migration: Create/Update Foundation Tables for MYI2
-- Date: 2026-02-23
-- Purpose: Create missing tables and add missing columns for Q&A pipeline

-- ============================================
-- Add missing columns to existing tables
-- ============================================
DO $$
BEGIN
  -- qa_entries: Add missing columns
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'qa_entries') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qa_entries' AND column_name = 'domain') THEN
      ALTER TABLE qa_entries ADD COLUMN domain TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qa_entries' AND column_name = 'entities') THEN
      ALTER TABLE qa_entries ADD COLUMN entities JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qa_entries' AND column_name = 'source_type') THEN
      ALTER TABLE qa_entries ADD COLUMN source_type TEXT DEFAULT 'guide';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qa_entries' AND column_name = 'updated_at') THEN
      ALTER TABLE qa_entries ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
  END IF;

  -- qa_candidates: Add missing columns
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'qa_candidates') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qa_candidates' AND column_name = 'domain') THEN
      ALTER TABLE qa_candidates ADD COLUMN domain TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qa_candidates' AND column_name = 'entities') THEN
      ALTER TABLE qa_candidates ADD COLUMN entities JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'qa_candidates' AND column_name = 'source_type') THEN
      ALTER TABLE qa_candidates ADD COLUMN source_type TEXT DEFAULT 'guide';
    END IF;
  END IF;
END $$;

-- Create indexes on existing tables (safe because columns now exist)
CREATE INDEX IF NOT EXISTS idx_qa_entries_domain ON qa_entries(domain);
CREATE INDEX IF NOT EXISTS idx_qa_candidates_domain ON qa_candidates(domain);

-- ============================================
-- TABLE: qa_reviews (Audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS qa_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qa_candidate_id UUID,
  qa_entry_id UUID,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'edit', 'bulk_approve', 'bulk_reject')),
  reason TEXT,
  original_question TEXT,
  original_answer TEXT,
  edited_question TEXT,
  edited_answer TEXT,
  reviewer_email TEXT DEFAULT 'system@myyachtsinsurance.com',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qa_reviews_candidate ON qa_reviews(qa_candidate_id);
CREATE INDEX IF NOT EXISTS idx_qa_reviews_entry ON qa_reviews(qa_entry_id);
CREATE INDEX IF NOT EXISTS idx_qa_reviews_action ON qa_reviews(action);
CREATE INDEX IF NOT EXISTS idx_qa_reviews_created ON qa_reviews(created_at DESC);

ALTER TABLE qa_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access qa_reviews" ON qa_reviews;
CREATE POLICY "Service role full access qa_reviews" ON qa_reviews FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABLE: glossary_terms (Dynamic glossary)
-- ============================================
CREATE TABLE IF NOT EXISTS glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  body TEXT,
  category TEXT DEFAULT 'General',
  related_terms TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  confidence FLOAT DEFAULT 1.0,
  source_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_glossary_terms_slug ON glossary_terms(slug);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_category ON glossary_terms(category);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_active ON glossary_terms(active);

ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active glossary_terms" ON glossary_terms;
CREATE POLICY "Public can read active glossary_terms" ON glossary_terms FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Service role full access glossary_terms" ON glossary_terms;
CREATE POLICY "Service role full access glossary_terms" ON glossary_terms FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TABLE: content_pages (Dynamic topic pages)
-- ============================================
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT NOT NULL,
  content_type TEXT DEFAULT 'guide' CHECK (content_type IN ('guide', 'topic', 'learn', 'tool')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  related_pages TEXT[] DEFAULT '{}',
  cta_text TEXT,
  cta_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_type ON content_pages(content_type);
CREATE INDEX IF NOT EXISTS idx_content_pages_active ON content_pages(active);

ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active content_pages" ON content_pages;
CREATE POLICY "Public can read active content_pages" ON content_pages FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "Service role full access content_pages" ON content_pages;
CREATE POLICY "Service role full access content_pages" ON content_pages FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- SEED: Glossary Terms
-- ============================================
INSERT INTO glossary_terms (term, slug, definition, body, category, related_terms, meta_title, meta_description) VALUES
('Agreed Value', 'agreed-value', 'Policy valuation method where you and insurer agree on your yacht''s value upfront', '## What is Agreed Value?\n\nAgreed Value is a policy valuation method where you and your insurer establish a fixed value for your yacht at the time of policy inception.\n\n### Key Benefits\n- Predictable payout\n- No depreciation disputes\n- Better for well-maintained yachts', 'Policy Structure', ARRAY['actual-cash-value', 'hull-and-machinery'], 'Agreed Value Yacht Insurance', 'Learn how agreed value policies work for yacht insurance.'),
('Actual Cash Value (ACV)', 'actual-cash-value', 'Policy that pays depreciated market value at time of loss', '## What is Actual Cash Value?\n\nACV policies value your yacht at fair market value at time of loss, accounting for depreciation.\n\n### How ACV is Calculated\nACV = Replacement Cost - Depreciation', 'Policy Structure', ARRAY['agreed-value', 'hull-and-machinery'], 'ACV Yacht Insurance', 'Understand ACV policies for yacht insurance.'),
('Hull and Machinery', 'hull-and-machinery', 'Physical damage coverage for your yacht''s structure and equipment', '## Hull and Machinery Coverage\n\nH&M coverage protects your yacht''s physical structure, equipment, and machinery.\n\n### What''s Covered\n- Hull structure\n- Deck and superstructure\n- Engines and generators\n- Navigation equipment', 'Coverage Types', ARRAY['agreed-value', 'protection-and-indemnity'], 'Hull & Machinery Insurance', 'Complete guide to H&M coverage for yachts.'),
('Protection and Indemnity (P&I)', 'protection-and-indemnity', 'Liability coverage for injury to others and property damage', '## P&I Coverage\n\nProtection and Indemnity covers third-party liability claims.\n\n### What P&I Covers\n- Crew injuries\n- Passenger injuries\n- Property damage\n- Wreck removal', 'Coverage Types', ARRAY['hull-and-machinery'], 'P&I Liability Coverage', 'Essential P&I coverage for yacht owners.'),
('Navigation Limits', 'navigation-limits', 'Geographic boundaries where your policy provides coverage', '## Navigation Limits\n\nDefines where your insurance coverage applies.\n\n### Common Areas\n- Coastal US\n- Caribbean\n- Bahamas', 'Policy Terms', ARRAY['lay-up-warranty'], 'Navigation Limits Guide', 'Understanding navigation limits in yacht insurance.'),
('Lay-Up Warranty', 'lay-up-warranty', 'Requirement to haul out or secure vessel during specific periods', '## Lay-Up Warranty\n\nRequires securing your yacht during specific periods.\n\n### Types\n- Winter lay-up\n- Hurricane lay-up', 'Policy Terms', ARRAY['navigation-limits', 'named-storm-deductible'], 'Lay-Up Warranty Guide', 'What to know about lay-up warranties.'),
('Named Storm Deductible', 'named-storm-deductible', 'Higher deductible that applies during named hurricanes and tropical storms', '## Named Storm Deductible\n\nA percentage-based deductible for hurricane damage.\n\n### Example\n- Yacht Value: $500,000\n- Deductible: 5%\n- Your Cost: $25,000', 'Policy Terms', ARRAY['lay-up-warranty', 'navigation-limits'], 'Named Storm Deductibles', 'Understanding hurricane deductibles.')
ON CONFLICT (slug) DO UPDATE SET term = EXCLUDED.term, definition = EXCLUDED.definition, body = EXCLUDED.body, category = EXCLUDED.category, related_terms = EXCLUDED.related_terms, meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description, updated_at = NOW();

-- ============================================
-- SEED: Content Pages
-- ============================================
INSERT INTO content_pages (slug, title, subtitle, body, content_type, category, meta_title, meta_description, related_pages) VALUES
('hull-and-machinery-insurance', 'Hull and Machinery Insurance', 'Complete Physical Damage Protection', '## Hull and Machinery Insurance\n\nH&M insurance covers physical damage to your vessel including hull, deck, machinery, and equipment.\n\n### Coverage Components\n- Hull structure\n- Engines and transmissions\n- Navigation electronics\n- Safety equipment\n\n### Valuation Methods\n- Agreed Value\n- Actual Cash Value (ACV)\n\n### Common Covered Perils\n- Collision damage\n- Grounding\n- Fire and lightning\n- Theft and vandalism', 'guide', 'Coverage Types', 'Hull & Machinery Insurance Guide', 'Complete guide to H&M coverage for yachts.', ARRAY['protection-and-indemnity-pi']),
('protection-and-indemnity-pi', 'Protection and Indemnity Coverage', 'Essential Liability Protection', '## P&I Coverage\n\nLiability coverage protecting against third-party claims.\n\n### Protection Coverage\n- Passenger injuries\n- Crew injuries\n- Third-party injuries\n\n### Indemnity Coverage\n- Damage to other vessels\n- Dock damage\n- Environmental cleanup\n\n### Recommended Limits\n- Under $100K yacht: $500,000\n- $100K-$500K yacht: $1,000,000\n- Over $500K yacht: $2,000,000+', 'guide', 'Coverage Types', 'P&I Insurance Guide', 'Understanding P&I coverage for yachts.', ARRAY['hull-and-machinery-insurance']),
('charter-yacht-insurance-commercial', 'Charter Yacht Insurance', 'Commercial Coverage for Charter Operations', '## Charter Yacht Insurance\n\nSpecialized commercial coverage for charter operations.\n\n### Charter Types\n- Bareboat charter\n- Crewed charter\n- Day charter\n\n### Coverage Requirements\n- Commercial use endorsement\n- Higher P&I limits\n- Charter cancellation insurance\n\n### Regulatory Requirements\n- USCG licensing\n- Vessel inspection\n- Safety equipment', 'guide', 'Coverage Types', 'Charter Yacht Insurance', 'Insurance guide for charter yachts.', ARRAY['protection-and-indemnity-pi']),
('yacht-crew-insurance-crew-medical-jones-act', 'Crew Insurance and Jones Act', 'Protecting Your Captain and Crew', '## Crew Insurance\n\nCoverage for yacht owners employing crew.\n\n### Coverage Types\n- Crew medical insurance\n- Jones Act coverage\n- Maritime Employers Liability\n\n### Who Needs It\n- Paid captains\n- Paid crew\n- Charter operations\n\n### Coverage Limits\n- Captain only: $1,000,000\n- 2-4 crew: $2,000,000\n- 5+ crew: $5,000,000', 'guide', 'Coverage Types', 'Crew Insurance Guide', 'Understanding crew coverage and Jones Act.', ARRAY['charter-yacht-insurance-commercial']),
('navigation-limits-and-lay-up-warranty', 'Navigation Limits and Lay-Up', 'Geographic and Seasonal Restrictions', '## Navigation Limits and Lay-Up\n\nUnderstanding where and when you can operate.\n\n### Navigation Limits\n- Coastal US waters\n- Caribbean (seasonal)\n- Bahamas\n\n### Lay-Up Warranties\n- Winter lay-up\n- Hurricane lay-up\n\n### Compliance Tips\n1. Know your limits\n2. Notify before traveling\n3. Get written confirmation', 'guide', 'Policy Terms', 'Navigation Limits Guide', 'Understanding cruising grounds and lay-up requirements.', ARRAY['named-storm-deductible-florida']),
('named-storm-deductible-florida', 'Named Storm Deductibles Florida', 'Hurricane Deductibles for Florida Owners', '## Named Storm Deductibles in Florida\n\nPercentage-based deductibles for hurricane damage.\n\n### Example Calculation\n- Yacht Value: $400,000\n- Deductible: 5%\n- Your Cost: $20,000\n\n### Typical Ranges\n- South Florida: 5-10%\n- Central Florida: 3-5%\n- North Florida: 2-5%\n\n### Reducing Exposure\n- Buydown options\n- Hurricane preparedness\n- Inland storage', 'guide', 'Policy Terms', 'Named Storm Deductibles Florida', 'Florida guide to hurricane deductibles.', ARRAY['navigation-limits-and-lay-up-warranty'])
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, body = EXCLUDED.body, content_type = EXCLUDED.content_type, category = EXCLUDED.category, meta_title = EXCLUDED.meta_title, meta_description = EXCLUDED.meta_description, related_pages = EXCLUDED.related_pages, updated_at = NOW();
