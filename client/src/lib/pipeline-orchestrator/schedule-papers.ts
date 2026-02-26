/**
 * Paper Publication Scheduler
 * Creates a balanced publication calendar for reviewed papers
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Schedule papers every 2 days, balanced across clusters
async function schedulePapers(weeks: number = 4) {
  console.log(`\n=== SCHEDULING PAPERS (${weeks} weeks) ===\n`);

  // Get reviewed papers with their clusters
  const { data: papers, error } = await db
    .from('papers')
    .select('id, title, cluster_id')
    .eq('review_status', 'reviewed')
    .order('created_at', { ascending: true });

  if (error || !papers || papers.length === 0) {
    console.log('No reviewed papers to schedule');
    return;
  }

  console.log(`Found ${papers.length} reviewed papers to schedule`);

  // Group papers by cluster for balanced scheduling
  const byCluster: Record<string, typeof papers> = {};
  for (const paper of papers) {
    const cluster = paper.cluster_id || 'uncategorized';
    if (!byCluster[cluster]) byCluster[cluster] = [];
    byCluster[cluster].push(paper);
  }

  console.log('Papers by cluster:');
  Object.entries(byCluster).forEach(([c, p]) => console.log(`  ${c}: ${p.length}`));

  // Create balanced schedule - round-robin across clusters
  const clusters = Object.keys(byCluster);
  const scheduledPapers: Array<{ paper: typeof papers[0]; date: string }> = [];

  // Start from tomorrow
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  currentDate.setHours(9, 0, 0, 0); // 9 AM

  let clusterIndex = 0;
  const totalDays = weeks * 7;
  const maxPapers = Math.floor(totalDays / 2); // One paper every 2 days

  while (scheduledPapers.length < maxPapers && scheduledPapers.length < papers.length) {
    // Find next cluster with papers
    let attempts = 0;
    while (attempts < clusters.length) {
      const cluster = clusters[clusterIndex % clusters.length];
      if (byCluster[cluster].length > 0) {
        const paper = byCluster[cluster].shift()!;
        scheduledPapers.push({
          paper,
          date: currentDate.toISOString().split('T')[0]
        });
        break;
      }
      clusterIndex++;
      attempts++;
    }

    // Move to next publication date (every 2 days)
    currentDate.setDate(currentDate.getDate() + 2);
    clusterIndex++;
  }

  console.log(`\nScheduling ${scheduledPapers.length} papers...`);

  // Check what's already scheduled
  const { data: existing } = await db
    .from('paper_calendar')
    .select('paper_id')
    .eq('status', 'scheduled');

  const existingIds = new Set((existing || []).map((e: any) => e.paper_id));

  // Insert into paper_calendar (skip already scheduled)
  let scheduled = 0;
  for (const item of scheduledPapers) {
    if (existingIds.has(item.paper.id)) {
      console.log(`  Already scheduled: ${item.paper.title.slice(0, 40)}...`);
      continue;
    }

    const { error: insertError } = await db
      .from('paper_calendar')
      .insert({
        paper_id: item.paper.id,
        publish_date: item.date,
        status: 'scheduled',
        cluster_id: item.paper.cluster_id
      });

    if (insertError) {
      console.log(`  Error scheduling ${item.paper.title.slice(0, 40)}...: ${insertError.message}`);
    } else {
      scheduled++;
    }
  }

  console.log(`\n✓ Scheduled ${scheduled} papers`);

  // Show schedule summary
  console.log('\nSchedule summary:');
  const byMonth: Record<string, number> = {};
  for (const item of scheduledPapers) {
    const month = item.date.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  }
  Object.entries(byMonth).forEach(([m, c]) => console.log(`  ${m}: ${c} papers`));

  // Show first 10 scheduled
  console.log('\nNext 10 publications:');
  scheduledPapers.slice(0, 10).forEach((item, i) => {
    console.log(`  ${item.date}: ${item.paper.title.slice(0, 50)}...`);
  });
}

const weeks = parseInt(process.argv[2] || '4', 10);
schedulePapers(weeks).catch((e: Error) => {
  console.error('Error:', e.message);
  process.exit(1);
});
