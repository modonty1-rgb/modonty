"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getArticleSeoScore, ARTICLE_SEO_SELECT } from "@/lib/seo/article-seo-score";
import {
  calculateWordCountImproved,
  calculateReadingTime,
  determineContentDepth,
  generateSEOTitle,
  generateSEODescription,
  generateCanonicalUrl,
  generateBreadcrumbPath,
} from "@/app/(dashboard)/articles/helpers/seo-helpers";
import { generateAndSaveNextjsMetadata } from "@/lib/seo/metadata-storage";
import { generateAndSaveJsonLd } from "@/lib/seo/jsonld-storage";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

export interface ArticleSeoHealth {
  id: string;
  title: string;
  slug: string;
  status: string;
  clientName: string | null;
  seoScore: number;
  missingSeoTitle: boolean;
  missingSeoDescription: boolean;
  missingCanonical: boolean;
  missingJsonLd: boolean;
  missingFeaturedImage: boolean;
  wordCount: number;
}

const articleSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  content: true,
  excerpt: true,
  seoTitle: true,
  seoDescription: true,
  canonicalUrl: true,
  wordCount: true,
  contentDepth: true,
  featuredImageId: true,
  jsonLdStructuredData: true,
  datePublished: true,
  featured: true,
  categoryId: true,
  // Fields the shared REAL scorer reads (so /seo shows the same number as everywhere else).
  nextjsMetadata: true,
  jsonLdValidationReport: true,
  dateModified: true,
  authorId: true,
  clientId: true,
  client: { select: { name: true } },
  author: { select: { id: true } },
  featuredImage: { select: { id: true, altText: true } },
  faqs: { select: { id: true } },
  category: { select: { name: true, slug: true } },
} as const;

export async function getArticlesSeoHealth(): Promise<ArticleSeoHealth[]> {
  const articles = await db.article.findMany({
    select: articleSelect,
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return articles.map((a) => {
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      status: a.status,
      clientName: a.client?.name || null,
      seoScore: getArticleSeoScore(a),
      missingSeoTitle: !a.seoTitle?.trim(),
      missingSeoDescription: !a.seoDescription?.trim(),
      missingCanonical: !a.canonicalUrl?.trim(),
      missingJsonLd: !a.jsonLdStructuredData,
      missingFeaturedImage: !a.featuredImageId,
      wordCount: a.wordCount || 0,
    };
  });
}

export interface BulkFixResult {
  articleId: string;
  title: string;
  success: boolean;
  oldScore: number;
  newScore: number;
  error?: string;
}

export async function bulkFixArticleSeo(articleIds: string[]): Promise<{ success: boolean; results: BulkFixResult[] }> {
  const session = await auth();
  if (!session) return { success: false, results: [] };

  const results: BulkFixResult[] = [];
  // Fetch siteUrl once for the whole batch (Settings.siteUrl > env > hardcoded)
  const baseUrl = await loadSiteUrl();

  for (const articleId of articleIds) {
    try {
      const article = await db.article.findUnique({
        where: { id: articleId },
        select: articleSelect,
      });

      if (!article) {
        results.push({ articleId, title: "Unknown", success: false, oldScore: 0, newScore: 0, error: "Article not found" });
        continue;
      }

      // Old score — the real scorer on the stored fields, before regeneration.
      const oldScore = getArticleSeoScore(article);

      // Auto-generate ONLY missing fields — never overwrite existing values
      const content = article.content || "";
      const wordCount = article.wordCount || calculateWordCountImproved(content, "ar");
      const readingTimeMinutes = calculateReadingTime(wordCount);
      const contentDepth = article.contentDepth || determineContentDepth(wordCount);
      const seoTitle = article.seoTitle?.trim() ? article.seoTitle : generateSEOTitle(article.title, article.client?.name);
      const seoDescription = article.seoDescription?.trim() ? article.seoDescription : generateSEODescription(article.excerpt || "");
      const canonicalUrl = !article.canonicalUrl?.trim() || article.canonicalUrl.includes("/clients/")
        ? generateCanonicalUrl(article.slug, baseUrl)
        : article.canonicalUrl;
      const metaRobots = article.status === "PUBLISHED" ? "index, follow" : "noindex, follow";
      const sitemapPriority = article.featured ? 0.8 : 0.5;
      const breadcrumbPath = generateBreadcrumbPath(
        article.category?.name,
        article.category?.slug,
        article.title,
        article.slug
      );

      // Update article with generated fields
      await db.article.update({
        where: { id: articleId },
        data: {
          wordCount,
          readingTimeMinutes,
          contentDepth,
          seoTitle,
          seoDescription,
          canonicalUrl,
          mainEntityOfPage: canonicalUrl,
          breadcrumbPath: JSON.parse(JSON.stringify(breadcrumbPath)) as Prisma.InputJsonValue,
          ogArticleModifiedTime: new Date(),
        },
      });

      // Regenerate metadata + JSON-LD
      await generateAndSaveNextjsMetadata(articleId, { robots: metaRobots });
      await generateAndSaveJsonLd(articleId);

      // New score — re-read the freshly regenerated stored fields so it's the real number.
      const fresh = await db.article.findUnique({ where: { id: articleId }, select: ARTICLE_SEO_SELECT });
      const newScore = fresh ? getArticleSeoScore(fresh) : oldScore;

      results.push({
        articleId,
        title: article.title,
        success: true,
        oldScore,
        newScore,
      });
    } catch (error) {
      results.push({
        articleId,
        title: "Unknown",
        success: false,
        oldScore: 0,
        newScore: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  revalidatePath("/articles");
  revalidatePath("/seo-overview");
  await revalidateModontyTag("articles");

  return { success: true, results };
}
