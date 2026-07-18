import { computeArticleSeoScore, computeArticleEntitySeo } from "@modonty/database/lib/seo/article/seo-score";
import type { JsonLdValidationReport } from "@modonty/database/lib/seo/client/types";

/**
 * The one adapter between an admin article row and the SHARED dataLayer scorer
 * (Khalid 2026-07-13: «أحتاج نتيجة 100% من source of truth واحد»).
 *
 * Every admin surface that displays an article's SEO number goes through here, so
 * the badge, the articles table and the segment tables cannot drift apart — there is
 * exactly one mapping and exactly one rubric, and both live in dataLayer.
 *
 * It scores the STORED, published fields (nextjsMetadata + jsonLdStructuredData + the
 * cached validation report). It deliberately does NOT score the draft form: that is a
 * different question, it belongs to the editor, and it must never be called "the SEO score".
 */

/**
 * Paste this into any Prisma `select` that will be scored. Every field is required:
 * the scorer cannot tell "not selected" from "empty", so omitting one silently drags
 * every row to the same low number — the exact bug that shipped a table of 34%s while
 * the same articles scored 85 elsewhere. Spread it, do not retype it.
 */
export const ARTICLE_SEO_SELECT = {
  title: true,
  nextjsMetadata: true,
  jsonLdStructuredData: true,
  jsonLdValidationReport: true,
  featuredImageId: true,
  datePublished: true,
  dateModified: true,
  authorId: true,
  clientId: true,
} as const;

export interface ArticleSeoRow {
  title?: string | null;
  nextjsMetadata?: unknown;
  jsonLdStructuredData?: string | null;
  jsonLdValidationReport?: unknown;
  featuredImageId?: string | null;
  datePublished?: Date | string | null;
  dateModified?: Date | string | null;
  authorId?: string | null;
  clientId?: string | null;
}

/** Full result (score + the checklist) — one mapping, used by both the number and the gate. */
export function getArticleSeoScoreDetail(article: ArticleSeoRow) {
  return computeArticleSeoScore({
    nextjsMetadata: article.nextjsMetadata,
    jsonLdStructuredData: article.jsonLdStructuredData,
    jsonLdValidationReport: (article.jsonLdValidationReport ?? null) as JsonLdValidationReport | null,
    title: article.title,
    featuredImageId: article.featuredImageId,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    authorId: article.authorId,
    clientId: article.clientId,
  });
}

export function getArticleSeoScore(article: ArticleSeoRow): number {
  return getArticleSeoScoreDetail(article).score;
}

/**
 * Full split breakdown — META and JSON-LD as separate scores, each with its own checks,
 * plus the overall (their average). Same mapping and rubric as the number above; this is
 * what the article's technical guide renders so "why 66%" is answerable per side.
 */
export function getArticleEntitySeo(article: ArticleSeoRow) {
  return computeArticleEntitySeo({
    nextjsMetadata: article.nextjsMetadata,
    jsonLdStructuredData: article.jsonLdStructuredData,
    jsonLdValidationReport: (article.jsonLdValidationReport ?? null) as JsonLdValidationReport | null,
    title: article.title,
    featuredImageId: article.featuredImageId,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    authorId: article.authorId,
    clientId: article.clientId,
  });
}
