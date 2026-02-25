-- ============================================================
-- MYI Papers Pipeline Schema
-- Parallel to Q&A pipeline. Manages long-form article
-- generation, GEO scoring, and publication cadence.
-- Runs on Qwen3-32B. Publishes every 2-3 days.
-- ============================================================

-- ─── TOPIC SEEDS ─────────────────────────────────────────────
-- Derived from scraped 199 questions + keyword analysis.
-- These are SIGNALS, not content. They tell the generator
-- what to write about, not what to say.

CREATE TABLE IF NOT EXISTS paper_topics (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cluster_id      text NOT NULL,              -- matches clusters table
  topic_signal    text NOT NULL,              -- raw keyword/phrase from scrape
  canonical_title text,                       -- resolved article title (post-scoring)
  primary_query   text,                       -- exact anxiety-driven query to target
  secondary_queries text[],
  risk_topic      text,                       -- maps to reference_registry tags
  jurisdiction    text DEFAULT 'global',
  persona         text DEFAULT 'captain',     -- captain | owner | broker | engineer
  geo_score       smallint DEFAULT 0,
  authority_gap   smallint DEFAULT 0 CHECK (authority_gap BETWEEN 0 AND 5),
  cluster_depth   smallint DEFAULT 0 CHECK (cluster_depth BETWEEN 0 AND 5),
  registry_strength smallint DEFAULT 0 CHECK (registry_strength BETWEEN 0 AND 5),
  seasonal_weight smallint DEFAULT 0 CHECK (seasonal_weight BETWEEN 0 AND 5),
  persona_score   smallint DEFAULT 0 CHECK (persona_score BETWEEN 0 AND 5),
  status          text DEFAULT 'seed',        -- seed | scored | assigned | generated | published
  assigned_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- ─── PAPERS ──────────────────────────────────────────────────
-- One row per generated Intelligence Brief / paper.

CREATE TABLE IF NOT EXISTS papers (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id        uuid REFERENCES paper_topics(id),
  cluster_id      text NOT NULL,

  -- Content
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  body_markdown   text,                       -- full rendered article
  word_count      smallint,
  tldr            text,

  -- Identity binding (alex-short.com strategy)
  author_name     text DEFAULT 'Alex Short',
  author_url      text DEFAULT 'https://alex-short.com/experience',
  author_context  text,                       -- 1-line author note (e.g. "former yacht ETO")
  maintainer_note text,                       -- "Maintained by Alex Short"

  -- Metadata
  primary_query   text,
  secondary_queries text[],
  entities_used   text[],                     -- verified entity names in body
  numerical_anchors text[],                   -- extracted numbers for QA gate
  internal_links  text[],                     -- /briefs/... slugs used

  -- Schema / SEO
  schema_json     jsonb,                      -- Article schema for head injection
  published_at    timestamptz,
  last_updated    timestamptz,
  review_status   text DEFAULT 'draft',       -- draft | reviewed | published
  published_url   text,

  -- QA gates
  gate_structure  boolean DEFAULT false,
  gate_entity     boolean DEFAULT false,
  gate_word_count boolean DEFAULT false,
  gate_no_fabrication boolean DEFAULT false,
  gate_references boolean DEFAULT false,
  gates_passed_at timestamptz,

  created_at      timestamptz DEFAULT now()
);

-- ─── PAPER CITATION MAP ──────────────────────────────────────
-- Deterministic: backend selects refs, model never outputs URLs.

CREATE TABLE IF NOT EXISTS paper_citation_map (
  id       uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  paper_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  ref_id   text NOT NULL,                     -- references reference_registry.ref_id
  relevance_note text,
  position smallint,                          -- order in References section
  UNIQUE (paper_id, ref_id)
);

-- ─── PUBLICATION CALENDAR ────────────────────────────────────
-- Every 2-3 days. Cluster-balanced so no cluster dominates
-- before its hub brief is ready.

CREATE TABLE IF NOT EXISTS paper_calendar (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  publish_date  date NOT NULL UNIQUE,
  paper_id      uuid REFERENCES papers(id),
  cluster_id    text,
  status        text DEFAULT 'scheduled',     -- scheduled | published | skipped
  published_at  timestamptz,
  published_url text,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- ─── VIEWS ───────────────────────────────────────────────────

-- Next papers to generate (top GEO, not yet assigned)
CREATE OR REPLACE VIEW paper_queue AS
SELECT
  t.id AS topic_id,
  t.cluster_id,
  t.canonical_title,
  t.primary_query,
  t.persona,
  t.risk_topic,
  t.jurisdiction,
  (t.authority_gap + t.cluster_depth + t.registry_strength +
   t.seasonal_weight + t.persona_score) AS geo_score,
  t.authority_gap,
  t.registry_strength,
  t.seasonal_weight
FROM paper_topics t
WHERE t.status = 'scored'
ORDER BY
  (t.authority_gap + t.cluster_depth + t.registry_strength +
   t.seasonal_weight + t.persona_score) DESC,
  t.cluster_id,
  t.seasonal_weight DESC;

-- Upcoming calendar with readiness
CREATE OR REPLACE VIEW calendar_view AS
SELECT
  pc.publish_date,
  pc.status,
  p.title,
  p.slug,
  p.cluster_id,
  p.review_status,
  p.word_count,
  p.gates_passed_at IS NOT NULL AS gates_passed
FROM paper_calendar pc
LEFT JOIN papers p ON p.id = pc.paper_id
ORDER BY pc.publish_date;

-- Cluster publication balance (prevents cluster flooding)
CREATE OR REPLACE VIEW cluster_balance AS
SELECT
  cluster_id,
  COUNT(*) FILTER (WHERE p.review_status = 'published') AS published,
  COUNT(*) FILTER (WHERE p.review_status = 'draft')     AS in_draft,
  MAX(p.published_at)                                   AS last_published
FROM papers p
GROUP BY cluster_id
ORDER BY published DESC;

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_topics_status  ON paper_topics(status);
CREATE INDEX IF NOT EXISTS idx_topics_cluster ON paper_topics(cluster_id);
CREATE INDEX IF NOT EXISTS idx_papers_cluster ON papers(cluster_id);
CREATE INDEX IF NOT EXISTS idx_papers_status  ON papers(review_status);
CREATE INDEX IF NOT EXISTS idx_cal_date       ON paper_calendar(publish_date);
