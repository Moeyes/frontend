import { describe, it, expect } from 'vitest';
import { eventSchema } from '../schema';

// ─── eventSchema ─────────────────────────────────────────────────────────────

describe('eventSchema', () => {
  const VALID_TYPE = 'កីឡាជាតិ'; // matches EVENT_TYPES[0] (national)

  const base = {
    name_kh: 'ព្រឹត្តិការណ៍សាកល្បង',
    type: VALID_TYPE,
  };

  describe('required fields', () => {
    it('accepts a minimal valid event (name + type only)', () => {
      expect(eventSchema.safeParse(base).success).toBe(true);
    });

    it('rejects empty name_kh', () => {
      const result = eventSchema.safeParse({ ...base, name_kh: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name_kh');
      }
    });

    it('rejects invalid event type', () => {
      const result = eventSchema.safeParse({ ...base, type: 'UNKNOWN_TYPE' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('type');
      }
    });
  });

  describe('optional fields', () => {
    it('accepts null for optional date fields', () => {
      const result = eventSchema.safeParse({
        ...base,
        start_date:  null,
        end_date:    null,
        description: null,
        location:    null,
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid optional date strings', () => {
      const result = eventSchema.safeParse({
        ...base,
        start_date: '2025-01-01',
        end_date:   '2025-12-31',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('date range refinement', () => {
    it('rejects end_date before start_date', () => {
      const result = eventSchema.safeParse({
        ...base,
        start_date: '2025-12-31',
        end_date:   '2025-01-01',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        // Refinement error is attached to the end_date path
        expect(result.error.issues[0].path).toContain('end_date');
      }
    });

    it('accepts end_date equal to start_date (single-day event)', () => {
      const result = eventSchema.safeParse({
        ...base,
        start_date: '2025-06-15',
        end_date:   '2025-06-15',
      });
      expect(result.success).toBe(true);
    });

    it('no constraint when start_date is null (end_date alone is fine)', () => {
      const result = eventSchema.safeParse({
        ...base,
        start_date: null,
        end_date:   '2025-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('no constraint when end_date is null', () => {
      const result = eventSchema.safeParse({
        ...base,
        start_date: '2025-01-01',
        end_date:   null,
      });
      expect(result.success).toBe(true);
    });
  });
});
