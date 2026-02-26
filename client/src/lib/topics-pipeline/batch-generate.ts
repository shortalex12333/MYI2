/**
 * Batch Topic Generator
 *
 * Reads expanded-queries.tsv, filters to T2/T3 consumer-intent queries,
 * deduplicates by similar topic, and generates consumer guides in batch.
 *
 * Usage:
 *   npx tsx batch-generate.ts --limit=20 --dry-run
 *   npx tsx batch-generate.ts --limit=50
 *   npx tsx batch-generate.ts  # Process all unique topics
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateTopic, saveTopic } from './topic-generator';

// ─── TYPES ──────────────────────────────────────────────────

interface QueryRow {
  tier: string;
  risk_topic: string;
  source: string;
  query: string;
}

interface TopicGroup {
  canonical: string;
  queries: QueryRow[];
  normalizedKey: string;
}

interface BatchResult {
  seed: string;
  status: 'success' | 'skipped' | 'error';
  title?: string;
  slug?: string;
  topicId?: string;
  error?: string;
}

// ─── TSV PARSER ─────────────────────────────────────────────

function parseTsv(filePath: string): QueryRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');

  // First line is header
  const header = lines[0].split('\t');
  const tierIdx = header.indexOf('tier');
  const riskIdx = header.indexOf('risk_topic');
  const sourceIdx = header.indexOf('source');
  const queryIdx = header.indexOf('query');

  const rows: QueryRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length >= 4) {
      rows.push({
        tier: cols[tierIdx]?.trim() || '',
        risk_topic: cols[riskIdx]?.trim() || '',
        source: cols[sourceIdx]?.trim() || '',
        query: cols[queryIdx]?.trim() || '',
      });
    }
  }

  return rows;
}

// ─── NORMALIZATION FOR DEDUPLICATION ────────────────────────

/**
 * Normalize a query to a canonical form for deduplication.
 * Queries that would produce the same topic are grouped together.
 */
function normalizeForDedup(query: string): string {
  let normalized = query.toLowerCase();

  // Remove common prefixes that don't affect topic content
  const prefixes = [
    'best ', 'top ', 'top-rated ',
    'what is ', 'what are ', 'what does ', 'what should ',
    'how to ', 'how much ', 'how do ', 'how does ',
    'guide to ', 'understanding ', 'tools for ', 'platforms for ',
    'solutions for ', 'options for ', 'resources for ',
    'services for ', 'providers for ',
    'why is ', 'where to ', 'when does ', 'who has ',
    'do i need ',
  ];

  for (const prefix of prefixes) {
    if (normalized.startsWith(prefix)) {
      normalized = normalized.slice(prefix.length);
      break;
    }
  }

  // Remove common suffixes
  const suffixes = [
    ' for boat owners', ' for yacht owners', ' for marine enthusiasts',
    ' for first-time buyers', ' for new owners', ' for brokers',
    ' for high-value assets', ' for informed decisions',
    ' for accurate coverage', ' for expert insights',
  ];

  for (const suffix of suffixes) {
    if (normalized.endsWith(suffix)) {
      normalized = normalized.slice(0, -suffix.length);
      break;
    }
  }

  // Normalize common synonyms
  const synonyms: Array<[RegExp, string]> = [
    [/\byacht\b/g, 'boat'],
    [/\bmarine\b/g, 'boat'],
    [/\bsailboat\b/g, 'boat'],
    [/\bboaters?\b/g, 'boat'],
    [/\bprice\b/g, 'cost'],
    [/\bpremium\b/g, 'cost'],
    [/\brates?\b/g, 'cost'],
    [/\bexpensive\b/g, 'cost'],
    [/\bcheap\b/g, 'cost'],
    [/\baffordable\b/g, 'cost'],
    [/\bcalculator\b/g, 'cost'],
    [/\bquote\b/g, 'cost'],
    [/\bflorida waters\b/g, 'florida'],
    [/\bflorida keys\b/g, 'florida'],
    [/\bsouth florida\b/g, 'florida'],
    [/\bsouthwest florida\b/g, 'florida'],
  ];

  for (const [pattern, replacement] of synonyms) {
    normalized = normalized.replace(pattern, replacement);
  }

  // Remove location modifiers (keep just the concept)
  normalized = normalized.replace(/\b(in |near |for )(florida|california|texas|uk|usa|ontario|greece|bahamas)\b/gi, '');

  // Remove filler words
  normalized = normalized.replace(/\b(the|a|an|my|your|their|this|that|these|those)\b/g, '');

  // Clean up whitespace and punctuation
  normalized = normalized
    .replace(/[?!.,;:'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract core topic keywords (sort for consistency)
  const coreWords = normalized.split(' ').filter(w => w.length > 2);
  coreWords.sort();

  return coreWords.join(' ');
}

// ─── DEDUPLICATION ──────────────────────────────────────────

/**
 * Group queries that would produce similar topics.
 * Returns one canonical query per unique topic concept.
 */
function deduplicateQueries(queries: QueryRow[]): TopicGroup[] {
  const groups = new Map<string, TopicGroup>();

  for (const row of queries) {
    const key = normalizeForDedup(row.query);

    if (!groups.has(key)) {
      groups.set(key, {
        canonical: row.query,
        queries: [row],
        normalizedKey: key,
      });
    } else {
      const group = groups.get(key)!;
      group.queries.push(row);

      // Prefer seed queries as canonical, then shorter queries
      if (row.source === 'seed' && group.queries[0].source !== 'seed') {
        group.canonical = row.query;
      } else if (row.query.length < group.canonical.length && row.source === group.queries[0].source) {
        group.canonical = row.query;
      }
    }
  }

  return Array.from(groups.values());
}

// ─── BATCH PROCESSOR ────────────────────────────────────────

interface BatchOptions {
  limit?: number;
  dryRun: boolean;
}

async function runBatch(options: BatchOptions): Promise<BatchResult[]> {
  const tsvPath = path.resolve('/Users/celeste7/Documents/MYI2/client/expanded-queries.tsv');

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          BATCH TOPIC GENERATOR - Consumer Guides          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nTSV Path: ${tsvPath}`);
  console.log(`Dry Run: ${options.dryRun ? 'Yes' : 'No'}`);
  console.log(`Limit: ${options.limit ?? 'None (all)'}`);

  // Step 1: Read TSV
  console.log('\n[1/4] Reading expanded-queries.tsv...');
  if (!fs.existsSync(tsvPath)) {
    throw new Error(`TSV file not found: ${tsvPath}`);
  }
  const allQueries = parseTsv(tsvPath);
  console.log(`  Total queries: ${allQueries.length}`);

  // Step 2: Filter to T2/T3 (consumer-intent)
  console.log('\n[2/4] Filtering to T2/T3 tiers (consumer-intent)...');
  const consumerQueries = allQueries.filter(
    (row) => row.tier === 'T2' || row.tier === 'T3'
  );
  console.log(`  T2 queries: ${allQueries.filter(r => r.tier === 'T2').length}`);
  console.log(`  T3 queries: ${allQueries.filter(r => r.tier === 'T3').length}`);
  console.log(`  Total consumer-intent: ${consumerQueries.length}`);

  // Step 3: Deduplicate
  console.log('\n[3/4] Deduplicating by similar topic...');
  const topicGroups = deduplicateQueries(consumerQueries);
  console.log(`  Unique topic groups: ${topicGroups.length}`);

  // Show some example groupings
  const largeGroups = topicGroups.filter(g => g.queries.length > 2).slice(0, 3);
  if (largeGroups.length > 0) {
    console.log('\n  Example groupings:');
    for (const group of largeGroups) {
      console.log(`    "${group.canonical}" (${group.queries.length} similar queries)`);
    }
  }

  // Apply limit
  let topicsToGenerate = topicGroups.map(g => g.canonical);
  if (options.limit && options.limit < topicsToGenerate.length) {
    topicsToGenerate = topicsToGenerate.slice(0, options.limit);
    console.log(`\n  Applied limit: processing ${topicsToGenerate.length} topics`);
  }

  // Step 4: Generate topics
  console.log('\n[4/4] Generating topics...');
  console.log('─'.repeat(60));

  const results: BatchResult[] = [];
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < topicsToGenerate.length; i++) {
    const seedQuery = topicsToGenerate[i];
    const progress = `[${i + 1}/${topicsToGenerate.length}]`;

    console.log(`\n${progress} Processing: "${seedQuery.slice(0, 50)}${seedQuery.length > 50 ? '...' : ''}"`);

    try {
      const topic = await generateTopic(seedQuery);

      if (options.dryRun) {
        console.log(`  -> Title: ${topic.title}`);
        console.log(`  -> Slug: ${topic.slug}`);
        console.log(`  -> [DRY RUN] Would save to database`);

        results.push({
          seed: seedQuery,
          status: 'success',
          title: topic.title,
          slug: topic.slug,
        });
        successCount++;
      } else {
        try {
          const topicId = await saveTopic(topic);
          console.log(`  -> Title: ${topic.title}`);
          console.log(`  -> Saved! ID: ${topicId}`);

          results.push({
            seed: seedQuery,
            status: 'success',
            title: topic.title,
            slug: topic.slug,
            topicId,
          });
          successCount++;
        } catch (saveErr) {
          const errMsg = saveErr instanceof Error ? saveErr.message : String(saveErr);
          if (errMsg.includes('already exists')) {
            console.log(`  -> SKIPPED: ${errMsg}`);
            results.push({
              seed: seedQuery,
              status: 'skipped',
              error: errMsg,
            });
            skipCount++;
          } else {
            throw saveErr;
          }
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.log(`  -> ERROR: ${errMsg}`);
      results.push({
        seed: seedQuery,
        status: 'error',
        error: errMsg,
      });
      errorCount++;
    }

    // Small delay between generations to avoid overwhelming Ollama
    if (i < topicsToGenerate.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('BATCH COMPLETE');
  console.log('═'.repeat(60));
  console.log(`  Total processed: ${results.length}`);
  console.log(`  Successful:      ${successCount}`);
  console.log(`  Skipped:         ${skipCount}`);
  console.log(`  Errors:          ${errorCount}`);

  if (options.dryRun) {
    console.log('\n[DRY RUN] No topics were saved to database.');
  }

  // Write results to JSON for reference
  const resultsPath = path.resolve('/Users/celeste7/Documents/MYI2/client/src/lib/topics-pipeline/batch-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to: ${resultsPath}`);

  return results;
}

// ─── CLI INTERFACE ──────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  let limit: number | undefined;
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.slice(8), 10);
      if (isNaN(limit) || limit < 1) {
        console.error('Error: --limit must be a positive integer');
        process.exit(1);
      }
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log('Batch Topic Generator');
      console.log('\nUsage:');
      console.log('  npx tsx batch-generate.ts [options]');
      console.log('\nOptions:');
      console.log('  --limit=N    Process only the first N unique topics');
      console.log('  --dry-run    Generate topics but do not save to database');
      console.log('  --help, -h   Show this help message');
      console.log('\nExamples:');
      console.log('  npx tsx batch-generate.ts --limit=20 --dry-run');
      console.log('  npx tsx batch-generate.ts --limit=50');
      console.log('  npx tsx batch-generate.ts');
      process.exit(0);
    }
  }

  try {
    await runBatch({ limit, dryRun });
  } catch (err) {
    console.error('\nFatal error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

// Run if called directly
main();
