import { ArticleFormData, FAQItem, GalleryFormItem } from "@/lib/types/form-types";
import { getArticleById } from "../../actions/articles-actions";
import { normalizeArticleCanonicalForForm } from "../seo-generation";

type ArticleFromDb = NonNullable<Awaited<ReturnType<typeof getArticleById>>>;

export function transformArticleToFormData(article: ArticleFromDb): Partial<ArticleFormData> {
  return {
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
                url: item.media.url,
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

    // SEO keywords the article is based on (reference)
    seoKeywords: article.seoKeywords ?? [],

    // Schema Versioning
    jsonLdVersion: article.jsonLdVersion || undefined,
    jsonLdHistory: article.jsonLdHistory || undefined,
    jsonLdDiffSummary: article.jsonLdDiffSummary || undefined,

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

    // Related Articles
    relatedArticles:
      article.relatedTo?.map((rel: { relatedId: string; relationshipType: string | null }) => ({
        relatedId: rel.relatedId,
        relationshipType: (rel.relationshipType as "related" | "similar" | "recommended") || undefined,
      })) || [],
  };
}

