# Requirements: MYI2 Keyword-Driven GEO Content System

**Version:** 1.0
**Date:** 2026-03-02
**Derived From:** `.planning/research/SUMMARY.md`, `.planning/PROJECT.md`

---

## Scope Statement

Transform myyachtsinsurance.com's random content generation into a strategic keyword-driven pipeline that targets 200+ yacht insurance keywords for AI citations (ChatGPT, Perplexity, Claude) and organic traffic growth.

**Timeline:** 2 weeks to measurable results
**Review Model:** Spot-check (20% + flagged) for maximum AI throughput
**Ethics:** White-hat GEO/SEO only — no manipulation tactics

---

## Functional Requirements

### FR-1: Keyword Queue Infrastructure

| ID | Requirement | Priority | Rationale |
|----|-------------|----------|-----------|
| FR-1.1 | Create `keyword_queue` table in Supabase with fields: id, keyword, priority_score, status, pipeline_type, cluster_id, search_volume, keyword_difficulty, retry_count, generated_paper_id, created_at | MUST | Orchestration layer sits above existing pipelines |
| FR-1.2 | Add `keyword_queue_id` foreign key to papers, qa_entries, consumer_topics tables | MUST | Track which keyword generated which content |
| FR-1.3 | Import 200+ keywords from PDF research into keyword_queue | MUST | Bootstrap the system with validated keyword data |
| FR-1.4 | Store cluster_id for semantic keyword groupings | MUST | Cluster approach beats one-page-per-keyword |

### FR-2: Priority Scoring

| ID | Requirement | Priority | Rationale |
|----|-------------|----------|-----------|
| FR-2.1 | Calculate priority_score using formula: `volume × (100 - difficulty)` | MUST | Balance opportunity with achievability |
| FR-2.2 | Apply seasonal multiplier for time-sensitive keywords (hurricane Q2-Q3) | SHOULD | Yacht insurance has seasonal peaks |
| FR-2.3 | Decay score for keywords waiting >7 days | SHOULD | Prevents stale keywords blocking queue |
| FR-2.4 | Re-score all pending keywords daily via cron | SHOULD | Priorities shift as content is published |

### FR-3: Content Generation Integration

| ID | Requirement | Priority | Rationale |
|----|-------------|----------|-----------|
| FR-3.1 | Queue processor selects highest-priority pending keyword with constraints | MUST | Constraint: cluster balance, persona distribution |
| FR-3.2 | Route keywords to appropriate pipeline based on intent: papers (informational), Q&A (question), topics (commercial) | MUST | Each pipeline serves different search intents |
| FR-3.3 | Papers pipeline accepts target_keyword parameter and includes it naturally | MUST | No keyword stuffing; natural integration |
| FR-3.4 | Q&A pipeline accepts target_keyword parameter | MUST | Short-form answers for question keywords |
| FR-3.5 | Topics pipeline accepts target_keyword parameter | MUST | Consumer guides for commercial keywords |
| FR-3.6 | Lock keyword row during generation (status: 'generating') | MUST | Prevent duplicate LLM calls |
| FR-3.7 | Update status to 'generated' and link to content upon completion | MUST | Track generation success |
| FR-3.8 | Increment retry_count on failure; mark 'failed' after 3 retries | MUST | Graceful failure handling |

### FR-4: Quality Gates

| ID | Requirement | Priority | Rationale |
|----|-------------|----------|-----------|
| FR-4.1 | Pre-generation: Verify keyword has intent mapped and volume data | MUST | Don't waste LLM calls on incomplete data |
| FR-4.2 | Post-generation: Check word count meets minimum (papers: 1200+, Q&A: 250+, topics: 500+) | MUST | Thin content gets deindexed |
| FR-4.3 | Post-generation: Verify keyword appears naturally (density <3%) | MUST | Keyword stuffing triggers penalties |
| FR-4.4 | Post-generation: Check readability score >60 Flesch | SHOULD | AI engines prefer readable content |
| FR-4.5 | Pre-publication: Flag 20% of content for human review | MUST | Spot-check review model per user requirement |
| FR-4.6 | Pre-publication: Auto-flag any content with detected issues | MUST | Quality gates catch problems before publish |
| FR-4.7 | Reject content failing gates to review queue, not auto-publish | MUST | Never publish unvalidated content |

### FR-5: Schema.org Structured Data

| ID | Requirement | Priority | Rationale |
|----|-------------|----------|-----------|
| FR-5.1 | Add FAQPage schema to all Q&A content | MUST | Highest AI citation probability |
| FR-5.2 | Add Article schema with author, datePublished, dateModified to papers | MUST | Required for AI visibility |
| FR-5.3 | Add Organization schema site-wide | SHOULD | E-E-A-T signal |
| FR-5.4 | Add BreadcrumbList schema for navigation | SHOULD | Improves crawlability |

### FR-6: Publishing & Rollout

| ID | Requirement | Priority | Rationale |
|----|-------------|----------|-----------|
| FR-6.1 | Publish maximum 20 pages per week initially | MUST | Rapid expansion triggers Google scrutiny |
| FR-6.2 | Track indexing rate via Search Console API or manual check | SHOULD | Monitor for mass deindexing signals |
| FR-6.3 | Scale to 50 pages/week if indexing rate >80% after 2 weeks | SHOULD | Progressive rollout |
| FR-6.4 | Pause generation if indexing rate drops below 50% | MUST | Red flag trigger |

### FR-7: Performance Tracking

| ID | Requirement | Priority | Rationale |
|----|-------------|----------|-----------|
| FR-7.1 | Create `keyword_performance` table to track rankings over time | SHOULD | Measure keyword success |
| FR-7.2 | Track which keywords have published content vs pending | MUST | Coverage visibility |
| FR-7.3 | Display queue health metrics: pending count, generating count, success rate | SHOULD | Operational visibility |

---

## Non-Functional Requirements

### NFR-1: Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1.1 | Queue processor completes selection in <500ms | P95 |
| NFR-1.2 | Content generation leverages existing Ollama setup (no new infrastructure) | Required |
| NFR-1.3 | Database queries use indexes on keyword_queue(status, priority_score) | Required |

### NFR-2: Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-2.1 | Queue processor handles failures gracefully with retry logic | 3 retries |
| NFR-2.2 | No duplicate content generation from race conditions | Zero tolerance |
| NFR-2.3 | Checkpoint-based resumption on cron failures | Required |

### NFR-3: Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-3.1 | Queue infrastructure decoupled from existing pipelines | Modular |
| NFR-3.2 | Priority scoring formula configurable without code changes | Via env or config |
| NFR-3.3 | Quality gate thresholds configurable | Via constants/config |

### NFR-4: Compliance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-4.1 | Allow AI crawlers in robots.txt (GPTBot, PerplexityBot, CCBot, Anthropic-AI) | Required |
| NFR-4.2 | White-hat SEO/GEO practices only | Zero black-hat |
| NFR-4.3 | No keyword stuffing (density <3% per term) | Enforced |

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Keywords imported | 200+ | Count in keyword_queue |
| Content published (Week 2) | 40 pieces | 20/week staged rollout |
| Indexing rate | >80% | Search Console |
| Quality gate pass rate | >90% | Auto-approved / total |
| Zero AI citations baseline | Established | Microsoft Clarity |
| Schema markup coverage | 100% new content | Manual audit |

---

## Out of Scope

- Paid advertising / PPC campaigns — organic focus only
- Backlink outreach — content quality first
- Social media automation — not core to GEO
- Mobile app — web-first strategy
- Manual content creation interface — defeats automation purpose
- AI content detector evasion — embrace AI generation; focus on quality

---

## Constraints

| Constraint | Impact |
|------------|--------|
| 2-week timeline | Phases must be tightly scoped |
| Existing tech stack (Next.js/Supabase/Ollama) | No new major infrastructure |
| CRON_SECRET missing from Vercel | Must add before cron jobs work |
| Spot-check review only | Quality gates must be robust |
| Max 20 pages/week initially | Staged rollout required |

---

## Dependencies

| Dependency | Status | Blocker? |
|------------|--------|----------|
| CRON_SECRET env var in Vercel | MISSING | YES - blocks cron jobs |
| Supabase database access | Available | No |
| Ollama (Qwen 3-32B, Mistral 7B) | Running locally | No |
| Keyword research PDF | Analyzed | No |
| Existing papers/Q&A/topics pipelines | Working | No |

---

## Phase Recommendations

Based on research synthesis, recommend **4 phases**:

1. **Phase 1: Foundation** — keyword_queue table, priority scoring, quality gates, Schema.org markup
2. **Phase 2: Pipeline Integration** — Connect queue to papers/Q&A/topics, import keywords, first 20-page batch
3. **Phase 3: Monitoring** — Dashboard, tracking, feedback loop, scale to 50/week
4. **Phase 4: Maintenance** — Ongoing audits, pruning, freshness updates

---

*Requirements derived from research synthesis: 2026-03-02*
