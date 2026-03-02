// /api/cron/keyword-queue/route.ts
// Vercel Cron Job: Processes 1 keyword per hour from priority queue

import { NextRequest } from 'next/server';
import { processNextKeyword, failKeyword } from '@/lib/keyword-queue/queue-processor';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[KEYWORD-QUEUE] Unauthorized access attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  console.log(`[KEYWORD-QUEUE] Starting run at ${new Date().toISOString()}`);

  try {
    let attempt = 0;
    const maxAttempts = 3;
    let lastResult = null;

    // Try up to 3 times to find and process a keyword
    while (attempt < maxAttempts) {
      attempt++;

      const result = await processNextKeyword();
      lastResult = result;

      if (!result.success) {
        console.error(`[KEYWORD-QUEUE] Attempt ${attempt} failed:`, result.error);

        // If we have a keyword ID, mark it as failed
        if (result.keywordId && result.error) {
          await failKeyword(result.keywordId, result.error);
        }

        // If it's a lock failure, another job might have taken it - try again
        if (result.error?.includes('lock')) {
          console.log(`[KEYWORD-QUEUE] Lock conflict, retrying (attempt ${attempt}/${maxAttempts})`);
          continue;
        }

        // Other errors - stop trying
        break;
      }

      // Success case
      if (result.keyword && result.pipeline) {
        const duration = Date.now() - startTime;
        console.log(
          `[KEYWORD-QUEUE] Selected: ${result.keyword} (priority: calculated, pipeline: ${result.pipeline})`
        );
        console.log(`[KEYWORD-QUEUE] Complete: success in ${duration}ms`);

        return new Response(
          JSON.stringify({
            status: 'success',
            keyword: result.keyword,
            keywordId: result.keywordId,
            pipeline: result.pipeline,
            attempt,
            duration
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // No eligible keywords found
      if (result.error === 'No eligible keywords') {
        const duration = Date.now() - startTime;
        console.log(`[KEYWORD-QUEUE] No eligible keywords (checked in ${duration}ms)`);

        return new Response(
          JSON.stringify({
            status: 'ok',
            message: 'No eligible keywords at this time',
            reason: 'Queue empty, cluster diversity limit, or weekly rate limit',
            duration
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Unexpected success state without keyword - shouldn't happen but handle it
      break;
    }

    // If we exhausted retries
    const duration = Date.now() - startTime;
    console.log(`[KEYWORD-QUEUE] Failed after ${attempt} attempts in ${duration}ms`);

    return new Response(
      JSON.stringify({
        status: 'error',
        message: `Failed after ${attempt} attempts`,
        lastError: lastResult?.error || 'Unknown error',
        duration
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[KEYWORD-QUEUE] Unexpected error:', error);

    return new Response(
      JSON.stringify({
        status: 'error',
        message: String(error),
        duration
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
