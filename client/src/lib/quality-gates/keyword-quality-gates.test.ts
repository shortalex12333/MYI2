import { describe, it, expect, vi } from 'vitest';
import {
  runKeywordQualityGates,
  shouldFlagForReview,
  validatePreGeneration,
} from './keyword-quality-gates';

describe('KeywordQualityGates', () => {
  describe('validatePreGeneration', () => {
    it('passes when keyword has intent and volume', () => {
      const keyword = {
        keyword: 'boat insurance',
        search_volume: 1000,
        intent_tier: 'T1',
      };
      const result = validatePreGeneration(keyword);
      expect(result.passed).toBe(true);
    });

    it('fails when missing search_volume', () => {
      const keyword = {
        keyword: 'boat insurance',
        search_volume: null,
        intent_tier: 'T1',
      };
      const result = validatePreGeneration(keyword);
      expect(result.passed).toBe(false);
    });

    it('fails when missing intent_tier', () => {
      const keyword = {
        keyword: 'boat insurance',
        search_volume: 1000,
        intent_tier: null,
      };
      const result = validatePreGeneration(keyword);
      expect(result.passed).toBe(false);
    });
  });

  describe('shouldFlagForReview', () => {
    it('returns true approximately 20% of the time', () => {
      // Run 1000 times, expect ~200 true (with tolerance)
      let trueCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (shouldFlagForReview()) trueCount++;
      }
      // Allow 15-25% range for randomness
      expect(trueCount).toBeGreaterThan(150);
      expect(trueCount).toBeLessThan(250);
    });
  });

  describe('runKeywordQualityGates', () => {
    it('returns verdict "publish" when all gates pass', () => {
      const content = 'The boat floats on the water. It is a nice day to sail. The sun is bright and warm. This is more content to make it longer.'.repeat(15);
      const result = runKeywordQualityGates(content, 'sailing');
      expect(result.verdict).toBe('publish');
    });

    it('returns verdict based on gate results', () => {
      // Complex text - may fail readability
      const content = 'The comprehensive insurance evaluation process involves detailed analysis of coverage requirements and policy specifications for maritime vessels.'.repeat(15);
      const result = runKeywordQualityGates(content, 'maritime');
      // Should return one of the three valid verdicts
      expect(['publish', 'revise', 'reject']).toContain(result.verdict);
      // Verify gates were run
      expect(result.gates.length).toBe(3);
    });

    it('returns verdict "reject" when fatal gate fails', () => {
      // Extreme keyword stuffing
      const content = 'boat boat boat boat boat boat boat boat boat boat boat boat';
      const result = runKeywordQualityGates(content, 'boat');
      expect(result.verdict).toBe('reject');
    });

    it('auto-flags content when any gate fails', () => {
      const content = 'boat boat boat boat boat content';
      const result = runKeywordQualityGates(content, 'boat');
      expect(result.requiresReview).toBe(true);
    });
  });
});
