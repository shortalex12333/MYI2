/**
 * Publish Today's Scheduled Papers
 * Run manually or via cron to publish papers scheduled for today
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function publishTodaysPapers() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  console.log(`\n=== PUBLISHING PAPERS FOR ${todayStr} ===\n`);

  // Get scheduled papers for today
  const { data: scheduled, error } = await db
    .from('paper_calendar')
    .select('*, papers(id, title, slug, review_status)')
    .eq('publish_date', todayStr)
    .eq('status', 'scheduled');

  if (error) {
    console.error('Error fetching:', error.message);
    return;
  }

  if (!scheduled || scheduled.length === 0) {
    console.log('No papers scheduled for today');
    return;
  }

  console.log(`Found ${scheduled.length} scheduled paper(s)\n`);

  let published = 0;

  for (const entry of scheduled) {
    const paper = entry.papers as { id: string; title: string; slug: string; review_status: string } | null;

    if (!paper) {
      console.log(`  Skipping entry ${entry.id}: no paper found`);
      continue;
    }

    if (paper.review_status !== 'reviewed') {
      console.log(`  Skipping ${paper.slug}: status=${paper.review_status}`);
      continue;
    }

    console.log(`  Publishing: ${paper.title.slice(0, 50)}...`);

    // Update calendar entry
    const { error: calError } = await db
      .from('paper_calendar')
      .update({
        status: 'published',
        published_at: now.toISOString(),
        published_url: `/papers/${paper.slug}`,
        notes: 'Auto-published by publish-today script'
      })
      .eq('id', entry.id);

    if (calError) {
      console.log(`    Calendar error: ${calError.message}`);
      continue;
    }

    // Update paper status
    const { error: paperError } = await db
      .from('papers')
      .update({
        review_status: 'published',
        published_at: now.toISOString(),
        last_updated: now.toISOString()
      })
      .eq('id', paper.id);

    if (paperError) {
      console.log(`    Paper error: ${paperError.message}`);
      continue;
    }

    console.log(`    ✓ Published: /papers/${paper.slug}`);
    published++;
  }

  console.log(`\n=== COMPLETE: ${published} paper(s) published ===\n`);
}

publishTodaysPapers().catch((e: Error) => {
  console.error('Error:', e.message);
  process.exit(1);
});
