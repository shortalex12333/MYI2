---
phase: 01-foundation
plan: 02
subsystem: keyword-queue
tags: [priority-scoring, tdd, database-view, real-time-calculation]
dependency_graph:
  requires: [01-01]
  provides: [priority-scoring-logic, priority-view]
  affects: [keyword-queue-processing]
tech_stack:
  added: [vitest-testing, postgresql-views]
  patterns: [tdd-red-green-refactor, pure-functions, view-based-calculation]
key_files:
  created:
    - src/lib/keyword-queue/priority-scorer.ts
    - src/lib/keyword-queue/priority-scorer.test.ts
    - src/lib/keyword-queue/migrations/003_priority_view.sql
  modified: []
decisions:
  - Use pure functions for testability and composability
  - PostgreSQL VIEW for real-time calculation eliminates cron dependency
  - Math.round() for consistent rounding between TypeScript and SQL
metrics:
  duration: 83s
  tasks_completed: 3
  tests_added: 12
  tests_passing: 12
  files_created: 3
  completed_at: 2026-03-02T20:41:38Z
---

# Phase 01 Plan 02: Priority Scoring System Summary

**One-liner:** TDD implementation of priority scoring with volume-difficulty formula, seasonal hurricane multiplier, decay factor, and PostgreSQL VIEW for real-time calculation.

## Objective Achievement

Implemented priority scoring logic using TDD methodology with both TypeScript functions and a PostgreSQL VIEW for real-time calculation. Priority scoring determines which keywords get content generated first, maximizing SEO impact by targeting high-volume, low-difficulty keywords while accounting for seasonality and queue age.

## Tasks Completed

### Task 1: Write failing tests for priority scoring (RED)
- **Commit:** `42db461`
- **Action:** Created comprehensive test suite with 12 test cases
- **Tests:** Base score, seasonal multiplier, decay factor, combined calculation
- **Status:** Tests failed as expected (module not found)

### Task 2: Implement priority scoring functions (GREEN)
- **Commit:** `e70a386`
- **Action:** Implemented pure functions matching test specifications
- **Functions:**
  - `calculateBaseScore(volume, difficulty)` → volume × (100 - difficulty)
  - `applySeasonalMultiplier(score, keyword, date)` → 1.5x for hurricane in Q2-Q3
  - `applyDecayFactor(score, status, createdAt)` → 0.8x for pending >7 days
  - `calculatePriorityScore(keyword)` → combines all factors
- **Status:** All 12 tests passing

### Task 3: Create PostgreSQL VIEW for real-time priority scoring
- **Commit:** `39cd153`
- **Action:** Created `keyword_queue_priority` VIEW with SQL logic matching TypeScript
- **Features:**
  - Real-time calculation eliminates cron dependency (FR-2.4)
  - Includes base_score, seasonal_multiplier, decay_factor, priority_score columns
  - Ordered by priority_score DESC for efficient queue processing
  - Uses ILIKE for case-insensitive hurricane detection
  - Handles NULL scores with NULLS LAST

## Requirements Coverage

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| FR-2.1 | Base score = volume × (100 - difficulty) | ✅ |
| FR-2.2 | 1.5x seasonal multiplier for hurricane keywords (Q2-Q3) | ✅ |
| FR-2.3 | 0.8x decay factor for pending keywords >7 days | ✅ |
| FR-2.4 | Real-time calculation via PostgreSQL VIEW | ✅ |

## Deviations from Plan

None - plan executed exactly as written.

## Test Results

```
Test Files: 1 passed (1)
Tests: 12 passed (12)
Duration: 103ms
```

**Test Coverage:**
- Base score calculation with edge cases (0 volume, 0 difficulty, 100 difficulty)
- Seasonal multiplier for hurricane keywords in/out of season
- Case-insensitive hurricane detection
- Decay factor for pending keywords by age
- Combined priority score calculation

## Architecture Notes

**Design Decisions:**

1. **Pure Functions:** All scoring functions are pure (no side effects) for testability and composability
2. **VIEW-based Calculation:** PostgreSQL VIEW eliminates need for cron jobs or background workers
3. **TypeScript/SQL Parity:** VIEW logic mirrors TypeScript exactly for consistency
4. **Math.round():** Used in both TypeScript and SQL for deterministic rounding

**Integration Points:**

- Queue processor queries `keyword_queue_priority` VIEW instead of base table
- Priority scores update automatically when underlying data changes
- TypeScript functions available for client-side calculations/previews

## Verification

✅ **Tests pass:** All 12 tests passing
✅ **Logic consistency:** TypeScript and SQL implement identical formulas
✅ **Requirements coverage:** FR-2.1, FR-2.2, FR-2.3, FR-2.4 all verified
✅ **Files created:** priority-scorer.ts, priority-scorer.test.ts, 003_priority_view.sql
✅ **Commits:** 3 atomic commits (RED, GREEN, SQL VIEW)

## Impact

**Enables:**
- Phase 2 queue processor to prioritize keywords intelligently
- High ROI content generation (high volume × low difficulty first)
- Seasonal SEO optimization for hurricane-related keywords
- Automatic de-prioritization of stale keywords

**Blocks Removed:**
- No cron dependency for priority re-calculation
- Real-time scoring without performance overhead

## Next Steps

Plan 01-04 (Schema.org Structured Data) can proceed - priority scoring foundation complete.

---

## Self-Check: PASSED

**Files Verified:**
- ✅ FOUND: src/lib/keyword-queue/priority-scorer.ts
- ✅ FOUND: src/lib/keyword-queue/priority-scorer.test.ts
- ✅ FOUND: src/lib/keyword-queue/migrations/003_priority_view.sql

**Commits Verified:**
- ✅ FOUND: 42db461 (test RED)
- ✅ FOUND: e70a386 (feat GREEN)
- ✅ FOUND: 39cd153 (feat SQL VIEW)

**Tests Verified:**
- ✅ 12 tests passing
- ✅ No failures or skipped tests
