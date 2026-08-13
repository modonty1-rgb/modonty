// Article SEO score — the SINGLE source of truth for EVERY surface that shows a
// number for an article (articles list, article segment tables, article detail
// header, future console portal).
//
// This is the sibling the client scorer's header promised:
//   "Designed to extend: an article scorer will live beside this under
//    dataLayer/lib/seo/article/ with the same SeoScore/EntitySeoScore contract."
//
// Same shape, same contract, same discipline:
//   • META    → computeArticleMetaScore    (Google title/desc/OG/canonical/hreflang)
//   • JSON-LD → computeArticleJsonLdScore  (stored validation report + Google's fields)
//
// Reads STORED DB fields (nextjsMetadata + jsonLdStructuredData + jsonLdValidationReport
// + raw article columns), so the number reflects what is ACTUALLY PUBLISHED and is the
// same everywhere. Never derive an article score from the draft form: that answers
// "is the editor filled in", which is a different question and a different number.

import type { EntitySeoScore, SeoCheck, SeoScore } from "../client/types";
import { computeArticleMetaScore, type ArticleMetaInput } from "./meta-score";
import { computeArticleJsonLdScore, type ArticleJsonLdInput } from "./jsonld-score";
import { computeArticleLinksScore, type ArticleLinksInput } from "./links-score";

export type { SeoCheck, SeoScore, EntitySeoScore } from "../client/types";

export interface ArticleSeoInput extends ArticleMetaInput, ArticleJsonLdInput, ArticleLinksInput {}

/**
 * Weighting (2026-08-13). Meta and JSON-LD stay the two heavy halves — they decide whether
 * the page is eligible for a rich result at all, and a mistake there costs the whole listing.
 * Internal linking is real but recoverable, so it earns a deliberate MINORITY share: enough
 * that building the related list visibly moves the number, small enough that it cannot make a
 * well-linked article with broken metadata look healthy.
 */
const W_META = 0.45;
const W_JSONLD = 0.45;
const W_LINKS = 0.1;

/** Full breakdown: meta + jsonLd + links + overall, each validity-based. */
export function computeArticleEntitySeo(article: ArticleSeoInput): EntitySeoScore {
  const meta = computeArticleMetaScore(article);
  const jsonLd = computeArticleJsonLdScore(article);
  const links = computeArticleLinksScore(article);
  const overall = Math.round(meta.score * W_META + jsonLd.score * W_JSONLD + links.score * W_LINKS);
  return { meta, jsonLd, links, overall };
}

export interface SeoScoreResult {
  score: number;
  checks: SeoCheck[];
}

/** Overall score + the merged checklist (meta, then jsonLd, then links). */
export function computeArticleSeoScore(article: ArticleSeoInput): SeoScoreResult {
  const { meta, jsonLd, links, overall } = computeArticleEntitySeo(article);
  return { score: overall, checks: [...meta.checks, ...jsonLd.checks, ...(links?.checks ?? [])] };
}
