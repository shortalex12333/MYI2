/**
 * Keyword-to-Paper Adapter
 *
 * Bridges keyword_queue to papers pipeline.
 * Creates paper_topic from keyword, generates paper, links back via keyword_queue_id.
 */

import { db } from '../db';
import { generatePaper } from '../../papers-pipeline/paper-generator';

export interface KeywordPaperInput {
  keyword_queue_id: string;
  keyword: string;
  cluster_id: string;
  risk_topic?: string;
}

export interface KeywordPaperResult {
  paperId: string;
  title: string;
  slug: string;
  success: boolean;
  error?: string;
}

/**
 * Generate paper from keyword
 *
 * Flow:
 * 1. Create paper_topic record (keyword as title + primary_query)
 * 2. Call generatePaper(topicId)
 * 3. Update paper with keyword_queue_id FK
 * 4. Return result
 */
export async function generatePaperFromKeyword(
  input: KeywordPaperInput
): Promise<KeywordPaperResult> {
  try {
    // Step 1: Create paper_topic from keyword
    const { data: topic, error: topicError } = await db
      .from('paper_topics')
      .insert({
        topic_signal: input.keyword,  // Required: raw keyword/phrase
        canonical_title: input.keyword,
        primary_query: input.keyword,
        cluster_id: input.cluster_id,
        risk_topic: input.risk_topic || 'other',
        jurisdiction: 'US',
        persona: 'yacht_owner',
        status: 'pending',
      })
      .select('id')
      .single();

    if (topicError || !topic) {
      throw new Error(`Failed to create paper_topic: ${topicError?.message}`);
    }

    console.log(`[ADAPTER:PAPER] Created paper_topic ${topic.id} for keyword: ${input.keyword}`);

    // Step 2: Generate paper using existing pipeline
    const generatedPaper = await generatePaper(topic.id);

    if (generatedPaper.status === 'failed') {
      throw new Error(generatedPaper.error || 'Paper generation failed');
    }

    // Step 3: Link paper back to keyword_queue
    const { error: updateError } = await db
      .from('papers')
      .update({ keyword_queue_id: input.keyword_queue_id })
      .eq('id', generatedPaper.paperId);

    if (updateError) {
      console.error(`[ADAPTER:PAPER] Failed to link paper to keyword_queue:`, updateError.message);
      // Non-fatal: paper was generated, just FK link failed
    }

    console.log(
      `[ADAPTER:PAPER] Generated paper ${generatedPaper.paperId} (${generatedPaper.wordCount} words) for keyword: ${input.keyword}`
    );

    return {
      paperId: generatedPaper.paperId,
      title: generatedPaper.title,
      slug: generatedPaper.slug,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ADAPTER:PAPER] Error:`, errorMessage);

    return {
      paperId: '',
      title: '',
      slug: '',
      success: false,
      error: errorMessage,
    };
  }
}
