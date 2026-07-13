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

export type { SeoCheck, SeoScore, EntitySeoScore } from "../client/types";

export interface ArticleSeoInput extends ArticleMetaInput, ArticleJsonLdInput {}

/** Full breakdown: meta + jsonLd + overall, each validity-based. */
export function computeArticleEntitySeo(article: ArticleSeoInput): EntitySeoScore {
  const meta = computeArticleMetaScore(article);
  const jsonLd = computeArticleJsonLdScore(article);
  const overall = Math.round((meta.score + jsonLd.score) / 2);
  return { meta, jsonLd, overall };
}

export interface SeoScoreResult {
  score: number;
  checks: SeoCheck[];
}

/** Overall score + the merged checklist (meta first, then jsonLd). */
export function computeArticleSeoScore(article: ArticleSeoInput): SeoScoreResult {
  const { meta, jsonLd, overall } = computeArticleEntitySeo(article);
  return { score: overall, checks: [...meta.checks, ...jsonLd.checks] };
}
