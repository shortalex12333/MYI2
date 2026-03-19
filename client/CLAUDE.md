# MYI2 — MyYachtsInsurance.com Content Pipeline

> Last verified: 2026-03-13 by live DB queries and filesystem inspection

## What This Is

Keyword-driven content pipeline for myyachtsinsurance.com. Generates yacht insurance papers, topics, and Q&A using local Ollama LLM, publishes to Supabase, served by Next.js on Vercel.

## Architecture (LOCAL-FIRST)

```
Pipeline 1: Python scraper (cron 8am/2pm/8pm)
  /Users/celeste7/Documents/MYI2/orchestrate.py
  → deep_crawl_all.py → extract Q&A → POST to production /api/v1/bulk-import
  → Writes to: qa_entries table

Pipeline 2: Keyword-driven LLM content (on-demand, LOCAL Ollama)
  keyword_queue → queue-processor.ts → Ollama → adapters → Supabase
  → Writes to: papers, consumer_topics, qa_candidates tables

CRITICAL: Content generation runs LOCALLY via Ollama.
Vercel only serves the website and two crons (daily-scrape, paper-publish) that do NOT use LLM.
```

## LLM Configuration

| Pipeline | Model | File | Temperature |
|----------|-------|------|-------------|
| Papers | qwen3:32b | src/lib/papers-pipeline/paper-generator.ts | 0.15 |
| Topics | qwen3:32b | src/lib/topics-pipeline/topic-generator.ts | 0.3 |
| Q&A | ministral-3:8b | src/lib/qa-generator/generate.ts | 0.1 |

- Ollama URL: `process.env.OLLAMA_URL || 'http://localhost:11434'`
- Binary: `/opt/homebrew/bin/ollama`

## Database State (verified 2026-03-13 post-fix)

| Table | Count | Breakdown |
|-------|-------|-----------|
| keyword_queue | 300 | 284 pending, 16 generated |
| papers | 51 | 44 published, 7 draft |
| consumer_topics | 48 | 39 published, 9 draft (8 new from keyword queue) |
| qa_entries | 199 | published Q&A on site |
| qa_candidates | 1000 | 445 raw, 307 published, 168 tagged, 80 drafted |

## Supabase

```
URL: https://gelaikvydtlktpsryucc.supabase.co
Credentials: in client/.env.local
```

## Key Files

### Queue System
- `src/lib/keyword-queue/queue-processor.ts` — orchestrator (select → lock → route → execute)
- `src/lib/keyword-queue/intent-router.ts` — routes keywords to paper/topic/qa (SINGULAR, not plural)
- `src/lib/keyword-queue/adapters/keyword-to-paper.ts` — creates paper_topic → calls generator
- `src/lib/keyword-queue/adapters/keyword-to-qa.ts` — creates qa_candidate → calls generator
- `src/lib/keyword-queue/adapters/keyword-to-topic.ts` — calls topic generator → saves
- `src/lib/keyword-queue/db.ts` — lazy Supabase client (Proxy pattern)
- `src/lib/keyword-queue/keyword-importer.ts` — bulk import from CSV

### Generators
- `src/lib/papers-pipeline/paper-generator.ts` — Intelligence Briefs (1200-1600 words, Qwen3 32B)
- `src/lib/topics-pipeline/topic-generator.ts` — Consumer Guides (~500 words, Qwen3 32B)
- `src/lib/qa-generator/generate.ts` — Short answers (~200 words, Ministral 8B)

### Publishing
- `src/app/api/cron/paper-publish/route.ts` — publishes reviewed papers (hourly Vercel cron)
- `src/app/api/v1/bulk-import/route.ts` — bulk Q&A import (used by Python scraper)
- `src/app/api/cron/daily-scrape.ts` — batch scrape + extract Q&A (no LLM)

### Quality Gates
- `src/lib/quality-gates/keyword-quality-gates.ts` — word count, keyword density, readability
- `src/lib/papers-pipeline/paper-gates.ts` — structure, entity density, fabrication detection
- `src/lib/papers-pipeline/reference-injector.ts` — deterministic citation injection

## Pipeline Type Values

**Database uses SINGULAR**: `paper`, `topic`, `qa`
**NOT plural**. Previous bug was `papers`/`topics` in switch statements — fixed 2026-03-02.

## CLI Commands

```bash
# Process next keyword from queue (needs Ollama running)
cd /Users/celeste7/Documents/MYI2/client
npx tsx src/lib/keyword-queue/run-first-batch.ts --limit=20

# Generate a paper directly
npx tsx src/lib/papers-pipeline/cli.ts generate

# Generate a topic directly
npx tsx src/lib/topics-pipeline/topic-generator.ts --seed="Best yacht insurance Florida"

# Import keywords from TSV
npx tsx src/lib/keyword-queue/keyword-importer.ts --file=keywords.tsv
```

## Cron Jobs (local crontab)

```
0 8  * * * cd /Users/celeste7/Documents/MYI2 && python3 orchestrate.py  (scrape + Q&A import)
0 14 * * * cd /Users/celeste7/Documents/MYI2 && python3 orchestrate.py
0 20 * * * cd /Users/celeste7/Documents/MYI2 && python3 orchestrate.py
```

## Vercel Crons (NO LLM, safe on Vercel)

- `daily-scrape` — HTTP scraping + pattern-based Q&A extraction
- `paper-publish` — moves papers from reviewed → published (hourly, business hours)

## Known Issues (verified 2026-03-13)

### Fixed this session:
1. ~~Ollama not running~~ — started, both models loaded (qwen3:32b, ministral-3:8b)
2. ~~38 papers stuck in `reviewed`~~ — published via `publish-reviewed.ts` CLI (44 now live)
3. ~~1 keyword stuck `generating`~~ — reset to pending
4. ~~Python scraper imports 0~~ — bulk-import now uses UPSERT (lookup → insert new / update existing)
5. ~~`.env.local` missing vars~~ — OLLAMA_URL and CRON_SECRET added
6. ~~Topic generator intermittent failures~~ — added retry to callQwen + parse-level retry

### Remaining:
- 7 draft papers need review before publishing
- 284 pending keywords in queue (run `npx tsx src/lib/keyword-queue/run-first-batch.ts --limit=20`)
- Ollama must be manually started after reboot (`/opt/homebrew/bin/ollama serve`)

## Import Pattern

```typescript
// CORRECT — lazy Supabase client
import { db } from './db';

// WRONG — don't use createClient() from server
import { createClient } from '@/lib/supabase/server';
```

## What NOT To Do

- Don't assume Vercel runs LLM content — it's LOCAL Ollama only
- Don't use plural pipeline types (`papers`, `topics`) — DB uses singular
- Don't trust "tests pass" without running them — previous Claude got burned on this
- Don't batch 30 things at once — do one, verify, then scale
- Don't skip verification — evidence before claims, always
