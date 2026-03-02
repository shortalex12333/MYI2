/**
 * Queue Processor Core
 *
 * Orchestrates keyword queue processing:
 * - Selects highest-priority pending keywords
 * - Enforces cluster diversity and rate limits
 * - Manages status transitions with row locking
 * - Routes keywords to appropriate content pipelines
 */

import { db } from './db';
import { routeKeyword, PipelineType } from './intent-router';
import {
  generatePaperFromKeyword,
  generateQAFromKeyword,
  generateTopicFromKeyword,
} from './adapters';

export interface KeywordQueueItem {
  id: string;
  keyword: string;
  cluster_id: string | null;
  status: 'pending' | 'generating' | 'generated' | 'failed';
  priority_score: number;
  retry_count: number;
  updated_at: string;
}

export interface ProcessResult {
  success: boolean;
  keyword?: string;
  keywordId?: string;
  pipeline?: PipelineType;
  contentId?: string;
  error?: string;
}

/**
 * FR-3.1: Select highest-priority pending keyword respecting constraints
 *
 * Constraints:
 * - FR-3.6: Max 1 keyword per cluster per day (cluster diversity)
 * - FR-3.7: Max 20 keywords published per rolling 7 days (rate limit)
 */
export async function selectNextKeyword(): Promise<KeywordQueueItem | null> {
  try {
    // Get all pending keywords ordered by priority
    const { data: candidates, error: fetchError } = await db
      .from('keyword_queue_priority')
      .select('*')
      .eq('status', 'pending')
      .order('priority_score', { ascending: false });

    if (fetchError) {
      console.error('[QUEUE] Fetch error:', fetchError.message);
      return null;
    }

    if (!candidates || candidates.length === 0) {
      console.log('[QUEUE] No pending keywords found');
      return null;
    }

    // Check rolling 7-day limit (FR-3.7)
    const { count: weekCount, error: countError } = await db
      .from('keyword_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'generated')
      .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (countError) {
      console.error('[QUEUE] Week count error:', countError.message);
      return null;
    }

    if (weekCount !== null && weekCount >= 20) {
      console.log('[QUEUE] Weekly limit reached:', weekCount);
      return null;
    }

    // Get today's processed clusters (FR-3.6: max 1 per cluster per day)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { data: todayClusters, error: clusterError } = await db
      .from('keyword_queue')
      .select('cluster_id')
      .not('cluster_id', 'is', null)
      .gte('updated_at', todayStart.toISOString())
      .in('status', ['generating', 'generated']);

    if (clusterError) {
      console.error('[QUEUE] Cluster check error:', clusterError.message);
      return null;
    }

    const processedClusterIds = new Set(
      (todayClusters || []).map((row) => row.cluster_id).filter(Boolean)
    );

    // Find first candidate that passes cluster diversity check
    for (const candidate of candidates) {
      // If keyword has no cluster, it's always eligible
      if (!candidate.cluster_id) {
        console.log(`[QUEUE] Selected: ${candidate.keyword} (no cluster)`);
        return candidate as KeywordQueueItem;
      }

      // If cluster not processed today, this keyword is eligible
      if (!processedClusterIds.has(candidate.cluster_id)) {
        console.log(`[QUEUE] Selected: ${candidate.keyword} (cluster: ${candidate.cluster_id})`);
        return candidate as KeywordQueueItem;
      }

      console.log(`[QUEUE] Skipping ${candidate.keyword}: cluster ${candidate.cluster_id} already processed today`);
    }

    console.log('[QUEUE] No eligible keywords found after cluster diversity check');
    return null;
  } catch (error) {
    console.error('[QUEUE] selectNextKeyword error:', error);
    return null;
  }
}

/**
 * FR-3.2: Atomic lock acquisition via status transition
 *
 * Uses WHERE status = 'pending' to ensure only one process locks the keyword.
 */
export async function lockKeyword(keywordId: string): Promise<boolean> {
  try {
    const { error } = await db
      .from('keyword_queue')
      .update({
        status: 'generating',
        updated_at: new Date().toISOString()
      })
      .eq('id', keywordId)
      .eq('status', 'pending'); // Atomic: only succeeds if still pending

    if (error) {
      console.error('[QUEUE] Lock error:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[QUEUE] lockKeyword error:', error);
    return false;
  }
}

/**
 * Mark keyword as successfully generated
 */
export async function completeKeyword(
  keywordId: string,
  contentId: string,
  contentType: 'paper' | 'qa' | 'topic'
): Promise<boolean> {
  try {
    const { error } = await db
      .from('keyword_queue')
      .update({
        status: 'generated',
        generated_content_id: contentId,
        generated_content_type: contentType,
        updated_at: new Date().toISOString()
      })
      .eq('id', keywordId);

    if (error) {
      console.error('[QUEUE] Complete error:', error.message);
      return false;
    }

    console.log(`[QUEUE] Completed: ${keywordId} -> ${contentType}:${contentId}`);
    return true;
  } catch (error) {
    console.error('[QUEUE] completeKeyword error:', error);
    return false;
  }
}

/**
 * FR-3.8: Retry logic - increment retry_count, fail after 3 attempts
 */
export async function failKeyword(keywordId: string, errorMessage: string): Promise<boolean> {
  try {
    // First, get current retry count
    const { data: current, error: fetchError } = await db
      .from('keyword_queue')
      .select('retry_count')
      .eq('id', keywordId)
      .single();

    if (fetchError || !current) {
      console.error('[QUEUE] Fail fetch error:', fetchError?.message);
      return false;
    }

    const newRetryCount = current.retry_count + 1;
    const shouldFail = newRetryCount >= 3;

    const { error } = await db
      .from('keyword_queue')
      .update({
        status: shouldFail ? 'failed' : 'pending',
        retry_count: newRetryCount,
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', keywordId);

    if (error) {
      console.error('[QUEUE] Fail update error:', error.message);
      return false;
    }

    console.log(
      `[QUEUE] Failed: ${keywordId} (retry ${newRetryCount}/3, status: ${shouldFail ? 'failed' : 'pending'})`
    );
    return true;
  } catch (error) {
    console.error('[QUEUE] failKeyword error:', error);
    return false;
  }
}

/**
 * Main orchestrator function
 *
 * Coordinates the entire process:
 * 1. Select next eligible keyword
 * 2. Lock it atomically
 * 3. Route to appropriate pipeline
 * 4. Return result for cron job logging
 */
export async function processNextKeyword(): Promise<ProcessResult> {
  const startTime = Date.now();

  try {
    // Step 1: Select highest-priority eligible keyword
    const keyword = await selectNextKeyword();

    if (!keyword) {
      return {
        success: true,
        error: 'No eligible keywords'
      };
    }

    // Step 2: Lock keyword atomically
    const locked = await lockKeyword(keyword.id);

    if (!locked) {
      return {
        success: false,
        keyword: keyword.keyword,
        keywordId: keyword.id,
        error: 'Failed to acquire lock (may have been processed by another job)'
      };
    }

    // Step 3: Route to appropriate pipeline
    const pipeline = routeKeyword(keyword.keyword);

    console.log(
      `[QUEUE] Locked ${keyword.keyword} for ${pipeline} pipeline (priority: ${keyword.priority_score})`
    );

    // Step 4: Execute pipeline via adapter
    let result;
    let contentId: string | undefined;

    try {
      switch (pipeline) {
        case 'papers':
          result = await generatePaperFromKeyword({
            keyword_queue_id: keyword.id,
            keyword: keyword.keyword,
            cluster_id: keyword.cluster_id || '',
            risk_topic: undefined, // Could be enriched from keyword metadata
          });

          if (result.success) {
            await completeKeyword(keyword.id, result.paperId, 'paper');
            contentId = result.paperId;
          } else {
            await failKeyword(keyword.id, result.error || 'Paper generation failed');
          }
          break;

        case 'qa':
          result = await generateQAFromKeyword({
            keyword_queue_id: keyword.id,
            keyword: keyword.keyword,
            risk_topic: 'other', // Could be enriched from keyword metadata
          });

          if (result.success) {
            await completeKeyword(keyword.id, result.qaId, 'qa');
            contentId = result.qaId;
          } else {
            await failKeyword(keyword.id, result.error || 'Q&A generation failed');
          }
          break;

        case 'topics':
          result = await generateTopicFromKeyword({
            keyword_queue_id: keyword.id,
            keyword: keyword.keyword,
            cluster_id: keyword.cluster_id || undefined,
          });

          if (result.success) {
            await completeKeyword(keyword.id, result.topicId, 'topic');
            contentId = result.topicId;
          } else {
            await failKeyword(keyword.id, result.error || 'Topic generation failed');
          }
          break;

        default:
          await failKeyword(keyword.id, `Unknown pipeline type: ${pipeline}`);
          return {
            success: false,
            keyword: keyword.keyword,
            keywordId: keyword.id,
            pipeline,
            error: `Unknown pipeline type: ${pipeline}`,
          };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await failKeyword(keyword.id, errorMessage);
      return {
        success: false,
        keyword: keyword.keyword,
        keywordId: keyword.id,
        pipeline,
        error: errorMessage,
      };
    }

    const duration = Date.now() - startTime;
    console.log(
      `[QUEUE] Completed ${keyword.keyword} via ${pipeline} pipeline (${duration}ms)`
    );

    return {
      success: result?.success || false,
      keyword: keyword.keyword,
      keywordId: keyword.id,
      pipeline,
      contentId,
    };
  } catch (error) {
    console.error('[QUEUE] processNextKeyword error:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}
