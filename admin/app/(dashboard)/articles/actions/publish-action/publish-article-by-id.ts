"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ArticleStatus } from "@prisma/client";
import type { FormSubmitResult } from "@/lib/types/form-types";
import { validateFullPage } from "@/lib/seo/page-validator";

export async function publishArticleById(
  articleId: string
): Promise<FormSubmitResult> {
  try {
    const article = await db.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return {
        success: false,
        error: "Article not found",
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

    revalidatePath("/articles");
    revalidatePath(`/articles/${articleId}`);
    revalidatePath(`/articles/${article.slug}`);

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

