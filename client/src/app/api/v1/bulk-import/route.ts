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
    domain: string;
    confidence: number;
    tags: string[];
  }>;
  dryRun?: boolean;
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

    const supabase = initSupabaseAdmin();

    // Transform entries to DB format
    const dbEntries = entries.map((entry) => {
      const qHash = createHash('sha256').update(entry.question).digest('hex');
      const aHash = createHash('sha256').update(entry.answer).digest('hex');
      return {
        question: entry.question,
        answer: entry.answer,
        question_hash: qHash,
        answer_hash: aHash,
        source_url: entry.source_url,
        confidence: entry.confidence,
        tags: entry.tags,
        active: entry.confidence >= 0.7,
        published_at: new Date().toISOString(),
      };
    });

    // Bulk insert
    const { data, error } = await supabase
      .from('qa_entries')
      .insert(dbEntries)
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
