# Phase 1: Foundation - Research

**Researched:** 2026-03-02
**Domain:** Keyword orchestration layer and quality infrastructure for GEO content system
**Confidence:** HIGH

## Summary

Phase 1 establishes the keyword orchestration layer that sits above existing content pipelines (papers, Q&A, topics). Research reveals the site already has robust content generation infrastructure with quality gates, Schema.org markup, and Supabase database patterns. The foundation phase adds a `keyword_queue` table to coordinate keyword-driven content generation across these pipelines, plus enhanced quality gates for keyword density and readability scoring.

**Key finding:** The existing papers pipeline already implements 6-gate quality validation including word count, entity density, and fabrication detection. This pattern should be replicated and extended for keyword-specific quality requirements (density <3%, readability >60 Flesch).

**Primary recommendation:** Add keyword orchestration layer via new `keyword_queue` table with foreign keys to existing content tables, then extend existing quality gate patterns with keyword density and readability checks.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FR-1.1 | Create keyword_queue table (id, keyword, priority_score, status, pipeline_type, cluster_id, search_volume, keyword_difficulty, retry_count, generated_paper_id, created_at) | Existing schema patterns in papers.sql, qa-generator/schema.sql, consumer_topics.sql provide reference. Use UUID primary keys, timestamptz for dates, status enums with CHECK constraints |
| FR-1.2 | Add keyword_queue_id foreign key to papers, qa_entries, consumer_topics tables | Supabase migration pattern established: `ALTER TABLE papers ADD COLUMN keyword_queue_id UUID REFERENCES keyword_queue(id)`. Add indexes for query performance |
| FR-1.4 | Store cluster_id for semantic keyword groupings | papers table already uses cluster_id (text field, indexed). Same pattern works for keyword_queue |
| FR-2.1-2.4 | Priority scoring (volume × (100 - difficulty)), seasonal multiplier, decay, daily re-score | Simple PostgreSQL calculation. Store base score, apply multipliers via VIEW or computed column. Cron job updates scores daily |
| FR-4.1-4.7 | Quality gates (pre-generation validation, word count, keyword density <3%, readability >60 Flesch, 20% spot-check, auto-flag issues, reject to review queue) | Existing paper-gates.ts implements 6-gate validation pattern. Extend with: (1) `flesch` npm package for readability, (2) keyword density calculation (count/total × 100), (3) review_status field with 'needs_review' state |
| FR-5.1-5.4 | Schema.org markup (FAQPage, Article, Organization, BreadcrumbList) | Organization schema already in layout.tsx, Article schema in papers/[slug]/page.tsx. Need to add FAQPage for Q&A content and BreadcrumbList for navigation |
</phase_requirements>

## Standard Stack

### Core (EXISTING - NO CHANGES)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 14 | SSR/SSG Framework | Already deployed. Native support for JSON-LD structured data via script tags |
| Supabase | Current | PostgreSQL Database | Already deployed. All content tables use this (papers, qa_candidates, consumer_topics) |
| PostgreSQL | 15+ | Relational DB | Supabase's underlying database. Supports foreign keys, triggers, views, and complex queries |
| Ollama | Latest | Local LLM Runtime | Already deployed with Qwen 3-32B and Mistral 7B for content generation |

### Quality Gate Libraries (NEW)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| flesch | 3.0.1 | Flesch Reading Ease calculation | Mature library (5+ years), 50K+ npm downloads/week, accepts syllable/word/sentence counts and returns 0-100 readability score |
| syllable | 5.0.1 | Syllable counting for readability | Required by `flesch` package. 100K+ npm downloads/week, works with all English text |

**Installation:**
```bash
npm install flesch syllable
```

### Schema.org (EXISTING - ENHANCE)
| Library | Current State | Required Addition |
|---------|---------------|-------------------|
| Native Next.js | Organization + Person + WebSite schemas in layout.tsx | Add FAQPage schema for Q&A content |
| Native Next.js | Article schema in papers/[slug]/page.tsx | Add BreadcrumbList schema for navigation |

**No external library needed** - Next.js native JSON-LD via script tags is preferred. The `next-seo` library (5.7M downloads/week) is available as alternative but adds unnecessary dependency.

## Architecture Patterns

### Recommended Project Structure
```
supabase/migrations/
├── 20260302_keyword_queue.sql          # New keyword orchestration table
├── 20260302_add_keyword_fks.sql        # Foreign keys to content tables
└── 20260302_quality_gate_fields.sql    # readability_score, keyword_density columns

src/lib/keyword-queue/
├── priority-scorer.ts                   # Calculate priority from volume/difficulty
├── queue-processor.ts                   # Select next keyword, route to pipeline
└── db.ts                                # Supabase client singleton

src/lib/quality-gates/
├── readability-checker.ts               # Flesch score calculation
├── keyword-density-checker.ts           # Density validation <3%
└── gate-runner.ts                       # Orchestrates all quality checks
```

### Pattern 1: Foreign Key Addition to Existing Tables

**What:** Add nullable `keyword_queue_id` column to existing content tables without disrupting current operations.

**When to use:** When adding orchestration layer to existing content pipelines.

**Example:**
```sql
-- Migration: 20260302_add_keyword_fks.sql
-- Add keyword tracking to papers table
ALTER TABLE papers
  ADD COLUMN keyword_queue_id UUID REFERENCES keyword_queue(id);

-- Index for performance (join queries)
CREATE INDEX idx_papers_keyword_queue ON papers(keyword_queue_id);

-- Add keyword tracking to qa_candidates table (if exists, otherwise skip)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'qa_candidates') THEN
    ALTER TABLE qa_candidates ADD COLUMN IF NOT EXISTS keyword_queue_id UUID REFERENCES keyword_queue(id);
    CREATE INDEX IF NOT EXISTS idx_qa_candidates_keyword_queue ON qa_candidates(keyword_queue_id);
  END IF;
END $$;

-- Add keyword tracking to consumer_topics table
ALTER TABLE consumer_topics
  ADD COLUMN keyword_queue_id UUID REFERENCES keyword_queue(id);

CREATE INDEX idx_consumer_topics_keyword_queue ON consumer_topics(keyword_queue_id);
```

**Critical:** Use `ADD COLUMN` (not `ADD COLUMN IF NOT EXISTS` for initial migration) to get clear error if column already exists. Use indexes on foreign keys for join performance.

### Pattern 2: Quality Gate Extension

**What:** Extend existing paper-gates.ts pattern with keyword-specific validation.

**When to use:** When adding new validation requirements to existing quality gate infrastructure.

**Example:**
```typescript
// Source: Inspired by src/lib/papers-pipeline/paper-gates.ts
import { flesch } from 'flesch';
import { syllable } from 'syllable';

export interface GateResult {
  gate: string;
  passed: boolean;
  detail: string;
  fatal: boolean;  // if true, reject entirely
}

// GATE: READABILITY
function gateReadability(body: string): GateResult {
  // Extract text without markdown formatting
  const text = body.replace(/[#*_~`]/g, '');

  // Count metrics
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  const totalSyllables = words.reduce((sum, word) => sum + syllable(word), 0);

  // Calculate Flesch Reading Ease (0-100, higher = easier)
  const score = flesch({ sentence: sentences, word: totalWords, syllable: totalSyllables });

  return {
    gate: 'Readability',
    passed: score >= 60,
    detail: `Flesch score: ${score.toFixed(1)} (target: ≥60)`,
    fatal: score < 40,  // Extremely difficult = reject
  };
}

// GATE: KEYWORD DENSITY
function gateKeywordDensity(body: string, targetKeyword: string): GateResult {
  const words = body.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  // Count keyword appearances (case-insensitive, whole keyword match)
  const keywordLower = targetKeyword.toLowerCase();
  const keywordCount = body.toLowerCase().split(keywordLower).length - 1;

  const density = (keywordCount / totalWords) * 100;

  return {
    gate: 'Keyword Density',
    passed: density < 3.0,
    detail: `Density: ${density.toFixed(2)}% (target: <3%)`,
    fatal: density >= 5.0,  // Extreme stuffing = reject
  };
}
```

**Key insight:** Quality gates return structured `GateResult` objects with `fatal` flag. This allows content to fail gracefully (send to review queue) vs. hard rejection.

### Pattern 3: Priority Scoring with PostgreSQL View

**What:** Calculate priority scores using database views for real-time ranking without storing stale scores.

**When to use:** When priority depends on multiple changing factors (volume, difficulty, time).

**Example:**
```sql
-- View: Real-time priority calculation
CREATE OR REPLACE VIEW keyword_queue_priority AS
SELECT
  id,
  keyword,
  status,
  pipeline_type,
  cluster_id,
  -- Base score: volume × (100 - difficulty)
  (search_volume * (100 - keyword_difficulty)) AS base_score,

  -- Seasonal multiplier (example: hurricane keywords in Q2-Q3)
  CASE
    WHEN keyword ILIKE '%hurricane%'
         AND EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 4 AND 9
    THEN 1.5
    ELSE 1.0
  END AS seasonal_multiplier,

  -- Decay for stale keywords (waiting >7 days)
  CASE
    WHEN status = 'pending'
         AND created_at < NOW() - INTERVAL '7 days'
    THEN 0.8
    ELSE 1.0
  END AS decay_factor,

  -- Final priority score
  (search_volume * (100 - keyword_difficulty))
    * CASE WHEN keyword ILIKE '%hurricane%'
           AND EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 4 AND 9
      THEN 1.5 ELSE 1.0 END
    * CASE WHEN status = 'pending'
           AND created_at < NOW() - INTERVAL '7 days'
      THEN 0.8 ELSE 1.0 END
  AS priority_score,

  created_at
FROM keyword_queue
WHERE status = 'pending'
ORDER BY priority_score DESC;
```

**Key insight:** Views calculate priority on-demand, avoiding stale cached scores. Queue processor simply queries the view for next keyword.

### Anti-Patterns to Avoid

- **Mass Content Publishing:** Don't publish 200 pages on day one. Staged rollout (20/week) prevents Google spam detection. Pitfall documented in research: 85% indexing failure rate for bulk AI content.

- **Keyword Stuffing:** Don't aim for high keyword density. Modern NLP detects semantic manipulation. Target <3% density, let natural language drive content.

- **Skipping Quality Gates:** Don't auto-publish AI-generated content. Every piece must pass validation. Existing papers pipeline has 6-gate system - extend it, don't bypass it.

- **Missing E-E-A-T Signals:** Don't publish without author attribution and expertise signals. 96% of AI citations come from authoritative sources with clear credentials.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Flesch readability scoring | Custom syllable counter + readability formula | `flesch` + `syllable` npm packages | Syllable counting has edge cases (silent e, compound words, names). Battle-tested library handles them. |
| Keyword density calculation | Complex regex for multi-word keywords | Simple split().length approach with toLowerCase() | Multi-word keyword matching seems simple but breaks on punctuation, case variations. Use proven pattern from existing research. |
| Priority queue ordering | Custom scoring algorithm with manual updates | PostgreSQL VIEW with real-time calculation | Storing priority scores requires cron jobs, cache invalidation, race conditions. Views calculate on-demand, always fresh. |
| Schema.org validation | Custom JSON-LD validator | Google Rich Results Test API | Schema.org spec is 1000+ types. Google's validator knows which fields are required/recommended. |
| Database migrations | Manual SQL execution | Supabase CLI migration system | Manual execution loses version tracking. Supabase CLI creates timestamped files, tracks applied migrations, supports rollback. |

**Key insight:** Supabase migration pattern is critical. Existing migrations show timestamped naming (20260225_add_gate_citations.sql) and IF NOT EXISTS guards for safety.

## Common Pitfalls

### Pitfall 1: qa_candidates Table Mystery

**What goes wrong:** The qa_candidates table is referenced throughout src/lib/qa-generator/*.ts but no CREATE TABLE statement exists in the migration files. The schema.sql only has ALTER TABLE statements, implying the table was created elsewhere or manually.

**Why it happens:** Incremental development where initial schema was created manually via Supabase dashboard, then later changes were migrated via SQL files.

**How to avoid:**
1. Check if qa_candidates exists in production database before writing migration
2. Use conditional migration with DO blocks and IF EXISTS checks
3. Document which tables were created manually vs. migrations

**Warning signs:**
- Code references table that doesn't appear in any migration file
- ALTER TABLE statements without corresponding CREATE TABLE
- Error: "relation does not exist" when running generator scripts

### Pitfall 2: Foreign Key Performance Without Indexes

**What goes wrong:** Adding foreign key constraints without indexes causes slow JOIN queries and full table scans on large tables.

**Why it happens:** Developers add foreign keys for referential integrity but forget that queries joining on those columns need indexes.

**How to avoid:**
```sql
-- WRONG: Just foreign key
ALTER TABLE papers ADD COLUMN keyword_queue_id UUID REFERENCES keyword_queue(id);

-- RIGHT: Foreign key + index
ALTER TABLE papers ADD COLUMN keyword_queue_id UUID REFERENCES keyword_queue(id);
CREATE INDEX idx_papers_keyword_queue ON papers(keyword_queue_id);
```

**Warning signs:**
- Slow queries on joined tables (papers JOIN keyword_queue)
- EXPLAIN ANALYZE shows "Seq Scan" instead of "Index Scan"
- Query performance degrades as table grows

### Pitfall 3: Keyword Density False Positives

**What goes wrong:** Simple keyword counting over-counts occurrences in URLs, code blocks, or HTML attributes that aren't visible content.

**Why it happens:** Naive implementation counts keyword in raw markdown/HTML instead of extracted text content.

**How to avoid:**
```typescript
// WRONG: Counts keywords in URLs, markdown syntax
const keywordCount = body.split(targetKeyword).length - 1;

// RIGHT: Extract text content first
function extractTextContent(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Extract link text only
    .replace(/[#*_~`]/g, '')  // Remove markdown formatting
    .replace(/<[^>]+>/g, '');  // Remove HTML tags if present
}

const text = extractTextContent(body);
const keywordCount = text.toLowerCase().split(targetKeyword.toLowerCase()).length - 1;
```

**Warning signs:**
- High keyword density reported but content reads naturally
- Keywords counted in reference URLs or code examples
- Density calculation changes when switching markdown renderers

### Pitfall 4: Flesch Score on Technical Content

**What goes wrong:** Technical insurance content (policy clauses, legal terms) naturally scores low on readability but is appropriate for the audience.

**Why it happens:** Flesch Reading Ease assumes general audience. Insurance professionals expect domain terminology.

**How to avoid:**
- Set threshold based on content type: papers (>60), Q&A (>70), consumer topics (>75)
- Don't fail technical content that appropriately uses industry terms
- Use readability as quality signal, not hard gate

**Warning signs:**
- Content rejected for low readability but is accurate and appropriate
- Oversimplification to hit readability targets reduces accuracy
- Subject matter experts flag content as "dumbed down"

### Pitfall 5: Missing RLS Policies on New Tables

**What goes wrong:** Creating keyword_queue table without Row Level Security policies allows unauthorized access.

**Why it happens:** Developers focus on schema structure and forget Supabase security model requires explicit RLS policies.

**How to avoid:**
```sql
-- ALWAYS enable RLS on new tables
CREATE TABLE keyword_queue (...);

ALTER TABLE keyword_queue ENABLE ROW LEVEL SECURITY;

-- Create appropriate policies
CREATE POLICY "Service role full access"
  ON keyword_queue FOR ALL
  USING (auth.role() = 'service_role');
```

**Warning signs:**
- Error: "Row-level security policy violated"
- Queries work with service key but fail with anon key
- Security audit flags public table access

## Code Examples

Verified patterns from existing codebase and official documentation:

### Quality Gate Integration

```typescript
// Source: Extends src/lib/papers-pipeline/paper-gates.ts pattern
import { db } from './db';
import { flesch } from 'flesch';
import { syllable } from 'syllable';

export interface GateResult {
  gate: string;
  passed: boolean;
  detail: string;
  fatal: boolean;
}

interface ValidationResult {
  contentId: string;
  passed: boolean;
  gates: GateResult[];
  verdict: 'publish' | 'revise' | 'reject';
}

// READABILITY GATE
function gateReadability(body: string): GateResult {
  const text = body.replace(/```[\s\S]*?```/g, '').replace(/[#*_~`]/g, '');
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  const totalSyllables = words.reduce((sum, word) => sum + syllable(word), 0);

  const score = flesch({ sentence: sentences, word: totalWords, syllable: totalSyllables });

  return {
    gate: 'Readability',
    passed: score >= 60,
    detail: `Flesch: ${score.toFixed(1)} (target: ≥60)`,
    fatal: score < 40,
  };
}

// KEYWORD DENSITY GATE
function gateKeywordDensity(body: string, keyword: string): GateResult {
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~`]/g, '');

  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;
  const keywordLower = keyword.toLowerCase();
  const keywordCount = text.toLowerCase().split(keywordLower).length - 1;
  const density = (keywordCount / totalWords) * 100;

  return {
    gate: 'Keyword Density',
    passed: density < 3.0,
    detail: `${density.toFixed(2)}% (target: <3%)`,
    fatal: density >= 5.0,
  };
}

// MAIN VALIDATOR
export async function validateContent(
  contentId: string,
  targetKeyword: string,
  contentType: 'paper' | 'qa' | 'topic'
): Promise<ValidationResult> {
  const tableName = contentType === 'paper' ? 'papers'
                  : contentType === 'qa' ? 'qa_candidates'
                  : 'consumer_topics';

  const bodyField = contentType === 'paper' ? 'body_markdown'
                  : contentType === 'qa' ? 'answer'
                  : 'content';

  const { data, error } = await db
    .from(tableName)
    .select(bodyField)
    .eq('id', contentId)
    .single();

  if (error || !data) {
    throw new Error(`Content not found: ${error?.message}`);
  }

  const body = data[bodyField];

  const gates: GateResult[] = [
    gateReadability(body),
    gateKeywordDensity(body, targetKeyword),
  ];

  const hasFatal = gates.some(g => g.fatal && !g.passed);
  const allPassed = gates.every(g => g.passed);

  const verdict = hasFatal ? 'reject'
                : allPassed ? 'publish'
                : 'revise';

  return {
    contentId,
    passed: allPassed,
    gates,
    verdict,
  };
}
```

### Schema.org FAQPage Implementation

```typescript
// Source: Extends existing pattern from src/app/papers/[slug]/page.tsx
// Note: JSON-LD in Next.js uses script tags - this is safe for structured data

interface FAQ {
  question: string;
  answer: string;
}

export default async function QAPage({ params }: { params: { id: string } }) {
  // Fetch Q&A data
  const qa = await fetchQAEntry(params.id);

  // Build FAQPage schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': {
      '@type': 'Question',
      'name': qa.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': qa.answer,
      }
    }
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Content rendering */}
    </div>
  );
}
```

### BreadcrumbList Schema Implementation

```typescript
// Source: Schema.org documentation + Next.js pattern

interface BreadcrumbItem {
  name: string;
  url: string;
}

function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `https://www.myyachtsinsurance.com${item.url}`
    }))
  };
}

// Usage in page
const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Papers', url: '/papers' },
  { name: 'Hurricane Coverage', url: '/papers/hurricane-coverage' },
];

const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Keyword density 2-5% optimal | Keyword density <3%, natural language focus | 2023-2024 (Google NLP updates) | Keyword stuffing now triggers penalties. Modern SEO prioritizes semantic relevance over density. |
| Manual Schema.org JSON-LD | Structured data required for AI citations | 2025-2026 (AI engine rise) | 96% of AI citations come from sites with Schema.org markup. No longer optional for GEO. |
| Bulk content publishing | Staged rollout (20 pages/week) | 2025 (Google spam detection) | Mass AI content publishing triggers deindexing. Progressive rollout avoids detection. |
| Single readability target | Audience-specific targets | Ongoing | Insurance professionals (grade 8-10) vs. consumers (grade 6-8) need different readability levels. |
| Grammarly for content quality | Automated quality gates (Flesch, density, gates) | 2024-2026 (AI content scale) | Human tools don't scale to 200+ AI-generated articles. Automated gates required. |

**Deprecated/outdated:**
- **Yoast SEO keyword density checker:** Optimizes for outdated 2015-era metrics. Use semantic analysis instead.
- **Manual content review only:** Doesn't scale to keyword-driven pipelines. Combine automated gates + human spot-checks (20%).
- **next-seo library for simple cases:** Adds dependency for functionality Next.js provides natively. Use only if managing complex schema across many pages.

## Open Questions

1. **qa_candidates Table Origin**
   - What we know: Table is referenced in code but no CREATE TABLE migration exists. Schema.sql only has ALTER statements.
   - What's unclear: Was it created manually in Supabase dashboard? Is there a missing migration file?
   - Recommendation: Query production database to check if table exists. If yes, use conditional migration with IF EXISTS. If no, create full schema in new migration.

2. **Spot-Check Review Implementation**
   - What we know: Requirement FR-4.5 mandates 20% human review. Papers pipeline has `review_status` field.
   - What's unclear: How to select 20% randomly? When in workflow does review happen (pre-publish or post-publish with ability to unpublish)?
   - Recommendation: Add `requires_human_review` boolean to keyword_queue table. Set TRUE for random 20% on creation. Block publication until reviewed.

3. **Seasonal Multiplier Configuration**
   - What we know: Requirement FR-2.2 mentions seasonal keywords (hurricane Q2-Q3).
   - What's unclear: Should seasonal rules be hardcoded in SQL view or configurable in application settings?
   - Recommendation: Start with hardcoded SQL view (simpler). Move to config table if seasonal rules change frequently or need per-keyword customization.

4. **CRON_SECRET Missing from Vercel**
   - What we know: Research noted "CRON_SECRET missing from Vercel" as blocker for cron jobs.
   - What's unclear: Does daily priority re-scoring (FR-2.4) require cron? Can we use on-demand calculation via VIEW instead?
   - Recommendation: Use PostgreSQL VIEW for real-time priority calculation instead of cron job. Eliminates cron dependency entirely.

## Sources

### Primary (HIGH confidence)

**Database Schema Patterns:**
- /Users/celeste7/Documents/MYI2/client/src/lib/papers-pipeline/papers.sql - papers table structure, indexes, views
- /Users/celeste7/Documents/MYI2/client/src/lib/qa-generator/schema.sql - qa_candidates ALTER statements
- /Users/celeste7/Documents/MYI2/client/supabase/migrations/20260226_consumer_topics.sql - consumer_topics table with RLS policies

**Quality Gate Implementation:**
- /Users/celeste7/Documents/MYI2/client/src/lib/papers-pipeline/paper-gates.ts - 6-gate validation pattern (structure, entity density, word count, fabrication, references, citations)

**Schema.org Existing Implementation:**
- /Users/celeste7/Documents/MYI2/client/src/app/layout.tsx - Organization, Person, WebSite schemas (site-wide)
- /Users/celeste7/Documents/MYI2/client/src/app/papers/[slug]/page.tsx - Article schema for papers

**Content Generation Pipelines:**
- /Users/celeste7/Documents/MYI2/client/src/lib/papers-pipeline/paper-generator.ts - Qwen 3-32B generation with reference injection
- /Users/celeste7/Documents/MYI2/client/src/lib/qa-generator/generate.ts - Ministral 8B Q&A generation
- /Users/celeste7/Documents/MYI2/client/src/lib/topics-pipeline/topic-generator.ts - Qwen 3-32B consumer guide generation

**Technology Stack Research:**
- /Users/celeste7/Documents/MYI2/client/.planning/research/STACK.md - Verified tool recommendations, cost breakdown, E-E-A-T requirements

**Domain Pitfalls:**
- /Users/celeste7/Documents/MYI2/client/.planning/research/PITFALLS.md - Common failures (mass content publishing, E-E-A-T gaps, keyword stuffing)

### Secondary (MEDIUM confidence)

**Readability Scoring:**
- [flesch npm package](https://www.npmjs.com/package/flesch) - Formula implementation, accepts syllable/word/sentence counts
- [GitHub - words/flesch](https://github.com/words/flesch) - Source code and documentation
- [text-readability npm package](https://www.npmjs.com/package/text-readability) - Alternative with multiple readability metrics

**Supabase Migrations:**
- [Database Migrations | Supabase Docs](https://supabase.com/docs/guides/deployment/database-migrations) - Official migration guide
- [Local development with schema migrations | Supabase Docs](https://supabase.com/docs/guides/local-development/overview) - CLI workflow
- [Performance and Security Advisors | Supabase Docs](https://supabase.com/docs/guides/database/database-advisors) - Foreign key indexing best practices

**Keyword Density Calculation:**
- [Keyword Density: Can It Improve SEO Results in 2026?](https://www.stanventures.com/blog/keyword-density/) - Modern SEO approach (0.5-1.75% optimal)
- [Keyword Density: What It Is & How to Calculate It](https://lowfruits.io/blog/keyword-density/) - Formula: (keyword count / total words) × 100
- [What is the Best Keyword Density Percentage for SEO?](https://www.hobo-web.co.uk/keyword-density-seo-myth/) - Anti-stuffing guidance (<3% maximum)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All technologies already deployed and verified in codebase
- Database patterns: HIGH - Multiple SQL files show consistent pattern (UUID primary keys, timestamptz, RLS policies)
- Quality gates: HIGH - Existing paper-gates.ts provides proven implementation pattern
- Schema.org implementation: HIGH - Existing layout.tsx and page.tsx show working patterns
- Readability/density calculation: MEDIUM - npm packages verified but not yet integrated, formula verified across multiple sources
- Priority scoring: HIGH - PostgreSQL VIEW pattern is standard approach, no custom logic needed

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (30 days - stable technologies, proven patterns)
