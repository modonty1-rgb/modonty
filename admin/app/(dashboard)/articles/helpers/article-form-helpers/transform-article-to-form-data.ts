import { mediaSrc } from "@modonty/database/lib/media-src";

import { ArticleFormData, FAQItem, GalleryFormItem } from "@/lib/types/form-types";
import { getArticleById } from "../../actions/articles-actions";
import { normalizeArticleCanonicalForForm } from "../seo-generation";

type ArticleFromDb = NonNullable<Awaited<ReturnType<typeof getArticleById>>>;

export function transformArticleToFormData(article: ArticleFromDb): Partial<ArticleFormData> {
  return {
    // Optimistic locking — user-initiated edits only (NOT bumped by SEO/cron/system writes)
    userVersion: article.userVersion ?? 0,
    // Kept for legacy/display only — NOT used for conflict detection anymore
    updatedAt: article.updatedAt ?? null,

    // Basic Content
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || undefined,
    content: article.content,

    // Relationships
    clientId: article.clientId,
    categoryId: article.categoryId || undefined,
    authorId: article.authorId,

    // Status & Workflow
    status: article.status,
    // WHERE it lives — read from the row, never re-decided by the form. Without this the
    // editor would open a client-site article looking exactly like a modonty one.
    isClientSiteArticle: article.isClientSiteArticle ?? false,
    scheduledAt: article.scheduledAt || null,
    featured: article.featured || false,

    // Schema.org Article - Core Fields
    datePublished: article.datePublished || null,
    lastReviewed: article.lastReviewed || null,
    mainEntityOfPage: article.mainEntityOfPage || undefined,

    // Schema.org Article - Extended Fields
    wordCount: article.wordCount || undefined,
    readingTimeMinutes: article.readingTimeMinutes || undefined,
    contentDepth: article.contentDepth || undefined,

    // SEO Meta Tags
    seoTitle: article.seoTitle || undefined,
    seoDescription: article.seoDescription || undefined,

    // Open Graph
    ogArticleAuthor: article.ogArticleAuthor || undefined,
    ogArticlePublishedTime: article.ogArticlePublishedTime || null,
    ogArticleModifiedTime: article.ogArticleModifiedTime || null,
    ogArticleSection: article.category?.name || undefined,
    ogArticleTag: article.tags?.map((t: { tag: { name: string } }) => t.tag.name) || [],

    // Technical SEO — always use siteUrl/articles/slug (never /clients/.../articles/)
    canonicalUrl: normalizeArticleCanonicalForForm(article.canonicalUrl, article.slug),

    // Breadcrumb Support
    breadcrumbPath: article.breadcrumbPath || undefined,

    // Featured Media
    featuredImageId: article.featuredImageId || null,
    featuredImageAlt: article.featuredImage?.altText ?? null,
    gallery:
      article.gallery?.map(
        (item: {
          mediaId: string;
          position: number;
          caption: string | null;
          altText: string | null;
          media: {
            id: string;
            url: string;
            bunnyUrl: string | null;
            blurDataURL: string | null;
            altText: string | null;
            width: number | null;
            height: number | null;
            filename: string;
          } | null;
        }): GalleryFormItem => ({
          mediaId: item.mediaId,
          position: item.position,
          caption: item.caption || null,
          altText: item.altText || null,
          media: item.media
            ? {
                id: item.media.id,
                url: mediaSrc(item.media) ?? item.media.url,
                // Already resolved into `url` above — carrying it again would be redundant,
                // but the field must be present so nothing downstream can silently narrow it.
                bunnyUrl: null,
                blurDataURL: item.media.blurDataURL,
                altText: item.media.altText || null,
                width: item.media.width || null,
                height: item.media.height || null,
                filename: item.media.filename,
              }
            : undefined,
        })
      ) || [],

    // JSON-LD Structured Data
    jsonLdStructuredData: article.jsonLdStructuredData || undefined,
    jsonLdLastGenerated: article.jsonLdLastGenerated || null,
    jsonLdValidationReport: article.jsonLdValidationReport || undefined,

    // Content for Structured Data
    articleBodyText: article.articleBodyText || undefined,

    // Semantic Enhancement
    semanticKeywords: article.semanticKeywords || undefined,

    // E-E-A-T Enhancement
    citations: article.citations || [],

    // Audio
    audioUrl: article.audioUrl || null,

    // Tags & FAQs
    tags: article.tags?.map((t: { tag: { id: string } }) => t.tag.id) || [],
    faqs:
      article.faqs?.map(
        (faq: { question: string; answer: string | null; position: number }): FAQItem => ({
          question: faq.question,
          answer: faq.answer ?? "",
          position: faq.position,
        })
      ) || [],

    // Related Articles — read `relatedFrom` (rows where THIS article is the source), which is
    // exactly what the editor writes back on save.
    //
    // It used to read `relatedTo`, the INCOMING side. An article nobody links to has none, so
    // the picker reopened empty no matter what the writer had saved — and because the save
    // path deletes every outgoing row before recreating the submitted list, the next save on
    // that article silently ERASED the related articles instead of keeping them. Proven live
    // 2026-08-13: saved 3, reopened at "0 / 5", saved again, 2 were gone.
    relatedArticles:
      article.relatedFrom?.map((rel: { relatedId: string; relationshipType: string | null }) => ({
        relatedId: rel.relatedId,
        relationshipType: (rel.relationshipType as "related" | "similar" | "recommended") || undefined,
      })) || [],
  };
}

