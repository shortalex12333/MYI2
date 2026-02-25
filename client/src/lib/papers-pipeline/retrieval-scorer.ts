/**
 * Retrieval Scorer - GROUNDED scoring based on observable signals
 *
 * Replaces vibes-based "GEO Score" with data-driven signals:
 * - frequency: How many questions exist for this risk_topic
 * - urgency: Decision-critical keywords (void, deny, exclude)
 * - liability: High-stakes nouns (charter, hurricane, total loss)
 * - jurisdiction: Specific jurisdiction signals (Florida, USCG)
 */

import { db } from './db';

// Decision-critical keywords
const URGENCY_KEYWORDS = [
  'void', 'deny', 'denied', 'exclude', 'exclusion',
  'cancel', 'requirements', 'notify', 'deadline', 'lapse'
];

// High-stakes nouns
const LIABILITY_NOUNS = [
  'refit', 'charter', 'crew injury', 'navigation limits',
  'hot work', 'hurricane', 'total loss', 'grounding',
  'salvage', 'pollution'
];

// Jurisdiction signals
const JURISDICTION_SIGNALS = [
  'florida', 'uscg', 'coast guard', 'lloyd\'s', 'mca',
  'caribbean', 'uk', 'eu'
];

interface TopicFrequency {
  risk_topic: string;
  count: number;
  normalized: number; // 0-10 scale
}

// Cache topic frequencies (computed once per session)
let frequencyCache: Map<string, number> | null = null;
let maxFrequency = 0;

async function loadFrequencyCache(): Promise<void> {
  if (frequencyCache) return;

  const { data, error } = await db
    .from('qa_candidates')
    .select('risk_topic');

  if (error || !data) {
    frequencyCache = new Map();
    return;
  }

  // Count by risk_topic
  const counts = new Map<string, number>();
  for (const row of data) {
    const topic = row.risk_topic || 'other';
    counts.set(topic, (counts.get(topic) || 0) + 1);
  }

  maxFrequency = Math.max(...counts.values());
  frequencyCache = counts;
}

function getFrequencyScore(riskTopic: string): number {
  if (!frequencyCache) return 5; // fallback mid-score
  const count = frequencyCache.get(riskTopic) || 0;
  // Normalize to 0-10 scale
  return Math.round((count / maxFrequency) * 10);
}

function getUrgencyScore(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const keyword of URGENCY_KEYWORDS) {
    if (lower.includes(keyword)) score += 2;
  }
  return Math.min(score, 10); // cap at 10
}

function getLiabilityScore(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const noun of LIABILITY_NOUNS) {
    if (lower.includes(noun)) score += 2;
  }
  return Math.min(score, 10); // cap at 10
}

function getJurisdictionScore(text: string): number {
  const lower = text.toLowerCase();
  for (const signal of JURISDICTION_SIGNALS) {
    if (lower.includes(signal)) return 2;
  }
  return 0;
}

export interface RetrievalScoreResult {
  topic_id: string;
  retrieval_score: number;
  breakdown: {
    frequency: number;
    urgency: number;
    liability: number;
    jurisdiction: number;
  };
  band: 'HIGH' | 'MEDIUM' | 'LOW';
}

export async function scoreTopics(limit = 50): Promise<{
  scored: number;
  results: RetrievalScoreResult[];
}> {
  await loadFrequencyCache();

  const { data: topics, error } = await db
    .from('paper_topics')
    .select('id, topic_signal, canonical_title, risk_topic, primary_query')
    .eq('status', 'seed')
    .limit(limit);

  if (error || !topics) {
    throw new Error(`Fetch failed: ${error?.message}`);
  }

  const results: RetrievalScoreResult[] = [];

  for (const topic of topics) {
    const text = `${topic.topic_signal} ${topic.canonical_title} ${topic.primary_query}`;

    const frequency = getFrequencyScore(topic.risk_topic || 'other');
    const urgency = getUrgencyScore(text);
    const liability = getLiabilityScore(text);
    const jurisdiction = getJurisdictionScore(text);

    // Weighted score
    const retrieval_score = Math.round(
      (frequency * 0.40) +
      (urgency * 0.25) +
      (liability * 0.20) +
      (jurisdiction * 0.15)
    );

    // Determine band
    const band = retrieval_score >= 20 ? 'HIGH'
               : retrieval_score >= 15 ? 'MEDIUM'
               : 'LOW';

    // Update database
    await db
      .from('paper_topics')
      .update({
        geo_score: retrieval_score,
        authority_gap: frequency,     // repurpose field
        cluster_depth: urgency,       // repurpose field
        registry_strength: liability, // repurpose field
        seasonal_weight: jurisdiction, // repurpose field
        status: 'scored',
      })
      .eq('id', topic.id);

    results.push({
      topic_id: topic.id,
      retrieval_score,
      breakdown: { frequency, urgency, liability, jurisdiction },
      band,
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.retrieval_score - a.retrieval_score);

  return { scored: results.length, results };
}

export { URGENCY_KEYWORDS, LIABILITY_NOUNS, JURISDICTION_SIGNALS };
