// /client/src/app/api/v1/scraper/batch/route.ts

import { NextRequest } from 'next/server';
import {
  verifyApiKey,
  errorResponse,
  successResponse,
  initSupabaseAdmin,
  parseRequestBody,
  generateRunId,
  log,
  withRetry,
} from '../_utils/auth';
import { EthicalWebScraper } from '@/lib/scraper/scraper';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const maxDuration = 300;  // 5 minutes for scraping batch

export async function POST(request: NextRequest) {
  const auth = verifyApiKey(request);
  if (!auth.valid) {
    log(`Batch failed: ${auth.error}`, 'error');
    return errorResponse(auth.error, 401);
  }

  try {
    // 1. Parse request
    const parsed = await parseRequestBody(request);
    if (!parsed.success) {
      return errorResponse(parsed.error || 'Invalid request', 400);
    }

    const { batchSize = 5, maxTier = 2 } = parsed.data || {};
    log(`Starting batch scrape: size=${batchSize}, maxTier=${maxTier}`);

    const supabase = initSupabaseAdmin();

    // 2. Create scrape run record
    const runId = generateRunId('batch');
    const { error: runError } = await supabase.from('scrape_runs').insert({
      run_id: runId,
      status: 'running',
      config: { batchSize, maxTier },
      pages_attempted: 0,
      pages_fetched: 0,
      pages_failed: 0,
    });

    if (runError) {
      log(`Failed to create run: ${runError.message}`, 'error');
      return errorResponse('Database error', 500);
    }

    // 3. Fetch next sources to scrape
    const { data: sources, error: sourceError } = await supabase
      .from('sources')
      .select('id, url, domain, tier, allowed')
      .eq('allowed', true)
      .lte('tier', maxTier)
      .is('last_crawled_at', null)  // Never crawled
      .order('tier', { ascending: true })
      .limit(batchSize);

    if (sourceError) {
      log(`Failed to fetch sources: ${sourceError.message}`, 'error');
      return errorResponse('Database error', 500);
    }

    if (!sources || sources.length === 0) {
      log('No sources available to scrape');
      await supabase
        .from('scrape_runs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('run_id', runId);

      return successResponse({
        status: 'OK',
        message: 'No sources available',
        runId,
      });
    }

    log(`Fetched ${sources.length} sources to scrape`);

    // 4. Initialize scraper
    const scraper = new EthicalWebScraper({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      rateLimitSeconds: 2,
      userAgent: 'Mozilla/5.0 (compatible; YachtInsuranceBot/1.0; +https://www.myyachtsinsurance.com/bot)',
      timeoutSeconds: 15,
      cacheDir: '/tmp/yacht-scraper',
    });

    // 5. Scrape each source
    let fetched = 0;
    let failed = 0;

    for (const source of sources) {
      try {
        log(`Scraping: ${source.domain}`);

        const scraped = await scraper.fetch(source.url);
        if (!scraped) {
          log(`Failed to scrape ${source.url}`, 'warn');
          failed++;
          continue;
        }

        // 6. Store raw page
        const contentHash = crypto
          .createHash('sha256')
          .update(scraped.content)
          .digest('hex');

        // Check if we've already cached this exact content
        const { data: existing } = await supabase
          .from('raw_pages')
          .select('id')
          .eq('content_hash', contentHash)
          .single();

        if (existing) {
          log(`Content already cached for ${source.url}, skipping`);
          continue;
        }

        const { error: pageError } = await supabase.from('raw_pages').insert({
          run_id: runId,
          source_id: source.id,
          url: source.url,
          canonical_url: source.url,
          status_code: 200,
          content_hash: contentHash,
          excerpt: scraped.content.substring(0, 500),
          full_content: scraped.content,
          title: scraped.title || 'Untitled',
          robots_allowed: true,
          extraction_status: 'pending',
        });

        if (pageError) {
          log(`Failed to store page: ${pageError.message}`, 'error');
          failed++;
          continue;
        }

        fetched++;
        log(`✓ Stored: ${source.domain}`);

        // Update source last_crawled_at
        await supabase
          .from('sources')
          .update({
            last_crawled_at: new Date().toISOString(),
          })
          .eq('id', source.id);
      } catch (error) {
        log(`Error scraping ${source.url}: ${String(error)}`, 'error');
        failed++;
      }
    }

    // 7. Update scrape run with results
    await supabase
      .from('scrape_runs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        pages_attempted: sources.length,
        pages_fetched: fetched,
        pages_failed: failed,
      })
      .eq('run_id', runId);

    log(`Batch complete: ${fetched} fetched, ${failed} failed`);

    return successResponse({
      status: 'success',
      runId,
      message: `Scraped ${fetched} sources`,
      stats: {
        attempted: sources.length,
        fetched,
        failed,
        successRate: `${((fetched / sources.length) * 100).toFixed(1)}%`,
      },
      nextStep: 'Run /api/v1/scraper/extract to extract Q&A',
    });
  } catch (error) {
    log(`Unexpected error: ${String(error)}`, 'error');
    return errorResponse('Server error', 500, { error: String(error) });
  }
}
