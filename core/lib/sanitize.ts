// XSS strategy for this app:
// - All user content is rendered via React JSX, which escapes strings by default.
// - `dangerouslySetInnerHTML` is prohibited (see RED_LINES.md).
// - No runtime sanitization is therefore needed for the current rendering paths.
//
// If rich-HTML rendering is ever introduced (e.g., admin bulletin board),
// replace these stubs with DOMPurify:
//   import DOMPurify from 'dompurify';
//   export const sanitizeHtml = (s: string) => DOMPurify.sanitize(s, { ALLOWED_TAGS: [] });

export function sanitizeHtml(input: string): string {
  // Delegates to React's built-in escaping — do NOT use this with dangerouslySetInnerHTML.
  return input;
}

export function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}
