/**
 * Paper Generator
 *
 * Generates full Intelligence Briefs using Qwen3-32B.
 * Follows INTELLIGENCE_BRIEF_STRUCTURE_v2.1 exactly.
 * References are injected AFTER generation — model never outputs URLs.
 *
 * Usage:
 *   npx ts-node cli.ts generate [--topic-id=uuid] [--cluster=shipyard-refit]
 */

import { db } from './db';
import { injectReferences as injectRefsFromBody } from './reference-injector';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const MODEL      = 'qwen3:32b';

// ─── AVAILABLE REFERENCE TYPE ────────────────────────────────
interface AvailableRef {
  ref_id: string;
  short_title: string;
}

// ─── FETCH AVAILABLE REFS FOR CLUSTER ────────────────────────
async function fetchAvailableRefs(clusterId: string): Promise<AvailableRef[]> {
  const { data } = await db
    .from('reference_registry')
    .select('ref_id, short_title')
    .contains('cluster_tags', [clusterId])
    .not('url', 'is', null)
    .not('short_title', 'is', null)
    .limit(15);
  return data || [];
}

// ─── SYSTEM PROMPT ───────────────────────────────────────────
const SYSTEM_PROMPT = `You are a marine insurance intelligence writer producing content for a professional reference library.

Your writing must:
- Read like technical documentation, not editorial or marketing
- Be structurally exact: every section must appear in the correct order
- Contain only verifiable operational facts
- Never invent clause numbers, section references, or document titles
- Never use filler phrases: "it is important to note", "in today's complex maritime landscape", "as a general rule"
- Never use rhetorical questions
- Never use emotional framing

CITATION RULES (CRITICAL):
- When referencing regulations, standards, or frameworks, cite using [ref_id] format inline
- You will be given a list of available references with their ref_ids
- ONLY cite from the provided reference list — do not invent or hallucinate reference IDs
- If you want to mention a framework not in the list, mention it by name WITHOUT a citation bracket
- Example correct usage: "Under the Marine Insurance Act 1906 [MIA-1906], the insurer..."
- Example incorrect: "According to [FAKE-REF], vessels must..." — NEVER invent ref_ids

Tone: technical memo. Declarative sentences. No hedging.`;

// ─── GENERATION PROMPT ───────────────────────────────────────
function buildGenerationPrompt(
  topic: {
    canonical_title: string;
    primary_query: string;
    secondary_queries?: string[];
    risk_topic?: string;
    jurisdiction: string;
    persona: string;
    cluster_id: string;
    topic_angle?: string;
  },
  availableRefs: AvailableRef[] = []
): string {
  // Build citation instruction block if refs available
  let citationBlock = '';
  if (availableRefs.length > 0) {
    const refList = availableRefs
      .map(r => `- [${r.ref_id}]: ${r.short_title}`)
      .join('\n');
    citationBlock = `
CITATION INSTRUCTIONS:
When referencing regulations, standards, or frameworks, cite using [ref_id] format inline.
Available references for this topic:
${refList}

Example usage: "Under the Marine Insurance Act 1906 [MIA-1906], the insurer..."
CRITICAL: Only cite from this list. Do not invent or hallucinate reference IDs.
If a framework is not in this list, mention it by name without citation brackets.

`;
  }

  return `Generate a full Intelligence Brief following this EXACT structure. Do not add or remove sections.
${citationBlock}

ARTICLE METADATA:
Title: ${topic.canonical_title}
Primary Query: ${topic.primary_query}
Cluster: ${topic.cluster_id}
Persona: ${topic.persona}
Jurisdiction: ${topic.jurisdiction}

CRITICAL WORD COUNT REQUIREMENT:
You MUST write between 1,200 and 1,600 words. This is non-negotiable.
- TL;DR: ~100-120 words
- Trigger Conditions table: ~150 words (4+ rows with detail)
- Underwriter's Checklist: ~100 words (6+ items with context)
- Common Wording Traps: ~200 words (4+ detailed entries)
- Operational Reality: ~250 words (detailed operational friction)
- Related Risks: ~50 words
- Questions to Clarify: ~80 words (5+ questions)
- Additional context throughout: ~300 words
TOTAL: ~1,200-1,400 words minimum

OUTPUT REQUIREMENTS:
- Minimum 3 named real-world entities (ABYC, ISO 12215, Lloyd's, IMO, USCG, MCA, etc.)
- Minimum 2 numerical anchors (percentages, dollar thresholds, distances, timeframes)
- No invented clause numbers (e.g. "Section 3.1", "Clause 12") — FATAL ERROR
- No fabricated verbatim quotes from documents
- No first-person pronouns
- No marketing language or filler phrases

REQUIRED STRUCTURE (output exactly in this order):

## ${topic.canonical_title}

**TL;DR**

[100-120 words. 4-5 declarative sentences. Directly answers the primary query. Name at least 2 real frameworks/organizations. Include 1 specific numerical threshold or timeframe.]

---

## Trigger Conditions

| Condition | Escalation Mechanism | Liability Shift |
|---|---|---|
| [Specific operational condition] | [How it escalates to claim/dispute] | [Who bears liability and why] |
| [Second condition with detail] | [Escalation path] | [Liability consequence] |
| [Third condition] | [Escalation mechanism] | [Liability shift] |
| [Fourth condition] | [Escalation] | [Liability] |

[Write 4-6 detailed rows. Each cell should have 10-20 words of specific content.]

---

## Underwriter's Checklist

- [Document type]: [Why it matters and what underwriters verify]
- [Second item]: [Specific verification requirement]
- [Third item]: [What triggers review]
- [Fourth item]: [Compliance requirement]
- [Fifth item]: [Documentation standard]
- [Sixth item]: [Certification or endorsement needed]

[6-8 items. Each item should be 15-25 words with specific operational detail.]

---

## Common Wording Traps

| Clause Type | Failure Trigger | Practical Scenario | Coverage Consequence |
|---|---|---|---|
| [Policy clause name] | [What causes it to fail] | [Real-world example] | [Coverage outcome] |
| [Second clause] | [Trigger condition] | [Scenario] | [Consequence] |
| [Third clause] | [Trigger] | [Scenario] | [Consequence] |
| [Fourth clause] | [Trigger] | [Scenario] | [Consequence] |

[4-6 detailed entries. Each cell should have 10-20 words.]

---

## Operational Reality

[Write 200-250 words here. Describe ONE specific operational friction point in detail. Include:
- Specific procedures or certifications involved
- Timeline requirements (days, weeks, months)
- Cost implications with dollar figures where applicable
- Which parties are involved (surveyor, underwriter, broker, owner)
- What documentation is required
- Common mistakes and their consequences
Be specific and mechanical. No storytelling or emotional framing.]

---

## Related Risks

- [Technical risk topic] → [related coverage area]
- [Second related risk] → [coverage implication]
- [Third related risk] → [coverage area]

---

## Questions to Clarify With Your Broker

- [Specific question about policy terms]?
- [Question about coverage limits or exclusions]?
- [Question about documentation requirements]?
- [Question about claims process]?
- [Question about endorsements or riders]?

[5-7 specific, actionable questions. No rhetorical questions.]

---

## Disclosure

This content is provided for informational purposes only and does not constitute insurance advice. Coverage terms vary by policy, jurisdiction, and underwriter. Consult a licensed marine insurance broker for guidance specific to your vessel and operations.

---
END OF BRIEF

REMINDER: Your output MUST be at least 1,200 words. Count your sections as you write. /no_think`;
}

// ─── CALL QWEN3-32B ──────────────────────────────────────────
async function callQwen(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      stream: false,
      options: {
        temperature: 0.15,    // deterministic structure
        top_p: 0.9,
        num_predict: 6000,    // increased further for 1200-1600 word target
        repeat_penalty: 1.05, // reduced to allow longer output
      },
    }),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
  const data = await response.json();
  return data.message?.content ?? '';
}

// ─── AUTHOR BLOCK ────────────────────────────────────────────
// Tier 2 identity binding — one visible reference per paper.

function buildAuthorBlock(authorUrl: string): string {
  return `*Maintained by [Alex Short](${authorUrl}) — maritime operational experience*`;
}

// ─── SCHEMA JSON ─────────────────────────────────────────────
function buildSchemaJson(paper: {
  title: string;
  slug: string;
  tldr: string;
  published_at: string;
  last_updated: string;
}): object {
  return {
    '@context':    'https://schema.org',
    '@type':       'Article',
    headline:      paper.title,
    url:           `https://myyachtsinsurance.com/briefs/${paper.slug}`,
    datePublished: paper.published_at,
    dateModified:  paper.last_updated,
    author: {
      '@type':  'Person',
      name:     'Alex Short',
      url:      'https://alex-short.com',
      sameAs:   [
        'https://alex-short.com',
        'https://www.linkedin.com/in/alexshort',
      ],
    },
    publisher: {
      '@type': 'Organization',
      name:    'MYI — Marine Insurance Intelligence',
      url:     'https://myyachtsinsurance.com',
    },
    description: paper.tldr,
    articleSection: 'Marine Insurance Intelligence',
  };
}

// ─── SLUG GENERATOR ──────────────────────────────────────────
function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ─── EXTRACT TL;DR ───────────────────────────────────────────
function extractTldr(body: string): string {
  const match = body.match(/\*\*TL;DR\*\*\s*([\s\S]*?)(?:\n---|\n##)/);
  return match?.[1]?.trim().slice(0, 500) ?? '';
}

// ─── WORD COUNT ──────────────────────────────────────────────
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// ─── MAIN GENERATOR ──────────────────────────────────────────

export interface GeneratedPaper {
  paperId: string;
  title: string;
  slug: string;
  wordCount: number;
  refCount: number;
  status: 'saved' | 'failed';
  error?: string;
}

export async function generatePaper(topicId: string): Promise<GeneratedPaper> {
  // Fetch topic
  const { data: topic, error: topicError } = await db
    .from('paper_topics')
    .select('*')
    .eq('id', topicId)
    .single();

  if (topicError || !topic) {
    throw new Error(`Topic not found: ${topicError?.message}`);
  }

  // Fetch available refs for this cluster (ID-based citation - Fix B)
  const availableRefs = await fetchAvailableRefs(topic.cluster_id);

  // Generate content with available refs for inline citation
  const userPrompt = buildGenerationPrompt(topic, availableRefs);
  let body: string;
  try {
    body = await callQwen(SYSTEM_PROMPT, userPrompt);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Generation failed: ${msg}`);
  }

  // Inject references from body signals (deterministic)
  const injectionResult = await injectRefsFromBody(body);
  body = injectionResult.injected_body;

  // Add author block (under H1, above TL;DR)
  const authorBlock = buildAuthorBlock('https://alex-short.com/experience');
  body = body.replace(
    /^(## .+)\n\n\*\*TL;DR\*\*/m,
    `$1\n\n${authorBlock}\n\n**TL;DR**`
  );

  // Extract metadata
  const tldr      = extractTldr(body);
  const wordCount = countWords(body);
  const slug      = toSlug(topic.canonical_title);
  const now       = new Date().toISOString();

  // Build schema
  const schemaJson = buildSchemaJson({
    title:        topic.canonical_title,
    slug,
    tldr,
    published_at: now,
    last_updated: now,
  });

  // Save to DB
  const { data: saved, error: saveError } = await db
    .from('papers')
    .insert({
      topic_id:        topic.id,
      cluster_id:      topic.cluster_id,
      title:           topic.canonical_title,
      slug,
      body_markdown:   body,
      word_count:      wordCount,
      tldr,
      primary_query:   topic.primary_query,
      secondary_queries: topic.secondary_queries,
      author_name:     'Alex Short',
      author_url:      'https://alex-short.com/experience',
      author_context:  'Former yacht ETO — maritime operational experience',
      schema_json:     schemaJson,
      review_status:   'draft',
      last_updated:    now,
    })
    .select('id')
    .single();

  if (saveError || !saved) {
    throw new Error(`DB save failed: ${saveError?.message}`);
  }

  // Save citation map from injection result
  if (injectionResult.refs.length > 0) {
    const citationRows = injectionResult.refs.map((r, i) => ({
      paper_id:  saved.id,
      ref_id:    r.ref_id,
      position:  i + 1,
      relevance_note: `Matched via signals: ${injectionResult.signals.frameworks.join(', ') || injectionResult.signals.tags.join(', ')}`,
    }));
    await db.from('paper_citation_map').insert(citationRows);
  }

  // Mark topic as assigned
  await db
    .from('paper_topics')
    .update({ status: 'assigned', assigned_at: now })
    .eq('id', topicId);

  return {
    paperId:   saved.id,
    title:     topic.canonical_title,
    slug,
    wordCount,
    refCount:  injectionResult.refs_matched,
    status:    'saved',
  };
}
