/**
 * Intent Router
 *
 * Classifies keywords into intent types and routes them to appropriate content pipelines.
 *
 * Intent Detection:
 * - question: User asking for information (how/what/why/when/where/does/can/is/are/should/do + ?)
 * - commercial: User researching purchase (best/cost/price/quote/compare/cheap/expensive/calculator/vs)
 * - informational: General knowledge seeking (default)
 *
 * Pipeline Mapping:
 * - question -> Q&A pipeline (direct answer format)
 * - commercial -> Topics pipeline (comparison/guide format)
 * - informational -> Papers pipeline (comprehensive article format)
 */

export type IntentType = 'question' | 'commercial' | 'informational';
export type PipelineType = 'paper' | 'qa' | 'topic';

// Question patterns: interrogative words and question marks
const QUESTION_PATTERN = /^(how|what|why|when|where|does|can|is|are|should|do)\b/i;
const QUESTION_MARK_PATTERN = /\?/;

// Commercial intent patterns: transactional and comparison keywords
const COMMERCIAL_PATTERN = /\b(best|cost|price|quote|compare|cheap|expensive|calculator|vs)\b/i;

/**
 * Detect user intent from keyword text
 *
 * Examples:
 * - "how much is yacht insurance" -> question
 * - "best yacht insurance florida" -> commercial
 * - "yacht insurance requirements" -> informational
 */
export function detectIntent(keyword: string): IntentType {
  const normalized = keyword.trim().toLowerCase();

  // Check for question patterns first (most specific)
  if (QUESTION_PATTERN.test(normalized) || QUESTION_MARK_PATTERN.test(normalized)) {
    return 'question';
  }

  // Check for commercial intent
  if (COMMERCIAL_PATTERN.test(normalized)) {
    return 'commercial';
  }

  // Default to informational
  return 'informational';
}

/**
 * Map intent type to content pipeline
 */
export function routeToPipeline(intent: IntentType): PipelineType {
  switch (intent) {
    case 'question':
      return 'qa';
    case 'commercial':
      return 'topic';
    case 'informational':
      return 'paper';
  }
}

/**
 * Main routing function: detect intent and return pipeline
 *
 * This is the primary export used by queue-processor.ts
 */
export function routeKeyword(keyword: string): PipelineType {
  const intent = detectIntent(keyword);
  const pipeline = routeToPipeline(intent);

  console.log(`[ROUTER] "${keyword}" -> intent: ${intent}, pipeline: ${pipeline}`);

  return pipeline;
}
