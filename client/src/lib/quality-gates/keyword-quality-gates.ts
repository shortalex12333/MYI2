import { GateResult, checkReadability } from './readability-checker';
import { checkKeywordDensity } from './keyword-density-checker';

export interface ValidationResult {
  contentId?: string;
  passed: boolean;
  gates: GateResult[];
  verdict: 'publish' | 'revise' | 'reject';
  requiresReview: boolean;
}

export interface KeywordData {
  keyword: string;
  search_volume: number | null;
  intent_tier: string | null;
}

/**
 * FR-4.1: Pre-generation validation
 * Verify keyword has required data before generating content
 */
export function validatePreGeneration(keyword: KeywordData): GateResult {
  const issues: string[] = [];

  if (!keyword.search_volume) {
    issues.push('missing search_volume');
  }
  if (!keyword.intent_tier) {
    issues.push('missing intent_tier');
  }

  return {
    gate: 'Pre-Generation',
    passed: issues.length === 0,
    detail: issues.length === 0
      ? 'Keyword has required data'
      : `Missing: ${issues.join(', ')}`,
    fatal: issues.length > 0,  // Block generation
  };
}

/**
 * FR-4.5: 20% spot-check selection
 */
export function shouldFlagForReview(): boolean {
  return Math.random() < 0.2;
}

/**
 * FR-4.2: Word count gate (configurable by content type)
 */
export function checkWordCount(
  content: string,
  minWords: number = 300
): GateResult {
  const words = content.split(/\s+/).filter(w => w.length > 0).length;
  return {
    gate: 'Word Count',
    passed: words >= minWords,
    detail: `${words} words (minimum: ${minWords})`,
    fatal: words < minWords * 0.5,  // Less than half = fatal
  };
}

/**
 * Run all keyword-specific quality gates
 * FR-4.2, FR-4.3, FR-4.4, FR-4.5, FR-4.6, FR-4.7
 */
export function runKeywordQualityGates(
  content: string,
  targetKeyword: string,
  minWordCount: number = 300
): ValidationResult {
  const gates: GateResult[] = [
    checkWordCount(content, minWordCount),
    checkReadability(content),
    checkKeywordDensity(content, targetKeyword),
  ];

  const hasFatal = gates.some(g => g.fatal && !g.passed);
  const allPassed = gates.every(g => g.passed);
  const anyFailed = gates.some(g => !g.passed);

  // FR-4.7: Determine verdict
  const verdict = hasFatal ? 'reject'
                : allPassed ? 'publish'
                : 'revise';

  // FR-4.5 + FR-4.6: Auto-flag on failure OR random 20%
  const requiresReview = anyFailed || shouldFlagForReview();

  return {
    passed: allPassed,
    gates,
    verdict,
    requiresReview,
  };
}

// Re-export types
export type { GateResult };
