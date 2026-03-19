#!/usr/bin/env node
/**
 * Publish Reviewed Papers — Local CLI
 *
 * The paper-publish cron only runs on Vercel (hourly). This script
 * publishes all papers with review_status='reviewed' from the local
 * machine, updating both the papers table and any matching
 * paper_calendar entries.
 *
 * Usage:
 *   npx tsx src/lib/papers-pipeline/publish-reviewed.ts              # publish all reviewed
 *   npx tsx src/lib/papers-pipeline/publish-reviewed.ts --dry-run    # show what would publish
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local before any Supabase client initialization
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from './db';

// ─── ARG PARSER ──────────────────────────────────────────────

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

// ─── MAIN ────────────────────────────────────────────────────

async function publishReviewed() {
  const dryRun = hasFlag('dry-run');
  const now = new Date();

  console.log(`\n=== PUBLISH REVIEWED PAPERS${dryRun ? ' (DRY RUN)' : ''} ===`);
  console.log(`Timestamp: ${now.toISOString()}\n`);

  // 1. Fetch all papers with review_status = 'reviewed'
  const { data: papers, error: fetchError } = await db
    .from('papers')
    .select('id, title, slug, review_status, created_at')
    .eq('review_status', 'reviewed')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error(`Error fetching reviewed papers: ${fetchError.message}`);
    process.exit(1);
  }

  if (!papers || papers.length === 0) {
    console.log('No papers with review_status=\'reviewed\' found.');
    process.exit(0);
  }

  console.log(`Found ${papers.length} reviewed paper(s):\n`);

  // 2. List them
  for (let i = 0; i < papers.length; i++) {
    const p = papers[i];
    console.log(`  ${String(i + 1).padStart(3)}. ${p.title.slice(0, 70)}`);
    console.log(`       slug: ${p.slug}  created: ${p.created_at?.split('T')[0] ?? 'unknown'}`);
  }

  if (dryRun) {
    console.log(`\n--- DRY RUN: ${papers.length} paper(s) would be published. No changes made. ---\n`);
    process.exit(0);
  }

  // 3. Publish each paper
  console.log('');
  let published = 0;
  let errors = 0;

  for (const paper of papers) {
    // 3a. Update paper status
    const { error: paperError } = await db
      .from('papers')
      .update({
        review_status: 'published',
        published_at: now.toISOString(),
        last_updated: now.toISOString(),
      })
      .eq('id', paper.id);

    if (paperError) {
      console.log(`  FAIL  ${paper.slug}: ${paperError.message}`);
      errors++;
      continue;
    }

    // 3b. Update paper_calendar entry if one exists for this paper
    const { data: calEntries, error: calFetchError } = await db
      .from('paper_calendar')
      .select('id')
      .eq('paper_id', paper.id)
      .neq('status', 'published');

    if (!calFetchError && calEntries && calEntries.length > 0) {
      const calIds = calEntries.map((e: { id: string }) => e.id);
      const { error: calUpdateError } = await db
        .from('paper_calendar')
        .update({
          status: 'published',
          published_at: now.toISOString(),
          published_url: `/papers/${paper.slug}`,
          notes: 'Published by publish-reviewed CLI script',
        })
        .in('id', calIds);

      if (calUpdateError) {
        console.log(`  WARN  calendar update failed for ${paper.slug}: ${calUpdateError.message}`);
      } else {
        console.log(`  OK    ${paper.slug}  (+ ${calEntries.length} calendar entr${calEntries.length === 1 ? 'y' : 'ies'})`);
        published++;
        continue;
      }
    }

    console.log(`  OK    ${paper.slug}`);
    published++;
  }

  // 4. Summary
  console.log(`\n=== COMPLETE: ${published} published, ${errors} failed (of ${papers.length} total) ===\n`);

  if (errors > 0) {
    process.exit(1);
  }
}

publishReviewed().catch((err: unknown) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
