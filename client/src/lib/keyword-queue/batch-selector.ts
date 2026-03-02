/**
 * Batch Selection for First Keyword Queue Run
 *
 * Selects top N keywords by priority with cluster diversity constraints.
 * Ensures no cluster is over-represented in a single batch.
 */

import { db } from './db';

export interface BatchKeyword {
  id: string;
  keyword: string;
  cluster_id: string;
  priority_score: number;
  pipeline_type: string;
  keyword_difficulty?: number;
}

/**
 * Select top keywords for batch processing with cluster diversity
 *
 * @param limit - Maximum keywords to select (default 20)
 * @param maxPerCluster - Maximum keywords from any single cluster (default 3)
 * @returns Array of keywords respecting diversity constraints
 *
 * Algorithm:
 * 1. Query keyword_queue_priority VIEW ordered by priority_score DESC
 * 2. Filter for status='pending'
 * 3. Track count per cluster_id
 * 4. Skip keywords if cluster already has maxPerCluster in batch
 * 5. Use keyword_difficulty as tiebreaker (lower difficulty preferred)
 * 6. Stop when batch reaches limit
 */
export async function selectFirstBatch(
  limit: number = 20,
  maxPerCluster: number = 3
): Promise<BatchKeyword[]> {
  try {
    // Fetch all pending keywords ordered by priority
    const { data: candidates, error } = await db
      .from('keyword_queue_priority')
      .select('id, keyword, cluster_id, priority_score, pipeline_type, keyword_difficulty')
      .eq('status', 'pending')
      .order('priority_score', { ascending: false })
      .order('keyword_difficulty', { ascending: true }); // Tiebreaker: easier keywords first

    if (error) {
      console.error('[BATCH-SELECTOR] Database error:', error.message);
      throw new Error(`Failed to fetch candidates: ${error.message}`);
    }

    if (!candidates || candidates.length === 0) {
      console.log('[BATCH-SELECTOR] No pending keywords found');
      return [];
    }

    console.log(`[BATCH-SELECTOR] Found ${candidates.length} pending keywords`);

    // Track cluster representation
    const clusterCounts = new Map<string, number>();
    const selectedBatch: BatchKeyword[] = [];

    for (const candidate of candidates) {
      // Check if we've reached the batch limit
      if (selectedBatch.length >= limit) {
        break;
      }

      const clusterId = candidate.cluster_id || 'unclustered';
      const currentCount = clusterCounts.get(clusterId) || 0;

      // Skip if this cluster already has maxPerCluster keywords in batch
      if (currentCount >= maxPerCluster) {
        console.log(
          `[BATCH-SELECTOR] Skipping "${candidate.keyword}" - cluster ${clusterId} already has ${currentCount} keywords`
        );
        continue;
      }

      // Add to batch
      selectedBatch.push({
        id: candidate.id,
        keyword: candidate.keyword,
        cluster_id: candidate.cluster_id || 'unclustered',
        priority_score: candidate.priority_score,
        pipeline_type: candidate.pipeline_type,
        keyword_difficulty: candidate.keyword_difficulty,
      });

      // Update cluster count
      clusterCounts.set(clusterId, currentCount + 1);

      console.log(
        `[BATCH-SELECTOR] Selected "${candidate.keyword}" (cluster: ${clusterId}, priority: ${candidate.priority_score})`
      );
    }

    console.log(`[BATCH-SELECTOR] Selected ${selectedBatch.length} keywords for batch`);

    // Log cluster distribution
    console.log('\n[BATCH-SELECTOR] Cluster distribution:');
    for (const [clusterId, count] of clusterCounts.entries()) {
      console.log(`  ${clusterId}: ${count} keywords`);
    }

    return selectedBatch;
  } catch (error) {
    console.error('[BATCH-SELECTOR] Error:', error);
    throw error;
  }
}
