#!/usr/bin/env tsx
/**
 * Keyword Import Script
 *
 * CLI utility to import keywords from expanded-queries.tsv into keyword_queue.
 *
 * Usage:
 *   npx tsx src/lib/keyword-queue/import-keywords.ts [--dry-run]
 *
 * Options:
 *   --dry-run    Parse and validate TSV without database writes
 *
 * Phase 02-03: Keyword Import
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

import { importFromTsv } from './keyword-importer';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  // Resolve path to TSV file in project root
  const tsvPath = path.resolve(__dirname, '../../../expanded-queries.tsv');

  // Verify file exists
  if (!fs.existsSync(tsvPath)) {
    console.error(`ERROR: TSV file not found at: ${tsvPath}`);
    process.exit(1);
  }

  // Read TSV content
  const tsvContent = fs.readFileSync(tsvPath, 'utf-8');

  console.log('=== Keyword Import Tool ===');
  console.log(`Source file: ${tsvPath}`);
  console.log(`Mode: ${dryRun ? 'DRY-RUN (no database writes)' : 'LIVE IMPORT'}`);
  console.log('');

  // Run import
  const startTime = Date.now();
  const result = await importFromTsv(tsvContent, { dryRun });
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Display summary
  console.log('');
  console.log('=== Import Summary ===');
  console.log(`Total lines:     ${result.total}`);
  console.log(`Imported:        ${result.imported}`);
  console.log(`Skipped:         ${result.skipped} (duplicates)`);
  console.log(`Errors:          ${result.errors}`);
  console.log(`Duration:        ${duration}s`);
  console.log('');

  // Display pipeline distribution
  console.log('=== Pipeline Distribution ===');
  const pipelineEntries = Object.entries(result.byPipeline).sort((a, b) => b[1] - a[1]);
  for (const [pipeline, count] of pipelineEntries) {
    console.log(`  ${pipeline.padEnd(10)} ${count}`);
  }
  console.log('');

  // Display cluster distribution
  console.log('=== Cluster Distribution ===');
  const clusterEntries = Object.entries(result.byCluster).sort((a, b) => b[1] - a[1]);
  for (const [cluster, count] of clusterEntries) {
    console.log(`  ${cluster.padEnd(25)} ${count}`);
  }
  console.log('');

  if (dryRun) {
    console.log('✓ Dry-run complete. No database changes made.');
    console.log('  Run without --dry-run to perform actual import.');
  } else {
    console.log(`✓ Import complete. ${result.imported} keywords added to queue.`);
  }
}

main().catch((error) => {
  console.error('FATAL ERROR:', error.message);
  console.error(error.stack);
  process.exit(1);
});
