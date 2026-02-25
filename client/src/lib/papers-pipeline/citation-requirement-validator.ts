/**
 * Citation Requirement Validator (Fix E)
 *
 * Detects uncited numbers and standards in paper content.
 * Ensures claims about costs, percentages, timelines, and distances have proper citations.
 * Validates standard references against an allowlist of real standards.
 */

import { db } from './db';

// ============================================================================
// Types
// ============================================================================

export interface ClaimViolation {
  type: 'cost_claim' | 'percentage_claim' | 'timeline_claim' | 'distance_claim';
  match: string;
  sentence: string;
  position: number;
}

export interface CitationValidationResult {
  passed: boolean;
  uncitedClaims: ClaimViolation[];
  invalidStandards: string[];
}

export interface GateResult {
  gate: string;
  passed: boolean;
  fatal: boolean;
  detail: string;
}

export interface MeasurementReport {
  totalUncitedCostClaims: number;
  totalUncitedPercentageClaims: number;
  totalUncitedTimelineClaims: number;
  totalUncitedDistanceClaims: number;
  totalInvalidStandards: number;
  papersAnalyzed: number;
  papersThatWouldFail: string[];
  detailedViolations: {
    paperId: string;
    paperTitle: string;
    uncitedClaims: ClaimViolation[];
    invalidStandards: string[];
  }[];
}

// ============================================================================
// Patterns that REQUIRE citation
// ============================================================================

const REQUIRES_CITATION = [
  { pattern: /\$[\d,]+(?:\.\d{2})?(?:\s*[-–]\s*\$[\d,]+(?:\.\d{2})?)?/g, name: 'cost_claim' as const },
  { pattern: /\d+(?:\.\d+)?%/g, name: 'percentage_claim' as const },
  { pattern: /\d+\s*(?:days?|hours?|weeks?|months?|years?)\b/gi, name: 'timeline_claim' as const },
  { pattern: /\d+\s*(?:meters?|feet|ft|nm|nautical miles?|miles?)\b/gi, name: 'distance_claim' as const },
];

// ============================================================================
// Allowlist of real standards
// ============================================================================

const ALLOWED_STANDARDS = [
  // ISO Standards
  'ISO 12215', 'ISO 8666', 'ISO 10240', 'ISO 15584', 'ISO 15085', 'ISO 17020', 'ISO 17357',
  // ABYC Standards
  'ABYC E-11', 'ABYC H-2', 'ABYC A-22', 'ABYC H-24',
  // NFPA Standards
  'NFPA 302', 'NFPA 303', 'NFPA 51B',
  // CFR Standards
  'CFR 33', 'CFR 46', '33 CFR', '46 CFR',
  // SOLAS Standards
  'SOLAS Chapter II-1', 'SOLAS Chapter II-2', 'SOLAS Ch. II',
  // MARPOL Standards
  'MARPOL Annex I', 'MARPOL Annex II', 'MARPOL Annex VI',
  // Other Maritime Standards
  'MLC 2006', 'IHC 2003', 'MIA 1906', 'OPA 90',
];

const STANDARD_PATTERN = /\b(ISO|ASTM|CFR|SOLAS|MARPOL|ABYC|NFPA)\s*[\w\d.-]+/gi;

// Citation reference pattern - matches [ref_id] format
const CITATION_PATTERN = /\[[^\]]+\]/g;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Splits text into sentences for analysis
 */
function splitIntoSentences(text: string): { sentence: string; start: number; end: number }[] {
  const sentences: { sentence: string; start: number; end: number }[] = [];
  // Match sentences ending with period, question mark, or exclamation
  // Also handles cases where sentence might end at paragraph boundary
  const sentenceRegex = /[^.!?\n]+[.!?]?(?=\s|$)/g;
  let match;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentence = match[0].trim();
    if (sentence.length > 0) {
      sentences.push({
        sentence,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  return sentences;
}

/**
 * Checks if a claim has a citation within the same sentence
 */
function hasCitationInSentence(sentence: string): boolean {
  return CITATION_PATTERN.test(sentence);
}

/**
 * Normalizes a standard reference for comparison
 */
function normalizeStandard(standard: string): string {
  return standard
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/**
 * Checks if a found standard matches any allowed standard
 */
function isAllowedStandard(foundStandard: string): boolean {
  const normalized = normalizeStandard(foundStandard);

  return ALLOWED_STANDARDS.some(allowed => {
    const normalizedAllowed = normalizeStandard(allowed);
    // Check if the found standard starts with or equals an allowed standard
    return normalized === normalizedAllowed ||
           normalized.startsWith(normalizedAllowed + ' ') ||
           normalizedAllowed.startsWith(normalized);
  });
}

/**
 * Finds the sentence containing a given position
 */
function findSentenceAtPosition(
  sentences: { sentence: string; start: number; end: number }[],
  position: number
): string {
  for (const s of sentences) {
    if (position >= s.start && position < s.end) {
      return s.sentence;
    }
  }
  // Fallback: return nearby context
  return '';
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validates citation requirements in the given body text.
 *
 * Checks for:
 * 1. Uncited claims (costs, percentages, timelines, distances)
 * 2. Invalid/unknown standard references
 *
 * @param body - The paper body text to validate
 * @returns CitationValidationResult with pass/fail status and violations
 */
export function validateCitationRequirements(body: string): CitationValidationResult {
  const uncitedClaims: ClaimViolation[] = [];
  const invalidStandards: string[] = [];

  // Split body into sentences for context
  const sentences = splitIntoSentences(body);

  // Check each claim pattern
  for (const { pattern, name } of REQUIRES_CITATION) {
    // Reset regex lastIndex for each use
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(body)) !== null) {
      const matchedText = match[0];
      const position = match.index;

      // Find the sentence containing this claim
      const sentence = findSentenceAtPosition(sentences, position);

      // Check if the sentence has a citation
      if (!hasCitationInSentence(sentence)) {
        uncitedClaims.push({
          type: name,
          match: matchedText,
          sentence: sentence.substring(0, 200) + (sentence.length > 200 ? '...' : ''),
          position,
        });
      }
    }
  }

  // Check standard references against allowlist
  const standardRegex = new RegExp(STANDARD_PATTERN.source, STANDARD_PATTERN.flags);
  let standardMatch;
  const seenStandards = new Set<string>();

  while ((standardMatch = standardRegex.exec(body)) !== null) {
    const foundStandard = standardMatch[0];
    const normalizedFound = normalizeStandard(foundStandard);

    // Skip if we've already checked this standard
    if (seenStandards.has(normalizedFound)) {
      continue;
    }
    seenStandards.add(normalizedFound);

    // Check if it's an allowed standard
    if (!isAllowedStandard(foundStandard)) {
      invalidStandards.push(foundStandard);
    }
  }

  const passed = uncitedClaims.length === 0 && invalidStandards.length === 0;

  return {
    passed,
    uncitedClaims,
    invalidStandards,
  };
}

// ============================================================================
// Gate Integration
// ============================================================================

/**
 * Runs the citation requirements gate check.
 *
 * Integrates with the paper pipeline gate system.
 *
 * Fatal conditions:
 * - More than 5 uncited claims
 * - Any invalid standard references
 *
 * @param body - The paper body text to check
 * @returns GateResult for integration with gate system
 */
export function runGateCitations(body: string): GateResult {
  const result = validateCitationRequirements(body);

  const uncitedCount = result.uncitedClaims.length;
  const invalidCount = result.invalidStandards.length;

  // Fatal if too many uncited claims or any invalid standards
  const fatal = uncitedCount > 5 || invalidCount > 0;

  // Build detail message
  let detail: string;

  if (result.passed) {
    detail = 'All claims are properly cited and all standards are valid.';
  } else {
    const parts: string[] = [];

    if (uncitedCount > 0) {
      const claimTypes = new Map<string, number>();
      for (const claim of result.uncitedClaims) {
        claimTypes.set(claim.type, (claimTypes.get(claim.type) || 0) + 1);
      }

      const breakdown = Array.from(claimTypes.entries())
        .map(([type, count]) => `${count} ${type.replace('_', ' ')}${count > 1 ? 's' : ''}`)
        .join(', ');

      parts.push(`${uncitedCount} uncited claim${uncitedCount > 1 ? 's' : ''} (${breakdown})`);
    }

    if (invalidCount > 0) {
      parts.push(`${invalidCount} invalid standard${invalidCount > 1 ? 's' : ''}: ${result.invalidStandards.join(', ')}`);
    }

    detail = parts.join('; ');

    if (fatal) {
      detail += ' [FATAL]';
    }
  }

  return {
    gate: 'Citation Requirements',
    passed: result.passed,
    fatal,
    detail,
  };
}

// ============================================================================
// Measurement Function
// ============================================================================

/**
 * Runs citation validation against all draft papers and generates a report.
 *
 * Useful for measuring the impact of the validation rules across the corpus.
 *
 * @returns MeasurementReport with aggregate statistics and per-paper details
 */
export async function measureClaimViolations(): Promise<MeasurementReport> {
  // Get all draft papers from the database
  const { data: papers, error } = await db
    .from('papers')
    .select('id, title, body_markdown')
    .eq('review_status', 'draft');

  if (error) {
    throw new Error(`Failed to fetch papers: ${error.message}`);
  }

  const report: MeasurementReport = {
    totalUncitedCostClaims: 0,
    totalUncitedPercentageClaims: 0,
    totalUncitedTimelineClaims: 0,
    totalUncitedDistanceClaims: 0,
    totalInvalidStandards: 0,
    papersAnalyzed: papers.length,
    papersThatWouldFail: [],
    detailedViolations: [],
  };

  for (const paper of papers || []) {
    if (!paper.body_markdown) {
      continue;
    }

    const result = validateCitationRequirements(paper.body_markdown);

    // Count violations by type
    for (const claim of result.uncitedClaims) {
      switch (claim.type) {
        case 'cost_claim':
          report.totalUncitedCostClaims++;
          break;
        case 'percentage_claim':
          report.totalUncitedPercentageClaims++;
          break;
        case 'timeline_claim':
          report.totalUncitedTimelineClaims++;
          break;
        case 'distance_claim':
          report.totalUncitedDistanceClaims++;
          break;
      }
    }

    report.totalInvalidStandards += result.invalidStandards.length;

    // Check if paper would fail gate
    const gateResult = runGateCitations(paper.body_markdown);
    if (!gateResult.passed) {
      report.papersThatWouldFail.push(paper.id);

      // Add detailed violation info
      report.detailedViolations.push({
        paperId: paper.id,
        paperTitle: paper.title || 'Untitled',
        uncitedClaims: result.uncitedClaims,
        invalidStandards: result.invalidStandards,
      });
    }
  }

  return report;
}

/**
 * Formats the measurement report for display
 */
export function formatMeasurementReport(report: MeasurementReport): string {
  const lines: string[] = [
    '=== Citation Requirement Validation Report ===',
    '',
    `Papers Analyzed: ${report.papersAnalyzed}`,
    `Papers That Would Fail: ${report.papersThatWouldFail.length}`,
    '',
    '--- Uncited Claims by Type ---',
    `  Cost claims: ${report.totalUncitedCostClaims}`,
    `  Percentage claims: ${report.totalUncitedPercentageClaims}`,
    `  Timeline claims: ${report.totalUncitedTimelineClaims}`,
    `  Distance claims: ${report.totalUncitedDistanceClaims}`,
    `  Total uncited: ${report.totalUncitedCostClaims + report.totalUncitedPercentageClaims + report.totalUncitedTimelineClaims + report.totalUncitedDistanceClaims}`,
    '',
    `--- Invalid Standards: ${report.totalInvalidStandards} ---`,
    '',
  ];

  if (report.papersThatWouldFail.length > 0) {
    lines.push('--- Papers That Would Fail ---');
    for (const violation of report.detailedViolations) {
      lines.push(`  ${violation.paperId}: ${violation.paperTitle}`);
      lines.push(`    Uncited claims: ${violation.uncitedClaims.length}`);
      lines.push(`    Invalid standards: ${violation.invalidStandards.length}`);
      if (violation.invalidStandards.length > 0) {
        lines.push(`    Standards: ${violation.invalidStandards.join(', ')}`);
      }
    }
  }

  return lines.join('\n');
}
