# MYI Papers Pipeline

Long-form Intelligence Brief generator. Parallel to Q&A pipeline.

Model: **Qwen3-32B** (local via Ollama)  
Cadence: **one paper every 2–3 days**  
Structure: **INTELLIGENCE_BRIEF_STRUCTURE_v2.1**  
Citations: **deterministic — registry only, model never outputs URLs**

---

## Architecture

```
qa_candidates (199 scraped questions)
        ↓
   [seed]  topic-seeder.ts
        ↓
  paper_topics (canonical titles, primary queries, personas)
        ↓
   [score]  geo-scorer.ts
        ↓
  paper_topics.geo_score (authority_gap + cluster_depth +
                          registry_strength + seasonal_weight +
                          persona_score)
        ↓
   [generate]  paper-generator.ts  ←  reference_registry (deterministic)
        ↓
  papers (draft, body_markdown, schema_json, author block)
        ↓
   [validate]  paper-gates.ts
        ↓
  Gate 1: Structure (all sections present)
  Gate 2: Entity density (≥3 named entities)
  Gate 3: Word count (1,200–1,600)
  Gate 4: No fabrication (FATAL)
  Gate 5: References injected (≥3)
        ↓
  papers.review_status = 'reviewed'
        ↓
   [schedule]  scheduler.ts (cluster-balanced, every 2–3 days)
        ↓
  paper_calendar
        ↓
  [publish]  your CMS / deploy hook
```

---

## Full Run

```bash
# 1. Convert scraped questions into article topics
npx ts-node cli.ts seed --limit=50

# 2. GEO-score all topics
npx ts-node cli.ts score --limit=100

# 3. Generate one paper (picks top GEO score automatically)
npx ts-node cli.ts generate

# 4. Validate the draft
npx ts-node cli.ts validate --all-drafts

# 5. Build 4-week publication calendar
npx ts-node cli.ts schedule --weeks=4

# 6. Check what's due today
npx ts-node cli.ts next

# 7. Pipeline dashboard
npx ts-node cli.ts status
```

---

## GEO Scoring Dimensions

| Dimension | What it measures | Max |
|---|---|---|
| authority_gap | No credible source currently answers this topic | 5 |
| cluster_depth | Existing published papers in this cluster | 5 |
| registry_strength | Primary refs available in reference_registry | 5 |
| seasonal_weight | Seasonal relevance (hurricane season, refit season) | 5 |
| persona_score | Professional persona = higher AI retrieval signal | 5 |

Total max: **25**. Schedule everything ≥15 first.

---

## Quality Gates

| Gate | Condition | Fatal? |
|---|---|---|
| Structure | All 9 sections present | If >2 missing |
| Entity Density | ≥3 named maritime entities | If 0 entities |
| Word Count | 1,200–1,600 words | If <800 or >2000 |
| No Fabrication | No invented clause numbers | **Always fatal** |
| References | ≥3 refs injected, no placeholder | If placeholder remains |

---

## Identity Binding (alex-short.com)

Every paper includes:

**Visible (Tier 2):**
```
*Maintained by [Alex Short](https://alex-short.com/experience) — maritime operational experience*
```
Placed under H1, above TL;DR. One per paper. Not in body.

**Structured data (Tier 1 — machine-level):**
```json
{
  "@type": "Article",
  "author": {
    "@type": "Person",
    "name": "Alex Short",
    "url": "https://alex-short.com",
    "sameAs": ["https://alex-short.com", "https://linkedin.com/in/alexshort"]
  }
}
```
Injected in `<head>` at render time. Never visible in body.

---

## Cluster Publication Balance

The scheduler prevents any single cluster from publishing more than twice what the least-published cluster has. This ensures:

- Broad topic coverage early (signals ecosystem depth to AI)
- No cluster hub is triggered before it has ≥8 papers backing it
- Hurricane/storm cluster gets seasonal weight boosts May–November

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OLLAMA_URL=http://localhost:11434
```

---

## Separation from Q&A Pipeline

| Q&A Pipeline | Papers Pipeline |
|---|---|
| Mistral 8B | Qwen3-32B |
| ~200 words | 1,200–1,600 words |
| Direct answer | Full structured brief |
| High volume | 2–3 day cadence |
| Forum surface layer | Authority layer |
| cli.ts (existing) | cli.ts (this repo) |
| qa_candidates table | papers + paper_topics tables |
