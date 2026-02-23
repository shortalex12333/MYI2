// /api/v1/bulk-import/route.ts
// Bulk import Q&A pairs from CSV/JSON

import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { initSupabaseAdmin, verifyApiKey, log } from '../scraper/_utils/auth';

export const runtime = 'nodejs';
export const maxDuration = 300;

interface ImportPayload {
  entries: Array<{
    question: string;
    answer: string;
    source_url: string;
    source_type?: string;
    confidence: number;
    tags: string[];
    entities?: Record<string, unknown>;
  }>;
  dryRun?: boolean;
}

/**
 * Extract domain (hostname) from a URL
 */
function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const auth = verifyApiKey(request);
  if (!auth.valid) {
    return new Response(JSON.stringify({ error: auth.error }), { status: 401 });
  }

  try {
    const body = (await request.json()) as ImportPayload;
    const { entries, dryRun } = body;

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No entries provided' }),
        { status: 400 }
      );
    }

    log(`Bulk import: ${entries.length} entries (dryRun=${dryRun})`);

    if (dryRun) {
      return new Response(
        JSON.stringify({
          status: 'dry_run',
          message: `Would import ${entries.length} entries`,
          preview: entries.slice(0, 3),
        }),
        { status: 200 }
      );
    }

    // Use the passed API key (from x-api-key header) as the service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured: Missing SUPABASE_URL' }),
        { status: 500 }
      );
    }

    // Use createClient from @supabase/supabase-js instead of createServerClient
    // This avoids cookie management issues in API routes
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, auth.key!);

    // Alternative: use initSupabaseAdmin if env vars are available
    // const supabase = initSupabaseAdmin();

    // Transform entries to DB format
    const dbEntries = entries.map((entry) => {
      const qHash = createHash('sha256').update(entry.question).digest('hex');
      const aHash = createHash('sha256').update(entry.answer).digest('hex');
      const domain = extractDomain(entry.source_url);
      return {
        question: entry.question,
        answer: entry.answer,
        question_hash: qHash,
        answer_hash: aHash,
        source_url: entry.source_url,
        source_type: entry.source_type || 'guide',
        domain,
        confidence: entry.confidence,
        tags: entry.tags,
        entities: entry.entities || null,
        active: entry.confidence >= 0.7,
        published_at: new Date().toISOString(),
      };
    });

    // Bulk upsert - update on question_hash conflict
    const { data, error } = await supabase
      .from('qa_entries')
      .upsert(dbEntries, {
        onConflict: 'question_hash',
        ignoreDuplicates: false,
      })
      .select('id');

    if (error) {
      log(`Import failed: ${error.message}`, 'error');
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    const importedCount = data?.length || 0;
    log(`✓ Imported ${importedCount} entries`);

    return new Response(
      JSON.stringify({
        status: 'success',
        imported: importedCount,
        total: entries.length,
        message: `Successfully imported ${importedCount}/${entries.length} entries`,
      }),
      { status: 200 }
    );
  } catch (error) {
    log(`Import error: ${String(error)}`, 'error');
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500 }
    );
  }
}
