import { describe, it, expect } from 'vitest';
import { checkKeywordDensity, countKeywordOccurrences, extractTextContent } from './keyword-density-checker';

describe('KeywordDensityChecker', () => {
  describe('countKeywordOccurrences', () => {
    it('counts single-word keyword occurrences', () => {
      const text = 'boat insurance covers your boat when your boat is damaged';
      expect(countKeywordOccurrences(text, 'boat')).toBe(3);
    });

    it('counts multi-word keyword occurrences', () => {
      const text = 'yacht insurance is important. Get yacht insurance today. Yacht insurance protects you.';
      expect(countKeywordOccurrences(text, 'yacht insurance')).toBe(3);
    });

    it('is case-insensitive', () => {
      const text = 'Boat BOAT boat BoAt';
      expect(countKeywordOccurrences(text, 'boat')).toBe(4);
    });

    it('returns 0 for no matches', () => {
      const text = 'This text has no target keyword';
      expect(countKeywordOccurrences(text, 'boat')).toBe(0);
    });
  });

  describe('checkKeywordDensity', () => {
    it('passes for natural content (<3% density)', () => {
      // 100 words with 2 keyword mentions = 2%
      const text = 'word '.repeat(98) + 'boat insurance. More about boat insurance.';
      const result = checkKeywordDensity(text, 'boat insurance');
      expect(result.passed).toBe(true);
    });

    it('fails for keyword stuffing (>=3% density)', () => {
      // High keyword density
      const text = 'boat insurance boat insurance boat insurance is great boat insurance';
      const result = checkKeywordDensity(text, 'boat insurance');
      expect(result.passed).toBe(false);
    });

    it('marks extreme stuffing as fatal (>=5%)', () => {
      const text = 'boat boat boat boat boat boat boat boat boat boat';
      const result = checkKeywordDensity(text, 'boat');
      expect(result.fatal).toBe(true);
    });

    it('returns density percentage in detail', () => {
      const text = 'boat insurance is good for boat owners who need boat coverage';
      const result = checkKeywordDensity(text, 'boat');
      expect(result.detail).toMatch(/\d+\.\d+%/);
    });

    it('handles empty content gracefully', () => {
      const result = checkKeywordDensity('', 'boat');
      expect(result.passed).toBe(true);
      expect(result.detail).toContain('empty');
    });
  });
});
