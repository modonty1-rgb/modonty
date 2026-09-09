/**
 * Makes visitor text safe for Prisma's MongoDB `contains` filter.
 *
 * Prisma implements case-insensitive MongoDB filtering with a regular
 * expression. Treating the input as regex syntax lets malformed input turn a
 * harmless search into a database error, and may enable ReDoS-style pressure.
 * Search is a literal-text feature, so every regex metacharacter is escaped.
 */
const REGEX_META = /[\\^$.*+?()[\]{}|]/g;
const MAX_SEARCH_LENGTH = 120;

export function safeLiteralSearch(value: string | undefined | null): string | null {
  const normalized = value?.trim().slice(0, MAX_SEARCH_LENGTH);
  if (!normalized) return null;

  return normalized.replace(REGEX_META, "\\$&");
}
