/**
 * Content extraction utilities
 * Functions for extracting and processing content
 */

import { truncateAtWordBoundary } from "@modonty/shared/lib/seo/truncate-at-word-boundary";

/**
 * Extract excerpt from content
 * Strips HTML and truncates to maxLength, never through a word.
 */
export function extractExcerpt(content: string, maxLength: number = 155): string {
  if (!content) return "";
  const stripped = content.replace(/<[^>]*>/g, "").trim();
  return truncateAtWordBoundary(stripped, maxLength);
}
