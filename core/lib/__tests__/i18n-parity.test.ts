// @vitest-environment node
// Runs in Node so we can use fs to read the message files directly.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// ─── helpers ─────────────────────────────────────────────────────────────────

type NestedRecord = { [key: string]: string | NestedRecord };

function flattenKeys(obj: NestedRecord, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? flattenKeys(value as NestedRecord, full)
      : [full];
  });
}

function loadMessages(locale: string): NestedRecord {
  const filePath = join(process.cwd(), 'messages', `${locale}.json`);
  return JSON.parse(readFileSync(filePath, 'utf-8')) as NestedRecord;
}

// ─── i18n key parity ─────────────────────────────────────────────────────────

describe('i18n key parity: en.json ↔ kh.json', () => {
  const en = loadMessages('en');
  const kh = loadMessages('kh');
  const enKeys = new Set(flattenKeys(en));
  const khKeys = new Set(flattenKeys(kh));

  it('en.json and kh.json have the same total key count', () => {
    if (enKeys.size !== khKeys.size) {
      const missingInKh = [...enKeys].filter((k) => !khKeys.has(k));
      const missingInEn = [...khKeys].filter((k) => !enKeys.has(k));
      // Print diffs for easy debugging
      if (missingInKh.length) console.error('Missing in kh.json:', missingInKh);
      if (missingInEn.length) console.error('Missing in en.json:', missingInEn);
    }
    expect(enKeys.size).toBe(khKeys.size);
  });

  it('every key in en.json exists in kh.json', () => {
    const missing = [...enKeys].filter((k) => !khKeys.has(k));
    expect(missing, `Keys in en.json not found in kh.json: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('every key in kh.json exists in en.json', () => {
    const missing = [...khKeys].filter((k) => !enKeys.has(k));
    expect(missing, `Keys in kh.json not found in en.json: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('no key in en.json maps to an empty string', () => {
    function findEmpty(obj: NestedRecord, prefix = ''): string[] {
      return Object.entries(obj).flatMap(([key, value]) => {
        const full = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string') return value === '' ? [full] : [];
        return findEmpty(value as NestedRecord, full);
      });
    }
    const emptyKeys = findEmpty(en);
    expect(emptyKeys, `Empty English translations: ${emptyKeys.join(', ')}`).toHaveLength(0);
  });

  it('no key in kh.json maps to an empty string', () => {
    function findEmpty(obj: NestedRecord, prefix = ''): string[] {
      return Object.entries(obj).flatMap(([key, value]) => {
        const full = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string') return value === '' ? [full] : [];
        return findEmpty(value as NestedRecord, full);
      });
    }
    const emptyKeys = findEmpty(kh);
    expect(emptyKeys, `Empty Khmer translations: ${emptyKeys.join(', ')}`).toHaveLength(0);
  });
});
