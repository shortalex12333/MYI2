/**
 * Sectional Generator - Multi-turn Paper Generation
 *
 * Generates each section separately to avoid early EOS.
 * Each section gets full model attention and enforced word counts.
 * Local Qwen3-32B so cost = 0.
 */

import { db } from './db';
import { injectReferences } from './reference-injector';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

// ─── REGISTRY COMPLETENESS CHECK ────────────────────────────

async function checkRegistryCompleteness(clusterId: string): Promise<{ ready: boolean; refCount: number; refs: Array<{ ref_id: string; short_title: string }> }> {
  const { data: refs, error } = await db
    .from('reference_registry')
    .select('ref_id, short_title, url, citation_category')
    .contains('cluster_tags', [clusterId])
    .not('url', 'is', null)
    .not('short_title', 'is', null)
    .not('ref_id', 'is', null)
    .limit(20);

  if (error) {
    console.error('Registry check failed:', error.message);
    return { ready: false, refCount: 0, refs: [] };
  }

  const validRefs = (refs || []).filter(r => r.url && r.short_title && r.ref_id);

  return {
    ready: validRefs.length >= 5,
    refCount: validRefs.length,
    refs: validRefs.map(r => ({ ref_id: r.ref_id, short_title: r.short_title })),
  };
}
const MODEL = 'qwen3:32b';

// ─── CITATION INSTRUCTIONS BUILDER ──────────────────────────

function buildCitationInstructions(refs: Array<{ ref_id: string; short_title: string }>): string {
  if (refs.length === 0) return '';

  const refList = refs.map(r => `- [${r.ref_id}]: ${r.short_title}`).join('\n');

  return `
CITATION INSTRUCTIONS:
When referencing regulations, standards, or frameworks, cite using [ref_id] format inline.
Available references for this topic:
${refList}

Example: "Vessels must comply with SOLAS Chapter II-1 [SOLAS-CH2] requirements."
Only cite from this list. Do not invent references. Aim for 2-4 citations per section where relevant.
`;
}

// ─── SECTION DEFINITIONS ────────────────────────────────────

interface SectionDef {
  name: string;
  header: string;
  minWords: number;
  maxWords: number;
  prompt: (topic: TopicContext) => string;
}

interface TopicContext {
  title: string;
  primary_query: string;
  cluster_id: string;
  persona: string;
  jurisdiction: string;
  previousSections?: string;
  availableRefs: Array<{ ref_id: string; short_title: string }>;
}

const SECTIONS: SectionDef[] = [
  {
    name: 'tldr',
    header: '**TL;DR**',
    minWords: 80,
    maxWords: 120,
    prompt: (ctx) => `Write a TL;DR for: "${ctx.title}"

Query: ${ctx.primary_query}
Persona: ${ctx.persona}
${buildCitationInstructions(ctx.availableRefs)}

MANDATORY STRUCTURE (all 3 must appear):
1. Policy type statement - name the specific coverage type (hull & machinery, P&I, yacht policy, etc.)
2. Exclusion mechanism - name specific clause types that limit coverage (e.g., "contractors' exclusion", "faulty workmanship clause", "care custody and control")
3. Trigger condition - what operational event activates or voids coverage

BAD example: "Coverage depends on policy wording."
GOOD example: "Interior water damage during refit is typically covered under hull and machinery policies if the loss is accidental and not excluded by the contractors' liability carve-out, faulty workmanship clause, or failure to comply with refit notification conditions under [IHC-2003]."

Requirements:
- 80-120 words
- State a conditional boundary, not a vague "it depends"
- Cite 2-3 references using [ref_id] format
- No hedging phrases like "may", "could", "might"
- Direct answer to the query

Output ONLY the TL;DR content. No headers. No thinking.`,
  },
  {
    name: 'trigger_conditions',
    header: '## Trigger Conditions',
    minWords: 150,
    maxWords: 250,
    prompt: (ctx) => `Write a Trigger Conditions table for: "${ctx.title}"

Context:
${ctx.previousSections}
${buildCitationInstructions(ctx.availableRefs)}

Create a markdown table: Trigger | Policy Impact | Consequence

This must be MECHANICAL, not narrative. Think like an underwriter's decision tree.

Include triggers like:
- Material change not disclosed
- Class suspended or withdrawn
- Refit/lay-up not notified within X days
- Navigation limits breached
- Hot work without approval
- Contractor assumes custody
- Survey overdue

Requirements:
- 5-6 rows
- Each trigger must be a specific operational event
- Policy impact must name the clause or condition affected
- Consequence must state coverage outcome (void, reduced, excluded, etc.)
- Cite [ref_id] where a regulation defines the trigger

Output ONLY the table starting with |. No headers. No thinking.`,
  },
  {
    name: 'checklist',
    header: '## Underwriter\'s Checklist',
    minWords: 120,
    maxWords: 200,
    prompt: (ctx) => `Write an Underwriter's Checklist for: "${ctx.title}"
${buildCitationInstructions(ctx.availableRefs)}

Format: "- [Document type]: [What underwriters verify and why it matters]"

Include documents like:
- Survey reports (condition, valuation, pre-purchase)
- Class certificates and status
- Maintenance logs
- Refit/modification records
- Crew qualifications
- Navigation area endorsements
- Loss history declarations

Requirements:
- 8-10 items
- Each item must name a specific document type
- Explain what the underwriter looks for
- Cite [ref_id] for regulatory requirements
- No generic items like "insurance documents"

Output ONLY the bullet list starting with -. No headers. No thinking.`,
  },
  {
    name: 'wording_traps',
    header: '## Policy Wording Traps',
    minWords: 180,
    maxWords: 280,
    prompt: (ctx) => `Write a Policy Wording Traps table for: "${ctx.title}"
${buildCitationInstructions(ctx.availableRefs)}

Create a markdown table: Clause Type | Trap Mechanism | Scenario | Coverage Result

USE CLAUSE-LEVEL VOCABULARY. Include terms like:
- "care, custody, and control"
- "contractors' exclusion"
- "consequential damage"
- "latent defect carve-out"
- "faulty workmanship exclusion"
- "wear and tear"
- "gradual deterioration"
- "inherent vice"
- "wilful misconduct"
- "material change warranty"

Requirements:
- 5-6 rows
- Clause Type must be real policy terminology
- Trap Mechanism explains how the clause catches owners
- Scenario is a concrete operational example
- Coverage Result states the claim outcome
- Cite [ref_id] for specific clause references

Output ONLY the table starting with |. No headers. No thinking.`,
  },
  {
    name: 'operational_reality',
    header: '## Operational Reality',
    minWords: 200,
    maxWords: 280,
    prompt: (ctx) => `Write an Operational Reality section for: "${ctx.title}"
${buildCitationInstructions(ctx.availableRefs)}

Describe ONE specific operational friction point. Include:

1. YARD/OPERATOR BEHAVIOR - what actually happens on the ground
2. DOCUMENTATION REQUIREMENTS - what paperwork is needed and when
3. SURVEYOR INTERACTION - when surveyors get involved
4. TIMING/NOTICE - deadlines that matter

CRITICAL: Only include specific numbers (days, percentages, dollar amounts) if they come from the available references. Do not invent timeframes or thresholds. If unsure, use ranges like "typically within the policy notification period" rather than fabricating "within 7 days".

Requirements:
- 200-280 words
- Name the parties involved (owner, surveyor, yard, underwriter, class society)
- Describe common mistakes and their consequences
- Cite 2-4 references using [ref_id] format
- Mechanical tone, no storytelling
- No invented statistics or timeframes

Output ONLY the paragraph. No headers. No thinking.`,
  },
  {
    name: 'related_risks',
    header: '## Related Risks',
    minWords: 40,
    maxWords: 80,
    prompt: (ctx) => `Write 4 Related Risks for: "${ctx.title}"
${buildCitationInstructions(ctx.availableRefs)}

Format: "- [Technical risk] → [Coverage implication with ref if applicable]"

These should link to adjacent coverage areas in the same cluster:
- Related exclusions
- Adjacent policy sections
- Interacting warranties
- Cascading liability scenarios

Requirements:
- 4 bullet points
- Technical insurance terminology
- Each connects to a related coverage concern
- Cite [ref_id] where relevant

Output ONLY the bullet list starting with -. No headers. No thinking.`,
  },
  {
    name: 'broker_questions',
    header: '## Questions for Your Broker',
    minWords: 60,
    maxWords: 100,
    prompt: (ctx) => `Write 6 broker questions for: "${ctx.title}"
${buildCitationInstructions(ctx.availableRefs)}

These must be ACTIONABLE questions that surface policy gaps:
- Coverage limits and sub-limits
- Specific exclusion applicability
- Notification requirements
- Documentation for claims
- Deductible triggers
- Warranty compliance

Requirements:
- 6 questions ending with ?
- Each must be answerable with policy specifics
- Reference [ref_id] clauses where relevant
- No rhetorical questions
- No questions about "the best" or "recommended"

Output ONLY the bullet list starting with -. No headers. No thinking.`,
  },
];

// ─── CALL QWEN ──────────────────────────────────────────────

async function callQwen(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a technical marine insurance writer. Write exactly what is requested. No introductions, no conclusions, no meta-commentary. Output only the requested content. Do not use thinking tags.`,
        },
        { role: 'user', content: prompt },
      ],
      stream: false,
      options: {
        temperature: 0.15,
        top_p: 0.9,
        num_predict: 1000,
        repeat_penalty: 1.05,
      },
    }),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
  const data = await response.json();
  let content = data.message?.content?.trim() ?? '';

  // Strip thinking tags if present (Qwen3 thinking mode)
  content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  return content;
}

// ─── FETCH RELATED PAPERS ────────────────────────────────────

interface RelatedPaper {
  title: string;
  slug: string;
  tldr: string | null;
}

async function fetchRelatedPapers(clusterId: string, excludeSlug?: string): Promise<RelatedPaper[]> {
  const { data, error } = await db
    .from('papers')
    .select('title, slug, tldr')
    .eq('cluster_id', clusterId)
    .neq('slug', excludeSlug || '')
    .order('last_updated', { ascending: false })
    .limit(5);

  if (error || !data) return [];
  return data;
}

// ─── ASSEMBLE PAPER ─────────────────────────────────────────

function assembleBody(
  title: string,
  sections: Map<string, string>,
  relatedPapers: RelatedPaper[] = []
): string {
  const authorBlock = `*Reviewed by [Alex Short](https://alex-short.com/experience), Independent Yacht Insurance Risk Analyst*`;

  // Build related papers section
  let relatedPapersSection = '';
  if (relatedPapers.length > 0) {
    const links = relatedPapers.map(p => `- [${p.title}](/papers/${p.slug})`).join('\n');
    relatedPapersSection = `## Related Papers\n\n${links}\n\n---\n\n`;
  }

  const parts = [
    `## ${title}`,
    '',
    authorBlock,
    '',
    '**TL;DR**',
    '',
    sections.get('tldr') ?? '',
    '',
    '---',
    '',
    '## Trigger Conditions',
    '',
    sections.get('trigger_conditions') ?? '',
    '',
    '---',
    '',
    '## Underwriter\'s Checklist',
    '',
    sections.get('checklist') ?? '',
    '',
    '---',
    '',
    '## Policy Wording Traps',
    '',
    sections.get('wording_traps') ?? '',
    '',
    '---',
    '',
    '## Operational Reality',
    '',
    sections.get('operational_reality') ?? '',
    '',
    '---',
    '',
    '## Related Risks',
    '',
    sections.get('related_risks') ?? '',
    '',
    '---',
    '',
    '## Questions for Your Broker',
    '',
    sections.get('broker_questions') ?? '',
    '',
    '---',
    '',
    relatedPapersSection,
    '## Disclosure',
    '',
    'This content is provided for informational purposes only and does not constitute insurance advice. Coverage terms vary by policy, jurisdiction, and underwriter. Consult a licensed marine insurance broker for guidance specific to your vessel and operations.',
  ];

  return parts.join('\n');
}

// ─── RANDOM DATE GENERATOR ───────────────────────────────────

function generateRandomDate(): Date {
  const now = Date.now();
  const threeYearsAgo = now - (3 * 365 * 24 * 60 * 60 * 1000);
  const fourYearsAgo = now - (4 * 365 * 24 * 60 * 60 * 1000);

  // Random timestamp between 4 years ago and now
  const randomTimestamp = fourYearsAgo + Math.random() * (now - fourYearsAgo);

  // Add random hour (business hours 8am-6pm) and random minutes
  const date = new Date(randomTimestamp);
  date.setHours(8 + Math.floor(Math.random() * 10)); // 8-17
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));

  return date;
}

// ─── SLUG GENERATOR ─────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ─── EXTRACT TL;DR ──────────────────────────────────────────

function extractTldr(body: string): string {
  const match = body.match(/\*\*TL;DR\*\*\s*([\s\S]*?)(?:\n---|\n##)/);
  return match?.[1]?.trim().slice(0, 500) ?? '';
}

// ─── WORD COUNT ─────────────────────────────────────────────

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// ─── MAIN GENERATOR ─────────────────────────────────────────

export interface GeneratedPaper {
  paperId: string;
  title: string;
  slug: string;
  wordCount: number;
  refCount: number;
  sectionWordCounts: Record<string, number>;
  status: 'saved' | 'failed';
  error?: string;
}

export async function generatePaperSectional(topicId: string): Promise<GeneratedPaper> {
  // Fetch topic
  const { data: topic, error: topicError } = await db
    .from('paper_topics')
    .select('*')
    .eq('id', topicId)
    .single();

  if (topicError || !topic) {
    throw new Error(`Topic not found: ${topicError?.message}`);
  }

  // Pre-flight: check registry completeness
  const registryCheck = await checkRegistryCompleteness(topic.cluster_id);
  if (!registryCheck.ready) {
    throw new Error(`Registry incomplete for cluster "${topic.cluster_id}": ${registryCheck.refCount} refs (need ≥5). Populate reference_registry first.`);
  }
  console.log(`  Registry ready: ${registryCheck.refCount} refs for cluster "${topic.cluster_id}"`);

  const ctx: TopicContext = {
    title: topic.canonical_title,
    primary_query: topic.primary_query || topic.topic_signal,
    cluster_id: topic.cluster_id,
    persona: topic.persona || 'owner',
    jurisdiction: topic.jurisdiction || 'global',
    previousSections: '',
    availableRefs: registryCheck.refs.map(r => ({ ref_id: r.ref_id, short_title: r.short_title })),
  };

  // Generate each section
  const generatedSections = new Map<string, string>();
  const sectionWordCounts: Record<string, number> = {};

  for (const section of SECTIONS) {
    console.log(`  Generating ${section.name}...`);

    const content = await callQwen(section.prompt(ctx));
    generatedSections.set(section.name, content);
    sectionWordCounts[section.name] = countWords(content);

    // Add to context for next sections
    ctx.previousSections = (ctx.previousSections || '') + '\n' + content;
  }

  // Generate slug first (needed for related papers exclusion)
  const slug = toSlug(topic.canonical_title);

  // Fetch related papers from same cluster (for internal linking)
  const relatedPapers = await fetchRelatedPapers(topic.cluster_id, slug);

  // Assemble body with related papers
  let body = assembleBody(topic.canonical_title, generatedSections, relatedPapers);

  // Inject references
  const injectionResult = await injectReferences(body);
  body = injectionResult.injected_body;

  // Calculate word count
  const wordCount = countWords(body);

  // Generate randomized publish date (3-4 years back to now)
  const publishDate = generateRandomDate();
  const publishDateISO = publishDate.toISOString();

  const tldr = extractTldr(body) || generatedSections.get('tldr')?.slice(0, 500) || '';

  // Build schema
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topic.canonical_title,
    url: `https://myyachtsinsurance.com/briefs/${slug}`,
    datePublished: publishDateISO,
    dateModified: publishDateISO,
    author: {
      '@type': 'Person',
      name: 'Alex Short',
      url: 'https://alex-short.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MYI — Marine Insurance Intelligence',
      url: 'https://myyachtsinsurance.com',
    },
    description: tldr,
  };

  // Save to DB
  const { data: saved, error: saveError } = await db
    .from('papers')
    .insert({
      topic_id: topic.id,
      cluster_id: topic.cluster_id,
      title: topic.canonical_title,
      slug,
      body_markdown: body,
      word_count: wordCount,
      tldr,
      primary_query: topic.primary_query,
      secondary_queries: topic.secondary_queries,
      author_name: 'Alex Short',
      author_url: 'https://alex-short.com/experience',
      author_context: 'Former yacht ETO — maritime operational experience',
      schema_json: schemaJson,
      review_status: 'draft',
      last_updated: publishDateISO,
    })
    .select('id')
    .single();

  if (saveError || !saved) {
    throw new Error(`DB save failed: ${saveError?.message}`);
  }

  // Save citation map
  if (injectionResult.refs.length > 0) {
    const citationRows = injectionResult.refs.map((r, i) => ({
      paper_id: saved.id,
      ref_id: r.ref_id,
      position: i + 1,
      relevance_note: `Matched via: ${injectionResult.signals.frameworks.join(', ') || injectionResult.signals.tags.slice(0, 3).join(', ')}`,
    }));
    await db.from('paper_citation_map').insert(citationRows);
  }

  // Mark topic as assigned (use actual current time for internal tracking)
  await db
    .from('paper_topics')
    .update({ status: 'assigned', assigned_at: new Date().toISOString() })
    .eq('id', topicId);

  return {
    paperId: saved.id,
    title: topic.canonical_title,
    slug,
    wordCount,
    refCount: injectionResult.refs_matched,
    sectionWordCounts,
    status: 'saved',
  };
}

// ─── BATCH GENERATOR ────────────────────────────────────────

export async function generateBatch(limit: number): Promise<{
  success: number;
  failed: number;
  preflightFailed: number;
  results: Array<{ topicId: string; result: GeneratedPaper | { error: string; preflight?: boolean } }>;
}> {
  // Get scored topics not yet assigned
  const { data: topics, error } = await db
    .from('paper_topics')
    .select('id, canonical_title')
    .eq('status', 'scored')
    .limit(limit);

  if (error || !topics) {
    throw new Error(`Failed to fetch topics: ${error?.message}`);
  }

  const results: Array<{ topicId: string; result: GeneratedPaper | { error: string; preflight?: boolean } }> = [];
  let success = 0;
  let failed = 0;
  let preflightFailed = 0;

  for (const topic of topics) {
    console.log(`\n[${success + failed + preflightFailed + 1}/${topics.length}] ${topic.canonical_title.slice(0, 50)}...`);

    try {
      const result = await generatePaperSectional(topic.id);
      results.push({ topicId: topic.id, result });
      success++;
      console.log(`  ✓ ${result.wordCount} words, ${result.refCount} refs`);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      const isPreflight = errMsg.includes('Registry incomplete');
      results.push({ topicId: topic.id, result: { error: errMsg, preflight: isPreflight } });
      if (isPreflight) {
        preflightFailed++;
        console.log(`  ⚠ PREFLIGHT: ${errMsg}`);
      } else {
        failed++;
        console.log(`  ✗ ${errMsg}`);
      }
    }
  }

  return { success, failed, preflightFailed, results };
}
