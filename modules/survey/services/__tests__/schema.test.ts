import { describe, it, expect } from 'vitest';
import { countRowSchema } from '../schema';

// ─── countRowSchema ───────────────────────────────────────────────────────────
// Used by all three survey forms (by-sport, by-number, by-category).
// All fields must be non-negative integers.

describe('countRowSchema', () => {
  const valid = {
    athlete_male_count:   5,
    athlete_female_count: 3,
    leader_male_count:    1,
    leader_female_count:  1,
  };

  describe('valid', () => {
    it('accepts all-zero counts', () => {
      expect(countRowSchema.safeParse({
        athlete_male_count:   0,
        athlete_female_count: 0,
        leader_male_count:    0,
        leader_female_count:  0,
      }).success).toBe(true);
    });

    it('accepts positive integers', () => {
      expect(countRowSchema.safeParse(valid).success).toBe(true);
    });

    it('accepts large numbers', () => {
      expect(countRowSchema.safeParse({
        athlete_male_count:   999,
        athlete_female_count: 999,
        leader_male_count:    50,
        leader_female_count:  50,
      }).success).toBe(true);
    });
  });

  describe('invalid — negative counts', () => {
    it('rejects -1 in athlete_male_count', () => {
      const result = countRowSchema.safeParse({ ...valid, athlete_male_count: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('athlete_male_count');
      }
    });

    it('rejects -1 in athlete_female_count', () => {
      const result = countRowSchema.safeParse({ ...valid, athlete_female_count: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects -1 in leader_male_count', () => {
      const result = countRowSchema.safeParse({ ...valid, leader_male_count: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects -1 in leader_female_count', () => {
      const result = countRowSchema.safeParse({ ...valid, leader_female_count: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe('invalid — non-integer', () => {
    it('rejects a decimal (1.5)', () => {
      const result = countRowSchema.safeParse({ ...valid, athlete_male_count: 1.5 });
      expect(result.success).toBe(false);
    });
  });

  describe('invalid — wrong type', () => {
    it('rejects a string where a number is expected', () => {
      const result = countRowSchema.safeParse({ ...valid, athlete_male_count: '5' });
      expect(result.success).toBe(false);
    });

    it('rejects missing field', () => {
      const { athlete_male_count: _, ...partial } = valid;
      const result = countRowSchema.safeParse(partial);
      expect(result.success).toBe(false);
    });
  });
});
