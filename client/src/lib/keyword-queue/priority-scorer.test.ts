import { describe, it, expect } from 'vitest';
import {
  calculateBaseScore,
  applySeasonalMultiplier,
  applyDecayFactor,
  calculatePriorityScore,
} from './priority-scorer';

describe('PriorityScorer', () => {
  describe('calculateBaseScore', () => {
    it('calculates volume × (100 - difficulty)', () => {
      expect(calculateBaseScore(1700, 45)).toBe(93500);
    });

    it('handles zero volume', () => {
      expect(calculateBaseScore(0, 50)).toBe(0);
    });

    it('handles 100 difficulty (maximum)', () => {
      expect(calculateBaseScore(1000, 100)).toBe(0);
    });

    it('handles 0 difficulty (minimum)', () => {
      expect(calculateBaseScore(1000, 0)).toBe(100000);
    });
  });

  describe('applySeasonalMultiplier', () => {
    it('applies 1.5x to hurricane keywords in Q2-Q3', () => {
      const june = new Date('2026-06-15');
      expect(applySeasonalMultiplier(1000, 'hurricane insurance', june)).toBe(1500);
    });

    it('returns 1.0x for hurricane keywords outside Q2-Q3', () => {
      const january = new Date('2026-01-15');
      expect(applySeasonalMultiplier(1000, 'hurricane insurance', january)).toBe(1000);
    });

    it('returns 1.0x for non-hurricane keywords in Q2-Q3', () => {
      const june = new Date('2026-06-15');
      expect(applySeasonalMultiplier(1000, 'boat insurance cost', june)).toBe(1000);
    });

    it('is case-insensitive for hurricane detection', () => {
      const june = new Date('2026-06-15');
      expect(applySeasonalMultiplier(1000, 'HURRICANE Coverage', june)).toBe(1500);
    });
  });

  describe('applyDecayFactor', () => {
    it('applies 0.8x decay for pending keywords >7 days old', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(applyDecayFactor(1000, 'pending', tenDaysAgo)).toBe(800);
    });

    it('returns 1.0x for pending keywords <=7 days old', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(applyDecayFactor(1000, 'pending', threeDaysAgo)).toBe(1000);
    });

    it('returns 1.0x for non-pending keywords regardless of age', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(applyDecayFactor(1000, 'generating', tenDaysAgo)).toBe(1000);
    });
  });

  describe('calculatePriorityScore', () => {
    it('combines all factors correctly', () => {
      const keyword = {
        search_volume: 1000,
        keyword_difficulty: 50,
        keyword: 'boat insurance',
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      // base: 1000 * 50 = 50000, no seasonal, no decay
      expect(calculatePriorityScore(keyword)).toBe(50000);
    });
  });
});
