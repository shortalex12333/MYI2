/**
 * GEO Scorer
 *
 * Scores paper_topics on five dimensions before generation.
 * Run after cluster-mapper assigns topics to clusters.
 *
 * Scoring logic is deterministic — no model involved.
 * Based on: keyword presence, registry coverage, cluster depth,
 * seasonal calendar, and persona signal.
 *
 * Usage:
 *   npx ts-node cli.ts score [--limit=50]
 */

import { db } from './db';

// ─── SEASONAL WEIGHTS ────────────────────────────────────────
// Month-indexed (0 = Jan). Risk topics that spike by season.
const SEASONAL_BOOST: Record<string, number[]> = {
  hurricane:   [0, 0, 0, 1, 2, 3, 5, 5, 5, 4, 2, 0],
  lay_up:      [3, 3, 2, 1, 1, 0, 0, 0, 0, 1, 3, 5],
  salvage:     [0, 0, 0, 0, 1, 2, 3, 5, 5, 4, 1, 0],
  grounding:   [0, 0, 1, 2, 3, 5, 5, 5, 4, 3, 1, 0],
  shipyard:    [5, 5, 4, 3, 2, 1, 0, 0, 0, 1, 3, 5],
};

function getSeasonalWeight(riskTopic: string): number {
  const month = new Date().getMonth();
  return SEASONAL_BOOST[riskTopic]?.[month] ?? 2;
}

// ─── PERSONA SCORES ──────────────────────────────────────────
// Professional (captain/engineer) = higher GEO signal.
// AI retrieves for specific professional queries more than owner.
const PERSONA_WEIGHTS: Record<string, number> = {
  captain:      5,
  engineer:     5,
  chief_officer: 4,
  broker:       4,
  owner:        3,
  family_office: 3,
  crew:         4,
};

// ─── AUTHORITY GAP ───────────────────────────────────────────
// Topics where no credible single source answers cleanly.
// Higher = bigger gap = higher GEO value.
const AUTHORITY_GAP_SIGNALS: Record<string, number> = {
  hot_work:                  5,
  concurrent_operations:     5,
  navigation_limits:         5,
  lay_up_warranty:           5,
  sue_and_labour:            5,
  charter_exclusion:         4,
  claims_denial:             4,
  crew_coverage:             4,
  total_loss_constructive:   5,
  pollution_liability:       4,
  salvage_lof:               5,
  hurricane_deductible:      4,
  hull_damage:               3,
  racing_exclusion:          4,
  towing_liability:          4,
  // Generic topics — low gap (USCG/Lloyd's already covers these well)
  basic_liability:           1,
  basic_coverage:            1,
  general_safety:            1,
};

function getAuthorityGap(topicSignal: string): number {
  const lower = topicSignal.toLowerCase();
  for (const [keyword, score] of Object.entries(AUTHORITY_GAP_SIGNALS)) {
    if (lower.includes(keyword.replace(/_/g, ' ')) ||
        lower.includes(keyword.replace(/_/g, '-'))) {
      return score;
    }
  }
  return 2; // default mid-gap
}

// ─── REGISTRY STRENGTH ───────────────────────────────────────
// Checks if reference_registry has strong coverage for this topic.
async function getRegistryStrength(riskTopic: string): Promise<number> {
  const { data, error } = await db
    .from('reference_registry')
    .select('quality_tier')
    .filter('cluster_tags', 'cs', `{${riskTopic}}`)
    .eq('is_active', true);

  if (error || !data) return 1;

  const primaryCount = data.filter(r => r.quality_tier === 'primary').length;
  const totalCount = data.length;

  if (primaryCount >= 3) return 5;
  if (primaryCount >= 2) return 4;
  if (primaryCount >= 1) return 3;
  if (totalCount >= 2)   return 2;
  return 1;
}

// ─── CLUSTER DEPTH ───────────────────────────────────────────
// More existing published papers in this cluster = more
// internal linking potential = higher GEO cluster signal.
async function getClusterDepth(clusterId: string): Promise<number> {
  const { count, error } = await db
    .from('papers')
    .select('id', { count: 'exact', head: true })
    .eq('cluster_id', clusterId)
    .eq('review_status', 'published');

  if (error || count === null) return 1;

  if (count >= 8)  return 5;
  if (count >= 5)  return 4;
  if (count >= 3)  return 3;
  if (count >= 1)  return 2;
  return 1;
}

// ─── MAIN SCORER ─────────────────────────────────────────────

interface ScoredTopic {
  id: string;
  title: string;
  geo_score: number;
  breakdown: {
    authority_gap: number;
    cluster_depth: number;
    registry_strength: number;
    seasonal_weight: number;
    persona_score: number;
  };
}

export async function scoreTopics(limit = 50): Promise<{
  scored: number;
  skipped: number;
  topTopics: ScoredTopic[];
}> {
  const { data: topics, error } = await db
    .from('paper_topics')
    .select('id, topic_signal, risk_topic, cluster_id, persona')
    .eq('status', 'seed')
    .limit(limit);

  if (error || !topics) throw new Error(`Fetch failed: ${error?.message}`);

  let scored = 0;
  let skipped = 0;
  const topTopics: ScoredTopic[] = [];

  for (const topic of topics) {
    try {
      const [registryStrength, clusterDepth] = await Promise.all([
        getRegistryStrength(topic.risk_topic ?? ''),
        getClusterDepth(topic.cluster_id),
      ]);

      const authorityGap    = getAuthorityGap(topic.topic_signal);
      const seasonalWeight  = getSeasonalWeight(topic.risk_topic ?? '');
      const personaScore    = PERSONA_WEIGHTS[topic.persona ?? 'owner'] ?? 3;
      const geoScore        = authorityGap + clusterDepth + registryStrength
                              + seasonalWeight + personaScore;

      const { error: updateError } = await db
        .from('paper_topics')
        .update({
          authority_gap:    authorityGap,
          cluster_depth:    clusterDepth,
          registry_strength: registryStrength,
          seasonal_weight:  seasonalWeight,
          persona_score:    personaScore,
          geo_score:        geoScore,
          status:           'scored',
        })
        .eq('id', topic.id);

      if (updateError) { skipped++; continue; }

      scored++;
      topTopics.push({
        id: topic.id,
        title: topic.topic_signal,
        geo_score: geoScore,
        breakdown: {
          authority_gap: authorityGap,
          cluster_depth: clusterDepth,
          registry_strength: registryStrength,
          seasonal_weight: seasonalWeight,
          persona_score: personaScore,
        },
      });
    } catch {
      skipped++;
    }
  }

  topTopics.sort((a, b) => b.geo_score - a.geo_score);

  return { scored, skipped, topTopics: topTopics.slice(0, 10) };
}
