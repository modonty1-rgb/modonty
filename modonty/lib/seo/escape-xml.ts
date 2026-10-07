/**
 * Escapes the five XML metacharacters in free text that reaches an XML document (sitemap video
 * tags · RSS feed · image sitemap). Google requires it: "All HTML entities must be escaped or
 * wrapped in a CDATA block" — a single raw `&` makes the whole file malformed and rejected.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
