/**
 * Allowlist Validator - Reference ID Validation System
 *
 * Validates that all reference IDs mentioned in paper bodies
 * exist in the reference_registry allowlist.
 *
 * Functions:
 *   validateRefIds()           - Check ref IDs against allowlist
 *   measureCurrentPaperFailures() - Audit all drafts for invalid refs
 *
 * Usage:
 *   npx tsx cli.ts validate-refs
 */

import { db } from './db';

// ─── TYPES ───────────────────────────────────────────────────

export interface ValidationResult {
  passed: boolean;
  invalidRefs: string[];
  validRefs: string[];
}

interface PaperFailureReport {
  paperId: string;
  title: string;
  totalRefs: number;
  validRefs: string[];
  invalidRefs: string[];
  passed: boolean;
}

export interface MeasurementResult {
  totalPapers: number;
  passingPapers: number;
  failingPapers: number;
  passRate: number;
  failureDetails: PaperFailureReport[];
}

// ─── REF ID EXTRACTION ───────────────────────────────────────

/**
 * Extract all ref_id patterns from body text.
 * Matches patterns like [ref_001], [ref_002], [ref_abyc_e11], etc.
 * Also extracts from numbered reference lists in References section.
 */
function extractRefIdsFromBody(body: string): string[] {
  const refIds = new Set<string>();

  // Pattern 1: Inline citations like [ref_001], [ref_abyc_e11]
  const inlinePattern = /\[ref_[a-zA-Z0-9_-]+\]/gi;
  const inlineMatches = body.match(inlinePattern) || [];
  for (const match of inlineMatches) {
    // Extract just the ref_id without brackets
    const refId = match.slice(1, -1).toLowerCase();
    refIds.add(refId);
  }

  // Pattern 2: References section - extract ref IDs from formatted citations
  // Look for ref_id mentions in the References section
  const referencesSection = body.match(/## References\n([\s\S]*?)(?:\n## |$)/)?.[1] ?? '';

  // Match ref_id patterns in the references section (with or without brackets)
  const refSectionPattern = /ref_[a-zA-Z0-9_-]+/gi;
  const refSectionMatches = referencesSection.match(refSectionPattern) || [];
  for (const match of refSectionMatches) {
    refIds.add(match.toLowerCase());
  }

  // Pattern 3: Data attributes or other formats
  const dataRefPattern = /data-ref=["']?(ref_[a-zA-Z0-9_-]+)["']?/gi;
  let dataMatch;
  while ((dataMatch = dataRefPattern.exec(body)) !== null) {
    refIds.add(dataMatch[1].toLowerCase());
  }

  return Array.from(refIds);
}

// ─── VALIDATION ──────────────────────────────────────────────

/**
 * Validate extracted ref IDs against an allowlist.
 *
 * @param body - The paper body text to scan for ref IDs
 * @param allowedRefs - Array of valid ref IDs from reference_registry
 * @returns ValidationResult with pass/fail status and ref breakdowns
 */
export function validateRefIds(body: string, allowedRefs: string[]): ValidationResult {
  const extractedRefs = extractRefIdsFromBody(body);

  // Normalize allowedRefs to lowercase for comparison
  const allowedSet = new Set(allowedRefs.map(r => r.toLowerCase()));

  const validRefs: string[] = [];
  const invalidRefs: string[] = [];

  for (const refId of extractedRefs) {
    if (allowedSet.has(refId)) {
      validRefs.push(refId);
    } else {
      invalidRefs.push(refId);
    }
  }

  return {
    passed: invalidRefs.length === 0,
    invalidRefs,
    validRefs,
  };
}

// ─── MEASUREMENT ─────────────────────────────────────────────

/**
 * Measure how many current draft papers would fail strict allowlist validation.
 *
 * Fetches all draft papers from Supabase, extracts reference IDs,
 * checks against reference_registry, and reports failure rates.
 */
export async function measureCurrentPaperFailures(): Promise<MeasurementResult> {
  // 1. Fetch all valid ref IDs from reference_registry
  const { data: registryRefs, error: registryError } = await db
    .from('reference_registry')
    .select('ref_id');

  if (registryError) {
    throw new Error(`Failed to fetch reference_registry: ${registryError.message}`);
  }

  const allowedRefs = (registryRefs ?? []).map(r => r.ref_id);
  console.log(`Loaded ${allowedRefs.length} valid ref IDs from reference_registry\n`);

  // 2. Fetch all draft papers
  const { data: papers, error: papersError } = await db
    .from('papers')
    .select('id, title, body_markdown')
    .eq('review_status', 'draft');

  if (papersError) {
    throw new Error(`Failed to fetch papers: ${papersError.message}`);
  }

  if (!papers || papers.length === 0) {
    return {
      totalPapers: 0,
      passingPapers: 0,
      failingPapers: 0,
      passRate: 100,
      failureDetails: [],
    };
  }

  // 3. Validate each paper
  const failureDetails: PaperFailureReport[] = [];
  let passingPapers = 0;
  let failingPapers = 0;

  for (const paper of papers) {
    if (!paper.body_markdown) continue;

    const result = validateRefIds(paper.body_markdown, allowedRefs);

    const report: PaperFailureReport = {
      paperId: paper.id,
      title: paper.title ?? 'Untitled',
      totalRefs: result.validRefs.length + result.invalidRefs.length,
      validRefs: result.validRefs,
      invalidRefs: result.invalidRefs,
      passed: result.passed,
    };

    failureDetails.push(report);

    if (result.passed) {
      passingPapers++;
    } else {
      failingPapers++;
    }
  }

  const totalPapers = papers.length;
  const passRate = totalPapers > 0
    ? Math.round((passingPapers / totalPapers) * 100)
    : 100;

  return {
    totalPapers,
    passingPapers,
    failingPapers,
    passRate,
    failureDetails,
  };
}

// ─── CLI RUNNER ──────────────────────────────────────────────

/**
 * CLI entry point for validate-refs command.
 * Runs measureCurrentPaperFailures and outputs formatted report.
 */
export async function runValidateRefs(): Promise<void> {
  console.log('\n=== Reference ID Allowlist Validation ===\n');
  console.log('Checking all draft papers for invalid ref IDs...\n');

  const result = await measureCurrentPaperFailures();

  // Summary
  console.log('─'.repeat(60));
  console.log('SUMMARY');
  console.log('─'.repeat(60));
  console.log(`Total draft papers:  ${result.totalPapers}`);
  console.log(`Passing (no invalid refs): ${result.passingPapers}`);
  console.log(`Failing (has invalid refs): ${result.failingPapers}`);
  console.log(`Pass rate: ${result.passRate}%`);
  console.log('');

  // Failure details
  const failures = result.failureDetails.filter(r => !r.passed);

  if (failures.length > 0) {
    console.log('─'.repeat(60));
    console.log('PAPERS WITH INVALID REF IDS');
    console.log('─'.repeat(60));

    for (const failure of failures) {
      console.log(`\n${failure.paperId.slice(0, 8)}... ${failure.title.slice(0, 50)}`);
      console.log(`  Total refs: ${failure.totalRefs}`);
      console.log(`  Valid:   ${failure.validRefs.length} - ${failure.validRefs.slice(0, 3).join(', ')}${failure.validRefs.length > 3 ? '...' : ''}`);
      console.log(`  Invalid: ${failure.invalidRefs.length} - ${failure.invalidRefs.join(', ')}`);
    }
  } else {
    console.log('All papers pass allowlist validation.');
  }

  console.log('');
}
