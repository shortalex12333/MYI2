// /client/src/app/api/v1/scraper/publish/route.ts

import { NextRequest } from 'next/server';
import {
  verifyApiKey,
  errorResponse,
  successResponse,
  initSupabaseAdmin,
  parseRequestBody,
  log,
} from '../_utils/auth';

export const runtime = 'nodejs';

interface PublishRequest {
  filter?: {
    minConfidence?: number;
    tags?: string[];
    noFlags?: boolean;  // Publish only candidates with no quality flags
  };
  dryRun?: boolean;
}

export async function POST(request: NextRequest) {
  const auth = verifyApiKey(request);
  if (!auth.valid) {
    log(`Publish failed: ${auth.error}`, 'error');
    return errorResponse(auth.error, 401);
  }

  try {
    // 1. Parse request
    const parsed = await parseRequestBody(request);
    if (!parsed.success) {
      return errorResponse(parsed.error || 'Invalid request', 400);
    }

    const req: PublishRequest = parsed.data || {};
    const dryRun = req.dryRun === true;

    log(`Publish request: dryRun=${dryRun}, filter=${JSON.stringify(req.filter)}`);

    const supabase = initSupabaseAdmin();

    // 2. Build query for candidates to publish
    let query = supabase
      .from('qa_candidates')
      .select('*')
      .in('review_status', ['approved', 'pending']);

    // Apply filters
    if (req.filter?.minConfidence) {
      query = query.gte('confidence', req.filter.minConfidence);
    }

    if (req.filter?.noFlags) {
      // Only candidates with empty quality_flags array
      // This requires a raw query or fetch and filter in app
      // For now, we'll fetch and filter in-app
    }

    const { data: candidates, error: fetchError } = await query;

    if (fetchError) {
      log(`Failed to fetch candidates: ${fetchError.message}`, 'error');
      return errorResponse('Database error', 500);
    }

    if (!candidates || candidates.length === 0) {
      log('No candidates to publish');
      return successResponse({
        status: 'OK',
        message: 'No candidates matching filter',
        published: 0,
      });
    }

    // Filter in-app if needed
    let filtered = candidates;
    if (req.filter?.tags && req.filter.tags.length > 0) {
      filtered = candidates.filter(c =>
        c.tags?.some((tag: string) => req.filter!.tags!.includes(tag))
      );
    }

    if (req.filter?.noFlags) {
      filtered = filtered.filter(
        c => !c.quality_flags || c.quality_flags.length === 0
      );
    }

    log(`Found ${filtered.length}/${candidates.length} candidates to publish`);

    if (filtered.length === 0) {
      return successResponse({
        status: 'OK',
        message: 'No candidates matching filters',
        published: 0,
      });
    }

    // 3. Dry run: just return what would be published
    if (dryRun) {
      return successResponse({
        status: 'dry_run',
        message: `Would publish ${filtered.length} entries`,
        wouldPublish: filtered.map(c => ({
          id: c.id,
          question: c.question.substring(0, 50),
          confidence: c.confidence,
          flags: c.quality_flags,
        })),
        nextStep: 'Remove dryRun=true to actually publish',
      });
    }

    // 4. Publish each candidate
    let published = 0;
    const publishErrors: string[] = [];

    for (const candidate of filtered) {
      try {
        // Check if already published
        const { data: existing } = await supabase
          .from('qa_entries')
          .select('id')
          .eq('question_hash', candidate.question_hash)
          .single();

        if (existing) {
          log(`Skipping already-published: ${candidate.id}`, 'warn');
          continue;
        }

        // Create entry
        const { error: insertError } = await supabase
          .from('qa_entries')
          .insert({
            source_url: candidate.source_url,
            question: candidate.question,
            answer: candidate.answer,
            question_hash: candidate.question_hash,
            answer_hash: candidate.answer_hash,
            tags: candidate.tags,
            confidence: candidate.confidence,
            entities: candidate.entities,
            active: true,
            published_at: new Date().toISOString(),
          });

        if (insertError) {
          publishErrors.push(`${candidate.id}: ${insertError.message}`);
          continue;
        }

        // Log review
        await supabase.from('qa_reviews').insert({
          qa_candidate_id: candidate.id,
          action: 'approved',
          reason: 'Bulk publish',
          reviewer_email: 'system@myyachtsinsurance.com',
        });

        published++;
      } catch (error) {
        publishErrors.push(`${candidate.id}: ${String(error)}`);
      }
    }

    log(`Published ${published}/${filtered.length} entries`);

    return successResponse({
      status: 'success',
      message: `Published ${published} entries`,
      published,
      total: filtered.length,
      errors: publishErrors.length > 0 ? publishErrors : undefined,
      nextStep: 'View published entries at /knowledge',
    });
  } catch (error) {
    log(`Unexpected error: ${String(error)}`, 'error');
    return errorResponse('Server error', 500, { error: String(error) });
  }
}
