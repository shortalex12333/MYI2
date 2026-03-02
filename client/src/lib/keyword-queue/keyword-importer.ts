/**
 * Keyword Importer Module
 *
 * Parses TSV keyword research data and imports into keyword_queue table.
 * Handles tier-to-pipeline and risk_topic-to-cluster mappings.
 *
 * Phase 02-03: Keyword Import
 */

import { calculatePriorityScore, type KeywordQueueRow } from './priority-scorer';

// Lazy-load db to allow environment variables to be set first
let _db: any = null;
function getDb() {
  if (!_db) {
    const { db } = require('./db');
    _db = db;
  }
  return _db;
}

/**
 * Mapping from tier (T1, T2, T3) to pipeline_type
 */
const TIER_TO_PIPELINE: Record<string, string> = {
  'T1': 'paper',      // High-value informational
  'T2': 'topic',      // Commercial/comparison
  'T3': 'qa',         // Question/quick answer
};

/**
 * Mapping from risk_topic to cluster_id
 */
const RISK_TOPIC_TO_CLUSTER: Record<string, string> = {
  'other': 'general-coverage',
  'navigation_limits': 'navigation-cruising',
  'claims_denial': 'claims-disputes',
  'hurricane': 'hurricane-storm',
  'deductible': 'claims-disputes',
  'total_loss': 'claims-disputes',
  'hull_damage': 'hull-machinery',
  'charter_exclusion': 'charter-commercial',
  'liability': 'liability-pip',
  'lay_up': 'seasonal-layup',
  'liveaboard': 'liveaboard-residential',
  'survey': 'survey-valuation',
  'fire': 'fire-safety',
};

/**
 * Parsed TSV line data
 */
export interface KeywordImport {
  tier: string;
  risk_topic: string;
  source: string;
  query: string;
}

/**
 * Import result summary
 */
export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  byPipeline: Record<string, number>;
  byCluster: Record<string, number>;
}

/**
 * Parse a single TSV line into KeywordImport object
 * @param line TSV line with tab-separated values
 * @returns KeywordImport or null if invalid
 */
export function parseTsvLine(line: string): KeywordImport | null {
  const parts = line.split('\t');

  if (parts.length < 4) {
    return null;
  }

  const [tier, risk_topic, source, query] = parts;

  // Skip empty or invalid lines
  if (!tier || !risk_topic || !query) {
    return null;
  }

  return {
    tier: tier.trim(),
    risk_topic: risk_topic.trim(),
    source: source.trim(),
    query: query.trim(),
  };
}

/**
 * Import a single keyword into the database
 * @param kw Keyword import data
 * @param dryRun If true, skip database insert
 * @returns true if imported, false if skipped
 */
export async function importKeyword(
  kw: KeywordImport,
  dryRun: boolean = false
): Promise<boolean> {
  // Map tier to pipeline_type
  const pipeline_type = TIER_TO_PIPELINE[kw.tier];
  if (!pipeline_type) {
    console.warn(`[SKIP] Unknown tier: ${kw.tier} for keyword: ${kw.query}`);
    return false;
  }

  // Map risk_topic to cluster_id
  const cluster_id = RISK_TOPIC_TO_CLUSTER[kw.risk_topic] || 'general-coverage';

  // Use placeholder values for search metrics
  const search_volume = 100;
  const keyword_difficulty = 50;

  // Calculate priority score using Phase 1 formula
  const mockRow: KeywordQueueRow = {
    search_volume,
    keyword_difficulty,
    keyword: kw.query,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  const priority_score = calculatePriorityScore(mockRow);

  if (dryRun) {
    console.log(`[DRY-RUN] ${kw.query} -> pipeline=${pipeline_type}, cluster=${cluster_id}, priority=${priority_score}`);
    return true;
  }

  // Check if keyword already exists
  const { data: existing, error: checkError } = await getDb()
    .from('keyword_queue')
    .select('id')
    .eq('keyword', kw.query)
    .single();

  if (existing) {
    console.log(`[SKIP] Duplicate: ${kw.query}`);
    return false;
  }

  // Insert into keyword_queue
  const { error } = await getDb()
    .from('keyword_queue')
    .insert({
      keyword: kw.query,
      pipeline_type,
      cluster_id,
      search_volume,
      keyword_difficulty,
      priority_score,
      status: 'pending',
    });

  if (error) {
    console.error(`[ERROR] Failed to import ${kw.query}:`, error.message);
    throw error;
  }

  console.log(`[IMPORT] ${kw.query} -> pipeline=${pipeline_type}, cluster=${cluster_id}, priority=${priority_score}`);
  return true;
}

/**
 * Import keywords from TSV content
 * @param tsvContent Full TSV file content
 * @param options Import options
 * @returns Import summary
 */
export async function importFromTsv(
  tsvContent: string,
  options?: { dryRun?: boolean }
): Promise<ImportResult> {
  const dryRun = options?.dryRun || false;
  const lines = tsvContent.split('\n');

  // Skip header line
  const dataLines = lines.slice(1);

  const result: ImportResult = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    byPipeline: {},
    byCluster: {},
  };

  for (const line of dataLines) {
    if (!line.trim()) {
      continue; // Skip empty lines
    }

    result.total++;

    const parsed = parseTsvLine(line);
    if (!parsed) {
      result.errors++;
      continue;
    }

    try {
      const imported = await importKeyword(parsed, dryRun);
      if (imported) {
        result.imported++;

        // Track statistics
        const pipeline = TIER_TO_PIPELINE[parsed.tier] || 'unknown';
        const cluster = RISK_TOPIC_TO_CLUSTER[parsed.risk_topic] || 'general-coverage';

        result.byPipeline[pipeline] = (result.byPipeline[pipeline] || 0) + 1;
        result.byCluster[cluster] = (result.byCluster[cluster] || 0) + 1;
      } else {
        result.skipped++;
      }
    } catch (error) {
      result.errors++;
      console.error(`Failed to import keyword:`, error);
    }
  }

  return result;
}
