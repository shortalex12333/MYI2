# MYI2 Keyword-Driven Content System

## What This Is

A keyword-driven content publishing system for myyachtsinsurance.com that transforms the existing random content generation into a strategic GEO (Generative Engine Optimization) pipeline. The system targets 200+ yacht insurance keywords to maximize AI citations and organic traffic growth.

## Core Value

**Get AI systems (ChatGPT, Perplexity, Claude) to cite myyachtsinsurance.com as an authoritative source for yacht insurance information.**

## Requirements

### Validated

<!-- Existing capabilities from codebase -->

- ✓ Papers pipeline generates 1200+ word intelligence briefs — existing
- ✓ Q&A pipeline generates short-form answers — existing
- ✓ Topics pipeline generates consumer guides — existing
- ✓ Vercel cron jobs configured for daily scrape and hourly publish — existing
- ✓ Supabase database stores all content — existing
- ✓ llms.txt and robots.txt configured for AI crawlers — existing
- ✓ 45 papers and 39 topics already published — existing

### Active

<!-- New capabilities for this milestone -->

- [ ] Keyword queue table stores prioritized keywords from research
- [ ] Content generators accept target keyword as input parameter
- [ ] Publishing prioritizes high-volume, low-difficulty keywords
- [ ] Quality gates detect keyword stuffing and reject unnatural content
- [ ] Spot-check review system flags 20% of content for human review
- [ ] Performance tracking shows which keywords are ranking

### Out of Scope

- Paid advertising / PPC campaigns — organic focus only
- Backlink outreach — content quality first
- Social media automation — not core to GEO
- Mobile app — web-first strategy

## Context

**Existing Infrastructure:**
- Next.js 14 app deployed on Vercel (www.myyachtsinsurance.com)
- Supabase PostgreSQL database with papers, topics, qa_entries tables
- Local Ollama running Qwen 3-32B (papers) and Mistral 8B (Q&A)
- Cron jobs at 2 AM UTC (scrape) and hourly 7am-6pm (publish)

**Keyword Research:**
- 200+ keywords analyzed from PDF research
- Top opportunities: "inland marine insurance" (1,700/mo), "boat insurance cost" (660/mo)
- Many question keywords ideal for Q&A: "does boat insurance cover X"

**Current Gap:**
- Content is generated randomly, not driven by keyword targeting
- No connection between keyword research and content pipeline
- CRON_SECRET missing from Vercel (cron jobs failing)

## Constraints

- **Timeline**: 2 weeks to measurable results
- **Review**: Spot-check only (20% + flagged) — max AI throughput
- **Tech stack**: Must use existing Next.js/Supabase/Ollama infrastructure
- **Quality**: No keyword stuffing, natural language only
- **Ethics**: White-hat SEO/GEO only — no manipulation tactics

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keyword queue in Supabase | Centralized, queryable, integrates with existing pipelines | — Pending |
| Prioritize by volume × (100 - difficulty) | Balances opportunity with achievability | — Pending |
| All content types eligible | Papers, Q&A, Topics each serve different intents | — Pending |

---
*Last updated: 2026-03-02 after GSD initialization*
