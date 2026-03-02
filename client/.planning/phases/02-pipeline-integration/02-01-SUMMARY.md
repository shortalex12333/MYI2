---
phase: 02-pipeline-integration
plan: 01
subsystem: keyword-queue
tags: [queue-processor, intent-routing, cron, orchestration]
dependency_graph:
  requires: [keyword_queue table, keyword_queue_priority view]
  provides: [queue processor API, intent router, hourly cron job]
  affects: [content generation pipelines]
tech_stack:
  added: []
  patterns: [atomic locking, cluster diversity, rate limiting, intent classification]
key_files:
  created:
    - src/lib/keyword-queue/queue-processor.ts
    - src/lib/keyword-queue/intent-router.ts
    - src/app/api/cron/keyword-queue/route.ts
  modified:
    - vercel.json
decisions:
  - Pure function design for intent detection (testable, composable)
  - Retry logic capped at 3 attempts per keyword
  - Hourly cron schedule (0 * * * *) for gradual content rollout
metrics:
  duration: 209
  tasks: 3
  files_created: 3
  files_modified: 1
  commits: 3
  lines_added: 491
  completed_date: "2026-03-02"
---

# Phase 02 Plan 01: Queue Processor & Intent Router

**One-liner:** Built keyword queue orchestration layer with atomic locking, cluster diversity enforcement, and intent-based pipeline routing for automated content generation.

## What Was Built

### 1. Queue Processor Core (queue-processor.ts - 282 lines)

**Core Functions:**
- `selectNextKeyword()`: Selects highest-priority pending keyword from `keyword_queue_priority` VIEW
  - Enforces cluster diversity: max 1 keyword per cluster per day
  - Enforces weekly rate limit: max 20 keywords per rolling 7 days
  - Returns null if no eligible keywords

- `lockKeyword()`: Atomically locks keyword via status transition
  - UPDATE with WHERE status = 'pending' ensures only one process succeeds
  - Prevents duplicate content generation across concurrent cron jobs

- `completeKeyword()`: Marks keyword as successfully generated
  - Records content ID and type (paper/qa/topic)
  - Updates timestamps

- `failKeyword()`: Handles generation failures
  - Increments retry_count
  - Resets to 'pending' for retry (up to 3 attempts)
  - Marks 'failed' after 3 attempts

- `processNextKeyword()`: Main orchestrator
  - Coordinates selection, locking, and routing
  - Returns structured result for cron logging

**Key Constraints Implemented:**
- FR-3.6: Cluster diversity check (query `keyword_queue` for today's processed clusters)
- FR-3.7: Weekly limit check (count generated keywords in rolling 7-day window)
- FR-3.2: Row-level locking via status transitions (prevents race conditions)

### 2. Intent Router (intent-router.ts - 78 lines)

**Intent Detection Patterns:**
- **Question**: `/^(how|what|why|when|where|does|can|is|are|should|do)\b/i` or contains `?`
- **Commercial**: `/\b(best|cost|price|quote|compare|cheap|expensive|calculator|vs)\b/i`
- **Informational**: Default for all other keywords

**Pipeline Mapping:**
- question → Q&A pipeline (direct answer format)
- commercial → Topics pipeline (comparison/guide format)
- informational → Papers pipeline (comprehensive article)

**Examples:**
```
"how much is yacht insurance" -> question -> qa
"best yacht insurance florida" -> commercial -> topics
"yacht insurance requirements" -> informational -> papers
```

### 3. Cron Endpoint (route.ts - 131 lines)

**Security:**
- Verifies `CRON_SECRET` from Authorization header
- Returns 401 if unauthorized

**Processing Logic:**
- Calls `processNextKeyword()` with retry loop (up to 3 attempts)
- Handles lock conflicts gracefully (another job may have taken the keyword)
- Logs selection, pipeline routing, and timing

**Response Types:**
- Success: `{ status: 'success', keyword, pipeline, duration }`
- No keywords: `{ status: 'ok', message: 'No eligible keywords' }`
- Error: `{ status: 'error', message, duration }`

**Vercel Configuration:**
- Added to `vercel.json` crons array
- Schedule: `0 * * * *` (hourly at minute 0)
- Runtime: nodejs, maxDuration: 60 seconds

## Verification Results

✅ All files created with required functions
✅ queue-processor.ts: 282 lines (requirement: 80+)
✅ intent-router.ts: 78 lines (requirement: 40+)
✅ route.ts: 131 lines (requirement: 30+)
✅ CRON_SECRET verification present
✅ vercel.json updated with hourly schedule
✅ Next.js build succeeds with no errors
✅ Key imports verified:
   - route.ts imports processNextKeyword from queue-processor
   - queue-processor imports routeKeyword from intent-router

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Commit | Hash | Description |
|--------|------|-------------|
| 1 | 3b98438 | feat(02-01): create queue processor core with constraint handling |
| 2 | 0b6dca5 | feat(02-01): create intent router for pipeline classification |
| 3 | eb0e978 | feat(02-01): create hourly keyword queue cron endpoint |

## Integration Points

**Upstream Dependencies:**
- Requires `keyword_queue` table (Phase 01-01)
- Requires `keyword_queue_priority` VIEW (Phase 01-02)
- Requires `db` client (Phase 01-01)

**Downstream Consumers:**
- Papers pipeline (will receive 'informational' keywords)
- Q&A pipeline (will receive 'question' keywords)
- Topics pipeline (will receive 'commercial' keywords)

## Testing Recommendations

1. **Unit Tests** (next plan):
   - Test intent detection regex patterns
   - Test cluster diversity logic with mock data
   - Test weekly rate limit calculation
   - Test retry logic (1st, 2nd, 3rd failure scenarios)

2. **Integration Tests**:
   - Insert test keywords with various intents
   - Call processNextKeyword() and verify correct pipeline routing
   - Test lock acquisition with concurrent calls

3. **E2E Tests**:
   - Manually trigger cron endpoint with valid CRON_SECRET
   - Verify keyword status transitions in database
   - Verify cluster diversity enforcement over multiple runs

## Known Limitations

1. **CRON_SECRET Required**: Cron job will fail in production until `CRON_SECRET` environment variable is set in Vercel (noted in STATE.md as blocker)

2. **No Actual Pipeline Integration**: This plan only locks keywords and routes them. The actual content generation happens in future plans:
   - Plan 02-02: Papers pipeline integration
   - Plan 02-03: Q&A pipeline integration
   - Plan 02-04: Topics pipeline integration

3. **No Admin UI**: Keywords are processed automatically. Future enhancement: admin interface to manually trigger processing or skip keywords.

## Success Metrics

- ✅ Atomic locking prevents duplicate generation
- ✅ Cluster diversity ensures varied content topics daily
- ✅ Weekly rate limit prevents content flooding
- ✅ Intent classification routes to appropriate format
- ✅ Retry logic handles transient failures gracefully
- ✅ Hourly schedule provides steady content flow

## Next Steps

**Immediate (Plan 02-02):**
- Integrate papers pipeline to process 'informational' keywords
- Call `completeKeyword()` after paper generation succeeds
- Call `failKeyword()` if paper generation fails

**Near-term:**
- Add unit tests for queue processor logic
- Set CRON_SECRET in Vercel environment
- Monitor cron execution logs for failures

**Future Enhancements:**
- Admin dashboard to view queue status
- Manual keyword processing trigger
- Adjustable cluster diversity window (currently hardcoded to 1 day)
- Adjustable weekly limit (currently hardcoded to 20)

## Self-Check: PASSED

✅ FOUND: queue-processor.ts
✅ FOUND: intent-router.ts
✅ FOUND: route.ts
✅ FOUND: commit 3b98438
✅ FOUND: commit 0b6dca5
✅ FOUND: commit eb0e978

All claimed files and commits verified on disk.
