# Roadmap: MYI2 Keyword-Driven GEO Content System

## Overview

Transform myyachtsinsurance.com's random content generation into a strategic keyword-driven pipeline that targets 200+ yacht insurance keywords for AI citations and organic traffic. The journey progresses from database infrastructure through pipeline integration to monitoring and ongoing maintenance, delivering measurable results within 2 weeks.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Keyword queue infrastructure, priority scoring, quality gates, Schema.org markup
- [ ] **Phase 2: Pipeline Integration** - Connect queue to content pipelines, import keywords, first 20-page batch
- [ ] **Phase 3: Monitoring** - Dashboard, tracking, feedback loop, scale to 50/week
- [ ] **Phase 4: Maintenance** - Ongoing audits, pruning, freshness updates

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the keyword orchestration layer and quality infrastructure that sits above existing content pipelines
**Depends on**: Nothing (first phase)
**Requirements**: FR-1.1, FR-1.2, FR-1.4, FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-4.1, FR-4.2, FR-4.3, FR-4.4, FR-4.5, FR-4.6, FR-4.7, FR-5.1, FR-5.2, FR-5.3, FR-5.4
**Success Criteria** (what must be TRUE):
  1. keyword_queue table exists in Supabase with all required fields (id, keyword, priority_score, status, pipeline_type, cluster_id, search_volume, keyword_difficulty, retry_count, generated_paper_id, created_at)
  2. Existing papers, qa_entries, and consumer_topics tables have keyword_queue_id foreign key
  3. Priority scoring function calculates score using volume x (100 - difficulty) formula
  4. Quality gate functions validate word count, keyword density (<3%), and readability (>60 Flesch)
  5. FAQPage and Article Schema.org markup renders on new content pages
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Database schema for keyword_queue table and foreign keys to content tables
- [ ] 01-02-PLAN.md — Priority scoring module with TDD (base score, seasonal multiplier, decay factor, VIEW)
- [ ] 01-03-PLAN.md — Quality gates implementation with TDD (readability, keyword density, spot-check)
- [ ] 01-04-PLAN.md — Schema.org markup (FAQPage, BreadcrumbList) integration

### Phase 2: Pipeline Integration
**Goal**: Connect the keyword queue to existing content generation pipelines and publish first batch of keyword-driven content
**Depends on**: Phase 1
**Requirements**: FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-3.5, FR-3.6, FR-3.7, FR-3.8, FR-6.1, FR-6.2
**Success Criteria** (what must be TRUE):
  1. Queue processor selects highest-priority pending keyword with constraint handling
  2. Keywords route to correct pipeline (papers/Q&A/topics) based on intent
  3. Papers, Q&A, and topics pipelines accept target_keyword parameter
  4. Row locking prevents duplicate generation (status transitions: pending -> generating -> generated/failed)
  5. 200+ keywords imported from research PDF into keyword_queue
  6. First 20 keyword-driven pieces published to production
**Plans**: TBD

Plans:
- [ ] 02-01: Queue processor module
- [ ] 02-02: Pipeline keyword integration (papers, Q&A, topics)
- [ ] 02-03: Keyword import and clustering
- [ ] 02-04: First batch generation and publish

### Phase 3: Monitoring
**Goal**: Build feedback loop to measure what is working and enable iteration
**Depends on**: Phase 2
**Requirements**: FR-7.1, FR-7.2, FR-7.3, FR-6.3, FR-6.4
**Success Criteria** (what must be TRUE):
  1. Dashboard displays queue health metrics (pending count, generating count, success rate)
  2. keyword_performance table tracks rankings over time
  3. Coverage visibility shows keywords with published content vs pending
  4. Indexing rate monitoring configured (manual Search Console check or API)
  5. Scale trigger activates 50/week if indexing rate >80% after 2 weeks
  6. Pause trigger halts generation if indexing rate drops below 50%
**Plans**: TBD

Plans:
- [ ] 03-01: Monitoring dashboard
- [ ] 03-02: Performance tracking table and queries
- [ ] 03-03: Scale/pause triggers

### Phase 4: Maintenance
**Goal**: Establish ongoing processes for content freshness and quality
**Depends on**: Phase 3
**Requirements**: NFR-3.1, NFR-3.2, NFR-3.3 (operational requirements derived from maintainability)
**Success Criteria** (what must be TRUE):
  1. Monthly content audit process documented and first audit completed
  2. Content older than 3 months flagged for refresh review
  3. Bottom 20% performers identified for pruning/noindex
  4. Top 20% performers identified for enhancement priority
  5. Seasonal keyword multiplier activates for hurricane keywords (Q2-Q3)
**Plans**: TBD

Plans:
- [ ] 04-01: Content audit automation
- [ ] 04-02: Freshness and pruning logic

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/4 | Planned | - |
| 2. Pipeline Integration | 0/4 | Not started | - |
| 3. Monitoring | 0/3 | Not started | - |
| 4. Maintenance | 0/2 | Not started | - |

## Coverage Validation

| Requirement Category | Requirements | Phase | Mapped |
|---------------------|--------------|-------|--------|
| FR-1: Keyword Queue | FR-1.1, FR-1.2, FR-1.4 | Phase 1 | Yes |
| FR-2: Priority Scoring | FR-2.1, FR-2.2, FR-2.3, FR-2.4 | Phase 1 | Yes |
| FR-3: Content Generation | FR-3.1 to FR-3.8 | Phase 2 | Yes |
| FR-4: Quality Gates | FR-4.1 to FR-4.7 | Phase 1 | Yes |
| FR-5: Schema.org | FR-5.1 to FR-5.4 | Phase 1 | Yes |
| FR-6: Publishing | FR-6.1, FR-6.2 (Phase 2), FR-6.3, FR-6.4 (Phase 3) | Phase 2/3 | Yes |
| FR-7: Performance Tracking | FR-7.1 to FR-7.3 | Phase 3 | Yes |

**Coverage:** 33/33 functional requirements mapped (FR-1.3 not in scope for Phase 1)

## Dependencies

| Dependency | Status | Blocker? |
|------------|--------|----------|
| CRON_SECRET env var in Vercel | MISSING | YES - blocks cron jobs |
| Supabase database access | Available | No |
| Ollama (Qwen 3-32B, Mistral 7B) | Running locally | No |
| Keyword research PDF | Analyzed | No |
| Existing papers/Q&A/topics pipelines | Working | No |

## Success Criteria (Milestone)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Keywords imported | 200+ | Count in keyword_queue |
| Content published (Week 2) | 40 pieces | 20/week staged rollout |
| Indexing rate | >80% | Search Console |
| Quality gate pass rate | >90% | Auto-approved / total |
| Zero AI citations baseline | Established | Microsoft Clarity |
| Schema markup coverage | 100% new content | Manual audit |
