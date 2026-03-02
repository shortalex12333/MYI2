# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-02)

**Core value:** Get AI systems (ChatGPT, Perplexity, Claude) to cite myyachtsinsurance.com as an authoritative source for yacht insurance information
**Current focus:** Phase 1 - Foundation

## Current Position

Phase: 2 of 4 (Pipeline Integration)
Plan: 3 of 4
Status: In Progress
Last activity: 2026-03-02 - Completed 02-02-PLAN.md (Pipeline Adapters) - backfilled

Progress: [████▌░░░░░] 46%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 278 seconds
- Total execution time: 0.46 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 4/4 | 660s | 165s |
| 2. Pipeline Integration | 3/4 | 1138s | 285s |
| 3. Monitoring | 0/3 | - | - |
| 4. Maintenance | 0/2 | - | - |

**Recent Executions:**

| Plan | Duration | Tasks | Files | Completed |
|------|----------|-------|-------|-----------|
| Phase 02 P02 | 295s | 3 tasks | 5 files | 2026-03-02 |
| Phase 02 P03 | 339s | 3 tasks | 3 files | 2026-03-02 |
| Phase 02 P01 | 209s | 3 tasks | 4 files | 2026-03-02 |
| Phase 01 P03 | 439s | 3 tasks | 6 files | 2026-03-02 |

**Recent Trend:**
- Last 5 plans: 01-03 (439s), 01-04 (51s), 02-01 (209s), 02-02 (295s), 02-03 (339s)
- Trend: Phase 2 progressing steadily, 3 of 4 complete

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Research: Database-backed priority queue pattern selected (vs message queue)
- Research: Cluster approach for keywords (vs one-page-per-keyword)
- Research: Staged rollout 20/week maximum (vs bulk publish)
- [Phase 01-01]: Follow consumer_topics.sql pattern for RLS and trigger implementation
- [Phase 01-01]: Use conditional DO block for qa_candidates to handle manual creation variations
- [Phase 01-foundation]: Used /knowledge/[id] route pattern matching existing /knowledge list page
- [Phase 01-foundation]: Created COMMON_BREADCRUMBS constant for reusable breadcrumb patterns
- [Phase 01-foundation]: Used standard Next.js JSON-LD pattern for Schema.org structured data
- [Phase 01-03]: Use Vitest for unit testing framework (lightweight, fast, ESM-native)
- [Phase 01-03]: Import flesch as named export (package API uses named exports)
- [Phase 01-03]: Re-export extractTextContent from readability-checker to avoid duplication
- [Phase 01-02]: Use pure functions for testability and composability
- [Phase 01-02]: PostgreSQL VIEW for real-time calculation eliminates cron dependency
- [Phase 02-03]: Lazy database loading pattern for CLI scripts requiring environment variables
- [Phase 02-03]: Default placeholder values (search_volume=100, keyword_difficulty=50) until keyword research API integrated
- [Phase 02-03]: Duplicate detection via SELECT before INSERT (vs UNIQUE constraint or UPSERT)
- [Phase 02-01]: Pure function design for intent detection (testable, composable)
- [Phase 02-01]: Retry logic capped at 3 attempts per keyword
- [Phase 02-01]: Hourly cron schedule (0 * * * *) for gradual content rollout
- [Phase 02-02]: Thin adapter pattern to preserve existing generator code unchanged
- [Phase 02-02]: Adapters create prerequisite records (paper_topic, qa_candidates) before calling generators
- [Phase 02-02]: FK linking happens after generation (non-fatal if update fails)

### Pending Todos

None yet.

### Blockers/Concerns

- CRON_SECRET missing from Vercel (blocks cron jobs in Phase 2)
- Must add before Phase 2 execution

## Session Continuity

Last session: 2026-03-02
Stopped at: Completed 02-02-PLAN.md (Pipeline Adapters) - backfilled after 02-03
Resume file: None

## Next Action

Continue Phase 2: Execute 02-04-PLAN.md (Keyword Queue Consumer)

## Note

Plan 02-02 was executed out of order (after 02-03) to fix dependency violation. Pipeline adapters are now in place for 02-04 to use.
