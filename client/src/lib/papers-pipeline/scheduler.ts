/**
 * Publication Scheduler
 *
 * Builds and manages the paper publication calendar.
 * Cadence: one paper every 2-3 days.
 * Cluster balancing: no cluster publishes more than 2x
 * another until they have comparable depth.
 *
 * Usage:
 *   npx ts-node cli.ts schedule [--weeks=4]
 *   npx ts-node cli.ts schedule --next     (next paper to publish today)
 */

import { db } from './db';

const PUBLISH_INTERVAL_DAYS = 2;  // publish every 2-3 days

// ─── NEXT PUBLISH DATE ────────────────────────────────────────
async function getNextPublishDate(): Promise<Date> {
  const { data: last } = await db
    .from('paper_calendar')
    .select('publish_date')
    .order('publish_date', { ascending: false })
    .limit(1)
    .single();

  const baseDate = last?.publish_date
    ? new Date(last.publish_date)
    : new Date();

  const next = new Date(baseDate);
  next.setDate(next.getDate() + PUBLISH_INTERVAL_DAYS);
  return next;
}

// ─── CLUSTER BALANCE CHECK ────────────────────────────────────
// Prevents any single cluster from dominating the feed.
// Rule: pick the cluster with the lowest recent publish count.
async function getClusterBalance(): Promise<Record<string, number>> {
  const { data } = await db
    .from('paper_calendar')
    .select('cluster_id')
    .eq('status', 'published')
    .gte('publish_date',
         new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);

  const balance: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.cluster_id) {
      balance[row.cluster_id] = (balance[row.cluster_id] || 0) + 1;
    }
  }
  return balance;
}

// ─── SELECT NEXT PAPER ────────────────────────────────────────
// Picks the highest-GEO-scored reviewed paper that isn't
// scheduled yet, with cluster balance applied.

async function selectNextPaper(
  excludeClusterIfCount: Record<string, number>
): Promise<{ id: string; cluster_id: string; title: string } | null> {
  // Find the most over-represented cluster to deprioritize
  const maxCount = Math.max(0, ...Object.values(excludeClusterIfCount));
  const overloaded = Object.entries(excludeClusterIfCount)
    .filter(([, count]) => count >= maxCount && maxCount > 0)
    .map(([cluster]) => cluster);

  // Build query: reviewed papers not yet scheduled
  let query = db
    .from('papers')
    .select('id, cluster_id, title, topic_id')
    .eq('review_status', 'reviewed')
    .is('published_at', null);

  // Avoid over-represented cluster if alternatives exist
  const { data: all } = await query;
  if (!all || all.length === 0) return null;

  const alternatives = all.filter(p => !overloaded.includes(p.cluster_id));
  const pool = alternatives.length > 0 ? alternatives : all;

  // Already scheduled IDs
  const { data: scheduled } = await db
    .from('paper_calendar')
    .select('paper_id')
    .neq('status', 'skipped');

  const scheduledIds = new Set((scheduled ?? []).map(s => s.paper_id));
  const unscheduled  = pool.filter(p => !scheduledIds.has(p.id));

  return unscheduled[0] ?? null;
}

// ─── SCHEDULE NEXT ────────────────────────────────────────────

export async function scheduleNextPaper(): Promise<{
  scheduled: boolean;
  publishDate?: string;
  paperTitle?: string;
  clusterId?: string;
}> {
  const [publishDate, balance] = await Promise.all([
    getNextPublishDate(),
    getClusterBalance(),
  ]);

  const paper = await selectNextPaper(balance);
  if (!paper) {
    return { scheduled: false };
  }

  const dateStr = publishDate.toISOString().split('T')[0];

  const { error } = await db.from('paper_calendar').insert({
    publish_date: dateStr,
    paper_id:     paper.id,
    cluster_id:   paper.cluster_id,
    status:       'scheduled',
  });

  if (error) {
    throw new Error(`Calendar insert failed: ${error.message}`);
  }

  return {
    scheduled:   true,
    publishDate: dateStr,
    paperTitle:  paper.title,
    clusterId:   paper.cluster_id,
  };
}

// ─── SCHEDULE WEEKS ──────────────────────────────────────────
// Pre-fills the calendar for N weeks ahead.

export async function scheduleWeeks(weeks = 4): Promise<{
  scheduled: number;
  dates: string[];
}> {
  const result = { scheduled: 0, dates: [] as string[] };
  const iterations = Math.floor((weeks * 7) / PUBLISH_INTERVAL_DAYS);

  for (let i = 0; i < iterations; i++) {
    const r = await scheduleNextPaper();
    if (!r.scheduled) break;
    result.scheduled++;
    if (r.publishDate) result.dates.push(r.publishDate);
  }

  return result;
}

// ─── TODAY'S PAPER ───────────────────────────────────────────
// Returns the paper scheduled for today or the closest
// upcoming date. Used by publish runner.

export async function getTodaysPaper(): Promise<{
  paperId?: string;
  title?: string;
  slug?: string;
  publishDate?: string;
  status?: string;
} | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await db
    .from('paper_calendar')
    .select(`
      publish_date, status, paper_id,
      papers (id, title, slug, review_status, body_markdown)
    `)
    .lte('publish_date', today)
    .eq('status', 'scheduled')
    .order('publish_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  const paper = Array.isArray(data.papers) ? data.papers[0] : data.papers;

  return {
    paperId:     paper?.id,
    title:       paper?.title,
    slug:        paper?.slug,
    publishDate: data.publish_date,
    status:      data.status,
  };
}

// ─── MARK PUBLISHED ──────────────────────────────────────────

export async function markPublished(
  paperId: string,
  publishedUrl: string
): Promise<void> {
  const now = new Date().toISOString();

  await Promise.all([
    db.from('paper_calendar')
      .update({ status: 'published', published_at: now, published_url: publishedUrl })
      .eq('paper_id', paperId),

    db.from('papers')
      .update({ review_status: 'published', published_at: now, published_url: publishedUrl })
      .eq('id', paperId),

    db.from('paper_topics')
      .update({ status: 'generated' })
      .eq('id',
          db.from('papers').select('topic_id').eq('id', paperId)
      ),
  ]);
}
