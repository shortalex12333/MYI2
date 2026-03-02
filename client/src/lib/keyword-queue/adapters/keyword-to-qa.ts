/**
 * Keyword-to-Q&A Adapter
 *
 * Bridges keyword_queue to Q&A pipeline.
 * Creates qa_candidates record with keyword as question, generates answer, links back.
 */

import { db } from '../db';
import { generateAnswer } from '../../qa-generator/generate';

export interface KeywordQAInput {
  keyword_queue_id: string;
  keyword: string;
  risk_topic: string;
  jurisdiction?: string;
}

export interface KeywordQAResult {
  qaId: string;
  question: string;
  success: boolean;
  error?: string;
}

/**
 * Generate Q&A from keyword
 *
 * Flow:
 * 1. Create qa_candidates record (keyword as question)
 * 2. Call generateAnswer() with extended input
 * 3. Update qa_candidates with answer and keyword_queue_id
 * 4. Return result
 */
export async function generateQAFromKeyword(
  input: KeywordQAInput
): Promise<KeywordQAResult> {
  try {
    // Step 1: Create qa_candidates record
    const { data: qaRecord, error: qaError } = await db
      .from('qa_candidates')
      .insert({
        question: input.keyword,
        risk_topic: input.risk_topic,
        jurisdiction: input.jurisdiction || 'US',
        persona: 'yacht_owner',
        scenario_stage: 'pre-purchase',
        intent_tier: 'T2',
        publish_status: 'pending',
      })
      .select('id')
      .single();

    if (qaError || !qaRecord) {
      throw new Error(`Failed to create qa_candidates: ${qaError?.message}`);
    }

    console.log(`[ADAPTER:QA] Created qa_candidates ${qaRecord.id} for keyword: ${input.keyword}`);

    // Step 2: Generate answer using existing pipeline
    const answer = await generateAnswer({
      id: qaRecord.id,
      question: input.keyword,
      risk_topic: input.risk_topic,
      jurisdiction: input.jurisdiction || 'US',
      persona: 'yacht_owner',
      scenario_stage: 'pre-purchase',
      intent_tier: 'T2',
    }, db);

    if (!answer || answer.trim().length === 0) {
      throw new Error('Answer generation returned empty result');
    }

    const wordCount = answer.split(/\s+/).filter(Boolean).length;

    // Step 3: Update qa_candidates with answer and keyword_queue_id link
    const { error: updateError } = await db
      .from('qa_candidates')
      .update({
        answer: answer,
        word_count: wordCount,
        keyword_queue_id: input.keyword_queue_id,
        publish_status: 'drafted',
        generated_at: new Date().toISOString(),
      })
      .eq('id', qaRecord.id);

    if (updateError) {
      throw new Error(`Failed to update qa_candidates: ${updateError.message}`);
    }

    console.log(
      `[ADAPTER:QA] Generated answer for ${qaRecord.id} (${wordCount} words) for keyword: ${input.keyword}`
    );

    return {
      qaId: qaRecord.id,
      question: input.keyword,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ADAPTER:QA] Error:`, errorMessage);

    return {
      qaId: '',
      question: input.keyword,
      success: false,
      error: errorMessage,
    };
  }
}
