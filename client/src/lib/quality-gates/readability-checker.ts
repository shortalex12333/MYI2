import { flesch } from 'flesch';
import { syllable } from 'syllable';

export interface GateResult {
  gate: string;
  passed: boolean;
  detail: string;
  fatal: boolean;
}

/**
 * Extract readable text content from markdown
 * Removes: code blocks, markdown formatting, URLs
 */
export function extractTextContent(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')           // Remove code blocks
    .replace(/`[^`]+`/g, '')                  // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Extract link text only
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')     // Remove images
    .replace(/[#*_~`]/g, '')                  // Remove markdown formatting
    .replace(/<[^>]+>/g, '')                  // Remove HTML tags
    .replace(/\n+/g, ' ')                     // Normalize whitespace
    .trim();
}

/**
 * FR-4.4: Check Flesch Reading Ease score
 * Pass: >= 60 (standard readable)
 * Fatal: < 40 (extremely difficult)
 */
export function checkReadability(content: string): GateResult {
  const text = extractTextContent(content);

  // Count metrics
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);

  if (words.length < 5 || sentences.length === 0) {
    return {
      gate: 'Readability',
      passed: true,
      detail: 'Content too short for readability analysis',
      fatal: false,
    };
  }

  const totalWords = words.length;
  const totalSentences = sentences.length;
  const totalSyllables = words.reduce((sum, word) => sum + syllable(word), 0);

  // Flesch Reading Ease: 0-100, higher = easier
  const score = flesch({
    sentence: totalSentences,
    word: totalWords,
    syllable: totalSyllables,
  });

  return {
    gate: 'Readability',
    passed: score >= 60,
    detail: `Flesch: ${score.toFixed(1)} (target: >=60)`,
    fatal: score < 40,
  };
}
