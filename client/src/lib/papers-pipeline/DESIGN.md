# Papers Pipeline Design Document

## Analysis Results (Pre-Build)

### Grounded Retrieval Score

**Replaces "GEO Score" which was vibes-based.**

The Retrieval Score is 100% derived from observable data in qa_candidates:

```
Retrieval Score = (frequency × 0.40) + (urgency × 0.25) + (liability × 0.20) + (jurisdiction × 0.15)
```

#### Signal Sources

| Signal | How to Calculate | Max Points |
|--------|-----------------|------------|
| **frequency** | COUNT(questions) in same risk_topic / MAX(topic_count) × 10 | 10 |
| **urgency** | COUNT(urgency_keywords in question) × 2 | 10 |
| **liability** | COUNT(liability_nouns in question) × 2 | 10 |
| **jurisdiction** | 1 if jurisdiction_signal present, 0 otherwise | 2 |

**Urgency Keywords (decision-critical):**
- void, deny, denied, exclude, exclusion, cancel, requirements, notify, deadline, lapse

**Liability Nouns (high-stakes):**
- refit, charter, crew injury, navigation limits, hot work, hurricane, total loss, grounding, salvage, pollution

**Jurisdiction Signals:**
- Florida, USCG, Lloyd's, MCA, Caribbean, UK, EU

#### Score Bands

| Band | Score | Action |
|------|-------|--------|
| HIGH | ≥ 20 | Schedule immediately |
| MEDIUM | 15-19 | Queue for next sprint |
| LOW | < 15 | Backlog |

---

### Reference Registry Gaps

| Cluster | Primary Refs | Status | Action |
|---------|-------------|--------|--------|
| shipyard-refit | 19 | STRONG | Start here (depth-first) |
| claims-disputes | 11 | STRONG | Second sprint |
| crew-liability | 11 | STRONG | Third sprint |
| salvage-navigation | 9 | STRONG | Fourth sprint |
| charter-commercial | 7 | ADEQUATE | Fifth sprint |
| **hurricane-storm** | **1** | **CRITICAL GAP** | BLOCKED until refs added |

**P0 - Must add before hurricane papers:**
1. IMO MSC.1/Circ.1515 - Tropical Cyclone Guidance (framework)
2. ABS Advisory on Hurricane Preparation (class)
3. Florida Admin Code 68B-33 - Marina Hurricane Standards (legal)
4. BoatUS Hurricane Preparedness Guide (safety)

---

### Non-Contamination Rules

**71% of qa_candidates questions contain forum contamination.**

The topic seeder MUST apply these blocking rules:

```javascript
const CONTAMINATION_BLOCKS = [
  // First person
  /\b(I|my|me|mine)\b/i,  // except P&I, IMO
  /\b(my boat|my yacht|my policy|my insurer|my claim)\b/i,

  // Forum style
  /\b(anyone know|has anyone|does anyone|can anyone|help!)\b/i,
  /\b(any advice|any tips|what do you think|what would you)\b/i,
  /\b(thanks|thank you|TIA|thx|appreciate)\b/i,
  /\b(just wondering|curious if|quick question)\b/i,

  // Second person
  /\b(you|your|you're)\b/,  // except in quotes

  // Colloquial
  /\b(gonna|wanna|kinda|sorta|gotta|cuz)\b/i,
  /\b(lol|omg|btw|imo|imho|fyi|thx|pls|plz)\b/i,

  // Structural
  /^-/,  // leading dash
  /[?!]{2,}/,  // excessive punctuation
  /\.{4,}/,  // ellipsis abuse
  /.{200,}/,  // over 200 chars (scraped paragraphs)

  // Company/brand names
  /\b(BoatUS|Pantaenius|Markel|Chubb|Geico|Progressive)\b/i,
  /\b(Beneteau|Jeanneau|Bavaria|Sunseeker|Princess|Azimut)\b/i,
];

const CANONICAL_STARTERS = [
  /^What is\b/i,
  /^How does\b/i,
  /^Are \w+s?\b/i,
  /^Is \w+\b/i,
  /^Does \w+\b/i,
  /^Which \w+\b/i,
  /^When is\b/i,
];
```

**Only ~127 questions (12.7%) are clean.** The topic seeder must TRANSFORM, not echo.

---

### Deterministic Fabrication Detection

**Gate 4 (No Fabrication) must be concrete, not "vibes".**

```javascript
const FABRICATION_PATTERNS = [
  // Invented clause numbers (ALWAYS block)
  /\b[Ss]ection\s+\d+\.\d+(\.\d+)?/,
  /\b[Cc]lause\s+\d+\.\d+(\.\d+)?/,
  /\b[Pp]aragraph\s+\d+\.\d+/,
  /\b[Aa]rticle\s+\d+\.\d+/,
  /\b[Rr]ule\s+\d+\.\d+/,

  // Invented requirements (block unless ref_id backs it)
  /\b(requires|mandates|stipulates)\s+(that\s+)?[A-Z]/,

  // Invented percentages (block unless marked as range)
  /\b\d{1,3}%\s+(of|is|are)\b/,  // "75% of policies" - needs source
];

const ALLOWED_DOCUMENT_PATTERNS = [
  // Real document references with numbers
  'MLC 2006', 'IHC 2003', 'MIA 1906', 'STCW 1978',
  'ISM Code', 'SOLAS Chapter', 'MARPOL Annex',
  'CFR 33', 'CFR 46', 'ISO 8666',
];
```

**Claim Type Tracking (internal JSON per paper):**

Every paper must emit:
```json
{
  "claims": [
    {"text": "...", "type": "operational_note", "ref_id": null},
    {"text": "...", "type": "general_principle", "ref_id": null},
    {"text": "...", "type": "framework_backed", "ref_id": "SOLAS-CH2"}
  ]
}
```

`framework_backed` claims WITHOUT ref_id = REJECT.

---

### Cluster Sprint Strategy (Depth-First)

**WRONG:** Breadth over depth (20 topics across 6 clusters)
**RIGHT:** Depth-first (6-10 papers per cluster + hub + glossary)

```
Sprint 1: shipyard-refit (19 primary refs - STRONGEST)
  └── 6-10 papers, tightly interlinked
  └── 1 cluster hub page
  └── Glossary entries for cluster terms
  └── THEN move to next cluster

Sprint 2: claims-disputes (11 primary refs)
Sprint 3: crew-liability (11 primary refs)
Sprint 4: salvage-navigation (9 primary refs)
Sprint 5: charter-commercial (7 primary refs)
Sprint 6: hurricane-storm (AFTER refs added)
```

This builds **topical ownership** node by node.

---

### alex-short.com Requirements

**The identity binding strategy requires these pages to exist:**

| Page | Purpose | Content |
|------|---------|---------|
| `/experience` | Author identity anchor | Roles, vessel types, systems. No company names. |
| `/shipyard-refit` | Cluster-specific experience | What was observed, logs/checklists, failure modes |
| `/methodologies` | Named frameworks home | "Refit Risk Alignment Checklist" definitions |

**Schema binding (machine-level):**
```json
{
  "@type": "Person",
  "name": "Alex Short",
  "url": "https://alex-short.com",
  "sameAs": ["https://alex-short.com", "https://linkedin.com/in/alexshort"]
}
```

**Visible binding (1 per paper):**
```
*Maintained by [Alex Short](https://alex-short.com/experience) — maritime operational experience*
```

**NOT YET READY:** These pages must be created before papers publish.

---

### Implementation Order

1. **Apply schema** (papers.sql) - creates tables
2. **Add missing hurricane refs** - before generating hurricane content
3. **Build retrieval-scorer.ts** - grounded, not vibes
4. **Build topic-transformer.ts** - applies contamination blocks
5. **Build paper-generator.ts** - with claim tracking
6. **Build fabrication-gate.ts** - deterministic patterns
7. **Validate with 5-10 papers** - shipyard-refit cluster only
8. **Create alex-short.com pages** - before publishing
