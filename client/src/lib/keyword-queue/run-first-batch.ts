#!/usr/bin/env node
/**
 * First Batch Execution Script
 *
 * Processes the first batch of keywords through the queue processor.
 * Usage:
 *   npx tsx src/lib/keyword-queue/run-first-batch.ts [--dry-run] [--limit=20]
 *
 * Features:
 * - --dry-run: Show selection without processing
 * - --limit=N: Process N keywords (default 20)
 * - 5s delay between generations for Ollama cooling
 * - Progress logging with pipeline routing info
 * - Error tracking and summary
 */

import { selectFirstBatch } from './batch-selector';
import { processKeyword } from './queue-processor';

interface BatchResults {
  success: number;
  failed: number;
  errors: Array<{ keyword: string; error: string }>;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 20;

  console.log('=== First Batch Execution ===');
  console.log(`Limit: ${limit}`);
  console.log(`Dry run: ${dryRun}`);
  console.log('');

  // Select batch with cluster diversity
  console.log('Selecting batch...');
  const batch = await selectFirstBatch(limit);

  if (batch.length === 0) {
    console.log('\nNo pending keywords found. Exiting.');
    return;
  }

  console.log(`\nSelected ${batch.length} keywords:\n`);

  for (const kw of batch) {
    console.log(
      `  - [${kw.cluster_id}] ${kw.keyword} (priority: ${kw.priority_score}, pipeline: ${kw.pipeline_type})`
    );
  }

  if (dryRun) {
    console.log('\n[DRY RUN] No processing performed.');
    return;
  }

  // Process each keyword with 5s delays
  console.log('\n=== Processing Keywords ===\n');

  const results: BatchResults = {
    success: 0,
    failed: 0,
    errors: [],
  };

  const startTime = Date.now();

  for (let i = 0; i < batch.length; i++) {
    const kw = batch[i];
    console.log(`[${i + 1}/${batch.length}] Processing: "${kw.keyword}"`);
    console.log(`  Cluster: ${kw.cluster_id}`);
    console.log(`  Pipeline: ${kw.pipeline_type}`);

    try {
      const result = await processKeyword(kw.id);

      if (result.success) {
        console.log(`  ✓ SUCCESS: Created ${result.contentType} (ID: ${result.contentId})`);
        results.success++;
      } else {
        console.log(`  ✗ FAILED: ${result.error}`);
        results.failed++;
        results.errors.push({
          keyword: kw.keyword,
          error: result.error || 'Unknown error',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log(`  ✗ ERROR: ${errorMessage}`);
      results.failed++;
      results.errors.push({
        keyword: kw.keyword,
        error: errorMessage,
      });
    }

    // Rate limit: 5s between generations (Ollama cooling)
    if (i < batch.length - 1) {
      console.log('  Waiting 5s before next generation...\n');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  const duration = Math.round((Date.now() - startTime) / 1000);

  console.log('\n=== Batch Summary ===');
  console.log(`Total: ${batch.length} keywords`);
  console.log(`Success: ${results.success}/${batch.length} (${Math.round((results.success / batch.length) * 100)}%)`);
  console.log(`Failed: ${results.failed}/${batch.length}`);
  console.log(`Duration: ${duration}s (avg ${Math.round(duration / batch.length)}s per keyword)`);

  if (results.errors.length > 0) {
    console.log('\n=== Errors ===');
    for (const err of results.errors) {
      console.log(`  - "${err.keyword}": ${err.error}`);
    }
  }

  console.log('\nBatch execution complete.');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
