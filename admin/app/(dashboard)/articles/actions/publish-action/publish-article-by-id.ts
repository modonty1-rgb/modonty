"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { ArticleStatus } from "@prisma/client";
import type { FormSubmitResult } from "@/lib/types/form-types";
import { validateFullPage } from "@/lib/seo/page-validator";
import { checkCompliance } from "@/lib/seo/pre-publish-audit";
import { auth } from "@/lib/auth";
import { isValidTransition } from "../../helpers/article-status-machine";
import { analyzeArticleSEO } from "../../analyzer";
import { getAllSettings } from "../../../settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "../../../settings/helpers/get-article-defaults-from-settings";

const MIN_SEO_SCORE = 60;

export async function publishArticleById(
  articleId: string
): Promise<FormSubmitResult> {
  try {
    const session = await auth(); if (!session) return { success: false, error: "غير مصرح" };
    const article = await db.article.findUnique({
      where: { id: articleId },
      include: {
        client: true,
        author: true,
        category: true,
        tags: { include: { tag: true } },
        faqs: true,
        featuredImage: true,
        gallery: { include: { media: true } },
      },
    });

    if (!article) {
      return {
        success: false,
        error: "Article not found",
      };
    }

    if (!isValidTransition(article.status, ArticleStatus.PUBLISHED)) {
      return {
        success: false,
        error: `Cannot publish article with status ${article.status}`,
      };
    }

    // SEO score gate — block publish below minimum
    const settings = await getAllSettings();
    const defaults = getArticleDefaultsFromSettings(settings);
    const mergedArticle = { ...article, ...defaults };
    const seoResult = analyzeArticleSEO(mergedArticle as never);
    if (seoResult.percentage < MIN_SEO_SCORE) {
      return {
        success: false,
        error: `نقاط SEO الحالية ${seoResult.percentage}% — الحد الأدنى للنشر ${MIN_SEO_SCORE}%. يرجى تحسين حقول SEO (العنوان، الوصف، الصورة) قبل النشر.`,
      };
    }

    if (!article.title || !article.slug || !article.content) {
      return {
        success: false,
        error:
          "Article is missing required fields (title, slug, or content)",
      };
    }

    try {
      const validationResult = await validateFullPage("article", articleId, {
        includeMetadata: true,
      });

      if (validationResult.issues.critical.length > 0) {
        return {
          success: false,
          error: `Article has ${validationResult.issues.critical.length} critical validation issue(s) that must be fixed before publishing`,
        };
      }
    } catch (error) {
      console.warn("Could not run full page validation:", error);
    }

    if (article.clientId) {
      const client = await db.client.findUnique({
        where: { id: article.clientId },
        select: { forbiddenKeywords: true, forbiddenClaims: true, intake: true },
      });
      const compliance = checkCompliance(
        {
          title: article.title,
          content: article.content,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          excerpt: article.excerpt,
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

    const now = new Date();
    await db.article.update({
      where: { id: articleId },
      data: {
        status: ArticleStatus.PUBLISHED,
        datePublished: article.datePublished || now,
        ogArticlePublishedTime: article.ogArticlePublishedTime || now,
        ogArticleModifiedTime: now,
      },
    });

    // Regenerate SEO data for the newly published article
    try {
      const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
      const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
      await generateAndSaveJsonLd(articleId);
      await generateAndSaveNextjsMetadata(articleId);
    } catch {}

    revalidatePath("/articles");
    revalidatePath(`/articles/${articleId}`);
    revalidatePath(`/articles/${article.slug}`);
    await revalidateModontyTag("articles");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error publishing article by ID:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to publish article";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

