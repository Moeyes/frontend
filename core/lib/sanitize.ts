// Simple tag-stripping sanitizer — no external deps, safe for plain text output.
// For rich HTML rendering, evaluate DOMPurify on a case-by-case basis.
const ALLOWED_TAGS_RE = /<(?!\/?(b|strong|em|u|br)(?:\s|\/?>))[^>]*>/gi;

export function sanitizeHtml(input: string): string {
  return input
    .replace(ALLOWED_TAGS_RE, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .trim();
}
