# Research Synthesis

**Project:** MYI2 Keyword-Driven GEO Content System
**Synthesized:** 2026-03-02
**Overall Confidence:** HIGH

---

## Executive Summary

Building a keyword-driven GEO content system in 2026 requires a priority queue architecture with multi-stage quality gates, not simple cron-based content generation. The system must cluster 200+ keywords into topical groups, route them through appropriate pipelines (papers/Q&A/topics), and enforce strict quality validation before publication. The existing Ollama + Supabase + Next.js stack is sufficient, but the critical gap is the orchestration layer: a keyword_queue table that sits above existing pipelines to manage priority scoring, constraint-based selection, and checkpoint-based generation.

The biggest risks are publishing unedited AI content (which triggers Google deindexing within 2-8 weeks) and ignoring E-E-A-T requirements (which causes zero AI citations despite technical optimization). Quality gates are non-negotiable: every piece of content must pass pre-generation, post-generation, and pre-publication validation before going live. A staged rollout (20 pages/week maximum initially) prevents triggering Google's quality scrutiny.

---

## Key Recommendations

1. **Build keyword_queue orchestration layer FIRST** - Don't modify existing pipelines until the queue table, priority scorer, and queue processor are working. This decouples keyword prioritization from content generation.

2. **Implement keyword clustering before generation** - The "one-page-one-keyword" era is dead. Group 200+ keywords into semantic clusters; generate comprehensive hub pages that rank for entire keyword families. This is foundational and must happen Phase 1.

3. **Enforce multi-stage quality gates** - Every content piece must pass: (a) pre-generation validation (intent mapped, SERP analyzed), (b) post-generation checks (word count, readability, uniqueness), (c) pre-publication human review (facts verified, E-E-A-T present), (d) technical validation (Core Web Vitals, mobile-friendly). Content failing any gate goes to review queue, not auto-publish.

4. **Staged rollout: 20 pages/week maximum** - Rapid expansion (200 pages day-one) triggers Google quality scrutiny. Progressive rollout with indexing rate monitoring prevents mass deindexing.

5. **Add Schema.org markup to 100% of pages** - FAQPage schema has highest AI citation probability. Article schema with author/dateModified is second priority. Organization schema site-wide. Without structured data, content is invisible to AI citation engines.

6. **Track AI citations from day one** - Use Microsoft Clarity (free) as baseline, add Otterly.AI ($25/mo) after first content batch. Citation tracking proves GEO value and informs iteration. Waiting to add tracking means missing critical feedback loop.

7. **Use Qwen 3-32B minimum for production content** - Smaller models (<32B parameters) produce repetitive, dry content with 90%+ hallucination rates. Model selection is Phase 1 infrastructure, not optional optimization.

---

## Technology Choices

### Keep (Existing Stack)
| Technology | Purpose | Notes |
|------------|---------|-------|
| Next.js 14 | SSR/SSG Framework | Excellent for JSON-LD, metadata, dynamic routing |
| Supabase | Database + Auth | Extend with keyword_queue, keyword_citations tables |
| Ollama (Qwen 3-32B) | Primary content generation | 128K context, 29 languages, good for factual insurance content |
| Ollama (Mistral 7B) | Q&A generation | Lighter weight for short-form content |

### Add (New Tools)
| Technology | Cost | Purpose | Priority |
|------------|------|---------|----------|
| next-seo | $0 | JSON-LD components (FAQ, Article, Breadcrumb) | Phase 1 |
| schema-dts | $0 | TypeScript Schema.org definitions | Phase 1 |
| Microsoft Clarity | $0 | Baseline AI citation tracking | Phase 1 |
| DataForSEO API | $3.60/mo | Keyword position tracking (200 keywords) | Phase 1 |
| Otterly.AI | $25/mo | Multi-platform citation tracking | Phase 2 |
| Readable.com API | ~$10/mo | Automated readability scoring | Phase 2 |
| KeySearch | $24/mo | Budget keyword research | Phase 2 |

**Total Monthly Cost:** ~$62.60/month (Phase 1-2 combined)

### Avoid
- SerpAPI ($15/1K requests) - 25x more expensive than DataForSEO
- Grammarly Business ($30/user/month) - Readable.com + Hemingway covers needs for $20 one-time
- SEMrush ($119.95/mo) - Overlaps with Ahrefs; pick one, not both
- GPT-4 API for generation - $2,400 for 200 articles vs $0 with Ollama

---

## Architecture Pattern

### Core Pattern: Database-Backed Priority Queue

```
Keyword Sources (scraper, PDF import, gap analysis)
       |
       v
+-----------------+
| keyword_queue   |  <-- NEW orchestration layer
| - keyword       |
| - priority_score|
| - status        |
| - metadata      |
+-----------------+
       |
       v
+-----------------+
| Priority Scorer |  (volume, difficulty, intent, seasonal)
+-----------------+
       |
       v
+-----------------+
| Queue Processor |  (constraints: cluster balance, persona distribution)
+-----------------+
       |
       +---> Papers Pipeline (Qwen 3-32B, 1500-2000 words)
       +---> Q&A Pipeline (Mistral 7B, 250 words)
       +---> Topics Pipeline (Qwen 3-32B, 500 words)
```

### Why Database Queue Over Message Queue
- PostgreSQL ACID guarantees prevent duplicate generation (critical for LLM costs)
- Exactly-once execution semantics without Redis/RabbitMQ/SQS
- Checkpoint-based resumption on failures
- Simpler deployment

### Key Schema Addition

```sql
CREATE TABLE keyword_queue (
  id UUID PRIMARY KEY,
  keyword TEXT NOT NULL,
  priority_score INT NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'scored', 'assigned', 'generating', 'generated', 'failed')),
  pipeline_type TEXT CHECK (pipeline_type IN ('papers', 'qa', 'topics')),
  cluster_id TEXT,
  search_volume INT,
  keyword_difficulty INT,
  retry_count INT DEFAULT 0,
  generated_paper_id UUID REFERENCES papers(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Integration Strategy
- keyword_queue sits ABOVE existing tables, not replacing them
- Add keyword_queue_id foreign key to paper_topics, qa_candidates, consumer_topics
- Existing pipelines continue working; queue processor calls them

---

## Critical Features

### Phase 1: Foundation (Must Have)
| Feature | Complexity | Why Critical |
|---------|------------|--------------|
| Keyword Clustering | Medium | Can't target 200 individual keywords; must group into topical clusters |
| keyword_queue Table | Low | Orchestration layer for priority scoring and constraint selection |
| Priority Scorer | Medium | Multi-dimensional scoring (volume, difficulty, intent, seasonal) |
| Quality Gates | High | Prevent hallucinations and thin content from publishing |
| Schema.org Markup | Medium | 100% of pages need Article/FAQ schema for AI visibility |
| Keyword-to-Content Mapping | Low | Track which keywords have coverage |

### Phase 2: Optimization
| Feature | Complexity | Why Important |
|---------|------------|---------------|
| Citation Tracking | High | Measure GEO effectiveness; inform iteration |
| Content Freshness Monitoring | Medium | 85% of AI citations are <2 years old; flag stale content |
| GEO Score Dashboard | High | Track visibility across Citability, Entity Authority, Structured Data, Trust |

### Phase 3: Advanced
| Feature | Complexity | Notes |
|---------|------------|-------|
| Platform-Specific Optimization | Medium | ChatGPT prefers Wikipedia-style; Perplexity prefers Reddit-style |
| Evidence-Backed Content | Medium | Auto-inject statistics from trusted sources |
| Substantive Update Automation | Medium | Auto-trigger rewrites for content >3 months old |

### Anti-Features (Do NOT Build)
- Manual content creation interface (defeats automation purpose)
- One-page-per-keyword (outdated; clusters beat individual pages)
- Keyword density optimization (LLMs evaluate semantic meaning, not stuffing)
- Backlink building features (brand search volume predicts citations, not backlinks)
- AI content detector evasion (embrace AI generation; focus on quality)

---

## Pitfalls to Avoid

### Critical (Will Cause Rewrites or Penalties)

| Pitfall | Consequence | Prevention |
|---------|-------------|------------|
| **Publishing unedited AI content at scale** | 85% pages stuck in "not indexed"; traffic collapse after 2-8 weeks | Multi-stage quality gates; human oversight; staged rollout 20/week |
| **Ignoring E-E-A-T requirements** | Zero AI citations despite technical optimization | Real author credentials; original examples; source citations; monthly updates |
| **Keyword stuffing** | Algorithmic penalties; AI engines skip citation | Readability >60 Flesch; keyword density <3% per term |
| **Duplicate/near-duplicate content** | Only 10-15% of pages indexed | 30%+ unique content threshold; template variation |
| **Processing queue without locking** | Duplicate LLM calls; duplicate content | Use PostgreSQL SELECT FOR UPDATE or status-based locks |

### Moderate (Will Require Fixes)

| Pitfall | Consequence | Prevention |
|---------|-------------|------------|
| Blocking AI crawlers in robots.txt | Zero AI citations | Explicitly allow GPTBot, PerplexityBot, CCBot, Anthropic-AI |
| No internal linking strategy | New pages orphaned, not indexed | Every page linked from 2+ existing pages |
| Poor local LLM quality (small models) | Content requires 50%+ rewriting | Use 32B+ parameter models minimum |
| Missing structured data | No rich snippets, limited AI citation | Article/FAQ schemas on 100% of pages |

### Red Flag Triggers (Require Immediate Action)

| Signal | Action | Timeline |
|--------|--------|----------|
| Indexing rate <50% after 2 weeks | Pause generation, audit quality | Immediate |
| Manual action in Search Console | Stop publishing, review flagged content | Immediate |
| Bounce rate >70% on new pages | Review intent matching | 48 hours |
| Zero AI citations after 1 month | Implement schema, restructure content | 1 week |
| Post-publication error rate >20% | Strengthen quality gates | Immediate |

---

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
**Goal:** Keyword orchestration layer + quality infrastructure

1. Create keyword_queue table schema
2. Add foreign keys to existing tables (paper_topics, qa_candidates, consumer_topics)
3. Build priority scoring module (volume, difficulty, intent, seasonal)
4. Build queue processor module (constraint-based selection)
5. Implement Schema.org markup (next-seo) on existing pages
6. Configure robots.txt to allow AI crawlers
7. Set up Microsoft Clarity for baseline tracking
8. Create quality gate checklist (pre-generation, post-generation, pre-publication)

**Deliverable:** Can insert keyword, score it, select highest priority with constraints

### Phase 2: Pipeline Integration (Week 3-4)
**Goal:** Connect queue to existing content pipelines

1. Integrate papers pipeline with keyword_queue
2. Integrate Q&A pipeline with keyword_queue
3. Integrate topics pipeline with keyword_queue
4. Build cron job API route for queue processing
5. Cluster 200 keywords from PDF into topical groups
6. Import clustered keywords to keyword_queue
7. Set up Otterly.AI for citation tracking
8. Generate first 20-page batch (staged rollout)

**Deliverable:** Keywords flow through queue to published content

### Phase 3: Monitoring & Optimization (Week 5-6)
**Goal:** Feedback loop for iteration

1. Build monitoring dashboard (queue health, indexing rate, citation rate)
2. Implement content freshness tracking (flag >3 months old)
3. Add GEO score tracking (Citability, Entity Authority, Structured Data, Trust)
4. Review first batch results; adjust quality gates
5. Scale to 50 pages/week if indexing rate >80%

**Deliverable:** Can measure what's working and iterate

### Phase 4: Maintenance (Ongoing)
**Goal:** Content stays fresh and performs

1. Monthly content audits (traffic, rankings, indexing)
2. Quarterly pruning (remove/noindex bottom 20% performers)
3. Monthly updates to top 20% performers
4. Weekly AI citation monitoring
5. Seasonal content refresh (hurricane keywords Q2-Q3)

---

## Risk Assessment

### High Risk

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Google deindexes AI content | HIGH if no quality gates | Traffic collapse | Multi-stage gates; staged rollout; human review |
| Zero AI citations despite effort | MEDIUM | Wasted investment | Schema markup; E-E-A-T signals; citation tracking from day 1 |
| Local LLM produces unusable content | MEDIUM with small models | Rewrite everything | Use Qwen 3-32B minimum; benchmark before production |

### Medium Risk

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Keyword clustering produces wrong groupings | LOW-MEDIUM | Poor topical authority | Validate clusters manually before generation |
| Queue processor race conditions | LOW if using locks | Duplicate content | PostgreSQL SELECT FOR UPDATE; status-based locking |
| Scoring factors weighted incorrectly | MEDIUM | Wrong priorities | Re-score daily; decay factor for old keywords |

### Low Risk

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase capacity limits | LOW | Temporary slowdown | Monitor query patterns; add indexes on status+priority |
| Next.js build times increase | LOW | Slower deploys | Incremental static regeneration; only rebuild changed pages |

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| **Stack Choices** | HIGH | Existing stack is correct; additions well-documented with 2026 sources |
| **Architecture Pattern** | HIGH | Priority queue pattern verified across Microsoft, InfoQ, multiple 2026 GEO frameworks |
| **Feature Prioritization** | HIGH | Clear consensus across sources on clustering > quality gates > citation tracking |
| **Pitfall Identification** | HIGH | Multiple sources corroborate each pitfall; case studies with failure timelines |
| **Cost Estimates** | MEDIUM | Pricing verified across sources but may change; conservative estimates used |
| **Citation Tracking Effectiveness** | MEDIUM | AI citation landscape evolving; measurement tools are new |

### Gaps to Address During Implementation

1. **Keyword clustering algorithm** - Research identified need but not specific implementation. Validate with test cluster before full import.
2. **E-E-A-T automation** - Manual checklist defined, but automation approach unclear. May need subject matter expert involvement.
3. **Platform-specific optimization** - ChatGPT vs Perplexity vs Google preferences documented, but testing required to validate for yacht insurance niche.
4. **Hallucination detection** - Research mentions RAG reduces hallucinations 71%, but current Ollama setup may not use RAG. Evaluate adding retrieval layer.

---

## Sources (Aggregated)

### GEO & AI Citation Optimization
- [Mastering Generative Engine Optimization in 2026 - Search Engine Land](https://searchengineland.com/mastering-generative-engine-optimization-in-2026-full-guide-469142)
- [The Generative Engine Optimization (GEO) Framework 2026 - AuraMetrics](https://aurametrics.io/en/blog/the-generative-engine-optimization-geo-framework-2026-aurametrics)
- [LLM-Optimized Content: How to Get Cited by ChatGPT, Perplexity & AI Search](https://www.averi.ai/breakdowns/the-definitive-guide-to-llm-optimized-content)
- [ChatGPT vs. Perplexity vs. Google AI Mode Citation Benchmarks](https://www.averi.ai/how-to/chatgpt-vs.-perplexity-vs.-google-ai-mode-the-b2b-saas-citation-benchmarks-report-(2026))

### Architecture & Patterns
- [Microsoft Azure Priority Queue Pattern](https://github.com/MicrosoftDocs/architecture-center/blob/main/docs/patterns/priority-queue-content.md)
- [Database-Backed Workflow Orchestration - InfoQ](https://www.infoq.com/news/2025/11/database-backed-workflow/)
- [Automated SEO Content Strategy 2026 - TrySight](https://www.trysight.ai/blog/automated-seo-content-strategy)
- [How to Prioritize Keywords for Better SEO - Surfer SEO](https://surferseo.com/blog/prioritize-keywords-for-seo/)

### Quality & Pitfalls
- [SEO Mistakes Using AI Content: 9 Shocking Errors in 2026](https://www.digitalwebxpert.com/seo-mistakes-using-ai-content-2026/)
- [Common AI SEO Mistakes That Kill Rankings in 2026](https://adlivetech.com/blogs/common-ai-seo-mistakes-that-kill-rankings/)
- [AI Content Quality Control: Complete Guide for 2026](https://koanthic.com/en/ai-content-quality-control-complete-guide-for-2026-2/)
- [Avoid "AI Thin Content": GEO Content Quality Checklist](https://www.toolient.com/2026/02/avoid-ai-thin-content-geo-quality-checklist.html)

### Tools & APIs
- [9 Best Generative Engine Optimization Tools for 2026](https://www.bignewsnetwork.com/news/278838990/9-best-generative-engine-optimization-geo-tools-for-2026-tested-and-compared)
- [DataForSEO Keyword Data API](https://dataforseo.com/apis/keyword-data-api)
- [next-seo GitHub Repository](https://github.com/garmeeh/next-seo)
- [Microsoft Clarity AI Citations Feature](https://clarity.microsoft.com/blog/understanding-your-influence-ai-citations/)

### Schema & Structured Data
- [Schema Markup for GEO SEO | AI-Friendly Structured Data](https://www.getpassionfruit.com/blog/ai-friendly-schema-markup-structured-data-strategies-for-better-geo-visibility)
- [FAQ Schema for AI Search & GEO](https://www.frase.io/blog/faq-schema-ai-search-geo-aeo)
- [Schema Markup for AI Citations - Averi.ai](https://www.averi.ai/blog/schema-markup-for-ai-citations-the-technical-implementation-guide)
