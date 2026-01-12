// /client/src/app/api/v1/scraper/init/route.ts

import { NextRequest } from 'next/server';
import {
  verifyApiKey,
  errorResponse,
  successResponse,
  initSupabaseAdmin,
  log,
} from '../_utils/auth';
import { prioritizedSources } from '@/lib/scraper/sources';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // 1. Verify API key
  const auth = verifyApiKey(request);
  if (!auth.valid) {
    log(`Init failed: ${auth.error}`, 'error');
    return errorResponse(auth.error, 401);
  }

  try {
    log('Initializing sources from prioritized list...');
    const supabase = initSupabaseAdmin();

    // 2. Fetch existing sources to avoid duplicates
    const { data: existing, error: fetchError } = await supabase
      .from('sources')
      .select('url');

    if (fetchError) {
      log(`Failed to fetch existing sources: ${fetchError.message}`, 'error');
      return errorResponse('Database error', 500);
    }

    const existingUrls = new Set((existing || []).map(s => s.url));

    // 3. Filter sources that don't exist
    const newSources = prioritizedSources.filter(
      s => !existingUrls.has(s.url)
    );

    log(`Found ${newSources.length} new sources to add (${existingUrls.size} already exist)`);

    if (newSources.length === 0) {
      return successResponse({
        status: 'OK',
        message: 'All sources already initialized',
        totalSources: existingUrls.size,
        newSources: 0,
      });
    }

    // 4. Insert new sources
    const sourcesForDb = newSources.map(source => ({
      url: source.url,
      domain: source.domain,
      base_url: source.url,  // Use URL as base for now
      tier: source.priority,
      source_type: source.sourceType,
      allowed: true,
      notes: `Auto-seeded from prioritized sources`,
      crawl_frequency_days: source.crawlFrequencyDays,
      robots_txt_compliant: true,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('sources')
      .insert(sourcesForDb)
      .select('id, url, tier, domain');

    if (insertError) {
      log(`Insert failed: ${insertError.message}`, 'error');
      return errorResponse('Failed to insert sources', 500);
    }

    log(`Successfully initialized ${inserted?.length || 0} sources`);

    // 5. Return summary
    const tierCounts = (inserted || []).reduce((acc, s) => {
      const tier = s.tier || 5;
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return successResponse({
      status: 'success',
      message: 'Sources initialized',
      initialized: inserted?.length || 0,
      totalSources: existingUrls.size + (inserted?.length || 0),
      tierBreakdown: tierCounts,
      examples: inserted?.slice(0, 3).map(s => ({
        domain: s.domain,
        tier: s.tier,
      })),
    });
  } catch (error) {
    log(`Unexpected error: ${String(error)}`, 'error');
    return errorResponse('Server error', 500, { error: String(error) });
  }
}
