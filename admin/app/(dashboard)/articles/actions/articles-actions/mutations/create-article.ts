"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ArticleStatus, Prisma } from "@prisma/client";
import {
  calculateWordCountImproved,
  calculateReadingTime,
  determineContentDepth,
  generateSEOTitle,
  generateSEODescription,
  generateCanonicalUrl,
  generateBreadcrumbPath,
} from "../../../helpers/seo-helpers";
import { ArticleFormData, FAQItem } from "@/lib/types";
import { generateAndSaveNextjsMetadata } from "@/lib/seo/metadata-storage";
import { generateAndSaveJsonLd } from "@/lib/seo/jsonld-storage";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { articleServerSchema } from "../article-server-schema";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";
import { analyzeArticleSEO } from "../../../analyzer";

const MIN_SEO_SCORE = 60;

function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function createArticle(data: ArticleFormData) {
  try {
    const session = await auth(); if (!session) return { success: false, error: "غير مصرح" };
    const parsed = articleServerSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return { success: false, error: firstError.message };
    }

    // Validate slug uniqueness within client
    const existingArticle = await db.article.findFirst({
      where: { clientId: data.clientId, slug: data.slug.trim() },
      select: { id: true },
    });
    if (existingArticle) {
      return { success: false, error: "هذا الرابط المختصر مستخدم بالفعل لهذا العميل" };
    }

    // SEO score gate — block publish below minimum
    if (data.status === ArticleStatus.PUBLISHED) {
      const seoResult = analyzeArticleSEO(data);
      if (seoResult.percentage < MIN_SEO_SCORE) {
        return {
          success: false,
          error: `نقاط SEO الحالية ${seoResult.percentage}% — الحد الأدنى للنشر ${MIN_SEO_SCORE}%. يرجى تحسين حقول SEO (العنوان، الوصف، الصورة) قبل النشر.`,
        };
      }
    }

    const { getModontyAuthor } = await import(
      "@/app/(dashboard)/authors/actions/authors-actions"
    );
    const modontyAuthor = await getModontyAuthor();
    if (!modontyAuthor) {
      return {
        success: false,
        error: "Modonty author not found. Please ensure the author is set up.",
      };
    }

    const client = await db.client.findUnique({
      where: { id: data.clientId },
      select: { name: true, slug: true },
    });

    const category = data.categoryId
      ? await db.category.findUnique({
          where: { id: data.categoryId },
          select: { name: true, slug: true },
        })
      : null;

    const wordCount =
      data.wordCount ||
      calculateWordCountImproved(data.content, data.inLanguage || "ar");
    const readingTimeMinutes =
      data.readingTimeMinutes || calculateReadingTime(wordCount);
    const contentDepth = data.contentDepth || determineContentDepth(wordCount);

    const seoTitle = data.seoTitle || generateSEOTitle(data.title, client?.name);
    const seoDescription =
      data.seoDescription || generateSEODescription(data.excerpt || "");

    const canonicalUrl =
      !data.canonicalUrl?.trim() || data.canonicalUrl.includes("/clients/")
        ? generateCanonicalUrl(data.slug)
        : data.canonicalUrl.trim();

    const breadcrumbPath = generateBreadcrumbPath(
      category?.name,
      category?.slug,
      data.title,
      data.slug
    );

    const datePublished =
      data.datePublished ||
      (data.status === ArticleStatus.PUBLISHED ? new Date() : null);

    const metaRobots =
      data.metaRobots ||
      (data.status === ArticleStatus.PUBLISHED ? "index, follow" : "noindex, follow");

    const sitemapPriority = data.sitemapPriority || (data.featured ? 0.8 : 0.5);

    const finalStatus = data.status ?? ArticleStatus.WRITING;

    const sanitizedContent = sanitizeHtmlContent(data.content);

    const article = await db.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: sanitizedContent,
        clientId: data.clientId,
        categoryId: data.categoryId || null,
        authorId: modontyAuthor.id,
        status: finalStatus,
        scheduledAt: data.scheduledAt || null,
        featured: data.featured || false,
        featuredImageId: data.featuredImageId || null,
        datePublished,
        wordCount,
        readingTimeMinutes,
        contentDepth,
        lastReviewed: data.lastReviewed || null,
        mainEntityOfPage: canonicalUrl || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        ogArticleAuthor: data.ogArticleAuthor || null,
        ogArticlePublishedTime: datePublished,
        ogArticleModifiedTime: new Date(),
        canonicalUrl,
        breadcrumbPath: JSON.parse(JSON.stringify(breadcrumbPath)) as Prisma.InputJsonValue,
        semanticKeywords:
          data.semanticKeywords != null
            ? (JSON.parse(JSON.stringify(data.semanticKeywords)) as Prisma.InputJsonValue)
            : undefined,
        seoKeywords: data.seoKeywords ?? [],
        citations: data.citations ?? [],
        audioUrl: data.audioUrl || null,
      },
    });

    // Create all relations atomically — if any fails, all roll back
    await db.$transaction(async (tx) => {
      if (data.tags && data.tags.length > 0) {
        await tx.articleTag.createMany({
          data: data.tags.map((tagId) => ({
            articleId: article.id,
            tagId,
          })),
        });
      }

      if (data.faqs && data.faqs.length > 0) {
        await tx.articleFAQ.createMany({
          data: data.faqs.map((faq: FAQItem, index: number) => ({
            articleId: article.id,
            question: sanitizeText(faq.question),
            answer: faq.answer ? sanitizeText(faq.answer) : null,
            position: faq.position ?? index,
          })),
        });
      }

      if (data.gallery && data.gallery.length > 0) {
        await tx.articleMedia.createMany({
          data: data.gallery.map((item, index) => ({
            articleId: article.id,
            mediaId: item.mediaId,
            position: item.position ?? index,
            caption: item.caption || null,
            altText: item.altText || null,
          })),
        });
      }

      if (data.relatedArticles && data.relatedArticles.length > 0) {
        await tx.relatedArticle.createMany({
          data: data.relatedArticles.map((related) => ({
            articleId: article.id,
            relatedId: related.relatedId,
            relationshipType: related.relationshipType || "related",
          })),
        });
      }
    });

    try {
      await generateAndSaveNextjsMetadata(article.id, {
        robots: metaRobots,
      });

      await generateAndSaveJsonLd(article.id);
    } catch (error) {
      console.error(
        "Failed to generate metadata/JSON-LD for article:",
        article.id,
        error
      );
    }

    revalidatePath("/articles");
    await revalidateModontyTag("articles");
    try { const { regenerateArticlesListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateArticlesListingCache(); } catch (error) { console.error("Failed to regenerate articles listing cache:", error); }

    // Re-fetch updatedAt after SEO generation
    const freshArticle = await db.article.findUnique({ where: { id: article.id }, select: { id: true, title: true, slug: true, status: true, updatedAt: true } });
    return { success: true, article: freshArticle || article };
  } catch (error) {
    console.error("Error creating article:", error);
    const message =
      error instanceof Error ? error.message : "فشل في إنشاء المقال";
    return {
      success: false,
      error: message,
    };
  }
}

