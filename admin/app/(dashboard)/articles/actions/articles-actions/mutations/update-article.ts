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
import { checkCompliance } from "@/lib/seo/pre-publish-audit";
import { auth } from "@/lib/auth";
import { articleServerSchema } from "../article-server-schema";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";
import { isValidTransition } from "../../../helpers/article-status-machine";
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

export async function updateArticle(articleId: string, data: ArticleFormData) {
  try {
    const session = await auth(); if (!session) return { success: false, error: "غير مصرح" };
    const parsed = articleServerSchema.safeParse(data);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return { success: false, error: firstError.message };
    }

    const existingArticle = await db.article.findUnique({
      where: { id: articleId },
      select: { authorId: true, ogArticlePublishedTime: true, slug: true, clientId: true, datePublished: true, status: true, updatedAt: true, title: true, content: true, excerpt: true, seoTitle: true, seoDescription: true },
    });

    if (!existingArticle) {
      return {
        success: false,
        error: "المقال غير موجود",
      };
    }

    // Optimistic locking: reject if another user modified the article
    if (data.updatedAt && existingArticle.updatedAt.getTime() !== new Date(data.updatedAt).getTime()) {
      return { success: false, error: "This article was modified by another user. Please refresh and try again." };
    }

    // Snapshot current version before overwriting
    await db.articleVersion.create({
      data: {
        articleId,
        title: existingArticle.title,
        content: existingArticle.content,
        excerpt: existingArticle.excerpt,
        seoTitle: existingArticle.seoTitle,
        seoDescription: existingArticle.seoDescription,
        createdBy: session.user?.id ?? null,
      },
    });

    // Validate status transition
    if (data.status && data.status !== existingArticle.status) {
      if (!isValidTransition(existingArticle.status, data.status)) {
        return {
          success: false,
          error: `Cannot transition from ${existingArticle.status} to ${data.status}`,
        };
      }
    }

    // Validate slug uniqueness within client when slug changed
    if (data.slug && data.slug !== existingArticle.slug) {
      const existingSlug = await db.article.findFirst({
        where: { clientId: data.clientId || existingArticle.clientId, slug: data.slug.trim(), id: { not: articleId } },
        select: { id: true },
      });
      if (existingSlug) {
        return { success: false, error: "هذا الرابط المختصر مستخدم بالفعل لهذا العميل" };
      }
    }

    const client = await db.client.findUnique({
      where: { id: data.clientId },
      select: {
        name: true,
        slug: true,
        forbiddenKeywords: true,
        forbiddenClaims: true,
      },
    });

    if (data.status === ArticleStatus.PUBLISHED) {
      // SEO score gate — block publish below minimum
      const seoResult = analyzeArticleSEO(data);
      if (seoResult.percentage < MIN_SEO_SCORE) {
        return {
          success: false,
          error: `SEO score is ${seoResult.percentage}% — minimum ${MIN_SEO_SCORE}% required to publish. Improve SEO fields before publishing.`,
        };
      }

      if (client) {
        const compliance = checkCompliance(
          {
            title: data.title,
            content: data.content,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            excerpt: data.excerpt,
          },
          client
        );
        if (compliance.blocked) {
          return {
            success: false,
            error: compliance.issues.map((i) => i.message).join(". "),
          };
        }
      }
    }

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

    const datePublished = data.datePublished !== undefined ? data.datePublished : existingArticle.datePublished;

    const metaRobots =
      data.metaRobots ||
      (data.status === ArticleStatus.PUBLISHED ? "index, follow" : "noindex, follow");

    const sitemapPriority = data.sitemapPriority || (data.featured ? 0.8 : 0.5);

    if (
      data.status &&
      !Object.values(ArticleStatus).includes(data.status as ArticleStatus)
    ) {
      return {
        success: false,
        error:
          "Invalid status value. Status must be a valid ArticleStatus enum value.",
      };
    }

    const sanitizedContent = sanitizeHtmlContent(data.content);

    const article = await db.article.update({
      where: { id: articleId },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: sanitizedContent,
        clientId: data.clientId,
        categoryId: data.categoryId || null,
        authorId: existingArticle.authorId,
        status: data.status,
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
        ogArticlePublishedTime: existingArticle.ogArticlePublishedTime,
        ogArticleModifiedTime: new Date(),
        canonicalUrl,
        breadcrumbPath: JSON.parse(JSON.stringify(breadcrumbPath)) as Prisma.InputJsonValue,
        semanticKeywords:
          data.semanticKeywords != null
            ? (JSON.parse(JSON.stringify(data.semanticKeywords)) as Prisma.InputJsonValue)
            : ([] as Prisma.InputJsonValue),
        seoKeywords: data.seoKeywords ?? [],
        citations: data.citations ?? [],
      },
    });

    // Delete + re-create all relations atomically — if any fails, all roll back
    await db.$transaction(async (tx) => {
      await tx.articleTag.deleteMany({ where: { articleId: article.id } });
      if (data.tags && data.tags.length > 0) {
        await tx.articleTag.createMany({
          data: data.tags.map((tagId) => ({
            articleId: article.id,
            tagId,
          })),
        });
      }

      await tx.articleFAQ.deleteMany({ where: { articleId: article.id } });
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

      await tx.articleMedia.deleteMany({ where: { articleId: article.id } });
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

      await tx.relatedArticle.deleteMany({ where: { articleId: article.id } });
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
    revalidatePath(`/articles/${article.id}`);
    revalidatePath(`/articles/${article.slug}`);
    await revalidateModontyTag("articles");
    try { const { regenerateArticlesListingCache } = await import("@/lib/seo/listing-page-seo-generator"); await regenerateArticlesListingCache(); } catch (error) { console.error("Failed to regenerate articles listing cache:", error); }
    return { success: true, article };
  } catch (error) {
    console.error("Error updating article:", error);
    const message =
      error instanceof Error ? error.message : "فشل في تحديث المقال";
    return {
      success: false,
      error: message,
    };
  }
}

