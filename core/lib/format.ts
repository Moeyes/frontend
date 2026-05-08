import { MINOR_AGE_THRESHOLD } from '@/core/config/constants';

// Khmer numeral mapping
const KH_DIGITS: Record<string, string> = {
  '0': '០', '1': '១', '2': '២', '3': '៣', '4': '៤',
  '5': '៥', '6': '៦', '7': '៧', '8': '៨', '9': '៩',
};

export function toKhmerNumerals(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => KH_DIGITS[d] ?? d);
}

const DATE_FORMAT_KH = new Intl.DateTimeFormat('km-KH', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const DATE_FORMAT_EN = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatDate(
  date: string | Date | null | undefined,
  locale: 'kh' | 'en' = 'kh'
): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';
    return locale === 'kh' ? DATE_FORMAT_KH.format(d) : DATE_FORMAT_EN.format(d);
  } catch {
    return '—';
  }
}

export function formatDateTime(
  date: string | Date | null | undefined,
  locale: 'kh' | 'en' = 'kh'
): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat(locale === 'kh' ? 'km-KH' : 'en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return '—';
  }
}

// Red Line #3 — ALWAYS compute age from the event date, NEVER from new Date()
export function computeAgeAtEvent(
  dob: string | Date | null | undefined,
  eventStartDate: string | Date | null | undefined
): number | null {
  if (!dob || !eventStartDate) return null;
  try {
    const birth = typeof dob === 'string' ? new Date(dob) : dob;
    const event = typeof eventStartDate === 'string' ? new Date(eventStartDate) : eventStartDate;
    if (isNaN(birth.getTime()) || isNaN(event.getTime())) return null;

    let age = event.getFullYear() - birth.getFullYear();
    const monthDiff = event.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && event.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

export function isMinorAtEvent(
  dob: string | Date | null | undefined,
  eventStartDate: string | Date | null | undefined
): boolean {
  const age = computeAgeAtEvent(dob, eventStartDate);
  if (age === null) return false;
  return age < MINOR_AGE_THRESHOLD;
}

export function formatNumber(n: number, locale: 'kh' | 'en' = 'kh'): string {
  const formatted = n.toLocaleString(locale === 'kh' ? 'km-KH' : 'en-US');
  return formatted;
}
