"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { ArticleStatus } from "@prisma/client";
import type { ArticleFormData, FormSubmitResult } from "@/lib/types/form-types";
import { createArticle } from "../articles-actions";
import { auth } from "@/lib/auth";
import { checkCompliance } from "@/lib/seo/pre-publish-audit";
import { analyzeArticleSEO } from "../../analyzer";

const MIN_SEO_SCORE = 60;

async function validateArticleData(formData: ArticleFormData): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!formData.title || formData.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!formData.slug || formData.slug.trim().length === 0) {
    errors.push("Slug is required");
  }

  if (!formData.content || formData.content.trim().length === 0) {
    errors.push("Content is required");
  }

  if (!formData.clientId) {
    errors.push("Client is required");
  }

  if (!formData.authorId) {
    errors.push("Author is required");
  }

  if (!formData.seoTitle) {
    warnings.push("SEO title is recommended for better search visibility");
  }

  if (!formData.seoDescription) {
    warnings.push("SEO description is recommended for better search visibility");
  }

  if (formData.seoDescription && formData.seoDescription.length > 160) {
    warnings.push(
      "SEO description should be 155-160 characters for optimal display"
    );
  }

  if (formData.content && formData.content.length < 300) {
    warnings.push(
      "Article content is quite short. Consider adding more detailed content"
    );
  }

  if (!formData.featuredImageId) {
    warnings.push(
      "Featured image is recommended for better social media sharing"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export async function publishArticle(
  formData: ArticleFormData
): Promise<FormSubmitResult> {
  try {
    const session = await auth(); if (!session) return { success: false, error: "غير مصرح" };
    const validation = await validateArticleData(formData);

    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join("; ")}`,
      };
    }

    // SEO score gate — block publish below minimum
    const seoResult = analyzeArticleSEO(formData);
    if (seoResult.percentage < MIN_SEO_SCORE) {
      return {
        success: false,
        error: `نقاط SEO الحالية ${seoResult.percentage}% — الحد الأدنى للنشر ${MIN_SEO_SCORE}%. يرجى تحسين حقول SEO (العنوان، الوصف، الصورة) قبل النشر.`,
      };
    }

    // Pre-publish compliance check
    if (formData.clientId) {
      const client = await db.client.findUnique({
        where: { id: formData.clientId },
        select: { forbiddenKeywords: true, forbiddenClaims: true },
      });
      const compliance = checkCompliance(
        {
          title: formData.title,
          content: formData.content,
          seoTitle: formData.seoTitle,
          seoDescription: formData.seoDescription,
          excerpt: formData.excerpt,
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

    const createResult = await createArticle({
      ...formData,
      status: ArticleStatus.WRITING,
    });

    if (!createResult.success || !createResult.article) {
      return {
        success: false,
        error: createResult.error || "Failed to create article",
      };
    }

    const finalArticleId = createResult.article.id;
    const now = new Date();

    const publishedArticle = await db.article.update({
      where: { id: finalArticleId },
      data: {
        status: ArticleStatus.PUBLISHED,
        datePublished: formData.datePublished || now,
        ogArticlePublishedTime: formData.datePublished || now,
        ogArticleModifiedTime: now,
      },
    });

    // Regenerate SEO data for the newly published article
    try {
      const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
      const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
      await generateAndSaveJsonLd(finalArticleId);
      await generateAndSaveNextjsMetadata(finalArticleId);
    } catch {}

    revalidatePath("/articles");
    revalidatePath(`/articles/${publishedArticle.id}`);
    revalidatePath(`/articles/${publishedArticle.slug}`);
    await revalidateModontyTag("articles");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error publishing article:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to publish article";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

