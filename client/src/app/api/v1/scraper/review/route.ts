// /client/src/app/api/v1/scraper/review/route.ts

import { NextRequest } from 'next/server';
import {
  verifyApiKey,
  errorResponse,
  successResponse,
  initSupabaseAdmin,
  parseRequestBody,
  validateRequired,
  log,
} from '../_utils/auth';
import { hashContent } from '@/lib/scraper/quality-gates';

export const runtime = 'nodejs';

interface ReviewRequest {
  candidateId: number;
  action: 'approve' | 'reject' | 'edit';
  reason?: string;
  editedQuestion?: string;
  editedAnswer?: string;
}

export async function POST(request: NextRequest) {
  const auth = verifyApiKey(request);
  if (!auth.valid) {
    log(`Review failed: ${auth.error}`, 'error');
    return errorResponse(auth.error, 401);
  }

  try {
    // 1. Parse request
    const parsed = await parseRequestBody(request);
    if (!parsed.success) {
      return errorResponse(parsed.error || 'Invalid request', 400);
    }

    const req: ReviewRequest = parsed.data;

    // Validate required fields
    const validation = validateRequired(req, ['candidateId', 'action']);
    if (!validation.valid) {
      return errorResponse(validation.errors?.join(', '), 400);
    }

    log(`Reviewing candidate ${req.candidateId}: ${req.action}`);

    const supabase = initSupabaseAdmin();

    // 2. Fetch candidate
    const { data: candidate, error: fetchError } = await supabase
      .from('qa_candidates')
      .select('*')
      .eq('id', req.candidateId)
      .single();

    if (fetchError || !candidate) {
      log(`Candidate not found: ${req.candidateId}`, 'error');
      return errorResponse('Candidate not found', 404);
    }

    if (candidate.review_status !== 'pending') {
      return errorResponse(
        `Candidate already ${candidate.review_status}`,
        400
      );
    }

    // 3. Handle action
    if (req.action === 'approve') {
      return await handleApprove(supabase, candidate, req);
    } else if (req.action === 'reject') {
      return await handleReject(supabase, candidate, req);
    } else if (req.action === 'edit') {
      return await handleEdit(supabase, candidate, req);
    }

    return errorResponse('Unknown action', 400);
  } catch (error) {
    log(`Unexpected error: ${String(error)}`, 'error');
    return errorResponse('Server error', 500, { error: String(error) });
  }
}

/**
 * Approve a candidate: move to qa_entries, mark active
 */
async function handleApprove(
  supabase: any,
  candidate: any,
  req: ReviewRequest
) {
  try {
    // 1. Check if entry already exists
    const { data: existing } = await supabase
      .from('qa_entries')
      .select('id')
      .eq('question_hash', candidate.question_hash)
      .eq('answer_hash', candidate.answer_hash)
      .single();

    if (existing) {
      log(`Entry already exists: ${candidate.id}`, 'warn');
      return errorResponse('Entry already published', 400);
    }

    // 2. Create qa_entry
    const { data: entry, error: insertError } = await supabase
      .from('qa_entries')
      .insert({
        source_url: candidate.source_url,
        source_type: candidate.source_type || 'guide',
        question: candidate.question,
        answer: candidate.answer,
        question_hash: candidate.question_hash,
        answer_hash: candidate.answer_hash,
        tags: candidate.tags,
        confidence: candidate.confidence,
        entities: candidate.entities,
        active: true,
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      log(`Failed to create entry: ${insertError.message}`, 'error');
      return errorResponse('Failed to create entry', 500);
    }

    // 3. Log review
    await supabase.from('qa_reviews').insert({
      qa_candidate_id: candidate.id,
      qa_entry_id: entry.id,
      action: 'approved',
      reason: req.reason || 'Manual approval',
      reviewer_email: 'system@myyachtsinsurance.com',
    });

    // 4. Update candidate status
    await supabase
      .from('qa_candidates')
      .update({ review_status: 'approved' })
      .eq('id', candidate.id);

    log(`✓ Approved candidate ${candidate.id} → entry ${entry.id}`);

    return successResponse({
      status: 'success',
      action: 'approved',
      entryId: entry.id,
      message: 'Candidate approved and published',
    });
  } catch (error) {
    log(`Approve failed: ${String(error)}`, 'error');
    return errorResponse('Approval failed', 500);
  }
}

/**
 * Reject a candidate: mark as rejected with reason
 */
async function handleReject(
  supabase: any,
  candidate: any,
  req: ReviewRequest
) {
  try {
    // 1. Log review
    await supabase.from('qa_reviews').insert({
      qa_candidate_id: candidate.id,
      action: 'rejected',
      reason: req.reason || 'Rejected by reviewer',
      reviewer_email: 'system@myyachtsinsurance.com',
    });

    // 2. Update candidate status
    await supabase
      .from('qa_candidates')
      .update({ review_status: 'rejected' })
      .eq('id', candidate.id);

    log(`✓ Rejected candidate ${candidate.id}`);

    return successResponse({
      status: 'success',
      action: 'rejected',
      message: 'Candidate rejected',
    });
  } catch (error) {
    log(`Reject failed: ${String(error)}`, 'error');
    return errorResponse('Rejection failed', 500);
  }
}

/**
 * Edit a candidate: update question/answer, then approve
 */
async function handleEdit(
  supabase: any,
  candidate: any,
  req: ReviewRequest
) {
  try {
    const editedQuestion = req.editedQuestion || candidate.question;
    const editedAnswer = req.editedAnswer || candidate.answer;

    // Validate edits
    if (editedQuestion.length < 5 || editedAnswer.length < 40) {
      return errorResponse('Edited content too short', 400);
    }

    // New hashes
    const newQuestionHash = hashContent(editedQuestion);
    const newAnswerHash = hashContent(editedAnswer);

    // Check for conflicts with existing entries
    const { data: conflict } = await supabase
      .from('qa_entries')
      .select('id')
      .eq('question_hash', newQuestionHash)
      .eq('answer_hash', newAnswerHash)
      .single();

    if (conflict) {
      return errorResponse('Edited content matches existing entry', 400);
    }

    // Update candidate
    const { data: updated, error: updateError } = await supabase
      .from('qa_candidates')
      .update({
        question: editedQuestion,
        answer: editedAnswer,
        question_hash: newQuestionHash,
        answer_hash: newAnswerHash,
      })
      .eq('id', candidate.id)
      .select();

    if (updateError) {
      log(`Edit update failed: ${updateError.message}`, 'error');
      return errorResponse('Failed to update candidate', 500);
    }

    // Log review
    await supabase.from('qa_reviews').insert({
      qa_candidate_id: candidate.id,
      action: 'edited',
      original_question: candidate.question,
      original_answer: candidate.answer,
      edited_question: editedQuestion,
      edited_answer: editedAnswer,
      reason: 'Edited before approval',
      reviewer_email: 'system@myyachtsinsurance.com',
    });

    log(`✓ Edited candidate ${candidate.id}`);

    return successResponse({
      status: 'success',
      action: 'edited',
      message: 'Candidate edited. Review again to approve.',
      candidateId: candidate.id,
    });
  } catch (error) {
    log(`Edit failed: ${String(error)}`, 'error');
    return errorResponse('Edit failed', 500);
  }
}

/**
 * GET /api/v1/scraper/review?candidateId=123
 * Fetch a single candidate for review
 */
export async function GET(request: NextRequest) {
  const auth = verifyApiKey(request);
  if (!auth.valid) {
    return errorResponse(auth.error, 401);
  }

  try {
    const candidateId = request.nextUrl.searchParams.get('candidateId');

    if (!candidateId) {
      return errorResponse('Missing candidateId query param', 400);
    }

    const supabase = initSupabaseAdmin();

    const { data: candidate, error } = await supabase
      .from('qa_candidates')
      .select('*')
      .eq('id', parseInt(candidateId))
      .single();

    if (error || !candidate) {
      return errorResponse('Candidate not found', 404);
    }

    return successResponse(candidate);
  } catch (error) {
    return errorResponse('Server error', 500, { error: String(error) });
  }
}
