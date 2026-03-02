# Phase 2: Pipeline Integration - Research

**Researched:** 2026-03-02
**Domain:** Queue processing, content generation pipelines, keyword data import
**Confidence:** HIGH

## Summary

Phase 2 connects the keyword_queue infrastructure (established in Phase 1) to the existing content generation pipelines. The codebase has three distinct pipelines - papers (Qwen3-32B for long-form Intelligence Briefs), Q&A (Ministral 8B for short answers), and topics (Qwen3-32B for consumer guides) - each with its own generation pattern but sharing a common database pattern via Supabase.

The queue processor will select keywords from `keyword_queue_priority` VIEW, route them by intent to the appropriate pipeline, and link the generated content back via the `keyword_queue_id` foreign key. The existing cron pattern (vercel.json + `/api/cron/` routes) provides the execution model for hourly processing.

**Primary recommendation:** Build a modular queue processor that adapts existing generators rather than rewriting them. Each generator already accepts topic/query inputs - extend them to accept `target_keyword` and `keyword_queue_id` parameters.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Cron runs **every hour** (24 checks/day)
- Process **1 keyword per run** - safest pace, naturally limits output
- **Immediate retry** on failure (up to 3 attempts in same run), then mark 'failed'
- Row locking via `status = 'generating'` before LLM call, release on completion/failure
- **Rolling 7-day count** - query `published_at > NOW() - INTERVAL '7 days'`
- Skip processing if count >= 20
- **Keyword intent determines pipeline:**
  - Questions ("how to", "what is", "does", "can") -> Q&A pipeline
  - Commercial ("best", "cost", "price", "compare") -> Topics pipeline
  - Everything else (informational) -> Papers pipeline
- Use simple keyword pattern matching for intent detection
- **Cluster behavior:** Process one keyword per cluster per day to ensure topic diversity
- **Source:** Existing `all_domains_qa.json` and keyword research data in project root
- **Clustering:** Group by semantic theme
- **Initial priorities:** Calculate using Phase 1 formula: `volume * (100 - difficulty)`
- **Status:** All imported as 'pending'
- **Selection:** Top 20 by priority score, ensuring cluster diversity (max 3 per cluster)
- **No manual review gate** - trust quality gates from Phase 1
- **Rollout pacing:** Natural 1/hour limit handles pacing; ~3-5 pieces/day realistic
- **Priority tiebreaker:** Lower difficulty wins (easier to rank for)

### Claude's Discretion
- Specific intent regex patterns
- Exact cluster grouping algorithm
- Error logging verbosity
- Database index optimization

### Deferred Ideas (OUT OF SCOPE)
- Monitoring dashboard - Phase 3
- Scale to 50/week triggers - Phase 3
- Search Console API integration - Phase 3
- Seasonal hurricane keyword boost - already in Phase 1 scoring formula
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FR-3.1 | Queue processor selects highest-priority pending keyword with constraints | Use `keyword_queue_priority` VIEW, filter by cluster_id for daily limit |
| FR-3.2 | Route keywords to appropriate pipeline based on intent | Intent detection via regex patterns, pipeline_type field |
| FR-3.3 | Papers pipeline accepts target_keyword parameter | Extend `generatePaper()` to inject keyword into prompt |
| FR-3.4 | Q&A pipeline accepts target_keyword parameter | Extend `generateAnswer()` to accept keyword context |
| FR-3.5 | Topics pipeline accepts target_keyword parameter | Extend `generateTopic()` with keyword parameter |
| FR-3.6 | Lock keyword row during generation (status: 'generating') | UPDATE with WHERE status='pending' for atomic lock |
| FR-3.7 | Update status to 'generated' and link to content upon completion | Set generated_content_id, status='generated' |
| FR-3.8 | Increment retry_count on failure; mark 'failed' after 3 retries | In-run retry loop, persist failure state |
| FR-6.1 | Publish maximum 20 pages per week initially | Rolling 7-day count query against published_at |
| FR-6.2 | Track indexing rate via Search Console API or manual check | Manual tracking for Phase 2; API deferred to Phase 3 |
</phase_requirements>

## Existing Content Pipelines

### Papers Pipeline (`src/lib/papers-pipeline/`)

**Generator:** `paper-generator.ts`
- **Entry point:** `generatePaper(topicId: string): Promise<GeneratedPaper>`
- **Model:** Qwen3-32B via Ollama (http://localhost:11434)
- **Input:** Reads from `paper_topics` table by topicId
- **Output:** Saves to `papers` table with full markdown body
- **Key function:** `buildGenerationPrompt(topic, availableRefs)` on line 59
- **Topic structure:**
  ```typescript
  {
    canonical_title: string;
    primary_query: string;
    secondary_queries?: string[];
    risk_topic?: string;
    jurisdiction: string;
    persona: string;
    cluster_id: string;
    topic_angle?: string;
  }
  ```

**Integration point:** The `buildGenerationPrompt()` function accepts a topic object. To add `target_keyword`:
1. Add keyword to topic object or pass separately
2. Modify prompt to include: "Target Keyword: ${target_keyword}" in ARTICLE METADATA section
3. After save, update `keyword_queue_id` FK on papers row

### Q&A Pipeline (`src/lib/qa-generator/`)

**Generator:** `generate.ts`
- **Entry point:** `generateAnswer(input: QAInput, supabase): Promise<string>`
- **Model:** Ministral 8B via Ollama
- **Input:** QAInput object with question, risk_topic, jurisdiction, persona, scenario_stage, intent_tier
- **Output:** Sanitized answer string
- **Storage:** `storeAnswers()` updates `qa_candidates` table

**Integration point:** The `QAInput` interface can be extended:
```typescript
interface QAInput {
  id: string;
  question: string;
  risk_topic: string;
  jurisdiction: string;
  persona: string;
  scenario_stage: string;
  intent_tier: 'T1' | 'T2' | 'T3';
  // ADD: target_keyword?: string;
  // ADD: keyword_queue_id?: string;
}
```

**Note:** Q&A content goes to `qa_candidates` table. The keyword_queue_id FK needs to be added to this table (Phase 1 migration only covers `papers` and `consumer_topics`).

### Topics Pipeline (`src/lib/topics-pipeline/`)

**Generator:** `topic-generator.ts`
- **Entry point:** `generateTopic(seedQuery: string): Promise<GeneratedTopic>`
- **Model:** Qwen3-32B via Ollama
- **Input:** Simple seedQuery string (the question/keyword)
- **Output:** GeneratedTopic with title, slug, summary, content, category, faqs
- **Storage:** `saveTopic(topic)` inserts into `consumer_topics` table

**Integration point:** Already accepts a seed query string. To add keyword tracking:
1. Modify `saveTopic()` to accept `keyword_queue_id`
2. Include in INSERT statement

## Database Patterns

### Existing Schema (from Phase 1)

**keyword_queue table:**
```sql
CREATE TABLE keyword_queue (
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
```

**keyword_queue_priority VIEW:**
- Calculates real-time priority score with seasonal multiplier and decay
- ORDER BY priority_score DESC
- Use this VIEW for queue selection

**Foreign keys on content tables:**
- `papers.keyword_queue_id` - EXISTS
- `consumer_topics.keyword_queue_id` - EXISTS
- `qa_candidates.keyword_queue_id` - NEEDS VERIFICATION (may need migration)

### Row Locking Pattern

Atomic lock acquisition:
```sql
UPDATE keyword_queue
SET status = 'generating', updated_at = NOW()
WHERE id = (
  SELECT id FROM keyword_queue_priority
  WHERE status = 'pending'
  AND pipeline_type = $pipeline_type
  -- Cluster constraint: not processed today
  AND cluster_id NOT IN (
    SELECT DISTINCT cluster_id FROM keyword_queue
    WHERE status IN ('generating', 'generated', 'published')
    AND updated_at > CURRENT_DATE
  )
  ORDER BY priority_score DESC
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

### Week Limit Query

Rolling 7-day count:
```sql
SELECT COUNT(*) FROM keyword_queue
WHERE status = 'published'
AND updated_at > NOW() - INTERVAL '7 days';
```

## API/Cron Patterns

### Existing Cron Configuration (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-scrape",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/paper-publish",
      "schedule": "0 7-18 * * *"
    }
  ]
}
```

### Cron Route Pattern (`/api/cron/paper-publish/route.ts`)

Standard pattern to follow:
```typescript
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Initialize Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 3. Execute logic with try/catch
  try {
    // ... processing
    return new Response(JSON.stringify({ status: 'success', ... }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### New Cron for Queue Processor

Add to vercel.json:
```json
{
  "path": "/api/cron/keyword-queue",
  "schedule": "0 * * * *"  // Every hour at minute 0
}
```

## Keyword Import Source

### Available Data Files

1. **`/Users/celeste7/Documents/MYI2/all_domains_qa.json`** - 14,725 lines
   - Format: Array of Q&A objects
   - Fields: question, answer, source_url, domain, confidence, tags
   - Quality: Mixed - contains many low-quality/garbled questions
   - Use case: Extract unique questions for Q&A pipeline

2. **`expanded-queries.tsv`** - 300 lines (in client/)
   - Format: TSV with columns: tier, risk_topic, source, query
   - Fields: T1/T2/T3 tier, risk_topic, source (seed/alphabet/autocomplete), query
   - Quality: HIGH - curated keyword list
   - Use case: Primary import source for keyword_queue

### Import Strategy

**Use `expanded-queries.tsv` as primary source:**
- Already has tier classification (T1/T2/T3)
- Has risk_topic for routing
- 300 high-quality keywords
- Missing: search_volume, keyword_difficulty (set defaults or estimate)

**Data transformation:**
```typescript
// TSV row structure
{ tier: 'T1' | 'T2' | 'T3', risk_topic: string, source: string, query: string }

// Maps to keyword_queue
{
  keyword: query,
  cluster_id: risk_topic,  // Direct mapping
  pipeline_type: tier === 'T1' ? 'paper' : tier === 'T2' ? 'topic' : 'qa',
  search_volume: ESTIMATE,  // Need to set defaults
  keyword_difficulty: ESTIMATE,
  status: 'pending'
}
```

### Clustering

The `risk_topic` field in expanded-queries.tsv provides natural clustering:
- `hurricane`
- `navigation_limits`
- `claims_denial`
- `deductible`
- `total_loss`
- `hull_damage`
- `other`

Use `risk_topic` as `cluster_id` directly.

## Publishing Flow

### Status Transitions

```
pending -> generating -> generated -> published
                    \-> failed (after 3 retries)
```

### Papers Publishing Path

1. Paper generated with `review_status: 'draft'`
2. Quality gates run (already implemented in Phase 1)
3. If gates pass: `review_status: 'reviewed'`
4. `paper_calendar` entry created with `status: 'scheduled'`
5. `/api/cron/paper-publish` publishes when hour matches
6. Update `keyword_queue.status = 'published'`

### Topics/Q&A Publishing Path

1. Content generated with `status: 'draft'`
2. Quality gates run
3. If gates pass and not flagged: `status: 'published'`
4. Update `keyword_queue.status = 'published'`

## Key Files

| File | Purpose | Modification Needed |
|------|---------|---------------------|
| `src/lib/papers-pipeline/paper-generator.ts` | Paper generation | Accept target_keyword, pass keyword_queue_id |
| `src/lib/qa-generator/generate.ts` | Q&A generation | Accept target_keyword, keyword_queue_id in QAInput |
| `src/lib/topics-pipeline/topic-generator.ts` | Topic generation | Accept keyword_queue_id in saveTopic() |
| `src/lib/keyword-queue/db.ts` | DB connection | Already exists |
| `src/lib/keyword-queue/priority-scorer.ts` | Priority calculation | Already exists |
| `src/lib/quality-gates/keyword-quality-gates.ts` | Quality validation | Already exists |
| `src/app/api/cron/paper-publish/route.ts` | Existing cron pattern | Reference for new cron |
| `vercel.json` | Cron configuration | Add keyword-queue cron |

### Files to Create

| File | Purpose |
|------|---------|
| `src/lib/keyword-queue/queue-processor.ts` | Core processing logic |
| `src/lib/keyword-queue/intent-router.ts` | Intent detection and routing |
| `src/lib/keyword-queue/keyword-importer.ts` | Import from TSV/JSON |
| `src/app/api/cron/keyword-queue/route.ts` | Hourly cron endpoint |

## Risks & Recommendations

### Risk 1: qa_candidates FK missing
**Issue:** Phase 1 FK migration may not have covered qa_candidates table
**Mitigation:** Verify in database, add migration if needed

### Risk 2: Search volume/difficulty data missing
**Issue:** expanded-queries.tsv doesn't have SEO metrics
**Mitigation:** Set reasonable defaults (volume=100, difficulty=50) or use tier as proxy

### Risk 3: Generator functions tightly coupled
**Issue:** Generators expect specific table structures (paper_topics, qa_candidates)
**Mitigation:** Create adapter functions that translate keyword_queue row to generator inputs

### Risk 4: Ollama availability
**Issue:** Local Ollama must be running for generation
**Mitigation:** Add health check before processing, graceful failure

### Risk 5: Rate limiting
**Issue:** Processing too fast could overwhelm Ollama
**Mitigation:** Built into existing generators (1 req/sec in Q&A), keep same pattern

### Recommendation: Adapter Pattern

Create thin adapters for each pipeline:
```typescript
// keyword-to-paper-adapter.ts
async function createPaperFromKeyword(kw: KeywordQueueRow): Promise<string> {
  // 1. Create paper_topics row from keyword
  // 2. Call existing generatePaper(topicId)
  // 3. Update keyword_queue with generated_content_id
  // 4. Return paperId
}
```

This preserves existing generators while adding keyword integration.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.x | Database client | Already used throughout |
| Qwen3:32B | - | Long-form generation | Papers, Topics pipelines |
| Ministral:8b | - | Short-form generation | Q&A pipeline |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fs (Node built-in) | - | TSV parsing | Import script |
| Existing db.ts | - | Supabase connection | All DB operations |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Queue locking | Custom mutex | PostgreSQL FOR UPDATE SKIP LOCKED | Race conditions |
| Priority calculation | Runtime calculation | keyword_queue_priority VIEW | Already implemented |
| Content generation | New LLM integration | Existing generators | Tested, working |
| Quality gates | New validation | keyword-quality-gates.ts | Phase 1 complete |

## Sources

### Primary (HIGH confidence)
- Codebase analysis of existing generators
- Phase 1 verification report (01-VERIFICATION.md)
- Database migrations (supabase/migrations/)

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions (user-provided)
- REQUIREMENTS.md specifications

## Metadata

**Confidence breakdown:**
- Existing pipelines: HIGH - read source code directly
- Database schema: HIGH - verified in Phase 1
- Import data: HIGH - examined actual files
- Integration approach: MEDIUM - requires implementation validation

**Research date:** 2026-03-02
**Valid until:** 2026-03-16 (2 weeks - fast-moving project)
