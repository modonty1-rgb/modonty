"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
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
import { logAction } from "@/lib/audit/log-action";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { auth } from "@/lib/auth";
import { articleServerSchema } from "../article-server-schema";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";

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
      // Surface ALL failed fields by name — generic "String must contain at most N character(s)"
      // is useless to the admin when they don't know which field is too long.
      const errors = parsed.error.errors
        .map((e) => `${e.path.join(".") || "field"}: ${e.message}`)
        .join(" · ");
      return { success: false, error: `بيانات غير صحيحة — ${errors}` };
    }

    // Validate slug uniqueness within client
    const existingArticle = await db.article.findFirst({
      where: { clientId: data.clientId, slug: data.slug.trim() },
      select: { id: true },
    });
    if (existingArticle) {
      return { success: false, error: "هذا الرابط المختصر مستخدم بالفعل لهذا العميل" };
    }

    // No SEO gate here: create always starts non-published (status = WRITING; the edit form
    // cannot set PUBLISHED — see meta-section). Going live happens ONLY via transitionArticleAction,
    // which runs the single real gate (assertArticlePublishable). One gate, one score.

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

    const baseUrl = await loadSiteUrl();
    // Always regenerate canonical from current slug — never trust input value
    // (prior logic kept user-provided canonicalUrl, allowing stale/wrong URLs)
    const canonicalUrl = generateCanonicalUrl(data.slug, baseUrl);

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
        excerpt: seoDescription || null,
        content: sanitizedContent,
        clientId: data.clientId,
        categoryId: data.categoryId || null,
        authorId: modontyAuthor.id,
        // YMYL reviewer (optional at create; required by publish gate when client.isYmyl=true)
        reviewedById: data.reviewedById ?? null,
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

      // Filter out incomplete FAQs (missing question OR answer) — prevents partial entries in DB
      const validFaqs = (data.faqs ?? []).filter(
        (f: FAQItem) => f.question?.trim() && f.answer?.trim(),
      );
      if (validFaqs.length > 0) {
        await tx.articleFAQ.createMany({
          data: validFaqs.map((faq: FAQItem, index: number) => ({
            articleId: article.id,
            question: sanitizeText(faq.question),
            answer: sanitizeText(faq.answer),
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

    // Who started this article — the first line of its history.
    await logAction("article.create", {
      entity: "Article",
      entityId: article.id,
      summary: article.title,
      metadata: { status: article.status },
    });

    revalidatePath("/articles");
    revalidateTag("article-status-counts", "max");
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

