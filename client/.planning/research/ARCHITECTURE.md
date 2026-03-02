# Architecture Patterns: Keyword-Driven Content Systems

**Domain:** GEO/SEO Content Generation
**Researched:** 2026-03-02
**Confidence:** HIGH (multiple 2026 sources, official architecture patterns, verified with database schemas)

## Recommended Architecture

Keyword-driven content systems in 2026 use a **priority queue pattern** with multi-stage pipelines. The architecture separates keyword acquisition, scoring, queue management, and generation into distinct components with clear boundaries.

```
┌──────────────────┐
│ Keyword Sources  │ (scraper, user queries, gap analysis)
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Keyword Queue    │ (table: keyword_queue)
│ - keyword        │
│ - priority_score │
│ - status         │
│ - metadata       │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Priority Scorer  │ (scoring dimensions: volume, difficulty, intent, geo)
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Queue Processor  │ (selects next task based on score + constraints)
└────────┬─────────┘
         │
         ├──> Papers Pipeline (Qwen 3-32B, long-form)
         ├──> Q&A Pipeline (Mistral 8B, short-form)
         └──> Topics Pipeline (Qwen 3-32B, consumer guides)
```

### Why This Architecture?

**Database-backed priority queue** over dedicated message queue:
- PostgreSQL ACID guarantees prevent duplicate generation (critical for LLM costs)
- Exactly-once execution semantics without separate infrastructure
- Checkpoint-based resumption on failures
- Simpler deployment (no Redis/RabbitMQ/SQS dependency)

**Multi-pipeline routing** over single generator:
- Different models optimized for different content types
- Independent scaling and retry logic per pipeline
- Clear separation of concerns (papers != Q&A != topics)

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Keyword Queue** | Stores incoming keywords with metadata; tracks status transitions | Keyword Sources (write), Priority Scorer (read/write), Queue Processor (read/write) |
| **Priority Scorer** | Calculates multi-dimensional priority score; updates queue records | Keyword Queue (read/write), Reference Registry (read), Cluster Balance (read) |
| **Queue Processor** | Selects next keyword based on score + constraints; routes to pipeline | Keyword Queue (read/write), Pipeline Routers (write) |
| **Pipeline Routers** | Accept keyword + metadata; invoke generator; update queue status | Queue Processor (read), Generators (write), Keyword Queue (write) |
| **Generators** | Generate content from keyword; validate against gates | Pipeline Routers (read), Content Tables (write), Reference Registry (read) |

## Data Flow

### Stage 1: Keyword Ingestion

```
Scraper/User Query → Keyword Queue (INSERT)
- keyword: "yacht insurance florida hurricane coverage"
- source: "scraper" | "user_query" | "gap_analysis"
- status: "pending"
- metadata: {cluster_guess, persona_guess, search_volume}
```

### Stage 2: Priority Scoring

```
Priority Scorer (runs on cron OR triggered on insert)
→ Read: keyword_queue WHERE status='pending'
→ Calculate: multi-dimensional score
→ Update: keyword_queue SET priority_score=X, status='scored'
```

**Scoring Dimensions (2026 Standard):**
- **Search Volume (30%)**: Higher volume = higher priority
- **Keyword Difficulty (40%)**: Lower difficulty = higher priority (easier wins)
- **Business Relevance (30%)**: Commercial intent, persona match, cluster balance

**GEO-Specific Scoring Additions:**
- **Citability Score**: Likelihood LLMs reference this topic
- **Entity Authority Gap**: Do competitors dominate this keyword?
- **Freshness Decay**: Penalty for keywords with stale content
- **Seasonal Weight**: Boost hurricane keywords in Q2-Q3

### Stage 3: Queue Selection

```
Queue Processor (cron-triggered daily OR on-demand)
→ Read: keyword_queue WHERE status='scored' ORDER BY priority_score DESC LIMIT 1
→ WITH constraint checks:
  - Cluster balance (prevent flooding one cluster)
  - Persona distribution (balance captain/owner/broker content)
  - Calendar slots available (papers publish every 2-3 days)
→ Update: status='assigned', assigned_at=NOW()
→ Route to appropriate pipeline
```

### Stage 4: Pipeline Routing

```
IF keyword matches Q&A intent (question pattern):
  → qa-generator (Mistral 8B, 250 words)

ELSIF keyword matches consumer topic (buyer-oriented):
  → topics-pipeline (Qwen 3-32B, 500 words HTML)

ELSE:
  → papers-pipeline (Qwen 3-32B, 1500-2000 words)
```

### Stage 5: Generation

```
Generator receives:
- keyword
- priority_score
- metadata (cluster, persona, risk_topic, jurisdiction)

Generator produces:
- content (markdown/HTML)
- metadata (entities, numerical_anchors, internal_links)
- quality gates (passed/failed)

ON success:
  → INSERT into papers/qa_entries/consumer_topics
  → UPDATE keyword_queue SET status='generated', generated_at=NOW()

ON failure:
  → UPDATE keyword_queue SET status='failed', retry_count++, error_log=X
```

## Integration Points with Existing Pipelines

### Current State (Before Keyword Queue)

```
Papers:  Topic seeder → paper_topics → paper_queue view → generator
Q&A:     Scraped questions → qa_candidates → filtered selection → generator
Topics:  Manual seeds → topic-generator.ts
```

### Proposed State (After Keyword Queue)

```
keyword_queue (NEW)
    ↓
    ├─> paper_topics (MODIFIED: add keyword_queue_id FK)
    ├─> qa_candidates (MODIFIED: add keyword_queue_id FK)
    └─> consumer_topics (MODIFIED: add keyword_queue_id FK)
```

**Key Insight:** Don't replace existing tables. keyword_queue sits ABOVE them as orchestration layer.

## Patterns to Follow

### Pattern 1: Priority Queue with Status Transitions

**What:** Use database table as task queue with explicit status field

**When:** Need exactly-once execution, checkpoint recovery, priority ordering

**Example:**
```typescript
// Database schema
CREATE TABLE keyword_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  priority_score INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'scored', 'assigned', 'generated', 'failed')),
  assigned_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ,
  retry_count INT DEFAULT 0,
  error_log JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keyword_queue_priority ON keyword_queue(status, priority_score DESC);

// Queue processor (SELECT FOR UPDATE prevents race conditions)
async function selectNextKeyword() {
  const { data } = await db
    .from('keyword_queue')
    .select('*')
    .eq('status', 'scored')
    .order('priority_score', { ascending: false })
    .limit(1)
    .single()
    // Use PostgreSQL row-level locking in production

  if (!data) return null;

  await db
    .from('keyword_queue')
    .update({ status: 'assigned', assigned_at: new Date() })
    .eq('id', data.id)

  return data;
}
```

### Pattern 2: Multi-Dimensional Scoring

**What:** Calculate composite score from weighted factors

**When:** Need to balance multiple competing priorities

**Example:**
```typescript
interface ScoringFactors {
  searchVolume: number;      // 0-100
  difficulty: number;        // 0-100
  commercialIntent: number;  // 0-100
  clusterGap: number;        // 0-100
  seasonalBoost: number;     // 0-100
}

function calculatePriorityScore(factors: ScoringFactors): number {
  const weights = {
    searchVolume: 0.30,
    difficulty: 0.40,        // INVERSE: lower difficulty = higher score
    commercialIntent: 0.30,
    clusterGap: 0.20,        // BONUS: gaps get extra weight
    seasonalBoost: 0.10      // BONUS: seasonal relevance
  };

  return Math.round(
    (factors.searchVolume * weights.searchVolume) +
    ((100 - factors.difficulty) * weights.difficulty) +  // Invert difficulty
    (factors.commercialIntent * weights.commercialIntent) +
    (factors.clusterGap * weights.clusterGap) +
    (factors.seasonalBoost * weights.seasonalBoost)
  );
}
```

### Pattern 3: Constraint-Based Queue Selection

**What:** Apply business rules BEFORE selecting from priority queue

**When:** Need to prevent imbalances (cluster flooding, persona skew)

**Example:**
```typescript
async function selectNextKeywordWithConstraints() {
  // Check cluster balance
  const { data: balance } = await db
    .from('cluster_balance')
    .select('cluster_id, published')
    .order('published', { ascending: true })
    .limit(1)
    .single();

  const priorityCluster = balance?.cluster_id;

  // Select highest priority keyword from underserved cluster
  const { data } = await db
    .from('keyword_queue')
    .select('*')
    .eq('status', 'scored')
    .eq('metadata->cluster_id', priorityCluster)
    .order('priority_score', { ascending: false })
    .limit(1)
    .single();

  return data;
}
```

### Pattern 4: Idempotent Generation with Checkpoint Recovery

**What:** Store input before generation, output after generation

**When:** LLM calls are expensive; failures mid-generation are common

**Example:**
```typescript
async function generateWithCheckpoints(keywordId: string) {
  // Checkpoint 1: Record input
  await db
    .from('keyword_queue')
    .update({
      status: 'generating',
      generation_started_at: new Date(),
      generation_input: { /* capture all context */ }
    })
    .eq('id', keywordId);

  try {
    // Expensive LLM call
    const content = await callQwen(prompt);

    // Checkpoint 2: Record output BEFORE inserting to papers
    await db
      .from('keyword_queue')
      .update({
        generation_output: content,
        generation_completed_at: new Date()
      })
      .eq('id', keywordId);

    // Now safe to insert (can retry from checkpoint if this fails)
    const paper = await insertPaper(content);

    // Mark complete
    await db
      .from('keyword_queue')
      .update({
        status: 'generated',
        generated_paper_id: paper.id
      })
      .eq('id', keywordId);

  } catch (error) {
    await db
      .from('keyword_queue')
      .update({
        status: 'failed',
        retry_count: db.raw('retry_count + 1'),
        error_log: { error: error.message, timestamp: new Date() }
      })
      .eq('id', keywordId);
  }
}
```

### Pattern 5: Pipeline-Specific Routing Logic

**What:** Route keywords to appropriate generator based on intent classification

**When:** Different content types require different models/templates

**Example:**
```typescript
function routeToPipeline(keyword: string, metadata: any): PipelineType {
  // Q&A intent detection (question patterns)
  const questionPatterns = [
    /^(what|how|why|when|where|who|which|should|can|does|is)\b/i,
    /\?$/
  ];

  if (questionPatterns.some(p => p.test(keyword))) {
    return 'qa';
  }

  // Consumer topic detection (buyer-oriented keywords)
  const consumerPatterns = [
    /\b(best|top|compare|vs|review|guide|tips|basics)\b/i,
    /\b(cost|price|cheap|expensive|worth)\b/i
  ];

  if (consumerPatterns.some(p => p.test(keyword))) {
    return 'topics';
  }

  // Default: professional paper
  return 'papers';
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Processing Queue Without Locking

**What:** Multiple workers pull same task from queue simultaneously

**Why bad:** Duplicate LLM calls waste money; duplicate content hurts SEO

**Instead:** Use PostgreSQL row-level locking (SELECT FOR UPDATE) or status-based locks

```typescript
// WRONG: Race condition
const task = await db.from('keyword_queue').select('*').eq('status', 'scored').limit(1).single();
await db.from('keyword_queue').update({ status: 'assigned' }).eq('id', task.id);

// RIGHT: Atomic update prevents race
const { data } = await db.rpc('claim_next_keyword'); // SQL function uses SELECT FOR UPDATE
```

### Anti-Pattern 2: Global Priority Queue Without Constraints

**What:** Always pick highest score, ignoring business rules

**Why bad:** One cluster dominates output; seasonal content crowds out evergreen

**Instead:** Partition queue by constraint dimensions (cluster, persona), select within partition

### Anti-Pattern 3: Synchronous Generation on User Request

**What:** User submits keyword → immediate LLM call → return content

**Why bad:** User waits 30-60s for generation; no retry logic; can't batch

**Instead:** User submits → INSERT to queue → return "queued" → cron processor generates async

### Anti-Pattern 4: Storing Full Content in Queue Table

**What:** keyword_queue.generated_content stores 2000-word markdown

**Why bad:** Queue table becomes bloated; queries slow down; not normalized

**Instead:** Store reference (generated_paper_id), content goes in papers table

### Anti-Pattern 5: Fixed Priority Scores (No Decay)

**What:** Calculate score once, never update

**Why bad:** Seasonal keywords stay high priority year-round; outdated keywords never drop

**Instead:** Re-score periodically (daily cron) with freshness decay factor

```typescript
// Add decay factor to scoring
const daysSinceCreated = (Date.now() - created_at) / (1000 * 60 * 60 * 24);
const decayFactor = Math.max(0, 1 - (daysSinceCreated / 90)); // 0% after 90 days
const adjustedScore = baseScore * decayFactor;
```

## Modification Strategy for Existing Pipelines

### Phase 1: Add keyword_queue Table (Non-Breaking)

```sql
CREATE TABLE keyword_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('scraper', 'user_query', 'gap_analysis', 'manual')),
  priority_score INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'scored', 'assigned', 'generating', 'generated', 'failed')),

  -- Routing metadata
  pipeline_type TEXT CHECK (pipeline_type IN ('papers', 'qa', 'topics')),
  cluster_id TEXT,
  persona TEXT,
  risk_topic TEXT,
  jurisdiction TEXT DEFAULT 'global',

  -- Scoring factors
  search_volume INT,
  keyword_difficulty INT,
  commercial_intent_score INT,
  geo_citability_score INT,
  seasonal_weight INT,

  -- Tracking
  assigned_at TIMESTAMPTZ,
  generation_started_at TIMESTAMPTZ,
  generation_completed_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ,
  retry_count INT DEFAULT 0,
  error_log JSONB,

  -- Foreign key to generated content (optional)
  generated_paper_id UUID REFERENCES papers(id),
  generated_qa_id UUID REFERENCES qa_candidates(id),
  generated_topic_id UUID REFERENCES consumer_topics(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_scored_at TIMESTAMPTZ
);

CREATE INDEX idx_kw_queue_status_priority ON keyword_queue(status, priority_score DESC);
CREATE INDEX idx_kw_queue_cluster ON keyword_queue(cluster_id);
CREATE INDEX idx_kw_queue_pipeline ON keyword_queue(pipeline_type);
```

### Phase 2: Add Foreign Keys to Existing Tables (Non-Breaking)

```sql
-- Papers pipeline
ALTER TABLE paper_topics ADD COLUMN keyword_queue_id UUID REFERENCES keyword_queue(id);
CREATE INDEX idx_paper_topics_keyword_queue ON paper_topics(keyword_queue_id);

-- Q&A pipeline
ALTER TABLE qa_candidates ADD COLUMN keyword_queue_id UUID REFERENCES keyword_queue(id);
CREATE INDEX idx_qa_candidates_keyword_queue ON qa_candidates(keyword_queue_id);

-- Topics pipeline (add column to consumer_topics)
ALTER TABLE consumer_topics ADD COLUMN keyword_queue_id UUID REFERENCES keyword_queue(id);
CREATE INDEX idx_consumer_topics_keyword_queue ON consumer_topics(keyword_queue_id);
```

### Phase 3: Create Priority Scorer Module

```typescript
// src/lib/keyword-queue/priority-scorer.ts

export async function scoreKeyword(keywordId: string) {
  const keyword = await fetchKeyword(keywordId);

  // Fetch external data for scoring
  const searchVolume = await estimateSearchVolume(keyword.keyword);
  const difficulty = await estimateDifficulty(keyword.keyword);
  const commercialIntent = classifyIntent(keyword.keyword);

  // Fetch internal data
  const clusterBalance = await getClusterBalance(keyword.cluster_id);
  const seasonalWeight = calculateSeasonalWeight(keyword.keyword);

  // Calculate composite score
  const priorityScore = calculatePriorityScore({
    searchVolume,
    difficulty,
    commercialIntent,
    clusterGap: 100 - clusterBalance.published, // Higher gap = higher score
    seasonalBoost: seasonalWeight
  });

  // Update queue record
  await db
    .from('keyword_queue')
    .update({
      priority_score: priorityScore,
      status: 'scored',
      last_scored_at: new Date(),
      search_volume: searchVolume,
      keyword_difficulty: difficulty,
      commercial_intent_score: commercialIntent,
      seasonal_weight: seasonalWeight
    })
    .eq('id', keywordId);
}
```

### Phase 4: Create Queue Processor Module

```typescript
// src/lib/keyword-queue/queue-processor.ts

export async function processNextKeyword() {
  // Select with constraints
  const keyword = await selectNextKeywordWithConstraints();

  if (!keyword) {
    console.log('No keywords ready for generation');
    return;
  }

  // Route to pipeline
  const pipeline = routeToPipeline(keyword.keyword, keyword);

  switch (pipeline) {
    case 'papers':
      await generatePaper(keyword);
      break;
    case 'qa':
      await generateQA(keyword);
      break;
    case 'topics':
      await generateTopic(keyword);
      break;
  }
}

async function generatePaper(keyword: KeywordQueueRecord) {
  // Create paper_topics entry (existing flow)
  const topic = await db.from('paper_topics').insert({
    cluster_id: keyword.cluster_id,
    topic_signal: keyword.keyword,
    primary_query: keyword.keyword,
    risk_topic: keyword.risk_topic,
    jurisdiction: keyword.jurisdiction,
    persona: keyword.persona,
    keyword_queue_id: keyword.id,  // NEW: Link back to queue
    status: 'assigned'
  }).select().single();

  // Existing paper-generator.ts flow continues...

  // On success, update queue
  await db.from('keyword_queue').update({
    status: 'generated',
    generated_paper_id: paper.id,
    generated_at: new Date()
  }).eq('id', keyword.id);
}
```

### Phase 5: Create Cron Job

```typescript
// src/app/api/cron/keyword-processor/route.ts

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Process up to 5 keywords per run (rate limiting)
    for (let i = 0; i < 5; i++) {
      await processNextKeyword();
    }

    return Response.json({ success: true, processed: 5 });
  } catch (error) {
    console.error('Keyword processor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Phase 6: Migration Path (Gradual Adoption)

**Week 1:** Deploy keyword_queue table, priority scorer (no traffic routing)
**Week 2:** Backfill existing paper_topics → keyword_queue (one-time script)
**Week 3:** Route 10% of new keywords through queue processor (A/B test)
**Week 4:** Route 50% through queue
**Week 5:** Route 100%, deprecate old direct insertion

## Build Order (Dependency Graph)

```
1. keyword_queue table schema
   └─> 2. Foreign keys in existing tables (paper_topics, qa_candidates, consumer_topics)
       └─> 3. Priority scoring module
           └─> 4. Queue processor module
               ├─> 5a. Papers pipeline integration
               ├─> 5b. Q&A pipeline integration
               └─> 5c. Topics pipeline integration
                   └─> 6. Cron job API route
                       └─> 7. Monitoring dashboard (queue health, score distribution)
```

**Critical Path:** 1 → 2 → 3 → 4 → 6 (minimal viable pipeline)

**Nice-to-Have:** 5a/5b/5c can be sequential (start with one pipeline, expand)

## Scalability Considerations

| Concern | At 100 keywords/mo | At 1000 keywords/mo | At 10K keywords/mo |
|---------|-------------------|---------------------|-------------------|
| **Queue Size** | Single table, no partitioning | Index on (status, priority_score) required | Partition by status (pending, scored, generated) |
| **Scoring Latency** | Synchronous scoring on insert | Async scoring (cron every hour) | Batch scoring (cron every 15 min), cache external API calls |
| **Lock Contention** | Single worker, no locks needed | Use SELECT FOR UPDATE | Multiple workers + advisory locks per cluster |
| **Cost Control** | No rate limiting | Limit 5 generations/hour | Limit 50/hour, smart batching (same cluster/persona) |
| **Monitoring** | Manual SQL queries | Dashboard showing queue depth by status | Alerts on queue backup (>100 pending), failed generations (>10% retry) |

## GEO-Specific Architecture Additions

### Citability Tracking

**Problem:** Need to know if generated content gets cited by LLMs

**Solution:** Add citation tracking table

```sql
CREATE TABLE keyword_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_queue_id UUID REFERENCES keyword_queue(id),
  generated_content_id UUID, -- paper_id, qa_id, or topic_id
  llm_source TEXT CHECK (llm_source IN ('chatgpt', 'perplexity', 'claude', 'gemini', 'google_ai_overview')),
  cited BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  citation_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Workflow:** Weekly cron queries ChatGPT/Perplexity with target keyword, checks if MYI content appears in citations

### Entity Authority Gap Analysis

**Problem:** Need to track if competitors dominate a keyword (entity authority gap)

**Solution:** Add competitor tracking to scoring metadata

```typescript
interface KeywordMetadata {
  competitors: Array<{
    domain: string;
    ranking_position: number;
    content_length: number;
    entity_mentions: number;
  }>;
  authority_gap_score: number; // 0-100, higher = bigger opportunity
}

// During scoring phase
const competitorAnalysis = await analyzeCompetitors(keyword);
const authorityGap = calculateAuthorityGap(competitorAnalysis);

await db.from('keyword_queue').update({
  metadata: { competitors: competitorAnalysis },
  geo_citability_score: authorityGap
});
```

## Sources

### Architecture Patterns
- [Microsoft Azure Priority Queue Pattern](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/priority-queue-content.md)
- [Database-Backed Workflow Orchestration - InfoQ](https://www.infoq.com/news/2025/11/database-backed-workflow/)
- [Workflow Management Database Design - GeeksforGeeks](https://www.geeksforgeeks.org/dbms/database-design-for-workflow-management-systems/)

### GEO Framework
- [Mastering Generative Engine Optimization in 2026 - Search Engine Land](https://searchengineland.com/mastering-generative-engine-optimization-in-2026-full-guide-469142)
- [The Generative Engine Optimization (GEO) Framework 2026 - AuraMetrics](https://aurametrics.io/en/blog/the-generative-engine-optimization-geo-framework-2026-aurametrics)

### Content Pipeline & Keyword Prioritization
- [Automated SEO Content Strategy: Complete Guide 2026 - TrySight](https://www.trysight.ai/blog/automated-seo-content-strategy)
- [How to Prioritize Keywords for Better SEO - Surfer SEO](https://surferseo.com/blog/prioritize-keywords-for-seo/)
- [How to Think About SEO Prioritization - Omniscient Digital](https://beomniscient.com/blog/seo-priorities/)

### Database Schema Patterns
- [How to Design a Database for Content Management System - GeeksforGeeks](https://www.geeksforgeeks.org/sql/how-to-design-a-database-for-content-management-system-cms/)
- [Content Management System Architecture - Simple Talk](https://www.red-gate.com/simple-talk/development/other-development/content-management-system-architecture/)
