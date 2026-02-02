/**
 * Content extraction utilities
 * Functions for extracting and processing content
 */

/**
 * Extract excerpt from content
 * Strips HTML and truncates to maxLength
 */
export function extractExcerpt(content: string, maxLength: number = 155): string {
  if (!content) return "";
  const stripped = content.replace(/<[^>]*>/g, "").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength - 3) + "...";
}
