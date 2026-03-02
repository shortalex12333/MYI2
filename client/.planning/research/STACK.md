# Technology Stack

**Project:** MyYachtsInsurance.com - Keyword-Driven GEO Content System
**Researched:** 2026-03-02

## Recommended Stack

### Core Framework (EXISTING - NO CHANGES)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 14 | SSR/SSG Framework | Already in use. Excellent for JSON-LD structured data and SEO. Native support for metadata and dynamic routing. |
| Supabase | Current | Database & Auth | Already in use. Don't replace - extend with new tables for keyword tracking and content metrics. |
| Ollama | Latest | Local LLM Runtime | Already in use with Qwen 3-32B and Mistral 8B. Perfect for cost-effective content generation at scale. |

### GEO Monitoring & Citation Tracking
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Otterly.AI | API | AI Citation Tracking | $25/month entry tier. Tracks brand mentions across 6 AI engines (ChatGPT, Perplexity, Gemini, Claude, Google AI Overviews, Meta AI). Automated weekly reporting. Best value for small teams. MEDIUM confidence - affordable pricing verified across multiple sources. |
| Microsoft Clarity | Free | AI Citation Analytics | Free Microsoft tool. Integrates with Bing Webmaster Tools. Shows AI-referred traffic and citation patterns. Essential baseline before paid tools. HIGH confidence - official Microsoft product. |

**Alternative (DO NOT USE):** Geoptie ($49/mo), Peec AI (€89-499/mo), Writesonic GEO ($99+/mo) - Overpriced for 2-week timeline. Wait until proven value before upgrading.

### Keyword Tracking API
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| DataForSEO | API v3 | Keyword Position Tracking | $0.60 per 1,000 searches (Standard queue, ~5 min delay). For 200 keywords checked daily = $3.60/month. Unbeatable cost. HIGH confidence - pricing verified across multiple sources. |
| Keyword.com API | Latest | Unlimited Rank Tracker | $46/month for 5,000 keywords with unlimited API pulls. Overkill for 200 keywords but good if expanding. Daily tracking included. MEDIUM confidence - single source pricing. |

**DO NOT USE:** SerpAPI ($15/1K requests = 10x more expensive than DataForSEO). Only justified if you need non-Google search engines.

### Structured Data & JSON-LD
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| next-seo | 7.x | JSON-LD Components | Mature library with built-in FAQJsonLd, ArticleJsonLd, BreadcrumbJsonLd. v7 is TypeScript-first with improved AI-friendly patterns. HIGH confidence - 5.7M+ npm downloads/week, official Next.js community recommendation. |
| schema-dts | Latest | TypeScript Definitions | Type-safe Schema.org definitions. Prevents malformed JSON-LD. Use with next-seo for bulletproof structured data. HIGH confidence - official Schema.org TypeScript bindings. |

**Native Alternative:** Next.js App Router built-in JSON-LD via `<script>` tags. Use this if avoiding dependencies. Manually type your schema objects.

### Content Quality & Readability
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Readable.com API | Latest | Readability Scoring | Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog. API-first design integrates directly into content pipeline. Target: Grade 8-10 for insurance content. MEDIUM confidence - multiple sources confirm API availability. |
| Hemingway Editor | CLI | Style Validation | $19.99 one-time (desktop app). No subscription. Checks passive voice, complex sentences, adverbs. Run before publishing. HIGH confidence - well-established tool. |

**DO NOT USE:** Grammarly Business ($30/user/month) - unnecessary expense. Readable.com + Hemingway covers all needs for $20 one-time.

### Local LLM Content Generation (EXISTING)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Qwen 2.5 32B | via Ollama | Primary Content Writer | Already deployed. Alibaba's model with 18T token training. Supports 128K context, 29 languages. Excellent for factual insurance content. HIGH confidence - official Ollama library model. |
| Mistral 7B v0.3 | via Ollama | Secondary/Creative | Already deployed. Lighter weight for quick iterations. Good for meta descriptions, titles, FAQ generation. HIGH confidence - official Mistral AI release. |

**Prompt Engineering Pattern:**
```
Role: Insurance content specialist with E-E-A-T credentials
Task: Write [content type] about [keyword]
Requirements:
- Reading level: Grade 9 (Flesch-Kincaid)
- Include personal experience signals (first-hand examples)
- Cite authoritative sources (NAIC, state regulators)
- Schema: FAQ format with 5-8 questions
- Word count: 1,500-2,000
- Avoid: Jargon, manipulation tactics, keyword stuffing
```

### E-E-A-T Verification (NEW - CRITICAL)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Manual Checklist | N/A | Authority Signals | 96% of AI Overview citations come from verified authoritative sources. Content with visible author credentials gets 40% more AI citations. Build author bios, credential pages, industry citations. HIGH confidence - multiple academic studies confirm. |

**E-E-A-T Requirements Before Publishing:**
- [ ] Author bio with insurance license numbers
- [ ] External citations to NAIC, state regulators, IRS publications
- [ ] First-hand experience examples (not generic)
- [ ] Updated in last 30 days (76.4% of ChatGPT citations are fresh content)
- [ ] Schema.org Author + Organization markup

### SEO & Keyword Research (NEW)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| KeySearch | Starter Plan | Budget Keyword Research | $24/month. 200 keyword searches/day. Perfect for insurance niche exploration. Competitor analysis included. MEDIUM confidence - pricing verified across sources. |
| Ahrefs | Lite Plan | Advanced Competitor Analysis | $129/month. Use ONLY after KeySearch validates approach. Track backlinks, content gaps, citation sources. HIGH confidence - industry standard tool. |

**DO NOT USE:** SEMrush ($119.95/mo) - overlaps with Ahrefs. Pick one, not both. Ahrefs preferred for backlink analysis (insurance competitors heavily link-driven).

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| GEO Monitoring | Otterly.AI ($25/mo) | Geoptie ($49/mo) | 2x cost, same 6-engine coverage. Not justified for 2-week MVP. |
| Keyword API | DataForSEO ($0.60/1K) | SerpAPI ($15/1K) | 25x more expensive. Only justified for multi-search-engine tracking (Bing, Yahoo, Yandex). |
| JSON-LD Library | next-seo | Manual Next.js scripts | Reinventing wheel. next-seo battle-tested with 5.7M downloads/week. |
| Readability | Readable.com + Hemingway | Grammarly Business | Grammarly = $360/year. Readable+Hemingway = $20 one-time + API fees. No contest. |
| Content Generation | Ollama (Qwen, Mistral) | OpenAI API (GPT-4) | GPT-4 = $0.03/1K tokens. For 200 articles at 2K words each = $12 per article = $2,400 total. Ollama = $0 after hardware. |
| Citation Tracking | Microsoft Clarity (free) | SE Visible ($299/mo) | Start free. Upgrade only after proving citation volume justifies spend. |

## Installation

```bash
# GEO Monitoring
# Otterly.AI - Sign up at otterly.ai, obtain API key
# Microsoft Clarity - Install via https://clarity.microsoft.com

# Keyword Tracking
npm install axios # For DataForSEO API calls

# Structured Data
npm install next-seo schema-dts

# Readability
npm install readable-api # If API available
# Hemingway Editor - Download from hemingwayapp.com

# Content Quality
npm install natural compromise readability-scores # For local readability scoring

# Development
npm install -D @types/node
```

## Schema.org Implementation Pattern

**Priority Schema Types for Insurance Content:**

1. **FAQPage** - Highest AI citation probability. Use for all keyword-targeted articles.
2. **Article** - Second priority. Include author, datePublished, dateModified.
3. **Organization** - Site-wide. Include insurance licenses, contact info, address.
4. **BreadcrumbList** - Navigation clarity for AI crawlers.

**Example with next-seo:**
```typescript
import { FAQPageJsonLd, ArticleJsonLd } from 'next-seo';

export default function YachtInsurancePage() {
  return (
    <>
      <FAQPageJsonLd
        mainEntity={[
          {
            questionName: 'What does yacht insurance cover?',
            acceptedAnswerText: 'Yacht insurance covers...',
          },
          // 5-8 FAQs per page
        ]}
      />
      <ArticleJsonLd
        type="Article"
        url="https://myyachtsinsurance.com/coverage"
        title="Yacht Insurance Coverage Guide 2026"
        images={['https://...']}
        datePublished="2026-03-02"
        dateModified="2026-03-02"
        authorName="[Licensed Insurance Agent Name]"
        description="Comprehensive guide to yacht insurance coverage..."
      />
      {/* Content */}
    </>
  );
}
```

## White-Hat GEO Enforcement Rules

**NEVER IMPLEMENT (Black Hat Tactics):**
- Mass AI-generated content without human review
- Hidden prompt injection in comments/metadata
- Fake E-E-A-T signals (synthetic authors, fake reviews)
- Keyword stuffing or manipulation tactics
- Content cloaking (showing different content to bots vs. users)

**ALWAYS IMPLEMENT (White Hat Tactics):**
- Human review and editing of all AI-generated content
- Real author credentials and industry experience
- Genuine first-hand examples and case studies
- Natural language optimized for readability, not algorithms
- Fresh updates every 30 days (76.4% of ChatGPT citations are recent)

**Detection Risk:** Google's SpamBrain and AI-powered detection systems identify manipulation faster in 2026. Penalties include:
- De-indexing (complete removal from search)
- Manual actions (months to recover)
- Algorithmic suppression (lost rankings)

**Philosophy:** Trust is measurable in 2026. Rankings driven by consistent signals across content quality, topical authority, credibility—not isolated tactics.

## Cost Breakdown (Monthly)

| Category | Tool | Cost |
|----------|------|------|
| **GEO Monitoring** | Otterly.AI | $25 |
| | Microsoft Clarity | $0 |
| **Keyword Tracking** | DataForSEO (200 keywords daily) | $3.60 |
| **Structured Data** | next-seo (npm package) | $0 |
| **Readability** | Hemingway Editor (one-time) | $0/mo |
| | Readable.com API | ~$10/mo (est.) |
| **Keyword Research** | KeySearch | $24 |
| **Content Generation** | Ollama (self-hosted) | $0 |
| **TOTAL** | | **$62.60/month** |

**Optional After Validation:**
- Ahrefs Lite: +$129/mo (use only after proving keyword targeting works)
- Geoptie upgrade: +$24/mo (if Otterly.AI data insufficient)
- Keyword.com: +$43/mo (if expanding beyond 200 keywords)

## Performance Targets

Based on 2026 GEO research:

| Metric | Target | Why |
|--------|--------|-----|
| Flesch Reading Ease | 60-70 (Grade 8-10) | Balance between accessibility and professional tone for insurance content |
| E-E-A-T Score | 8+/10 | 96% of AI citations come from verified authoritative sources |
| Schema Implementation | 100% of pages | Sites with structured data see 30% higher AI visibility |
| Content Freshness | Updated every 30 days | 76.4% of ChatGPT citations are fresh content |
| Citation Rate | 5-10% of keywords | Realistic target for 200 keywords = 10-20 AI citations within 2 weeks |
| Organic CTR Lift | +35% | Cited pages earn 35% more organic clicks than non-cited |

## API Integration Priority

**Week 1 (Immediate):**
1. Microsoft Clarity setup - Baseline citation tracking
2. DataForSEO API - Keyword position tracking for 200 target keywords
3. next-seo installation - JSON-LD structured data on all pages
4. Ollama prompt templates - Standardized content generation

**Week 2 (After initial data):**
1. Otterly.AI API - Track first AI citations
2. Readable.com API - Automated readability scoring
3. KeySearch - Identify top-performing keyword clusters

**Post-Launch (Validation phase):**
1. Ahrefs API - Deep competitor backlink analysis
2. Upgrade GEO monitoring if citation volume justifies

## Sources

### GEO Tools & Monitoring
- [9 Best Generative Engine Optimization Tools for 2026](https://www.bignewsnetwork.com/news/278838990/9-best-generative-engine-optimization-geo-tools-for-2026-tested-and-compared)
- [The 8 Best GEO Software in 2026 - Alex Birkett](https://www.alexbirkett.com/generative-engine-optimization-software/)
- [Top 5 GEO Tools in 2026](https://getairefs.com/blog/top-5-geo-tools/)
- [Best GEO Tools 2026 Complete Guide](https://www.usebear.ai/blog/best-geo-tools-2026)
- [Microsoft Clarity AI Citations Feature](https://clarity.microsoft.com/blog/understanding-your-influence-ai-citations/)

### Keyword Tracking APIs
- [Best Rank Tracking APIs - ScrapingBee](https://www.scrapingbee.com/blog/best-rank-tracker-apis/)
- [Keyword Research API - SE Ranking](https://seranking.com/keyword-research-api.html)
- [15 Best Keyword Tracking Tools for 2026](https://www.yotpo.com/blog/best-keyword-tracking-tools/)
- [Keyword.com Rank Tracker API](https://keyword.com/rank-tracker-api/)
- [DataForSEO Keyword Data API](https://dataforseo.com/apis/keyword-data-api)
- [DataForSEO vs SerpAPI Comparison](https://www.lobstr.io/blog/google-rank-tracking-api)

### AI Citation & Structured Data
- [GEO Metrics That Matter - Averi.ai](https://www.averi.ai/how-to/how-to-track-ai-citations-and-measure-geo-success-the-2026-metrics-guide)
- [AI Citation Tracking Tools 2026 Guide](https://siftly.ai/blog/tools-measure-citation-rates-ai-generated-content-brands-2026)
- [Google AI Overviews Ranking Factors 2026](https://wellows.com/blog/google-ai-overviews-ranking-factors/)
- [Structured Data: SEO and GEO Optimization](https://www.digidop.com/blog/structured-data-secret-weapon-seo)
- [Schema Markup for GEO SEO](https://www.getpassionfruit.com/blog/ai-friendly-schema-markup-structured-data-strategies-for-better-geo-visibility)
- [Schema Markup in 2026: SERP Visibility](https://almcorp.com/blog/schema-markup-detailed-guide-2026-serp-visibility/)
- [FAQ Schema for AI Search & GEO](https://www.frase.io/blog/faq-schema-ai-search-geo-aeo)
- [Schema Markup for AI Citations - Averi.ai](https://www.averi.ai/blog/schema-markup-for-ai-citations-the-technical-implementation-guide)

### Next.js & JSON-LD Implementation
- [next-seo GitHub Repository](https://github.com/garmeeh/next-seo)
- [Next.js Official JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
- [Implementing JSON-LD in Next.js - Wisp CMS](https://www.wisp.blog/blog/implementing-json-ld-in-nextjs-for-seo)
- [Structured Data in Next.js 14](https://craig.madethis.co.uk/2024/structured-data-next-14)

### E-E-A-T & Authority
- [Google AI Overviews Ranking Factors 2026](https://wellows.com/blog/google-ai-overviews-ranking-factors/)
- [E-E-A-T and AI: Build Authority 2026](https://ailabsaudit.com/blog/en/eeat-ai-authority-citations-2026)
- [EEAT for Business: AI Search Trust Signals](https://revved.digital/eeat-ai-search-ranking-signals-2026/)
- [E-E-A-T in 2026: Trust and Authority Evaluation](https://www.blissdrive.com/blog-ai-visibility/eeat-how-google-and-ai-platforms-evaluate-trust-and-authority/)
- [E-E-A-T for AI: +40% Citations with Credentials](https://www.qwairy.co/blog/eeat-for-ai-authority-signals-guide)

### White-Hat GEO & Avoiding Penalties
- [White Hat vs Black Hat SEO in 2026](https://www.vazoola.com/resources/black-hat-vs-white-hat-seo-whats-the-difference)
- [AI-Driven Search Black Hat GEO Tactics](https://digimatiq.com/ai-driven-search-has-enabled-large-scale-geo-black-hat-tactics-why-best-practices-still-win/)
- [Black hat GEO is Real - Search Engine Land](https://searchengineland.com/black-hat-geo-pay-attention-463684)
- [Top 7 Black Hat SEO Practices to Avoid](https://www.creaitor.ai/blog/top-7-black-hat-seo-practices)

### Content Quality & Readability
- [Readability Score in AI Content](https://wellows.com/blog/readability-score-in-ai-content/)
- [AI Content Quality Control Guide 2026](https://koanthic.com/en/ai-content-quality-control-complete-guide-for-2026-2/)
- [10 Best Readability Tools](https://www.yomu.ai/blog/10-best-readability-tools-to-improve-content)
- [AI Readability Optimization](https://www.gravitatedesign.com/blog/ai-readability-optimization/)

### Local LLM & Ollama
- [Ollama Models 2026: Llama, Qwen, Mistral](https://localaimaster.com/blog/free-local-ai-models)
- [Ollama Library - Qwen 2.5](https://ollama.com/library/qwen2.5)
- [Top 10 Open Source LLMs 2026](https://o-mega.ai/articles/top-10-open-source-llms-the-deepseek-revolution-2026)
- [Small Language Models 2026 Guide](https://localaimaster.com/blog/small-language-models-guide-2026)

### Insurance SEO Niche
- [Top 15 Insurance SEO Services 2026](https://www.helloroketto.com/articles/insurance-seo-services)
- [SEO for Insurance Brokers 2026](https://seoprofy.com/blog/seo-for-insurance-brokers/)
- [Best Keyword Research Tools 2026](https://topicalmap.ai/blog/auto/best-keyword-research-tools-2026)
