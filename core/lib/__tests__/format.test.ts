import { describe, it, expect } from 'vitest';
import {
  computeAgeAtEvent,
  isMinorAtEvent,
  formatDate,
  toKhmerNumerals,
  formatNumber,
} from '../format';
import { MINOR_AGE_THRESHOLD } from '@/core/config/constants';

// ─── computeAgeAtEvent ────────────────────────────────────────────────────────
// RED LINE #3: age must be computed from event start_date, never from new Date()

describe('computeAgeAtEvent', () => {
  // Null / invalid inputs
  it('returns null when dob is null', () => {
    expect(computeAgeAtEvent(null, '2024-01-01')).toBeNull();
  });

  it('returns null when eventStartDate is null', () => {
    expect(computeAgeAtEvent('2000-01-15', null)).toBeNull();
  });

  it('returns null when dob is undefined', () => {
    expect(computeAgeAtEvent(undefined, '2024-01-01')).toBeNull();
  });

  it('returns null when dob is an invalid date string', () => {
    expect(computeAgeAtEvent('not-a-date', '2024-01-01')).toBeNull();
  });

  it('returns null when eventStartDate is an invalid date string', () => {
    expect(computeAgeAtEvent('2000-01-15', 'bad')).toBeNull();
  });

  // Birthday boundary cases — the most safety-critical
  it('birthday IS the event day → counts as having had the birthday (adult)', () => {
    // born 2000-01-15, event 2018-01-15 → age = 18
    expect(computeAgeAtEvent('2000-01-15', '2018-01-15')).toBe(18);
  });

  it('one day before birthday → still the previous age (minor)', () => {
    // born 2000-01-15, event 2018-01-14 → age = 17
    expect(computeAgeAtEvent('2000-01-15', '2018-01-14')).toBe(17);
  });

  it('one day after birthday → new age (adult)', () => {
    // born 2000-01-15, event 2018-01-16 → age = 18
    expect(computeAgeAtEvent('2000-01-15', '2018-01-16')).toBe(18);
  });

  // Leap year edge cases
  it('leap-year DOB: event on Feb 28 (birthday not yet reached) → previous age', () => {
    // born 2000-02-29, event 2018-02-28 → age = 17
    expect(computeAgeAtEvent('2000-02-29', '2018-02-28')).toBe(17);
  });

  it('leap-year DOB: event on Mar 1 (birthday passed) → new age', () => {
    // born 2000-02-29, event 2018-03-01 → age = 18
    expect(computeAgeAtEvent('2000-02-29', '2018-03-01')).toBe(18);
  });

  // Month boundary cases
  it('same day/month — years apart — computes correctly', () => {
    // born 1990-12-31, event 2018-01-01 → age = 27
    expect(computeAgeAtEvent('1990-12-31', '2018-01-01')).toBe(27);
  });

  it('young participant — age 14', () => {
    // born 2010-06-15, event 2025-06-14 → age = 14
    expect(computeAgeAtEvent('2010-06-15', '2025-06-14')).toBe(14);
  });

  // Accepts Date objects as well as strings
  it('accepts Date objects as arguments', () => {
    const dob   = new Date('2000-01-15');
    const event = new Date('2018-01-15');
    expect(computeAgeAtEvent(dob, event)).toBe(18);
  });

  // Month boundary — event month < birth month
  it('event month before birth month → subtracts a year', () => {
    // born 2000-08-15, event 2018-03-01 → age = 17 (hasn't had August birthday yet)
    expect(computeAgeAtEvent('2000-08-15', '2018-03-01')).toBe(17);
  });

  // Month boundary — event month > birth month
  it('event month after birth month → counts the birthday', () => {
    // born 2000-03-01, event 2018-08-15 → age = 18
    expect(computeAgeAtEvent('2000-03-01', '2018-08-15')).toBe(18);
  });
});

// ─── isMinorAtEvent ───────────────────────────────────────────────────────────

describe('isMinorAtEvent', () => {
  it(`age ${MINOR_AGE_THRESHOLD - 1} → true (minor)`, () => {
    // Participant turns 17 on event day — still minor
    expect(isMinorAtEvent('2001-06-15', '2018-06-14')).toBe(true);
  });

  it(`age exactly ${MINOR_AGE_THRESHOLD} on event day → false (adult)`, () => {
    // Participant turns 18 on event day — adult
    expect(isMinorAtEvent('2000-06-15', '2018-06-15')).toBe(false);
  });

  it('age > 18 → false (adult)', () => {
    expect(isMinorAtEvent('1990-01-01', '2024-01-01')).toBe(false);
  });

  it('null DOB → false (safe default, does not block submission)', () => {
    expect(isMinorAtEvent(null, '2024-01-01')).toBe(false);
  });

  it('null eventStartDate → false (safe default)', () => {
    expect(isMinorAtEvent('2010-01-01', null)).toBe(false);
  });

  it('invalid date string → false (safe default)', () => {
    expect(isMinorAtEvent('invalid', '2024-01-01')).toBe(false);
  });
});

// ─── toKhmerNumerals ─────────────────────────────────────────────────────────

describe('toKhmerNumerals', () => {
  it('converts 0–9 to Khmer digits', () => {
    expect(toKhmerNumerals(0)).toBe('០');
    expect(toKhmerNumerals(5)).toBe('៥');
    expect(toKhmerNumerals(9)).toBe('៩');
  });

  it('converts multi-digit numbers', () => {
    expect(toKhmerNumerals(2024)).toBe('២០២៤');
    expect(toKhmerNumerals(100)).toBe('១០០');
  });

  it('converts string input', () => {
    expect(toKhmerNumerals('42')).toBe('៤២');
  });
});

// ─── formatDate ──────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns em-dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('returns em-dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—');
  });

  it('returns em-dash for invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });

  it('formats a valid ISO date string (en locale)', () => {
    const result = formatDate('2024-03-15', 'en');
    // en-GB format: 15/03/2024
    expect(result).toBe('15/03/2024');
  });

  it('accepts a Date object', () => {
    const d = new Date('2024-06-01');
    const result = formatDate(d, 'en');
    expect(result).toBe('01/06/2024');
  });
});

// ─── formatNumber ────────────────────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats with en-US locale (comma thousands separator)', () => {
    const result = formatNumber(1000, 'en');
    expect(result).toBe('1,000');
  });

  it('formats 0 correctly', () => {
    expect(formatNumber(0, 'en')).toBe('0');
  });
});
