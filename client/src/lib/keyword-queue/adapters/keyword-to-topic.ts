/**
 * Keyword-to-Topic Adapter
 *
 * Bridges keyword_queue to topics pipeline.
 * Generates consumer-facing topic guide from keyword, links back via keyword_queue_id.
 */

import { db } from '../db';
import { generateTopic, saveTopic } from '../../topics-pipeline/topic-generator';
import { embedTopic } from '../../embeddings/auto-embed';

export interface KeywordTopicInput {
  keyword_queue_id: string;
  keyword: string;
  cluster_id?: string;
}

export interface KeywordTopicResult {
  topicId: string;
  title: string;
  slug: string;
  success: boolean;
  error?: string;
}

/**
 * Generate topic from keyword
 *
 * Flow:
 * 1. Call generateTopic(keyword) - keyword becomes seedQuery
 * 2. Call saveTopic() to persist to consumer_topics
 * 3. Update consumer_topics with keyword_queue_id FK
 * 4. Return result
 */
export async function generateTopicFromKeyword(
  input: KeywordTopicInput
): Promise<KeywordTopicResult> {
  try {
    console.log(`[ADAPTER:TOPIC] Starting topic generation for keyword: ${input.keyword}`);

    // Step 1: Generate topic content (keyword as seedQuery)
    const generatedTopic = await generateTopic(input.keyword);

    console.log(
      `[ADAPTER:TOPIC] Generated topic: ${generatedTopic.title} (${generatedTopic.content.split(/\s+/).filter(Boolean).length} words)`
    );

    // Step 2: Check if topic with this slug already exists
    const { data: existing } = await db
      .from('consumer_topics')
      .select('id, title, slug')
      .eq('slug', generatedTopic.slug)
      .single();

    let topicId: string;

    if (existing) {
      // Topic already exists - link keyword to existing topic
      console.log(`[ADAPTER:TOPIC] Topic already exists: ${existing.slug} (${existing.id})`);
      topicId = existing.id;
    } else {
      // Save new topic
      topicId = await saveTopic(generatedTopic);
      console.log(`[ADAPTER:TOPIC] Saved new topic ${topicId} to database`);
    }

    // Step 3: Link topic back to keyword_queue
    const { error: updateError } = await db
      .from('consumer_topics')
      .update({ keyword_queue_id: input.keyword_queue_id })
      .eq('id', topicId);

    if (updateError) {
      console.error(`[ADAPTER:TOPIC] Failed to link topic to keyword_queue:`, updateError.message);
      // Non-fatal: topic exists, just FK link failed
    }

    console.log(
      `[ADAPTER:TOPIC] Linked topic ${topicId} for keyword: ${input.keyword}`
    );

    // Auto-embed the new topic
    const topicData = existing || generatedTopic;
    await embedTopic(topicId, topicData.title, topicData.content || "", topicData.summary || "", topicData.category || "").catch(() => {});

    return {
      topicId: topicId,
      title: existing?.title || generatedTopic.title,
      slug: existing?.slug || generatedTopic.slug,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ADAPTER:TOPIC] Error:`, errorMessage);


    return {
      topicId: '',
      title: '',
      slug: '',
      success: false,
      error: errorMessage,
    };
  }
}
