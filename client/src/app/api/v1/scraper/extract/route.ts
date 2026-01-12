// /client/src/app/api/v1/scraper/extract/route.ts

import { NextRequest } from 'next/server';
import {
  verifyApiKey,
  errorResponse,
  successResponse,
  initSupabaseAdmin,
  parseRequestBody,
  log,
} from '../_utils/auth';
import { QAExtractionPipeline } from '@/lib/scraper/qa-extraction';
import { validateCandidateBatch, hashContent } from '@/lib/scraper/quality-gates';

export const runtime = 'nodejs';
export const maxDuration = 300;  // 5 minutes for extraction

export async function POST(request: NextRequest) {
  const auth = verifyApiKey(request);
  if (!auth.valid) {
    log(`Extract failed: ${auth.error}`, 'error');
    return errorResponse(auth.error, 401);
  }

  try {
    // 1. Parse request
    const parsed = await parseRequestBody(request);
    if (!parsed.success) {
      return errorResponse(parsed.error || 'Invalid request', 400);
    }

    const { runId, limit = 10 } = parsed.data || {};
    log(`Starting extraction: runId=${runId}, limit=${limit}`);

    const supabase = initSupabaseAdmin();

    // 2. Fetch pending raw pages
    let query = supabase
      .from('raw_pages')
      .select('id, run_id, source_id, url, full_content, sources(url)')
      .eq('extraction_status', 'pending')
      .limit(limit);

    if (runId) {
      query = query.eq('run_id', runId);
    }

    const { data: pages, error: pageError } = await query;

    if (pageError) {
      log(`Failed to fetch pages: ${pageError.message}`, 'error');
      return errorResponse('Database error', 500);
    }

    if (!pages || pages.length === 0) {
      log('No pending pages to extract');
      return successResponse({
        status: 'OK',
        message: 'No pending pages',
        extracted: 0,
      });
    }

    log(`Fetching ${pages.length} pages for extraction`);

    // 3. Fetch existing questions for dedup check
    const { data: existingQA } = await supabase
      .from('qa_candidates')
      .select('question')
      .eq('review_status', 'pending');

    const existingQuestions = (existingQA || []).map(q => q.question);

    // 4. Initialize extraction pipeline
    const extractor = new QAExtractionPipeline(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 5. Extract Q&A from each page
    let totalExtracted = 0;
    let totalApproved = 0;
    const extractionErrors: string[] = [];

    for (const page of pages) {
      try {
        log(`Extracting from ${page.url}`);

        // Run extraction
        const qaEntries = await extractor.processSnapshot(
          page.id,
          page.full_content || '',
          page.url
        );

        if (!qaEntries || qaEntries.length === 0) {
          log(`  No Q&A extracted`, 'warn');
          await supabase
            .from('raw_pages')
            .update({ extraction_status: 'skipped' })
            .eq('id', page.id);
          continue;
        }

        log(`  Extracted ${qaEntries.length} raw Q&A entries`);

        // 6. Validate candidates against quality gates
        const validated = validateCandidateBatch(qaEntries, existingQuestions);
        const approved = validated.filter(c => c.isApproved);

        log(`  Validated: ${approved.length}/${validated.length} approved`);

        // 7. Store approved candidates
        const candidatesForDb = approved.map(candidate => ({
          run_id: page.run_id,
          raw_page_id: page.id,
          source_url: page.url,
          question: candidate.question,
          answer: candidate.answer,
          question_hash: candidate.questionHash,
          answer_hash: candidate.answerHash,
          tags: candidate.tags,
          confidence: candidate.confidence,
          extraction_method: candidate.extractionMethod,
          entities: JSON.stringify(candidate.entities || []),
          quality_flags: candidate.qualityFlags,
          review_status: 'pending',
        }));

        if (candidatesForDb.length > 0) {
          const { error: insertError } = await supabase
            .from('qa_candidates')
            .insert(candidatesForDb);

          if (insertError) {
            log(`Failed to insert candidates: ${insertError.message}`, 'error');
            extractionErrors.push(`${page.url}: ${insertError.message}`);
          } else {
            totalApproved += approved.length;
            log(`  ✓ Stored ${approved.length} candidates`);
          }
        }

        totalExtracted += qaEntries.length;

        // Mark page as extracted
        await supabase
          .from('raw_pages')
          .update({
            extraction_status: 'extracted',
            extraction_error: null,
          })
          .eq('id', page.id);
      } catch (error) {
        const errorMsg = String(error);
        log(`Error extracting from ${page.url}: ${errorMsg}`, 'error');
        extractionErrors.push(`${page.url}: ${errorMsg}`);

        await supabase
          .from('raw_pages')
          .update({
            extraction_status: 'failed',
            extraction_error: errorMsg,
          })
          .eq('id', page.id);
      }
    }

    log(`Extraction complete: ${totalExtracted} raw, ${totalApproved} approved`);

    return successResponse({
      status: 'success',
      message: `Extraction complete`,
      stats: {
        pagesProcessed: pages.length,
        totalQAExtracted: totalExtracted,
        candidatesApproved: totalApproved,
        successRate: `${((totalApproved / totalExtracted || 0) * 100).toFixed(1)}%`,
      },
      errors: extractionErrors.length > 0 ? extractionErrors : undefined,
      nextStep: 'Review pending candidates at /admin/qa-review',
    });
  } catch (error) {
    log(`Unexpected error: ${String(error)}`, 'error');
    return errorResponse('Server error', 500, { error: String(error) });
  }
}
