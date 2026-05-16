import { describe, it, expect } from 'vitest';
import {
  eventSportStepSchema,
  personalInfoStepSchema,
  documentStepSchema,
} from '../schema';

// ─── eventSportStepSchema ─────────────────────────────────────────────────────

describe('eventSportStepSchema', () => {
  const valid = {
    event_id:    1,
    sport_id:    2,
    category_id: null,
    role:        'athlete' as const,
    leader_role: null,
  };

  it('accepts a valid athlete registration', () => {
    expect(eventSportStepSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a valid leader registration', () => {
    expect(eventSportStepSchema.safeParse({
      ...valid,
      role:        'leader',
      leader_role: 'coach',
    }).success).toBe(true);
  });

  it('rejects missing event_id', () => {
    const { event_id: _, ...rest } = valid;
    const result = eventSportStepSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects missing sport_id', () => {
    const { sport_id: _, ...rest } = valid;
    const result = eventSportStepSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects event_id = 0 (must be positive)', () => {
    const result = eventSportStepSchema.safeParse({ ...valid, event_id: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid role value', () => {
    const result = eventSportStepSchema.safeParse({ ...valid, role: 'unknown' });
    expect(result.success).toBe(false);
  });
});

// ─── personalInfoStepSchema ───────────────────────────────────────────────────

describe('personalInfoStepSchema', () => {
  const valid = {
    kh_family_name: 'ចាន់',
    kh_given_name:  'ដារ',
    en_family_name: 'Chan',
    en_given_name:  'Dara',
    gender:         'MALE'  as const,
    date_of_birth:  '2000-01-15',
    phone:          undefined,
    address:        undefined,
  };

  it('accepts a fully valid personal info', () => {
    expect(personalInfoStepSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts with optional phone and address', () => {
    expect(personalInfoStepSchema.safeParse({
      ...valid,
      phone:   '012345678',
      address: 'Phnom Penh',
    }).success).toBe(true);
  });

  it('rejects empty kh_family_name', () => {
    const result = personalInfoStepSchema.safeParse({ ...valid, kh_family_name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('kh_family_name');
    }
  });

  it('rejects empty kh_given_name', () => {
    const result = personalInfoStepSchema.safeParse({ ...valid, kh_given_name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty en_family_name', () => {
    const result = personalInfoStepSchema.safeParse({ ...valid, en_family_name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty en_given_name', () => {
    const result = personalInfoStepSchema.safeParse({ ...valid, en_given_name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid gender value', () => {
    const result = personalInfoStepSchema.safeParse({ ...valid, gender: 'UNKNOWN' });
    expect(result.success).toBe(false);
  });

  it('accepts FEMALE gender', () => {
    expect(personalInfoStepSchema.safeParse({ ...valid, gender: 'FEMALE' }).success).toBe(true);
  });

  it('rejects empty date_of_birth', () => {
    const result = personalInfoStepSchema.safeParse({ ...valid, date_of_birth: '' });
    expect(result.success).toBe(false);
  });
});

// ─── documentStepSchema ───────────────────────────────────────────────────────
// The base schema accepts all nulls (document requirements enforced by superRefine in the component).

describe('documentStepSchema', () => {
  it('accepts all null/undefined documents (base validation is permissive)', () => {
    expect(documentStepSchema.safeParse({
      photoUrl:            null,
      birthCertificateUrl: null,
      nationalIdUrl:       null,
      passportUrl:         null,
    }).success).toBe(true);
  });

  it('accepts valid URL strings', () => {
    expect(documentStepSchema.safeParse({
      photoUrl:            'https://res.cloudinary.com/example/photo.jpg',
      birthCertificateUrl: null,
      nationalIdUrl:       'https://res.cloudinary.com/example/id.pdf',
      passportUrl:         null,
    }).success).toBe(true);
  });

  it('accepts empty object (all fields optional)', () => {
    expect(documentStepSchema.safeParse({}).success).toBe(true);
  });
});
