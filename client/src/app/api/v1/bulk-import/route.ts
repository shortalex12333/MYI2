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

    // Transform entries to DB format with hashes
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

    // Look up which entries already exist by EITHER unique constraint:
    // 1. (question_hash, answer_hash) — exact duplicate
    // 2. (source_url, question_hash) — same question from same source, answer may differ
    const LOOKUP_BATCH = 100;
    const existingByQA = new Set<string>();       // question_hash:answer_hash
    const existingBySource = new Set<string>();   // source_url:question_hash

    for (let i = 0; i < dbEntries.length; i += LOOKUP_BATCH) {
      const batch = dbEntries.slice(i, i + LOOKUP_BATCH);

      // Check constraint 1: question_hash + answer_hash
      const qaFilter = batch
        .map((h) => `and(question_hash.eq.${h.question_hash},answer_hash.eq.${h.answer_hash})`)
        .join(',');
      const { data: foundQA } = await supabase
        .from('qa_entries')
        .select('question_hash, answer_hash, source_url')
        .or(qaFilter);
      if (foundQA) {
        for (const row of foundQA) {
          existingByQA.add(`${row.question_hash}:${row.answer_hash}`);
          existingBySource.add(`${row.source_url}:${row.question_hash}`);
        }
      }

      // Check constraint 2: source_url + question_hash (catches answer updates)
      const srcFilter = batch
        .map((h) => `and(source_url.eq.${h.source_url},question_hash.eq.${h.question_hash})`)
        .join(',');
      const { data: foundSrc } = await supabase
        .from('qa_entries')
        .select('question_hash, answer_hash, source_url')
        .or(srcFilter);
      if (foundSrc) {
        for (const row of foundSrc) {
          existingBySource.add(`${row.source_url}:${row.question_hash}`);
        }
      }
    }

    // Split: existing by either constraint → update; truly new → insert
    const newEntries: typeof dbEntries = [];
    const updateEntries: typeof dbEntries = [];
    for (const entry of dbEntries) {
      const qaKey = `${entry.question_hash}:${entry.answer_hash}`;
      const srcKey = `${entry.source_url}:${entry.question_hash}`;
      if (existingByQA.has(qaKey) || existingBySource.has(srcKey)) {
        updateEntries.push(entry);
      } else {
        newEntries.push(entry);
      }
    }

    let insertedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // INSERT new entries in batches
    const INSERT_BATCH = 500;
    for (let i = 0; i < newEntries.length; i += INSERT_BATCH) {
      const batch = newEntries.slice(i, i + INSERT_BATCH);
      const { data: inserted, error: insertErr } = await supabase
        .from('qa_entries')
        .insert(batch)
        .select('id');
      if (insertErr) {
        errors.push(`Insert batch ${i}: ${insertErr.message}`);
        log(`Insert batch failed: ${insertErr.message}`, 'error');
      } else {
        insertedCount += inserted?.length || 0;
      }
    }

    // UPDATE existing entries — only answer, confidence, tags, entities
    // Match by source_url + question_hash (handles both same and different answers)
    // Preserves created_at and other original fields
    const UPDATE_BATCH = 50;
    for (let i = 0; i < updateEntries.length; i += UPDATE_BATCH) {
      const batch = updateEntries.slice(i, i + UPDATE_BATCH);
      for (const entry of batch) {
        const { error: updateErr } = await supabase
          .from('qa_entries')
          .update({
            answer: entry.answer,
            answer_hash: entry.answer_hash,
            confidence: entry.confidence,
            tags: entry.tags,
            entities: entry.entities,
            active: entry.confidence >= 0.7,
          })
          .eq('source_url', entry.source_url)
          .eq('question_hash', entry.question_hash);
        if (updateErr) {
          errors.push(`Update ${entry.question_hash.slice(0, 8)}: ${updateErr.message}`);
          log(`Update failed: ${updateErr.message}`, 'error');
        } else {
          updatedCount++;
        }
      }
    }

    log(`✓ Inserted ${insertedCount} new, updated ${updatedCount} existing`);
    if (errors.length > 0) {
      log(`⚠ ${errors.length} errors during import`, 'warn');
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        inserted: insertedCount,
        updated: updatedCount,
        total: entries.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Imported ${insertedCount} new + updated ${updatedCount} existing out of ${entries.length} entries${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
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
