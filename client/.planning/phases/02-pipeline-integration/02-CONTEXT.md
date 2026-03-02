# Phase 2: Pipeline Integration - Context

**Gathered:** 2026-03-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect the keyword queue to existing content generation pipelines (papers, Q&A, topics), import 200+ keywords from research, and publish first 20 keyword-driven pieces. Does NOT include monitoring dashboards or scaling triggers (Phase 3).

</domain>

<decisions>
## Implementation Decisions

### Queue Processing
- Cron runs **every hour** (24 checks/day)
- Process **1 keyword per run** — safest pace, naturally limits output
- **Immediate retry** on failure (up to 3 attempts in same run), then mark 'failed'
- Row locking via `status = 'generating'` before LLM call, release on completion/failure

### Week Limit Enforcement
- **Rolling 7-day count** — query `published_at > NOW() - INTERVAL '7 days'`
- Skip processing if count >= 20
- No calendar week complexity

### Pipeline Routing
- **Keyword intent determines pipeline:**
  - Questions ("how to", "what is", "does", "can") → Q&A pipeline
  - Commercial ("best", "cost", "price", "compare") → Topics pipeline
  - Everything else (informational) → Papers pipeline
- Use simple keyword pattern matching for intent detection
- **Cluster behavior:** Process one keyword per cluster per day to ensure topic diversity

### Keyword Import
- **Source:** Existing `all_domains_qa.json` and keyword research data in project root
- **Clustering:** Group by semantic theme (e.g., "yacht insurance cost", "yacht insurance calculator", "how much is yacht insurance" = same cluster)
- **Initial priorities:** Calculate using Phase 1 formula: `volume × (100 - difficulty)`
- **Status:** All imported as 'pending'

### First Batch Strategy
- **Selection:** Top 20 by priority score, ensuring cluster diversity (max 3 per cluster)
- **No manual review gate** — trust quality gates from Phase 1
- **Rollout pacing:** Natural 1/hour limit handles pacing; ~3-5 pieces/day realistic
- **Priority tiebreaker:** Lower difficulty wins (easier to rank for)

### Claude's Discretion
- Specific intent regex patterns
- Exact cluster grouping algorithm
- Error logging verbosity
- Database index optimization

</decisions>

<specifics>
## Specific Ideas

- "Maximum AI throughput" — no unnecessary human review bottlenecks
- Quality gates from Phase 1 (readability, keyword density, word count) catch issues pre-publish
- 20% spot-check already handled by Phase 1 flagging logic

</specifics>

<deferred>
## Deferred Ideas

- Monitoring dashboard — Phase 3
- Scale to 50/week triggers — Phase 3
- Search Console API integration — Phase 3
- Seasonal hurricane keyword boost — already in Phase 1 scoring formula

</deferred>

---

*Phase: 02-pipeline-integration*
*Context gathered: 2026-03-02*
