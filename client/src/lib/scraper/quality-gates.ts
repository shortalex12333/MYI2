/**
 * Quality Gates for Q&A Entries
 * Validates and flags candidates before review
 */

import crypto from 'crypto';

export interface QACandidate {
  question: string;
  answer: string;
  tags: string[];
  confidence: number;
  extractionMethod: 'faq_pattern' | 'header_inference' | 'definition_extraction';
  entities: Array<{ type: string; value: string; confidence: number }>;
}

export interface ValidatedCandidate extends QACandidate {
  questionHash: string;
  answerHash: string;
  qualityFlags: string[];
  isApproved: boolean;
  rejectionReason?: string;
}

// ============================================================================
// Quality Rule Definitions
// ============================================================================

const MARKETING_TERMS = [
  'best', 'leading', 'award-winning', 'trusted', 'exclusive', 'premium',
  'state-of-the-art', 'cutting-edge', 'revolutionary', 'innovative',
  'industry-leading', 'our experts', 'top rated', 'highly recommended',
  'click here', 'learn more', 'contact us', 'call now', 'get a quote',
  'call today', 'free quote', 'special offer', 'limited time', 'buy now',
];

const LEGAL_ADVICE_TERMS = [
  'should consult', 'should contact', 'must consult', 'legal advice',
  'consult an attorney', 'talk to a lawyer', 'seek legal counsel',
  'not legal advice', 'we are not lawyers', 'not a substitute',
];

const REGION_MARKERS = {
  US: ['United States', 'USA', 'US waters', 'USCG', 'federal waters', 'continental shelf'],
  UK: ['United Kingdom', 'UK waters', 'UK Flag', 'Crown Dependencies', 'UK waters'],
  EU: ['European', 'EU waters', 'European Union'],
  AUSTRALIA: ['Australia', 'Australian', 'Great Barrier'],
};

// ============================================================================
// Core Validation Functions
// ============================================================================

/**
 * Hash a string using SHA256
 */
export function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Check answer length constraints
 */
function validateLength(answer: string): { valid: boolean; flag?: string } {
  const wordCount = answer.trim().split(/\s+/).length;

  if (wordCount < 40) {
    return { valid: false, flag: 'too_short' };
  }
  if (wordCount > 120) {
    return { valid: false, flag: 'too_long' };
  }

  return { valid: true };
}

/**
 * Remove or flag marketing language
 */
function checkMarketingTone(text: string): { cleanedText: string; hasMarketing: boolean } {
  const lowerText = text.toLowerCase();
  let hasMarketing = false;

  let cleaned = text;
  for (const term of MARKETING_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(lowerText)) {
      hasMarketing = true;
      cleaned = cleaned.replace(regex, '');
    }
  }

  return { cleanedText: cleaned.trim(), hasMarketing };
}

/**
 * Check for legal advice phrasing
 */
function checkLegalAdvicePhrase(text: string): boolean {
  const lowerText = text.toLowerCase();
  return LEGAL_ADVICE_TERMS.some(term => lowerText.includes(term));
}

/**
 * Detect regional specificity
 */
function detectRegion(question: string, answer: string): string[] {
  const combined = `${question} ${answer}`.toLowerCase();
  const regions: string[] = [];

  for (const [region, markers] of Object.entries(REGION_MARKERS)) {
    for (const marker of markers) {
      if (combined.includes(marker.toLowerCase())) {
        regions.push(region);
        break;
      }
    }
  }

  return regions.length > 0 ? regions : [];
}

/**
 * Check for duplicate-like patterns
 * (exact question match would be caught by unique constraint, but check semantics)
 */
function isSemanticallyDuplicate(
  question: string,
  existingQuestions?: string[]
): boolean {
  if (!existingQuestions) return false;

  const normalize = (q: string) =>
    q.toLowerCase().replace(/[?!.]/g, '').replace(/\s+/g, ' ').trim();

  const normalized = normalize(question);

  return existingQuestions.some(
    existing => normalize(existing) === normalized
  );
}

/**
 * Confidence-based approval
 */
function validateConfidence(
  confidence: number,
  extractionMethod: string
): { valid: boolean; flag?: string } {
  // Lower threshold for FAQ patterns (highest confidence source)
  if (extractionMethod === 'faq_pattern' && confidence >= 0.7) {
    return { valid: true };
  }

  // Medium threshold for others
  if (confidence >= 0.65) {
    return { valid: true };
  }

  return { valid: false, flag: 'low_confidence' };
}

// ============================================================================
// Main Validation Pipeline
// ============================================================================

/**
 * Full validation of a Q&A candidate
 * Returns validated candidate with flags and approval decision
 */
export function validateCandidate(
  candidate: QACandidate,
  existingQuestions?: string[]
): ValidatedCandidate {
  const flags: string[] = [];
  let isApproved = true;
  let rejectionReason: string | undefined;

  // 1. Check answer length
  const lengthCheck = validateLength(candidate.answer);
  if (!lengthCheck.valid && lengthCheck.flag) {
    flags.push(lengthCheck.flag);
    if (lengthCheck.flag === 'too_short') {
      isApproved = false;
      rejectionReason = 'Answer is too short (< 40 words)';
    }
    if (lengthCheck.flag === 'too_long') {
      // Truncate instead of reject
      candidate = {
        ...candidate,
        answer: candidate.answer.split(/\s+/).slice(0, 120).join(' ') + ' ...',
      };
      flags.push('truncated_to_120_words');
    }
  }

  // 2. Check marketing tone
  const marketingCheck = checkMarketingTone(candidate.answer);
  if (marketingCheck.hasMarketing) {
    flags.push('marketing_tone');
    candidate = {
      ...candidate,
      answer: marketingCheck.cleanedText,
    };
  }

  // 3. Check for legal advice phrasing
  if (checkLegalAdvicePhrase(candidate.answer)) {
    flags.push('legal_advice_phrasing');
    isApproved = false;
    rejectionReason = 'Contains legal advice phrasing (disallowed)';
  }

  // 4. Check confidence
  const confidenceCheck = validateConfidence(candidate.confidence, candidate.extractionMethod);
  if (!confidenceCheck.valid && confidenceCheck.flag) {
    flags.push(confidenceCheck.flag);
    if (candidate.extractionMethod !== 'faq_pattern') {
      isApproved = false;
      rejectionReason = 'Confidence below threshold and not from FAQ pattern';
    }
  }

  // 5. Check for duplicates
  if (isSemanticallyDuplicate(candidate.question, existingQuestions)) {
    flags.push('duplicate');
    isApproved = false;
    rejectionReason = 'Semantically duplicate question';
  }

  // 6. Detect regional specificity
  const regions = detectRegion(candidate.question, candidate.answer);
  if (regions.length > 0) {
    flags.push(`region_specific:${regions.join(',')}`);
    // Don't reject, just flag
  }

  // 7. Check clarity (very basic: question mark, answer mentions keywords)
  const hasQuestionMark = candidate.question.endsWith('?');
  const hasAnswer = candidate.answer.length > 20;
  if (!hasQuestionMark || !hasAnswer) {
    flags.push('unclear_scope');
    isApproved = false;
    rejectionReason = 'Unclear question or minimal answer';
  }

  return {
    ...candidate,
    questionHash: hashContent(candidate.question),
    answerHash: hashContent(candidate.answer),
    qualityFlags: flags,
    isApproved,
    rejectionReason,
  };
}

/**
 * Batch validation of multiple candidates
 */
export function validateCandidateBatch(
  candidates: QACandidate[],
  existingQuestions?: string[]
): ValidatedCandidate[] {
  return candidates.map(candidate =>
    validateCandidate(candidate, existingQuestions)
  );
}

/**
 * Filter to only approved candidates (ready for review)
 */
export function filterApprovedCandidates(
  validated: ValidatedCandidate[]
): ValidatedCandidate[] {
  return validated.filter(c => c.isApproved);
}

/**
 * Get rejection summary for batch
 */
export function getRejectionSummary(validated: ValidatedCandidate[]): {
  total: number;
  approved: number;
  rejected: number;
  rejectionsByReason: Record<string, number>;
} {
  const rejectionsByReason: Record<string, number> = {};

  for (const candidate of validated) {
    if (!candidate.isApproved && candidate.rejectionReason) {
      rejectionsByReason[candidate.rejectionReason] =
        (rejectionsByReason[candidate.rejectionReason] || 0) + 1;
    }
  }

  return {
    total: validated.length,
    approved: validated.filter(c => c.isApproved).length,
    rejected: validated.filter(c => !c.isApproved).length,
    rejectionsByReason,
  };
}

// ============================================================================
// Rewrite/Normalization Helpers
// ============================================================================

/**
 * Normalize answer to strict word count + remove common fluff
 */
export function normalizeAnswer(answer: string): string {
  let normalized = answer;

  // Remove common conclusion phrases
  const fluffPhrases = [
    /For more information[,.]?.*/gi,
    /If you have questions[,.]?.*/gi,
    /Feel free to[,.]?.*/gi,
    /Don't hesitate to[,.]?.*/gi,
  ];

  for (const phrase of fluffPhrases) {
    normalized = normalized.replace(phrase, '').trim();
  }

  // Break into sentences, max 15 words per sentence
  const sentences = normalized.split(/[.!?]+/).filter(s => s.trim());
  const refinedSentences = sentences.map(sentence => {
    const words = sentence.trim().split(/\s+/);
    if (words.length > 15) {
      // Split long sentences
      const chunks = [];
      for (let i = 0; i < words.length; i += 15) {
        chunks.push(words.slice(i, i + 15).join(' '));
      }
      return chunks.join('. ') + '.';
    }
    return sentence.trim() + '.';
  });

  return refinedSentences.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Suggested edits to improve candidate
 */
export function suggestEdits(candidate: ValidatedCandidate): {
  suggestedQuestion?: string;
  suggestedAnswer?: string;
  improvements: string[];
} {
  const improvements: string[] = [];
  let suggestedQuestion = candidate.question;
  let suggestedAnswer = candidate.answer;

  // Suggestion 1: Normalize answer
  if (candidate.qualityFlags.includes('marketing_tone')) {
    suggestedAnswer = normalizeAnswer(candidate.answer);
    improvements.push('Removed marketing language');
  }

  // Suggestion 2: Standardize question format
  if (!candidate.question.endsWith('?')) {
    suggestedQuestion = candidate.question.replace(/[?!]*$/, '') + '?';
    improvements.push('Standardized question format');
  }

  // Suggestion 3: Add context if region-specific
  const regionFlag = candidate.qualityFlags.find(f => f.startsWith('region_specific'));
  if (regionFlag) {
    const regions = regionFlag.split(':')[1]?.split(',') || [];
    if (regions.length > 0 && !suggestedAnswer.includes(`(${regions[0]})`)) {
      suggestedQuestion = `${suggestedQuestion.replace('?', '')} (${regions[0]})?`;
      improvements.push(`Added regional context: ${regions.join(', ')}`);
    }
  }

  return {
    suggestedQuestion,
    suggestedAnswer,
    improvements,
  };
}

// ============================================================================
// Export quality metrics
// ============================================================================

export function getQualityScore(candidate: ValidatedCandidate): number {
  let score = 100;

  // Deduct for flags
  const flagPenalties: Record<string, number> = {
    too_short: 25,
    too_long: 10,
    marketing_tone: 15,
    legal_advice_phrasing: 100,  // Auto-reject
    low_confidence: 20,
    duplicate: 100,  // Auto-reject
    unclear_scope: 30,
  };

  for (const flag of candidate.qualityFlags) {
    const baseFlag = flag.split(':')[0];
    score -= flagPenalties[baseFlag] || 5;
  }

  // Bonus for high confidence
  score += Math.round((candidate.confidence - 0.5) * 10);

  // Bonus for FAQ pattern
  if (candidate.extractionMethod === 'faq_pattern') {
    score += 15;
  }

  return Math.max(0, Math.min(100, score));
}
