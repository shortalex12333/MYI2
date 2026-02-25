/**
 * Gate 5: Reference-Question Relevance Check
 *
 * Validates that cited references are semantically relevant to the question topic.
 * Catches the "real reference, wrong application" problem where:
 * - SOLAS (ship construction/fire) is cited for charter/claims questions
 * - ICOMIA Refit (shipyard work) is cited for general coverage questions
 * - Jones Act (worker injury) is cited for charter structure questions
 *
 * Gates 1-4 cannot catch this because they reward presence of named references
 * without evaluating semantic relevance.
 */

interface EvalResult {
  passed: boolean;
  gate: string;
  details: string;
  matches?: string[];
}

// Hard exclusion map: references that should NEVER appear
// in answers to certain risk topics
const REFERENCE_EXCLUSIONS: Record<string, string[]> = {
  // SOLAS governs construction/fire/safety — not claims, coverage, charter, deductibles
  'solas': [
    'claims_denial', 'deductible', 'charter_exclusion',
    'racing', 'theft', 'financing', 'liveaboard',
    'quote_bind', 'policy_void', 'salvage', 'towing'
  ],

  // ICOMIA Refit Standard governs shipyard refit work — not general coverage questions
  'icomia': [
    'claims_denial', 'deductible', 'charter_exclusion',
    'racing', 'theft', 'financing', 'liveaboard', 'total_loss',
    'quote_bind', 'policy_void', 'liability', 'crew_coverage',
    'navigation_limits', 'salvage', 'towing'
  ],

  // Jones Act governs maritime worker injury claims — not charter structure or general coverage
  'jones act': [
    'charter_exclusion', 'deductible', 'hull_damage',
    'racing', 'theft', 'total_loss', 'fire', 'hurricane',
    'grounding', 'navigation_limits', 'quote_bind', 'financing'
  ],

  // FSS Code governs fire safety systems — not claims/deductibles/charter
  'fss code': [
    'claims_denial', 'deductible', 'charter_exclusion',
    'racing', 'theft', 'financing', 'liveaboard',
    'quote_bind', 'policy_void', 'salvage', 'towing'
  ],

  // ISM Code governs safety management — not individual coverage questions
  'ism code': [
    'deductible', 'theft', 'financing', 'quote_bind',
    'racing', 'liveaboard'
  ],
};

// Patterns to detect each reference type in text
const REFERENCE_PATTERNS: Record<string, RegExp> = {
  'solas': /\bsolas\b/i,
  'icomia': /\bicomia\b/i,
  'jones act': /\bjones act\b/i,
  'fss code': /\bfss code\b/i,
  'ism code': /\bism code\b/i,
};

/**
 * Check if references in the answer are appropriate for the risk topic
 */
export function checkReferenceRelevance(
  answer: string,
  riskTopic: string
): EvalResult {
  const violations: string[] = [];

  for (const [refKey, excludedTopics] of Object.entries(REFERENCE_EXCLUSIONS)) {
    const pattern = REFERENCE_PATTERNS[refKey];
    if (!pattern) continue;

    // Check if this reference appears in the answer
    if (pattern.test(answer)) {
      // Check if this risk topic is excluded for this reference
      if (excludedTopics.includes(riskTopic)) {
        violations.push(`"${refKey.toUpperCase()}" is not applicable to ${riskTopic}`);
      }
    }
  }

  return {
    passed: violations.length === 0,
    gate: 'Reference Relevance',
    details: violations.length === 0
      ? 'References are appropriate for risk topic'
      : `Misapplied reference(s): ${violations.join('; ')}`,
    matches: violations,
  };
}

/**
 * Infer risk topic from question text when not explicitly tagged
 */
export function inferRiskTopic(question: string): string {
  const q = question.toLowerCase();

  // Charter/rental keywords
  if (q.includes('charter') || q.includes('rental') || q.includes('rent')) {
    return 'charter_exclusion';
  }

  // Claims keywords
  if (q.includes('claim') || q.includes('denied') || q.includes('reject')) {
    return 'claims_denial';
  }

  // Deductible keywords
  if (q.includes('deductible') || q.includes('excess')) {
    return 'deductible';
  }

  // Racing keywords
  if (q.includes('racing') || q.includes('regatta') || q.includes('race')) {
    return 'racing';
  }

  // Theft keywords
  if (q.includes('theft') || q.includes('stolen') || q.includes('steal')) {
    return 'theft';
  }

  // Fire keywords
  if (q.includes('fire') || q.includes('burn') || q.includes('flame')) {
    return 'fire';
  }

  // Hurricane/storm keywords
  if (q.includes('hurricane') || q.includes('storm') || q.includes('named storm')) {
    return 'hurricane';
  }

  // Liveaboard keywords
  if (q.includes('liveaboard') || q.includes('live aboard') || q.includes('living on')) {
    return 'liveaboard';
  }

  // Total loss keywords
  if (q.includes('total loss') || q.includes('write off') || q.includes('totaled')) {
    return 'total_loss';
  }

  // Salvage keywords
  if (q.includes('salvage') || q.includes('wreck')) {
    return 'salvage';
  }

  // Towing keywords
  if (q.includes('tow') || q.includes('towing')) {
    return 'towing';
  }

  // Hull damage keywords
  if (q.includes('hull') || q.includes('damage') || q.includes('repair')) {
    return 'hull_damage';
  }

  // Liability keywords
  if (q.includes('liability') || q.includes('injur') || q.includes('passenger')) {
    return 'liability';
  }

  // Quote/bind keywords
  if (q.includes('quote') || q.includes('bind') || q.includes('insure a boat')) {
    return 'quote_bind';
  }

  // Financing keywords
  if (q.includes('financ') || q.includes('loan') || q.includes('lien')) {
    return 'financing';
  }

  // Default fallback
  return 'other';
}

export { REFERENCE_EXCLUSIONS, REFERENCE_PATTERNS };
