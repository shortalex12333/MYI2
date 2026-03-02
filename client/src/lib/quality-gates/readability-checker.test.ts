import { describe, it, expect } from 'vitest';
import { checkReadability, extractTextContent } from './readability-checker';

describe('ReadabilityChecker', () => {
  describe('extractTextContent', () => {
    it('removes markdown formatting', () => {
      const input = '**bold** and *italic* text';
      expect(extractTextContent(input)).not.toContain('*');
    });

    it('removes code blocks', () => {
      const input = 'text\n```javascript\nconst x = 1;\n```\nmore text';
      expect(extractTextContent(input)).not.toContain('const');
    });

    it('extracts link text, removes URLs', () => {
      const input = 'Check [this link](https://example.com) here';
      const result = extractTextContent(input);
      expect(result).toContain('this link');
      expect(result).not.toContain('https://');
    });
  });

  describe('checkReadability', () => {
    it('passes for simple readable content', () => {
      const simpleText = 'The boat floats on the water. It is a nice day to sail. The sun is bright and warm.';
      const result = checkReadability(simpleText);
      expect(result.passed).toBe(true);
      expect(result.gate).toBe('Readability');
    });

    it('returns Flesch score in detail', () => {
      const text = 'Simple words are easy to read.';
      const result = checkReadability(text);
      expect(result.detail).toMatch(/Flesch: \d+/);
    });

    it('fails for very complex text', () => {
      // Deliberately complex text with long words and sentences
      const complexText = 'The anthropomorphization of meteorological phenomena necessitates comprehensive epistemological reconsideration of prevailing paradigmatic frameworks governing contemporary climatological discourse.';
      const result = checkReadability(complexText);
      expect(result.passed).toBe(false);
    });

    it('marks extremely difficult content as fatal', () => {
      const extremeText = 'Pseudopseudohypoparathyroidism phenomenologically instantiates multidimensional pathophysiological manifestations.';
      const result = checkReadability(extremeText);
      expect(result.fatal).toBe(true);
    });
  });
});
