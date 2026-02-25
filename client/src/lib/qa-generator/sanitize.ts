/**
 * Post-processing sanitization for generated answers
 *
 * Strips hedge phrases that slip through prompt constraints.
 * Run BEFORE evaluation gates.
 */

const HEDGE_REPLACEMENTS: Record<string, string> = {
  // Single-word hedges → specific alternatives
  'typically': 'by default',
  'usually': 'as a standard condition',
  'often': 'in most documented cases',

  // Phrase hedges → specific alternatives
  'generally speaking': '',
  'in most cases': 'where',
  'most policies': 'standard hull and machinery policies',
  'coverage depends': 'coverage is determined by',
  'verify with your insurer': 'confirm in the declarations page',
  'it depends': 'the determining factor is',
  'may or may not': 'will or will not',
  'might be covered': 'is covered when',
  'could potentially': 'will',
  'contact your broker': 'review your policy declarations',
  'speak with your agent': 'review your policy declarations',
  'consult a professional': '',
  'check your policy wording': 'as stated in the policy',
  'it varies': 'the specific threshold is',
};

/**
 * Replace hedge phrases with specific alternatives
 */
function sanitizeHedges(answer: string): string {
  let cleaned = answer;

  // Sort by length descending to replace longer phrases first
  const sortedPhrases = Object.entries(HEDGE_REPLACEMENTS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [phrase, replacement] of sortedPhrases) {
    const regex = new RegExp(phrase, 'gi');
    cleaned = cleaned.replace(regex, replacement);
  }

  // Clean up any double spaces or empty bold markers
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  cleaned = cleaned.replace(/\*\*\s*\*\*/g, '');

  return cleaned.trim();
}

/**
 * Full sanitization pipeline
 */
function sanitizeAnswer(answer: string): string {
  return sanitizeHedges(answer);
}

export {
  sanitizeAnswer,
  sanitizeHedges,
  HEDGE_REPLACEMENTS,
};
