import type { Metadata } from "next";

/**
 * Consistent hreflang alternates (ar-SA / ar-EG / ar + x-default → canonical).
 * Single source of truth so no page hand-rolls `alternates: { canonical }` and
 * forgets the languages map (= the "missing hreflang" gap on about/terms/legal/authors).
 */
export function buildAlternates(canonicalUrl: string): Metadata["alternates"] {
  return {
    canonical: canonicalUrl,
    languages: {
      "ar-SA": canonicalUrl,
      "ar-EG": canonicalUrl,
      ar: canonicalUrl,
      "x-default": canonicalUrl,
    },
  };
}
