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
    prompt: (ctx) => `Write a TL;DR section for an intelligence brief about: "${ctx.title}"

Primary query: ${ctx.primary_query}
Target persona: ${ctx.persona}
${buildCitationInstructions(ctx.availableRefs)}
Requirements:
- 80-120 words exactly
- 4-5 declarative sentences
- Cite at least 2 frameworks/regulations from the available references using [ref_id] format
- Include 1 specific numerical threshold or timeframe
- No hedging or filler phrases
- Directly answer the primary query

Output ONLY the TL;DR content, no headers. Do not output any thinking or reasoning.`,
  },
  {
    name: 'trigger_conditions',
    header: '## Trigger Conditions',
    minWords: 150,
    maxWords: 250,
    prompt: (ctx) => `Write a Trigger Conditions table for: "${ctx.title}"

Context from TL;DR:
${ctx.previousSections}
${buildCitationInstructions(ctx.availableRefs)}
Create a markdown table with columns: Condition | Escalation Mechanism | Liability Shift

Requirements:
- 5-6 rows minimum
- Each cell should have 15-25 words of specific operational detail
- Real operational scenarios only
- Include specific timeframes, dollar amounts, or percentages where applicable
- Cite relevant regulations using [ref_id] format where applicable
- No generic statements

Output ONLY the table (starting with |), no headers or explanations. Do not output any thinking or reasoning.`,
  },
  {
    name: 'checklist',
    header: '## Underwriter\'s Checklist',
    minWords: 120,
    maxWords: 200,
    prompt: (ctx) => `Write an Underwriter's Checklist for: "${ctx.title}"
${buildCitationInstructions(ctx.availableRefs)}
Requirements:
- 8-10 bullet points
- Each item: "[Document/certification type]: [Why it matters and what underwriters verify]"
- 15-25 words per item
- Specific documents: surveys, certificates, logs, endorsements, compliance records
- Cite relevant regulatory requirements using [ref_id] format where applicable
- No generic items

Output ONLY the bullet list (starting with -), no headers. Do not output any thinking or reasoning.`,
  },
  {
    name: 'wording_traps',
    header: '## Common Wording Traps',
    minWords: 180,
    maxWords: 280,
    prompt: (ctx) => `Write a Common Wording Traps table for: "${ctx.title}"
${buildCitationInstructions(ctx.availableRefs)}
Create a markdown table with columns: Clause Type | Failure Trigger | Practical Scenario | Coverage Consequence

Requirements:
- 5-6 rows minimum
- Each cell should have 12-20 words
- Real policy clause types (not invented)
- Specific failure scenarios from maritime operations
- Cite relevant regulations using [ref_id] format where applicable
- Clear coverage consequences

Output ONLY the table (starting with |), no headers or explanations. Do not output any thinking or reasoning.`,
  },
  {
    name: 'operational_reality',
    header: '## Operational Reality',
    minWords: 200,
    maxWords: 280,
    prompt: (ctx) => `Write an Operational Reality section for: "${ctx.title}"

This section describes ONE specific operational friction point in detail.
${buildCitationInstructions(ctx.availableRefs)}
Requirements:
- 200-280 words
- Describe specific procedures or certifications involved
- Include timeline requirements (days, weeks, months)
- Include cost implications with dollar figures
- Name which parties are involved (surveyor, underwriter, broker, owner, classification society)
- Explain what documentation is required
- Cite relevant regulations and standards using [ref_id] format (aim for 2-4 citations)
- Describe common mistakes and their consequences
- Be mechanical and specific, no storytelling

Output ONLY the paragraph content, no headers. Do not output any thinking or reasoning.`,
  },
  {
    name: 'related_risks',
    header: '## Related Risks',
    minWords: 40,
    maxWords: 80,
    prompt: (ctx) => `Write 4 Related Risks bullet points for: "${ctx.title}"
${buildCitationInstructions(ctx.availableRefs)}
Format: "- [Technical risk topic] → [related coverage area or implication]"

Requirements:
- 4 bullet points
- Technical terminology
- Real risk categories from maritime insurance
- Cite relevant regulations using [ref_id] format where applicable

Output ONLY the bullet list (starting with -), no headers. Do not output any thinking or reasoning.`,
  },
  {
    name: 'broker_questions',
    header: '## Questions to Clarify With Your Broker',
    minWords: 60,
    maxWords: 100,
    prompt: (ctx) => `Write 6 Questions to Clarify With Your Broker for: "${ctx.title}"
${buildCitationInstructions(ctx.availableRefs)}
Requirements:
- 6 specific, actionable questions
- About policy terms, coverage limits, exclusions, documentation, claims process
- May reference specific regulations using [ref_id] format where relevant
- No rhetorical questions
- No firm names

Output ONLY the bullet list (starting with - and ending with ?), no headers. Do not output any thinking or reasoning.`,
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

// ─── ASSEMBLE PAPER ─────────────────────────────────────────

function assembleBody(
  title: string,
  sections: Map<string, string>
): string {
  const authorBlock = `*Maintained by [Alex Short](https://alex-short.com/experience) — maritime operational experience*`;

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
    '## Common Wording Traps',
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
    '## Questions to Clarify With Your Broker',
    '',
    sections.get('broker_questions') ?? '',
    '',
    '---',
    '',
    '## Disclosure',
    '',
    'This content is provided for informational purposes only and does not constitute insurance advice. Coverage terms vary by policy, jurisdiction, and underwriter. Consult a licensed marine insurance broker for guidance specific to your vessel and operations.',
  ];

  return parts.join('\n');
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

  // Assemble body
  let body = assembleBody(topic.canonical_title, generatedSections);

  // Inject references
  const injectionResult = await injectReferences(body);
  body = injectionResult.injected_body;

  // Calculate word count
  const wordCount = countWords(body);
  const slug = toSlug(topic.canonical_title);
  const now = new Date().toISOString();
  const tldr = extractTldr(body) || generatedSections.get('tldr')?.slice(0, 500) || '';

  // Build schema
  const schemaJson = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topic.canonical_title,
    url: `https://myyachtsinsurance.com/briefs/${slug}`,
    datePublished: now,
    dateModified: now,
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
      last_updated: now,
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

  // Mark topic as assigned
  await db
    .from('paper_topics')
    .update({ status: 'assigned', assigned_at: now })
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
