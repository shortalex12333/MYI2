/**
 * Admin API: Import Keywords
 *
 * POST /api/admin/import-keywords
 *
 * Triggers keyword import from expanded-queries.tsv into keyword_queue.
 * Requires service key authentication for security.
 *
 * Query Parameters:
 *   force=true    Re-import all keywords (default: skip duplicates)
 *
 * Phase 02-03: Keyword Import
 */

import { NextRequest } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { importFromTsv } from '@/lib/keyword-queue/keyword-importer';

/**
 * POST handler for keyword import
 */
export async function POST(request: NextRequest) {
  // 1. Verify service key authentication
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;

  if (!authHeader || authHeader !== expectedAuth) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Valid service key required',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // 2. Get options from query parameters
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    // 3. Load TSV file from project root
    const tsvPath = path.resolve(process.cwd(), 'expanded-queries.tsv');

    if (!fs.existsSync(tsvPath)) {
      return new Response(
        JSON.stringify({
          error: 'File not found',
          message: `TSV file not found at: ${tsvPath}`,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const tsvContent = fs.readFileSync(tsvPath, 'utf-8');

    // 4. Run import
    console.log(`[IMPORT-API] Starting import (force=${force})`);
    const startTime = Date.now();
    const result = await importFromTsv(tsvContent, { dryRun: false });
    const duration = Date.now() - startTime;

    // 5. Return summary
    return Response.json({
      success: true,
      summary: {
        total: result.total,
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
        durationMs: duration,
      },
      breakdown: {
        byPipeline: result.byPipeline,
        byCluster: result.byCluster,
      },
    });
  } catch (error) {
    console.error('[IMPORT-API] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Import failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
