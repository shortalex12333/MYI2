---
phase: 01-foundation
plan: 01
subsystem: keyword-queue
tags: [database, schema, migration, foundation]
dependency_graph:
  requires: []
  provides: [keyword_queue_table, keyword_fk_relationships, keyword_queue_db_client]
  affects: [papers, qa_candidates, consumer_topics]
tech_stack:
  added: [keyword-queue-module]
  patterns: [sql-migrations, supabase-singleton, rls-policies]
key_files:
  created:
    - src/lib/keyword-queue/migrations/001_keyword_queue.sql
    - src/lib/keyword-queue/migrations/002_add_fk_to_content_tables.sql
    - src/lib/keyword-queue/db.ts
  modified: []
decisions:
  - "Follow consumer_topics.sql pattern for RLS and trigger implementation"
  - "Use conditional DO block for qa_candidates table to handle manual creation variations"
  - "Match papers-pipeline/db.ts pattern for Supabase client singleton"
metrics:
  duration_seconds: 87
  completed_at: "2026-03-02T17:30:39Z"
  tasks_completed: 3
  files_created: 3
  commits: 3
---

# Phase 01 Plan 01: Database Foundation Summary

**Created keyword_queue table and foreign key relationships to enable keyword-driven content generation.**

## What Was Built

Created the database foundation layer that connects keyword research to content generation pipelines. The keyword_queue table serves as a central orchestration point, tracking keywords from research through to published content.

### Components Created

1. **keyword_queue table** - Central queue with priority scoring, status tracking, and metadata
2. **Foreign key relationships** - Links papers, qa_candidates, and consumer_topics back to keywords
3. **Supabase client singleton** - Database access layer for keyword-queue module

## Implementation Details

### Task 1: keyword_queue Table Migration

**File:** `src/lib/keyword-queue/migrations/001_keyword_queue.sql`

Created table with 12 columns:
- Core fields: id, keyword, priority_score, status, pipeline_type
- Metadata: cluster_id, search_volume, keyword_difficulty, retry_count
- References: generated_content_id, requires_human_review
- Timestamps: created_at, updated_at (with auto-update trigger)

**Key features:**
- Indexes on status, cluster_id, priority_score, pipeline_type for query performance
- RLS enabled with service_role full access + authenticated user policies
- updated_at trigger function following consumer_topics pattern
- Comprehensive documentation comments for all columns

**Commit:** `795a5e7`

### Task 2: Foreign Key Migration

**File:** `src/lib/keyword-queue/migrations/002_add_fk_to_content_tables.sql`

Added `keyword_queue_id` foreign key to three content tables:

1. **papers** - Direct ALTER TABLE with index
2. **qa_candidates** - Conditional DO block (handles manual creation variations)
3. **consumer_topics** - Direct ALTER TABLE with index

**Key features:**
- IF NOT EXISTS for idempotent execution
- Indexes on all foreign keys for JOIN performance
- Documentation comments explaining relationships

**Commit:** `b33ab1a`

### Task 3: Database Client Singleton

**File:** `src/lib/keyword-queue/db.ts`

Created Supabase client singleton matching papers-pipeline/db.ts pattern:
- Uses service role key for admin access (bypasses RLS for pipeline operations)
- Supports both SUPABASE_SERVICE_KEY and SUPABASE_SERVICE_ROLE_KEY env vars
- Throws error if environment variables missing

**Commit:** `3384b9d`

## Verification Results

All success criteria met:

- ✅ src/lib/keyword-queue/migrations/001_keyword_queue.sql exists with complete table definition
- ✅ src/lib/keyword-queue/migrations/002_add_fk_to_content_tables.sql exists with all 3 table alterations
- ✅ src/lib/keyword-queue/db.ts exports Supabase client singleton
- ✅ All SQL uses IF NOT EXISTS for idempotent execution
- ✅ RLS enabled on keyword_queue table
- ✅ Indexes created for all foreign keys and frequently-queried columns

### Pattern Consistency

- ✅ RLS patterns match consumer_topics.sql
- ✅ Index naming follows idx_{table}_{column} convention
- ✅ UUID primary keys with gen_random_uuid()
- ✅ Trigger function follows consumer_topics pattern
- ✅ Client singleton matches papers-pipeline pattern

## Deviations from Plan

None - plan executed exactly as written.

## Next Steps

**Phase 01, Plan 02** will build the priority queue service layer on top of this database foundation to:
- Calculate priority scores from search_volume and keyword_difficulty
- Select next keywords for generation based on priority
- Update status as keywords move through pipeline

## Technical Notes

### Why Service Role Key?

The db.ts singleton uses the service role key (not anon key) because pipeline operations need to bypass RLS for administrative tasks like batch updates and cron job operations. Individual user operations would use the anon key through Next.js API routes.

### Why Conditional for qa_candidates?

The qa_candidates table was created manually in earlier development and may have schema variations. The conditional DO block ensures the migration succeeds whether the table exists or not, and whether the column already exists.

### Migration Execution

To run these migrations:
```bash
# Via Supabase CLI
supabase db push

# Or via Supabase Dashboard
# Copy/paste SQL into SQL Editor and run
```

---

## Self-Check: PASSED

**Files created:**
- ✅ FOUND: src/lib/keyword-queue/migrations/001_keyword_queue.sql
- ✅ FOUND: src/lib/keyword-queue/migrations/002_add_fk_to_content_tables.sql
- ✅ FOUND: src/lib/keyword-queue/db.ts

**Commits exist:**
- ✅ FOUND: 795a5e7 (Task 1: keyword_queue table)
- ✅ FOUND: b33ab1a (Task 2: foreign keys)
- ✅ FOUND: 3384b9d (Task 3: db client)

**Schema validation:**
- ✅ All SQL files syntactically valid (PostgreSQL)
- ✅ Table definition matches FR-1.1 requirements
- ✅ Foreign keys properly reference keyword_queue(id)
