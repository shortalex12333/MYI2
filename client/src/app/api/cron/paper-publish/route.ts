// /api/cron/paper-publish/route.ts
// Vercel Cron Job: Publishes scheduled papers at randomized business hours (7am-6pm)

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Business hours config
const BUSINESS_START = 7;  // 7am
const BUSINESS_END = 18;   // 6pm

// Generate deterministic "random" hour for a paper based on its ID
function getPublishHour(paperId: string, dateStr: string): number {
  // Simple hash: sum of char codes
  const seed = `${paperId}-${dateStr}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Map to business hours (7-18)
  const hour = BUSINESS_START + Math.abs(hash % (BUSINESS_END - BUSINESS_START + 1));
  return hour;
}

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[PAPER-CRON] Missing Supabase credentials');
    return new Response(
      JSON.stringify({ status: 'error', message: 'Missing credentials' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get current date and hour in UTC (adjust for your timezone if needed)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentHour = now.getUTCHours(); // Use UTC or adjust: now.getHours() for local

    console.log(`[PAPER-CRON] Running at ${now.toISOString()}, hour=${currentHour}`);

    // 1. Get today's scheduled (unpublished) papers
    const { data: scheduled, error: fetchError } = await supabase
      .from('paper_calendar')
      .select('*, papers(id, title, slug, review_status)')
      .eq('publish_date', todayStr)
      .eq('status', 'scheduled');

    if (fetchError) {
      console.error('[PAPER-CRON] Fetch error:', fetchError.message);
      return new Response(
        JSON.stringify({ status: 'error', message: fetchError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!scheduled || scheduled.length === 0) {
      console.log('[PAPER-CRON] No papers scheduled for today');
      // Don't return early — still need to check topics and QA below
    }

    console.log(`[PAPER-CRON] Found ${scheduled?.length || 0} paper(s) scheduled for ${todayStr}`);

    // 2. Check each paper's publish hour
    const results: Array<{
      title: string;
      slug: string;
      publishHour: number;
      action: string;
    }> = [];

    for (const entry of (scheduled || [])) {
      const paper = entry.papers;
      if (!paper) {
        console.warn(`[PAPER-CRON] No paper found for calendar entry ${entry.id}`);
        continue;
      }

      // Skip if paper isn't reviewed
      if (paper.review_status !== 'reviewed') {
        console.log(`[PAPER-CRON] Skipping ${paper.slug}: status=${paper.review_status}`);
        results.push({
          title: paper.title,
          slug: paper.slug,
          publishHour: -1,
          action: `skipped (status=${paper.review_status})`
        });
        continue;
      }

      // Get this paper's assigned publish hour
      const publishHour = getPublishHour(paper.id, todayStr);

      if (currentHour >= publishHour) {
        // Time to publish!
        console.log(`[PAPER-CRON] Publishing ${paper.slug} (hour ${publishHour} <= ${currentHour})`);

        // Update calendar entry
        const { error: calendarError } = await supabase
          .from('paper_calendar')
          .update({
            status: 'published',
            published_at: now.toISOString(),
            published_url: `/papers/${paper.slug}`,
            notes: `Auto-published at hour ${currentHour} (scheduled for ${publishHour})`
          })
          .eq('id', entry.id);

        if (calendarError) {
          console.error(`[PAPER-CRON] Calendar update error: ${calendarError.message}`);
          results.push({
            title: paper.title,
            slug: paper.slug,
            publishHour,
            action: `error: ${calendarError.message}`
          });
          continue;
        }

        // Update paper status to published
        const { error: paperError } = await supabase
          .from('papers')
          .update({
            review_status: 'published',
            published_at: now.toISOString(),
            last_updated: now.toISOString()
          })
          .eq('id', paper.id);

        if (paperError) {
          console.error(`[PAPER-CRON] Paper update error: ${paperError.message}`);
        }

        results.push({
          title: paper.title,
          slug: paper.slug,
          publishHour,
          action: 'published'
        });
      } else {
        // Not time yet
        console.log(`[PAPER-CRON] Waiting for ${paper.slug} (hour ${publishHour} > ${currentHour})`);
        results.push({
          title: paper.title,
          slug: paper.slug,
          publishHour,
          action: `waiting (publishes at ${publishHour}:00)`
        });
      }
    }

    const published = results.filter(r => r.action === 'published').length;
    const waiting = results.filter(r => r.action.startsWith('waiting')).length;

    console.log(`[PAPER-CRON] Papers: ${published} published, ${waiting} waiting`);

    // ─── TOPICS + QA SCHEDULED PUBLISHING ──────────────────────
    // Calendar entries with paper_id = null use notes field:
    //   notes = "topic:{uuid}" or "qa:{id}"
    const { data: contentScheduled } = await supabase
      .from('paper_calendar')
      .select('id, notes, publish_date')
      .eq('publish_date', todayStr)
      .eq('status', 'scheduled')
      .is('paper_id', null);

    let topicsPublished = 0;
    let qaPublished = 0;

    for (const entry of (contentScheduled || [])) {
      const notes = entry.notes || '';

      if (notes.startsWith('topic:')) {
        const topicId = notes.slice(6);
        const { error: topicErr } = await supabase
          .from('consumer_topics')
          .update({ status: 'published', last_updated: now.toISOString() })
          .eq('id', topicId)
          .eq('status', 'draft');

        if (!topicErr) {
          await supabase.from('paper_calendar')
            .update({ status: 'published', published_at: now.toISOString() })
            .eq('id', entry.id);
          topicsPublished++;
          console.log(`[CRON] Published topic ${topicId}`);
        }
      } else if (notes.startsWith('qa:')) {
        const qaId = notes.slice(3);
        const { error: qaErr } = await supabase
          .from('qa_candidates')
          .update({ publish_status: 'published' })
          .eq('id', qaId)
          .eq('publish_status', 'drafted');

        if (!qaErr) {
          await supabase.from('paper_calendar')
            .update({ status: 'published', published_at: now.toISOString() })
            .eq('id', entry.id);
          qaPublished++;
          console.log(`[CRON] Published QA ${qaId}`);
        }
      }
    }

    console.log(`[CRON] Complete: ${published} papers, ${topicsPublished} topics, ${qaPublished} QA published`);

    return new Response(
      JSON.stringify({
        status: 'success',
        date: todayStr,
        currentHour,
        summary: {
          total: (scheduled?.length || 0) + (contentScheduled?.length || 0),
          papers: published,
          topics: topicsPublished,
          qa: qaPublished,
          waiting
        },
        papers: results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[PAPER-CRON] Unexpected error:', error);
    return new Response(
      JSON.stringify({ status: 'error', message: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
