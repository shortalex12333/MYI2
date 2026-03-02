import { GateResult, extractTextContent } from './readability-checker';

// Re-export for convenience (shared utility)
export { extractTextContent };

/**
 * Count occurrences of keyword in text (case-insensitive)
 * Handles multi-word keywords
 */
export function countKeywordOccurrences(text: string, keyword: string): number {
  const textLower = text.toLowerCase();
  const keywordLower = keyword.toLowerCase();

  // Use split to count (length - 1 = occurrences)
  return textLower.split(keywordLower).length - 1;
}

/**
 * FR-4.3: Check keyword density < 3%
 * Formula: (keyword occurrences / total words) × 100
 * Pass: < 3%
 * Fatal: >= 5% (keyword stuffing)
 */
export function checkKeywordDensity(content: string, targetKeyword: string): GateResult {
  // Extract text content (reuse from readability checker)
  const text = extractTextContent(content);

  const words = text.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  if (totalWords === 0) {
    return {
      gate: 'Keyword Density',
      passed: true,
      detail: 'Content empty or whitespace only',
      fatal: false,
    };
  }

  const keywordCount = countKeywordOccurrences(text, targetKeyword);
  const density = (keywordCount / totalWords) * 100;

  return {
    gate: 'Keyword Density',
    passed: density < 3.0,
    detail: `${density.toFixed(2)}% (${keywordCount}/${totalWords} words, target: <3%)`,
    fatal: density >= 5.0,
  };
}
