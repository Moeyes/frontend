import { describe, it, expect } from 'vitest';
import {
  phoneSchema,
  nationalIdSchema,
  passportSchema,
  emailSchema,
  positiveIntSchema,
} from '../validation';

// ─── phoneSchema ─────────────────────────────────────────────────────────────
// Pattern: ^(\+855|0)[0-9]{8,9}$

describe('phoneSchema', () => {
  describe('valid', () => {
    it('accepts 0XX + 8 digits', () => {
      expect(phoneSchema.safeParse('012345678').success).toBe(true);
    });

    it('accepts 0XX + 9 digits', () => {
      expect(phoneSchema.safeParse('0123456789').success).toBe(true);
    });

    it('accepts +855 + 8 digits', () => {
      expect(phoneSchema.safeParse('+85512345678').success).toBe(true);
    });

    it('accepts +855 + 9 digits', () => {
      expect(phoneSchema.safeParse('+855123456789').success).toBe(true);
    });
  });

  describe('invalid', () => {
    it('rejects number starting with 1 (no +855 or 0)', () => {
      expect(phoneSchema.safeParse('1234567890').success).toBe(false);
    });

    it('rejects +855 with too few digits', () => {
      expect(phoneSchema.safeParse('+855123456').success).toBe(false);
    });

    it('rejects Laos country code (+856)', () => {
      expect(phoneSchema.safeParse('+856123456789').success).toBe(false);
    });

    it('rejects letters in the number', () => {
      expect(phoneSchema.safeParse('012abc678').success).toBe(false);
    });

    it('rejects empty string', () => {
      expect(phoneSchema.safeParse('').success).toBe(false);
    });

    it('rejects 0 followed by only 7 digits (too short)', () => {
      expect(phoneSchema.safeParse('01234567').success).toBe(false);
    });
  });
});

// ─── nationalIdSchema ────────────────────────────────────────────────────────
// Pattern: ^[0-9]{9}$  (Cambodian National ID — exactly 9 digits)

describe('nationalIdSchema', () => {
  describe('valid', () => {
    it('accepts exactly 9 digits', () => {
      expect(nationalIdSchema.safeParse('123456789').success).toBe(true);
    });

    it('accepts leading zeros', () => {
      expect(nationalIdSchema.safeParse('000000001').success).toBe(true);
    });
  });

  describe('invalid', () => {
    it('rejects 8 digits (too short)', () => {
      expect(nationalIdSchema.safeParse('12345678').success).toBe(false);
    });

    it('rejects 10 digits (too long)', () => {
      expect(nationalIdSchema.safeParse('1234567890').success).toBe(false);
    });

    it('rejects a letter mixed in', () => {
      expect(nationalIdSchema.safeParse('12345678a').success).toBe(false);
    });

    it('rejects empty string', () => {
      expect(nationalIdSchema.safeParse('').success).toBe(false);
    });

    it('rejects dashes', () => {
      expect(nationalIdSchema.safeParse('123-45-678').success).toBe(false);
    });
  });
});

// ─── passportSchema ──────────────────────────────────────────────────────────
// Pattern: ^[A-Z]{1,2}[0-9]{6,7}$

describe('passportSchema', () => {
  describe('valid', () => {
    it('accepts 1 uppercase letter + 7 digits', () => {
      expect(passportSchema.safeParse('A1234567').success).toBe(true);
    });

    it('accepts 2 uppercase letters + 7 digits', () => {
      expect(passportSchema.safeParse('AB1234567').success).toBe(true);
    });

    it('accepts 1 uppercase letter + 6 digits', () => {
      expect(passportSchema.safeParse('A123456').success).toBe(true);
    });

    it('accepts 2 uppercase letters + 6 digits', () => {
      expect(passportSchema.safeParse('AB123456').success).toBe(true);
    });
  });

  describe('invalid', () => {
    it('rejects 3 uppercase letters prefix', () => {
      expect(passportSchema.safeParse('ABC12345').success).toBe(false);
    });

    it('rejects lowercase letters', () => {
      expect(passportSchema.safeParse('a1234567').success).toBe(false);
    });

    it('rejects only 5 digits after prefix (too short)', () => {
      expect(passportSchema.safeParse('A12345').success).toBe(false);
    });

    it('rejects 8 digits after prefix (too long)', () => {
      expect(passportSchema.safeParse('A12345678').success).toBe(false);
    });

    it('rejects digits only (no letter prefix)', () => {
      expect(passportSchema.safeParse('12345678').success).toBe(false);
    });

    it('rejects empty string', () => {
      expect(passportSchema.safeParse('').success).toBe(false);
    });
  });
});

// ─── emailSchema ─────────────────────────────────────────────────────────────

describe('emailSchema', () => {
  it('accepts standard email', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true);
  });

  it('accepts email with subdomain', () => {
    expect(emailSchema.safeParse('user@mail.example.com').success).toBe(true);
  });

  it('rejects missing @', () => {
    expect(emailSchema.safeParse('userexample.com').success).toBe(false);
  });

  it('rejects missing domain', () => {
    expect(emailSchema.safeParse('user@').success).toBe(false);
  });

  it('rejects empty string', () => {
    expect(emailSchema.safeParse('').success).toBe(false);
  });
});

// ─── positiveIntSchema ───────────────────────────────────────────────────────

describe('positiveIntSchema', () => {
  it('accepts 0', () => {
    expect(positiveIntSchema.safeParse(0).success).toBe(true);
  });

  it('accepts positive integers', () => {
    expect(positiveIntSchema.safeParse(100).success).toBe(true);
  });

  it('rejects -1', () => {
    expect(positiveIntSchema.safeParse(-1).success).toBe(false);
  });

  it('rejects decimals', () => {
    expect(positiveIntSchema.safeParse(1.5).success).toBe(false);
  });

  it('rejects string input', () => {
    expect(positiveIntSchema.safeParse('5').success).toBe(false);
  });
});
