---
phase: 02-pipeline-integration
plan: 03
subsystem: keyword-queue
tags: [import, tsv, mapping, cli, admin-api]

dependency_graph:
  requires:
    - phase-01-02-priority-scoring
    - expanded-queries.tsv
  provides:
    - keyword_importer_module
    - cli_import_script
    - admin_import_api
  affects:
    - keyword_queue_table

tech_stack:
  added:
    - dotenv (environment loading)
  patterns:
    - tier-to-pipeline mapping
    - risk_topic-to-cluster mapping
    - lazy database loading
    - dynamic imports for env compatibility

key_files:
  created:
    - src/lib/keyword-queue/keyword-importer.ts
    - src/lib/keyword-queue/import-keywords.ts
    - src/app/api/admin/import-keywords/route.ts
  modified:
    - package.json (added dotenv)
    - package-lock.json

decisions:
  - title: Lazy Database Loading
    rationale: Environment variables must be loaded before db client initializes
    approach: Use require() in getDb() function and dynamic import() in CLI script
    alternatives: dotenv-cli wrapper, separate env loader module

  - title: Default Placeholder Values
    rationale: Actual search volume and difficulty data not yet available
    values: search_volume=100, keyword_difficulty=50
    future: Will be updated when keyword research API is integrated

  - title: Duplicate Handling
    rationale: Prevent accidental re-imports during testing
    approach: Check existing keywords before insert, skip duplicates
    alternatives: UNIQUE constraint (would fail transaction), UPSERT (would update existing)

metrics:
  duration: 339s
  tasks_completed: 3
  files_created: 3
  commits: 6
  completed_at: 2026-03-02T14:09:51Z
---

# Phase 02 Plan 03: Keyword Import System

**One-liner:** TSV keyword importer with tier-to-pipeline and risk-topic-to-cluster mappings, supporting 300-keyword bootstrap via CLI or admin API.

## Objective

Import 300+ keywords from expanded-queries.tsv into keyword_queue with proper tier-to-pipeline mapping (T1→paper, T2→topic, T3→qa), risk_topic-to-cluster mapping (13 topics to cluster IDs), and calculated priority scores using the Phase 1 formula.

## Tasks Completed

### Task 1: Create Keyword Importer Module ✓

**File:** `src/lib/keyword-queue/keyword-importer.ts`

**Commit:** `fe09665`

Created reusable module with:
- **TIER_TO_PIPELINE mapping:** T1→paper, T2→topic, T3→qa
- **RISK_TOPIC_TO_CLUSTER mapping:** 13 risk topics (hurricane, claims_denial, navigation_limits, etc.) to semantic cluster IDs
- **parseTsvLine():** Parses tab-separated values, validates 4-column format
- **importKeyword():** Maps tier/risk_topic, calculates priority score, inserts with duplicate detection
- **importFromTsv():** Batch import with dry-run support, returns statistics by pipeline and cluster

**Key mappings implemented:**
```typescript
T1 → paper (high-value informational)
T2 → topic (commercial/comparison)
T3 → qa (question/quick answer)

hurricane → hurricane-storm
claims_denial → claims-disputes
navigation_limits → navigation-cruising
deductible → claims-disputes
hull_damage → hull-machinery
liability → liability-pip
liveaboard → liveaboard-residential
survey → survey-valuation
fire → fire-safety
charter_exclusion → charter-commercial
lay_up → seasonal-layup
total_loss → claims-disputes
other → general-coverage
```

### Task 2: Create Import Script ✓

**File:** `src/lib/keyword-queue/import-keywords.ts`

**Commits:** `6a1c978`, `d44ab45`, `d3ebc8c`

Created executable CLI script with:
- **--dry-run flag:** Parse and validate without database writes
- **Environment loading:** dotenv integration for .env.local
- **Progress logging:** Real-time import status per keyword
- **Summary output:** Total/imported/skipped/errors with duration
- **Distribution stats:** Breakdown by pipeline_type and cluster_id

**Usage:**
```bash
npx tsx src/lib/keyword-queue/import-keywords.ts --dry-run
npx tsx src/lib/keyword-queue/import-keywords.ts
```

**Dry-run test results:**
```
Total lines:     300
Imported:        300
Skipped:         0 (duplicates)
Errors:          0
Duration:        0.00s

Pipeline Distribution:
  qa         192
  topic      98
  paper      10

Cluster Distribution:
  general-coverage          254
  claims-disputes           28
  navigation-cruising       6
  hurricane-storm           4
  hull-machinery            2
```

### Task 3: Create Import API Route ✓

**File:** `src/app/api/admin/import-keywords/route.ts`

**Commit:** `f80e75e`

Created admin API endpoint:
- **Endpoint:** POST /api/admin/import-keywords
- **Authentication:** Service key (Bearer token)
- **Query params:** ?force=true for re-import
- **Response:** JSON summary with import statistics and breakdowns
- **Error handling:** File not found, import failures, unauthorized access

**Usage:**
```bash
curl -X POST https://example.com/api/admin/import-keywords \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Environment Variable Loading**
- **Found during:** Task 2 - CLI script execution
- **Issue:** Database client initialized before environment variables loaded, causing "Missing Supabase environment variables" error
- **Fix:**
  - Lazy-load db module using require() in getDb() function
  - Use dynamic import() in CLI script to defer module loading
  - Add dotenv package for environment loading
- **Files modified:**
  - src/lib/keyword-queue/keyword-importer.ts (lazy loading)
  - src/lib/keyword-queue/import-keywords.ts (dynamic import)
  - package.json (dotenv dependency)
- **Commits:** `d44ab45`, `e14b5c8`, `d3ebc8c`
- **Rationale:** Required for CLI script execution - blocked task completion

## Verification

### Pre-flight Checks ✓

- [x] Files exist at expected paths
- [x] TypeScript compiles (with pre-existing warnings in other files)
- [x] Build succeeds (`npm run build` ✓)
- [x] Dry-run executes successfully

### Dry-run Output ✓

```bash
$ npx tsx src/lib/keyword-queue/import-keywords.ts --dry-run

=== Keyword Import Tool ===
Source file: /Users/celeste7/Documents/MYI2/client/expanded-queries.tsv
Mode: DRY-RUN (no database writes)

[DRY-RUN] boat insurance requirements -> pipeline=paper, cluster=general-coverage, priority=5000
[DRY-RUN] yacht insurance cost -> pipeline=topic, cluster=general-coverage, priority=5000
[DRY-RUN] is boat insurance required -> pipeline=qa, cluster=general-coverage, priority=5000
...

=== Import Summary ===
Total lines:     300
Imported:        300
Skipped:         0 (duplicates)
Errors:          0
Duration:        0.00s

✓ Dry-run complete. No database changes made.
```

### Mapping Validation ✓

Verified correct mappings:
- T1 keywords → paper pipeline
- T2 keywords → topic pipeline
- T3 keywords → qa pipeline
- hurricane risk_topic → hurricane-storm cluster
- claims_denial risk_topic → claims-disputes cluster
- navigation_limits risk_topic → navigation-cruising cluster

## Success Criteria

- [x] src/lib/keyword-queue/keyword-importer.ts exists with importFromTsv function
- [x] src/lib/keyword-queue/import-keywords.ts exists as executable CLI script
- [x] Tier mapping: T1→paper, T2→topic, T3→qa
- [x] risk_topic mapping: hurricane→hurricane-storm, claims_denial→claims-disputes, etc.
- [x] Default search_volume=100, keyword_difficulty=50
- [x] Dry-run mode works without database changes
- [x] Build succeeds
- [x] Admin API route with service key authentication

## Next Steps

1. **Run live import** (requires Supabase connection):
   ```bash
   npx tsx src/lib/keyword-queue/import-keywords.ts
   ```

2. **Verify database records**:
   ```sql
   SELECT COUNT(*) FROM keyword_queue; -- Expected: ~300
   SELECT pipeline_type, COUNT(*) FROM keyword_queue GROUP BY pipeline_type;
   SELECT cluster_id, COUNT(*) FROM keyword_queue GROUP BY cluster_id;
   ```

3. **Proceed to Plan 04:** Implement keyword queue consumer (content generation trigger)

## Self-Check: PASSED

**Files created:**
```bash
$ ls -la src/lib/keyword-queue/keyword-importer.ts
-rw-r--r--@ 1 celeste7  staff  5457  2 Mar 14:04 keyword-importer.ts
✓ FOUND

$ ls -la src/lib/keyword-queue/import-keywords.ts
-rwxr-xr-x@ 1 celeste7  staff  2616  2 Mar 14:05 import-keywords.ts
✓ FOUND

$ ls -la src/app/api/admin/import-keywords/route.ts
-rw-r--r--@ 1 celeste7  staff  3245  2 Mar 14:05 route.ts
✓ FOUND
```

**Commits exist:**
```bash
$ git log --oneline | grep "02-03"
d3ebc8c fix(02-03): lazy-load database connection for env var compatibility
e14b5c8 chore(02-03): add dotenv dev dependency for CLI scripts
d44ab45 fix(02-03): load environment variables in import script
f80e75e feat(02-03): create admin API route for keyword import
6a1c978 feat(02-03): create CLI import script for keyword queue
fe09665 feat(02-03): create keyword importer module with tier and cluster mappings
✓ ALL COMMITS FOUND
```

**Build verification:**
```bash
$ npm run build
✓ Compiled successfully
✓ Generating static pages (62/62)
✓ BUILD PASSED
```

**Dry-run verification:**
```bash
$ npx tsx src/lib/keyword-queue/import-keywords.ts --dry-run
Total lines:     300
Imported:        300
Errors:          0
✓ DRY-RUN PASSED
```

## Summary

Successfully created keyword import system with tier-to-pipeline and risk_topic-to-cluster mappings. Dry-run test confirms 300 keywords parse correctly with proper mapping distribution (192 qa, 98 topic, 10 paper). All three deliverables complete: reusable importer module, CLI script, and admin API endpoint. System ready for live import to populate keyword_queue table.
