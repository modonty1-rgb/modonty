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

export async function createArticle(data: ArticleFormData) {
  try {
    if (!data.title || data.title.trim().length === 0) {
      return {
        success: false,
        error: "العنوان مطلوب",
      };
    }

    if (!data.content || data.content.trim().length === 0) {
      return {
        success: false,
        error: "المحتوى مطلوب",
      };
    }

    if (!data.clientId) {
      return {
        success: false,
        error: "العميل مطلوب",
      };
    }

    if (!data.slug || data.slug.trim().length === 0) {
      return {
        success: false,
        error: "الرابط المختصر مطلوب",
      };
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

    const finalStatus = ArticleStatus.WRITING;

    const article = await db.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
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
      },
    });

    if (data.tags && data.tags.length > 0) {
      for (const tagId of data.tags) {
        try {
          await db.articleTag.create({
            data: {
              articleId: article.id,
              tagId,
            },
          });
        } catch (error) {
          console.error(
            `Failed to create tag ${tagId} for article ${article.id}:`,
            error
          );
        }
      }
    }

    if (data.faqs && data.faqs.length > 0) {
      await db.articleFAQ.createMany({
        data: data.faqs.map((faq: FAQItem, index: number) => ({
          articleId: article.id,
          question: faq.question,
          answer: faq.answer,
          position: faq.position ?? index,
        })),
      });
    }

    if (data.gallery && data.gallery.length > 0) {
      await db.$transaction(
        data.gallery.map((item, index) =>
          db.articleMedia.create({
            data: {
              articleId: article.id,
              mediaId: item.mediaId,
              position: item.position ?? index,
              caption: item.caption || null,
              altText: item.altText || null,
            },
          })
        )
      );
    }

    if (data.relatedArticles && data.relatedArticles.length > 0) {
      await db.relatedArticle.createMany({
        data: data.relatedArticles.map((related) => ({
          articleId: article.id,
          relatedId: related.relatedId,
          relationshipType: related.relationshipType || "related",
        })),
      });
    }

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
    return { success: true, article };
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

