/**
 * Topic Generator - Consumer-Facing Guides
 *
 * Generates ~500 word HTML guides for the /topics/ page.
 * Different from papers (professional) - these are buyer-oriented, consumer language.
 *
 * Usage:
 *   npx tsx topic-generator.ts --seed="Best yacht insurance options for Florida waters"
 *   npx tsx topic-generator.ts --seed="What does yacht insurance cover?" --dry-run
 */

import { db } from './db';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const MODEL = 'qwen3:32b';

// ─── CATEGORIES ─────────────────────────────────────────────

const CATEGORIES = [
  'Coverage Basics',
  'Cost & Quotes',
  'Claims',
  'Policy Types',
  'Florida & Hurricane',
  'General',
] as const;

type Category = (typeof CATEGORIES)[number];

// ─── CLUSTER MAPPINGS ───────────────────────────────────────

const CATEGORY_TO_CLUSTER: Record<Category, string> = {
  'Coverage Basics': 'claims-disputes',
  'Cost & Quotes': 'claims-disputes',
  'Claims': 'claims-disputes',
  'Policy Types': 'charter-commercial',
  'Florida & Hurricane': 'hurricane-storm',
  'General': 'claims-disputes',
};

// ─── KEYWORD TO CATEGORY MAPPING ────────────────────────────

const KEYWORD_CATEGORIES: Array<{ keywords: RegExp; category: Category }> = [
  { keywords: /\b(florida|hurricane|storm|wind|named storm|cat[0-9]|tropical)\b/i, category: 'Florida & Hurricane' },
  { keywords: /\b(cost|price|premium|quote|cheap|expensive|afford|rate)\b/i, category: 'Cost & Quotes' },
  { keywords: /\b(claim|deny|denied|deductible|total loss|payout|settlement)\b/i, category: 'Claims' },
  { keywords: /\b(hull|liability|P&I|protection|indemnity|comprehensive|agreed value)\b/i, category: 'Policy Types' },
  { keywords: /\b(cover|covered|coverage|include|exclude|what does|protect)\b/i, category: 'Coverage Basics' },
];

function classifyCategory(query: string): Category {
  for (const { keywords, category } of KEYWORD_CATEGORIES) {
    if (keywords.test(query)) {
      return category;
    }
  }
  return 'General';
}

// ─── TYPES ──────────────────────────────────────────────────

interface FAQ {
  question: string;
  answer: string;
}

interface RelatedPaper {
  title: string;
  slug: string;
}

interface GeneratedTopic {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: Category;
  faqs: FAQ[];
  related_papers: RelatedPaper[];
  related_cluster: string;
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

// ─── CALL QWEN ──────────────────────────────────────────────

async function callQwen(prompt: string, maxTokens = 2000, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: `You are a helpful consumer guide writer for yacht and boat insurance. Write in plain, friendly language that everyday boat owners can understand. Avoid technical jargon - explain concepts simply. Be direct and practical.`,
            },
            { role: 'user', content: prompt },
          ],
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            num_predict: maxTokens,
            repeat_penalty: 1.05,
          },
        }),
      });

      if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
      const data = await response.json();
      let content = data.message?.content?.trim() ?? '';

      // Strip thinking tags if present (Qwen3 thinking mode)
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

      if (!content) throw new Error('Empty response from Ollama');
      return content;
    } catch (err) {
      if (attempt < retries) {
        console.log(`  [Retry ${attempt + 1}/${retries}] Ollama call failed, retrying in 3s...`);
        await new Promise(r => setTimeout(r, 3000));
      } else {
        throw err;
      }
    }
  }
  throw new Error('callQwen exhausted retries');
}

// ─── PARSE JSON ─────────────────────────────────────────────

function parseJson<T>(raw: string): T | null {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

// ─── FETCH RELATED PAPERS ───────────────────────────────────

async function fetchRelatedPapers(clusterId: string, limit = 5): Promise<RelatedPaper[]> {
  const { data, error } = await db
    .from('papers')
    .select('title, slug')
    .eq('cluster_id', clusterId)
    .eq('review_status', 'published')
    .order('last_updated', { ascending: false })
    .limit(limit);

  if (error || !data) {
    // Fallback: try without status filter
    const { data: fallback } = await db
      .from('papers')
      .select('title, slug')
      .eq('cluster_id', clusterId)
      .order('last_updated', { ascending: false })
      .limit(limit);
    return (fallback || []).map(p => ({ title: p.title, slug: p.slug }));
  }

  return data.map(p => ({ title: p.title, slug: p.slug }));
}

// ─── GENERATION PROMPTS ─────────────────────────────────────

function buildTitleAndSummaryPrompt(seedQuery: string, category: Category): string {
  return `/no_think
Create a consumer-friendly title and summary for a yacht insurance guide based on this query:

"${seedQuery}"

Category: ${category}

Requirements:
1. Title: Clear, helpful, under 60 characters. What a boat owner would search for.
2. Summary: 1-2 sentences that hook the reader. Promise value. Under 160 characters.

Examples of good titles:
- "What Does Yacht Insurance Actually Cover?"
- "How Much Does Boat Insurance Cost in Florida?"
- "Filing a Yacht Insurance Claim: Step-by-Step"

Output JSON only:
{
  "title": "Consumer-Friendly Title Here",
  "summary": "Brief hook that promises value to the reader."
}`;
}

function buildContentPrompt(title: string, seedQuery: string, category: Category): string {
  return `/no_think
Write a ~500 word consumer guide about: "${title}"

Original query: "${seedQuery}"
Category: ${category}

AUDIENCE: Boat owners who are NOT insurance experts. They want practical, clear answers.

TONE:
- Friendly but informative
- Use "you" and "your boat"
- Explain terms when you use them
- Be direct - no filler

STRUCTURE (use this exact HTML structure):
<h2>Brief intro header</h2>
<p>1-2 sentence intro that acknowledges the reader's question.</p>

<h3>First Key Point</h3>
<p>Explanation paragraph...</p>

<h3>Second Key Point</h3>
<p>Explanation paragraph...</p>

<h3>Third Key Point</h3>
<p>Explanation paragraph...</p>

<h3>What to Look For</h3>
<p>Practical advice or checklist...</p>

REQUIREMENTS:
- Approximately 500 words (450-550)
- Use <h2>, <h3>, <p>, <ul>, <li> tags only
- NO <h1> tags (the page template adds the title)
- NO markdown - pure HTML
- Include at least one <ul> list with 3-5 items
- End with actionable advice

Output ONLY the HTML content. No explanation.`;
}

function buildFAQsPrompt(title: string, content: string, seedQuery: string): string {
  return `/no_think
Generate 3-4 FAQs for a consumer guide about: "${title}"

Original query: "${seedQuery}"

The article covers:
${content.slice(0, 500)}...

Requirements:
1. Questions should be what real boat owners would ask
2. Answers should be 1-2 sentences, helpful and direct
3. Don't repeat what's already in the main content
4. Focus on follow-up questions readers might have

Output JSON only:
{
  "faqs": [
    {"question": "Question here?", "answer": "Clear, helpful answer."},
    {"question": "Another question?", "answer": "Direct answer here."},
    {"question": "Third question?", "answer": "Practical response."}
  ]
}`;
}

// ─── MAIN GENERATOR ─────────────────────────────────────────

export async function generateTopic(seedQuery: string): Promise<GeneratedTopic> {
  console.log(`\nGenerating topic for: "${seedQuery}"`);

  // Step 1: Classify category
  const category = classifyCategory(seedQuery);
  console.log(`  Category: ${category}`);

  // Step 2: Generate title and summary (with parse retry)
  console.log('  Generating title and summary...');
  const titlePrompt = buildTitleAndSummaryPrompt(seedQuery, category);
  let titleParsed: { title: string; summary: string } | null = null;
  for (let parseAttempt = 0; parseAttempt < 2; parseAttempt++) {
    const titleRaw = await callQwen(titlePrompt, 500);
    titleParsed = parseJson<{ title: string; summary: string }>(titleRaw);
    if (titleParsed?.title && titleParsed?.summary) break;
    console.log(`  [Parse retry] Got unparseable response, retrying...`);
  }

  if (!titleParsed?.title || !titleParsed?.summary) {
    throw new Error('Failed to generate title/summary after retries');
  }

  const title = titleParsed.title;
  const summary = titleParsed.summary;
  const slug = toSlug(title);

  console.log(`  Title: ${title}`);
  console.log(`  Slug: ${slug}`);

  // Step 3: Generate content
  console.log('  Generating content...');
  const contentPrompt = buildContentPrompt(title, seedQuery, category);
  let content = await callQwen(contentPrompt, 1500);

  // Clean up content - ensure it starts with HTML tag
  content = content.trim();
  if (!content.startsWith('<')) {
    // Try to extract HTML portion
    const htmlStart = content.indexOf('<h2');
    if (htmlStart > 0) {
      content = content.slice(htmlStart);
    }
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  console.log(`  Content: ${wordCount} words`);

  // Step 4: Generate FAQs
  console.log('  Generating FAQs...');
  const faqPrompt = buildFAQsPrompt(title, content, seedQuery);
  const faqRaw = await callQwen(faqPrompt, 800);
  const faqParsed = parseJson<{ faqs: FAQ[] }>(faqRaw);
  const faqs = faqParsed?.faqs || [];
  console.log(`  FAQs: ${faqs.length} items`);

  // Step 5: Fetch related papers by cluster
  const relatedCluster = CATEGORY_TO_CLUSTER[category];
  console.log(`  Fetching related papers from cluster: ${relatedCluster}`);
  const relatedPapers = await fetchRelatedPapers(relatedCluster);
  console.log(`  Related papers: ${relatedPapers.length} found`);

  return {
    title,
    slug,
    summary,
    content,
    category,
    faqs,
    related_papers: relatedPapers,
    related_cluster: relatedCluster,
  };
}

// ─── SAVE TO DATABASE ───────────────────────────────────────

export async function saveTopic(topic: GeneratedTopic): Promise<string> {
  // Check for duplicate slug
  const { data: existing } = await db
    .from('consumer_topics')
    .select('id')
    .eq('slug', topic.slug)
    .single();

  if (existing) {
    throw new Error(`Topic with slug "${topic.slug}" already exists`);
  }

  const { data: saved, error } = await db
    .from('consumer_topics')
    .insert({
      slug: topic.slug,
      title: topic.title,
      summary: topic.summary,
      content: topic.content,
      category: topic.category,
      faqs: topic.faqs,
      related_papers: topic.related_papers,
      related_cluster: topic.related_cluster,
      status: 'published',
    })
    .select('id')
    .single();

  if (error || !saved) {
    throw new Error(`Failed to save topic: ${error?.message}`);
  }

  return saved.id;
}

// ─── CLI INTERFACE ──────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let seedQuery = '';
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith('--seed=')) {
      seedQuery = arg.slice(7).replace(/^["']|["']$/g, '');
    } else if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  if (!seedQuery) {
    console.error('Usage: npx tsx topic-generator.ts --seed="Your query here" [--dry-run]');
    console.error('\nExamples:');
    console.error('  npx tsx topic-generator.ts --seed="Best yacht insurance options for Florida waters"');
    console.error('  npx tsx topic-generator.ts --seed="What does yacht insurance cover?" --dry-run');
    process.exit(1);
  }

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           TOPIC GENERATOR - Consumer Guides                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nSeed Query: "${seedQuery}"`);
  console.log(`Dry Run: ${dryRun ? 'Yes' : 'No'}`);

  try {
    const topic = await generateTopic(seedQuery);

    console.log('\n' + '─'.repeat(60));
    console.log('GENERATED TOPIC:');
    console.log('─'.repeat(60));
    console.log(`Title:    ${topic.title}`);
    console.log(`Slug:     ${topic.slug}`);
    console.log(`Summary:  ${topic.summary}`);
    console.log(`Category: ${topic.category}`);
    console.log(`Cluster:  ${topic.related_cluster}`);
    console.log(`FAQs:     ${topic.faqs.length} items`);
    console.log(`Papers:   ${topic.related_papers.length} related`);
    console.log(`Words:    ~${topic.content.split(/\s+/).filter(Boolean).length}`);

    if (topic.faqs.length > 0) {
      console.log('\nFAQs:');
      topic.faqs.forEach((faq, i) => {
        console.log(`  ${i + 1}. ${faq.question}`);
        console.log(`     ${faq.answer.slice(0, 80)}...`);
      });
    }

    if (topic.related_papers.length > 0) {
      console.log('\nRelated Papers:');
      topic.related_papers.forEach(p => {
        console.log(`  - ${p.title}`);
      });
    }

    console.log('\n' + '─'.repeat(60));
    console.log('CONTENT PREVIEW (first 500 chars):');
    console.log('─'.repeat(60));
    console.log(topic.content.slice(0, 500) + '...');

    if (dryRun) {
      console.log('\n[DRY RUN] Topic was not saved to database.');
    } else {
      console.log('\nSaving to database...');
      const topicId = await saveTopic(topic);
      console.log(`\nSaved! Topic ID: ${topicId}`);
      console.log(`View at: /topics/${topic.slug}`);
    }

    console.log('\nDone.');
  } catch (err) {
    console.error('\nError:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

// Run if called directly (not imported)
const isMainModule = process.argv[1]?.includes('topic-generator');
if (isMainModule) {
  main();
}
