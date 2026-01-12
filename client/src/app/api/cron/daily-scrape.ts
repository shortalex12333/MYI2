// /api/cron/daily-scrape.ts
// Vercel Cron Job: Runs daily to scrape and collect yacht insurance content

import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const apiKey = process.env.SCRAPER_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    console.log('[CRON] Starting daily scraping job');

    // 1. Batch scrape (large batch)
    console.log('[CRON] Running batch scrape...');
    const batchResponse = await fetch(`${baseUrl}/api/v1/scraper/batch`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        batchSize: 20,
        maxTier: 6,
      }),
    });

    const batchData = await batchResponse.json();
    const fetched = batchData.stats?.fetched || 0;
    console.log(`[CRON] Batch complete: ${fetched} pages fetched`);

    if (fetched === 0) {
      console.log('[CRON] No new sources - all crawled recently');
      return new Response(
        JSON.stringify({ status: 'ok', message: 'No new sources available' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Extract Q&A
    console.log('[CRON] Extracting Q&A...');
    const extractResponse = await fetch(`${baseUrl}/api/v1/scraper/extract`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const extractData = await extractResponse.json();
    const extracted = extractData.stats?.totalQAExtracted || 0;
    const approved = extractData.stats?.candidatesApproved || 0;
    console.log(
      `[CRON] Extraction complete: ${extracted} extracted, ${approved} approved`
    );

    // 3. Publish approved entries
    console.log('[CRON] Publishing...');
    const publishResponse = await fetch(`${baseUrl}/api/v1/scraper/publish`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const publishData = await publishResponse.json();
    const published = publishData.published || 0;
    console.log(`[CRON] Published ${published} new entries`);

    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'Daily scraping job completed',
        results: {
          pagesScraped: fetched,
          qaExtracted: extracted,
          approved,
          published,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[CRON] Error:', error);
    return new Response(
      JSON.stringify({
        status: 'error',
        message: String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
