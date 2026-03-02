/**
 * Priority Scoring Module
 *
 * Calculates priority scores for keyword queue items.
 * Formula: base_score × seasonal_multiplier × decay_factor
 *
 * Mirrors logic in 003_priority_view.sql for consistency.
 */

export interface KeywordQueueRow {
  search_volume: number;
  keyword_difficulty: number;
  keyword: string;
  status: string;
  created_at: string;
}

/**
 * FR-2.1: Base score = volume × (100 - difficulty)
 */
export function calculateBaseScore(volume: number, difficulty: number): number {
  return volume * (100 - difficulty);
}

/**
 * FR-2.2: 1.5x multiplier for hurricane keywords in Q2-Q3 (April-September)
 */
export function applySeasonalMultiplier(
  score: number,
  keyword: string,
  date: Date = new Date()
): number {
  const month = date.getMonth() + 1; // JS months are 0-indexed
  const isHurricaneSeason = month >= 4 && month <= 9;
  const isHurricaneKeyword = keyword.toLowerCase().includes('hurricane');

  if (isHurricaneSeason && isHurricaneKeyword) {
    return Math.round(score * 1.5);
  }
  return score;
}

/**
 * FR-2.3: 0.8x decay for pending keywords waiting >7 days
 */
export function applyDecayFactor(
  score: number,
  status: string,
  createdAt: Date
): number {
  if (status !== 'pending') {
    return score;
  }

  const now = new Date();
  const ageMs = now.getTime() - createdAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > 7) {
    return Math.round(score * 0.8);
  }
  return score;
}

/**
 * Calculate final priority score combining all factors
 */
export function calculatePriorityScore(keyword: KeywordQueueRow): number {
  const baseScore = calculateBaseScore(keyword.search_volume, keyword.keyword_difficulty);
  const withSeasonal = applySeasonalMultiplier(baseScore, keyword.keyword);
  const withDecay = applyDecayFactor(
    withSeasonal,
    keyword.status,
    new Date(keyword.created_at)
  );
  return withDecay;
}
