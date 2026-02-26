/**
 * Query Expander for Q&A Pipeline
 *
 * Expands seed queries into 300-500 consumer-intent variants using:
 * 1. Google Autocomplete (free, no API key)
 * 2. People Also Ask via SerpAPI (optional, $0.01/query)
 * 3. Alphabet suffixing for long-tail variants
 *
 * Usage:
 *   npx tsx query-expander.ts [--limit=500] [--input=seeds.txt] [--output=expanded.tsv]
 *   SERPAPI_KEY=xxx npx tsx query-expander.ts  # Enable PAA scraping
 */

import * as fs from 'fs';
import * as crypto from 'crypto';

// Lazy imports - only loaded when needed
let db: any = null;
let tagQuestion: any = null;

function hashText(text: string): string {
  return crypto.createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
}

async function getDb() {
  if (!db) {
    const module = await import('./db');
    db = module.db;
  }
  return db;
}

async function getTagger() {
  if (!tagQuestion) {
    const module = await import('./tagger');
    tagQuestion = module.tagQuestion;
  }
  return tagQuestion;
}

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const DEFAULT_LIMIT = 500;

// Intent tier classification keywords
const T1_KEYWORDS = [
  'void', 'deny', 'denied', 'cancel', 'cancellation', 'limits', 'limit',
  'requirement', 'required', 'notify', 'notification', 'deadline', 'lapse',
  'exclusion', 'excluded', 'won\'t cover', 'not covered', 'refuse',
  'non-renewal', 'terminate', 'violation', 'breach', 'void policy'
];

const T2_KEYWORDS = [
  'cost', 'price', 'premium', 'coverage', 'cover', 'deductible',
  'how much', 'quote', 'rate', 'compare', 'best', 'options',
  'calculator', 'calculate', 'afford', 'save', 'discount'
];

// Risk topic detection patterns
const TOPIC_PATTERNS: Record<string, RegExp> = {
  navigation_limits: /navigat|cruising|territory|waters|area|zone|limit/i,
  survey: /survey|inspection|condition|haul|marine survey/i,
  hurricane: /hurricane|storm|named storm|tropical|cyclone/i,
  claims_denial: /claim|denied|denial|reject|refuse|won't pay/i,
  charter_exclusion: /charter|rental|commercial use|hire|bareboat/i,
  crew_coverage: /crew|captain|staff|employee|worker/i,
  hull_damage: /hull|damage|collision|allision|impact/i,
  liability: /liability|third party|injury|sue|lawsuit/i,
  deductible: /deductible|excess|out of pocket/i,
  policy_void: /void|cancel|lapse|breach|violat/i,
  total_loss: /total loss|write off|constructive|actual total/i,
  salvage: /salvage|recover|wreck/i,
  towing: /tow|rescue|assistance|breakdown/i,
  theft: /theft|stolen|steal|burglary/i,
  fire: /fire|burn|explosion/i,
  grounding: /ground|ran aground|stuck|reef/i,
  lay_up: /lay up|layup|winter|storage|out of commission/i,
  racing: /racing|regatta|competition/i,
  liveaboard: /liveaboard|live aboard|residence|live on/i,
  financing: /financ|loan|lender|mortgage|bank/i,
};

interface ExpandedQuery {
  query: string;
  tier: 'T1' | 'T2' | 'T3';
  risk_topic: string;
  source: 'seed' | 'autocomplete' | 'paa' | 'alphabet';
}

interface ExpansionResult {
  queries: ExpandedQuery[];
  stats: {
    seeds: number;
    autocomplete: number;
    paa: number;
    alphabet: number;
    deduplicated: number;
  };
}

/**
 * Classify query intent tier based on keywords
 */
function classifyTier(query: string): 'T1' | 'T2' | 'T3' {
  const lower = query.toLowerCase();

  if (T1_KEYWORDS.some(kw => lower.includes(kw))) {
    return 'T1';
  }
  if (T2_KEYWORDS.some(kw => lower.includes(kw))) {
    return 'T2';
  }
  return 'T3';
}

/**
 * Detect risk topic from query
 */
function detectTopic(query: string): string {
  for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS)) {
    if (pattern.test(query)) {
      return topic;
    }
  }
  return 'other';
}

/**
 * Google Autocomplete scraper (free, no API)
 */
async function scrapeAutocomplete(seed: string): Promise<string[]> {
  const suggestions: string[] = [];

  try {
    // Google's autocomplete API (unofficial but stable)
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`Autocomplete failed for "${seed}": ${response.status}`);
      return [];
    }

    const data = await response.json();
    // Response format: [query, [suggestions...]]
    if (Array.isArray(data) && Array.isArray(data[1])) {
      suggestions.push(...data[1].filter((s: string) => s !== seed));
    }
  } catch (error) {
    console.warn(`Autocomplete error for "${seed}":`, error);
  }

  return suggestions;
}

/**
 * People Also Ask scraper via SerpAPI (optional)
 */
async function scrapePAA(seed: string): Promise<string[]> {
  if (!SERPAPI_KEY) {
    return [];
  }

  const questions: string[] = [];

  try {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('api_key', SERPAPI_KEY);
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', seed);
    url.searchParams.set('num', '10');

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.warn(`SerpAPI failed for "${seed}": ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Extract PAA questions
    if (data.related_questions) {
      questions.push(
        ...data.related_questions.map((q: { question: string }) => q.question)
      );
    }
  } catch (error) {
    console.warn(`SerpAPI error for "${seed}":`, error);
  }

  return questions;
}

/**
 * Alphabet suffixing for long-tail variants
 */
async function scrapeAlphabetSuffix(baseQuery: string): Promise<string[]> {
  const suggestions: string[] = [];
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  // Only suffix if query is short enough
  if (baseQuery.split(' ').length > 4) {
    return [];
  }

  // Sample 5 random letters to avoid too many requests
  const letters = Array.from(alphabet).sort(() => Math.random() - 0.5).slice(0, 5);

  for (const letter of letters) {
    const suffixed = `${baseQuery} ${letter}`;
    const results = await scrapeAutocomplete(suffixed);
    suggestions.push(...results);

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return suggestions;
}

// Off-topic geographic terms to filter out
const OFF_TOPIC_TERMS = [
  'dubai', 'hawaii', 'australia', 'ireland', 'uk ', 'nz', 'new zealand',
  'zurich', 'london', 'singapore', 'hong kong', 'canada', 'europe',
  'philippines', 'india', 'hindi', 'class 11', 'class 12', 'wikipedia',
  'drawing', 'definition class', 'ipleaders', 'wisconsin', 'washington state',
  'western australia', 'dublin', 'spanish',
];

/**
 * Check if query is relevant to US marine insurance
 */
function isRelevantQuery(query: string): boolean {
  const lower = query.toLowerCase();

  // Filter out off-topic terms
  for (const term of OFF_TOPIC_TERMS) {
    if (lower.includes(term)) {
      return false;
    }
  }

  // Must contain insurance-related term
  const hasInsuranceTerm = /insurance|policy|coverage|claim|premium|deductible|underwriter|broker/i.test(query);
  if (!hasInsuranceTerm) {
    return false;
  }

  return true;
}

/**
 * Deduplicate and normalize queries
 */
function deduplicateQueries(queries: ExpandedQuery[]): ExpandedQuery[] {
  const seen = new Set<string>();
  const unique: ExpandedQuery[] = [];

  for (const q of queries) {
    // Normalize: lowercase, trim, collapse whitespace
    const normalized = q.query.toLowerCase().trim().replace(/\s+/g, ' ');

    if (!seen.has(normalized) && normalized.length > 10 && isRelevantQuery(normalized)) {
      seen.add(normalized);
      unique.push(q);
    }
  }

  return unique;
}

/**
 * Main expansion function
 */
export async function expandQueries(
  seeds: string[],
  limit: number = DEFAULT_LIMIT,
  onProgress?: (message: string) => void
): Promise<ExpansionResult> {
  const allQueries: ExpandedQuery[] = [];
  const stats = {
    seeds: seeds.length,
    autocomplete: 0,
    paa: 0,
    alphabet: 0,
    deduplicated: 0,
  };

  // Add seeds as T1/T2/T3 based on classification
  for (const seed of seeds) {
    allQueries.push({
      query: seed,
      tier: classifyTier(seed),
      risk_topic: detectTopic(seed),
      source: 'seed',
    });
  }

  onProgress?.(`Processing ${seeds.length} seeds...`);

  // Expand each seed
  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    onProgress?.(`[${i + 1}/${seeds.length}] Expanding: ${seed.slice(0, 40)}...`);

    // 1. Google Autocomplete
    const autocompleteResults = await scrapeAutocomplete(seed);
    for (const suggestion of autocompleteResults) {
      allQueries.push({
        query: suggestion,
        tier: classifyTier(suggestion),
        risk_topic: detectTopic(suggestion),
        source: 'autocomplete',
      });
      stats.autocomplete++;
    }

    // 2. PAA (if key available)
    const paaResults = await scrapePAA(seed);
    for (const question of paaResults) {
      allQueries.push({
        query: question,
        tier: classifyTier(question),
        risk_topic: detectTopic(question),
        source: 'paa',
      });
      stats.paa++;
    }

    // 3. Alphabet suffixing (for short base queries)
    if (seed.split(' ').length <= 3) {
      const alphabetResults = await scrapeAlphabetSuffix(seed);
      for (const suggestion of alphabetResults) {
        allQueries.push({
          query: suggestion,
          tier: classifyTier(suggestion),
          risk_topic: detectTopic(suggestion),
          source: 'alphabet',
        });
        stats.alphabet++;
      }
    }

    // Rate limit between seeds
    await new Promise(resolve => setTimeout(resolve, 500));

    // Early exit if we have enough
    const unique = deduplicateQueries(allQueries);
    if (unique.length >= limit) {
      onProgress?.(`Reached limit of ${limit} queries`);
      break;
    }
  }

  // Final deduplication
  const deduplicated = deduplicateQueries(allQueries);
  stats.deduplicated = allQueries.length - deduplicated.length;

  // Sort: T1 first, then T2, then T3
  deduplicated.sort((a, b) => {
    const tierOrder = { T1: 0, T2: 1, T3: 2 };
    return tierOrder[a.tier] - tierOrder[b.tier];
  });

  // Trim to limit
  const final = deduplicated.slice(0, limit);

  return {
    queries: final,
    stats,
  };
}

/**
 * Insert expanded queries into qa_candidates table
 */
export async function insertCandidates(
  queries: ExpandedQuery[],
  dryRun: boolean = false
): Promise<{ inserted: number; skipped: number; errors: string[] }> {
  const result = { inserted: 0, skipped: 0, errors: [] as string[] };

  const database = await getDb();

  // Check for existing questions
  const { data: existing } = await database
    .from('qa_candidates')
    .select('question')
    .in('question', queries.map(q => q.query));

  const existingSet = new Set(existing?.map((e: any) => e.question.toLowerCase()) || []);

  for (const q of queries) {
    if (existingSet.has(q.query.toLowerCase())) {
      result.skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`[DRY] Would insert: [${q.tier}] ${q.query.slice(0, 50)}...`);
      result.inserted++;
      continue;
    }

    // Use heuristic classification (skip Ollama for speed)
    const tags = {
      risk_topic: q.risk_topic,
      intent_tier: q.tier,
    };

    // Required fields: source_url, question, answer, question_hash, answer_hash
    const questionHash = hashText(q.query);
    const placeholderAnswer = ''; // Will be generated later by answer pipeline
    const answerHash = hashText(placeholderAnswer);

    const { error } = await database.from('qa_candidates').insert({
      source_url: `expanded:${q.source}`,
      question: q.query,
      answer: placeholderAnswer,
      question_hash: questionHash,
      answer_hash: answerHash,
      risk_topic: tags.risk_topic,
      intent_tier: tags.intent_tier,
      publish_status: 'raw',
    });

    if (error) {
      result.errors.push(`Insert failed for "${q.query.slice(0, 30)}...": ${error.message}`);
      result.skipped++;
    } else {
      result.inserted++;
    }

    // Small delay to avoid overwhelming DB
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return result;
}

/**
 * Write results to TSV file
 */
function writeToTSV(queries: ExpandedQuery[], outputPath: string): void {
  const header = 'tier\trisk_topic\tsource\tquery';
  const lines = queries.map(q =>
    `${q.tier}\t${q.risk_topic}\t${q.source}\t${q.query}`
  );

  fs.writeFileSync(outputPath, [header, ...lines].join('\n'));
  console.log(`Wrote ${queries.length} queries to ${outputPath}`);
}

// Default seed queries - mix of user's seeds + short bases for autocomplete
const DEFAULT_SEEDS = [
  // SHORT BASES - these generate the most autocomplete suggestions
  'yacht insurance',
  'boat insurance',
  'marine insurance',
  'yacht insurance Florida',
  'yacht insurance cost',
  'yacht insurance quote',
  'yacht insurance claim',
  'yacht insurance coverage',
  'yacht insurance deductible',
  'yacht policy',
  'boat insurance requirements',
  'charter boat insurance',
  'sailboat insurance',
  'yacht hull insurance',
  'yacht liability insurance',

  // QUESTION PATTERNS - high volume consumer intent
  'how much is yacht insurance',
  'what does yacht insurance cover',
  'do I need yacht insurance',
  'why is yacht insurance expensive',
  'when does yacht insurance cover',
  'where to buy yacht insurance',
  'who has the best yacht insurance',

  // User's 33 provided seeds
  'Best yacht insurance options for Florida waters',
  'Top yacht insurance providers for high-value assets',
  'Platforms for calculating named storm deductibles',
  'Tools for understanding yacht insurance coverage',
  'Best yacht insurance solutions for new owners',
  'Top-rated yacht insurance services for marine enthusiasts',
  'Providers for agreed value vs ACV yacht insurance',
  'Best resources for yacht insurance claims assistance',
  'Yacht insurance calculators for accurate coverage',
  'Best yacht insurance guides for informed decisions',
  'Top yacht insurance tools for brokers',
  'Best yacht insurance policies for total loss payouts',
  'Yacht insurance solutions for layup warranty',
  'Best practices for selecting yacht insurance coverage',
  'Top yacht insurance platforms for expert insights',
  'Best yacht insurance resources for understanding navigation limits',
  'Tools for comparing yacht insurance options',
  'Best yacht insurance calculators for hurricane deductibles',
  'Yacht insurance solutions for hull machinery coverage',
  'Top yacht insurance services for claims support',
  'Best yacht insurance advice for first-time buyers',
  'Best alternatives to Chubb for yacht insurance',
  'Solutions similar to AIG for yacht coverage',
  'What yacht insurance is similar to GEICO',
  'How does yacht insurance work?',
  'What are the benefits of agreed value vs ACV in yacht insurance?',
  'Guide to understanding named storm deductibles',
  'What should I know about yacht insurance claims?',
  'Best practices for calculating hurricane deductibles',
  'Understanding total loss payouts in yacht insurance',
  'What are the key coverage options for yacht insurance?',
  'How to choose the right yacht insurance provider?',
  'Guide to yacht insurance for marine enthusiasts',
];

// CLI
async function main() {
  const args = process.argv.slice(2);

  // Parse args
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : DEFAULT_LIMIT;

  const inputArg = args.find(a => a.startsWith('--input='));
  const inputFile = inputArg ? inputArg.split('=')[1] : null;

  const outputArg = args.find(a => a.startsWith('--output='));
  const outputFile = outputArg ? outputArg.split('=')[1] : 'expanded-queries.tsv';

  const dryRun = args.includes('--dry-run');
  const insertDb = args.includes('--insert');

  console.log('\n=== QUERY EXPANDER ===');
  console.log(`Limit: ${limit}`);
  console.log(`Output: ${outputFile}`);
  console.log(`SerpAPI: ${SERPAPI_KEY ? 'enabled' : 'disabled'}`);
  console.log(`Insert to DB: ${insertDb}`);
  console.log(`Dry run: ${dryRun}\n`);

  // Load seeds
  let seeds = DEFAULT_SEEDS;
  if (inputFile && fs.existsSync(inputFile)) {
    seeds = fs.readFileSync(inputFile, 'utf-8')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    console.log(`Loaded ${seeds.length} seeds from ${inputFile}`);
  } else {
    console.log(`Using ${seeds.length} default seeds`);
  }

  // Expand
  const result = await expandQueries(seeds, limit, console.log);

  console.log('\n--- EXPANSION STATS ---');
  console.log(`Seeds: ${result.stats.seeds}`);
  console.log(`Autocomplete: ${result.stats.autocomplete}`);
  console.log(`PAA: ${result.stats.paa}`);
  console.log(`Alphabet: ${result.stats.alphabet}`);
  console.log(`Deduplicated: ${result.stats.deduplicated}`);
  console.log(`Final count: ${result.queries.length}`);

  // Tier breakdown
  const tierCounts = { T1: 0, T2: 0, T3: 0 };
  result.queries.forEach(q => tierCounts[q.tier]++);
  console.log(`\nTier breakdown: T1=${tierCounts.T1}, T2=${tierCounts.T2}, T3=${tierCounts.T3}`);

  // Write TSV
  writeToTSV(result.queries, outputFile);

  // Insert to DB if requested
  if (insertDb) {
    console.log('\n--- INSERTING TO DATABASE ---');
    const insertResult = await insertCandidates(result.queries, dryRun);
    console.log(`Inserted: ${insertResult.inserted}`);
    console.log(`Skipped: ${insertResult.skipped}`);
    if (insertResult.errors.length > 0) {
      console.log('Errors:');
      insertResult.errors.forEach(e => console.log(`  - ${e}`));
    }
  }
}

main().catch(console.error);
