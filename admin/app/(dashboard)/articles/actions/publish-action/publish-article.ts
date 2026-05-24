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

  // All messages in Arabic — admin is bilingual but UX targets Arabic-first usage.
  // Each error names the field clearly so admin knows what to fix without guessing.
  if (!formData.title || formData.title.trim().length === 0) {
    errors.push("العنوان (Title) مطلوب");
  }

  if (!formData.slug || formData.slug.trim().length === 0) {
    errors.push("الرابط المختصر (Slug) مطلوب");
  }

  if (!formData.content || formData.content.trim().length === 0) {
    errors.push("المحتوى (Content) مطلوب");
  }

  if (!formData.clientId) {
    errors.push("العميل (Client) مطلوب");
  }

  if (!formData.authorId) {
    errors.push("الكاتب (Author) مطلوب");
  }

  if (!formData.seoTitle) {
    warnings.push("عنوان SEO (SEO Title) مهم لتحسين الظهور في نتائج البحث");
  }

  if (!formData.seoDescription || formData.seoDescription.trim().length < 50) {
    const current = formData.seoDescription?.trim().length ?? 0;
    errors.push(`وصف SEO (SEO Description) مطلوب ولا يقل عن 50 حرفاً — حالياً ${current} حرف`);
  } else if (formData.seoDescription.length > 160) {
    warnings.push(
      `وصف SEO (SEO Description) الأفضل أن يكون 155-160 حرف — حالياً ${formData.seoDescription.length} حرف`
    );
  }

  if (formData.content && formData.content.length < 300) {
    warnings.push(
      `المحتوى قصير (${formData.content.length} حرف) — يُفضّل 300+ حرف للتأثير على ترتيب البحث`
    );
  }

  if (!formData.featuredImageId) {
    warnings.push(
      "الصورة الرئيسية (Featured Image) مهمة للمشاركة على وسائل التواصل"
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
        error: `لا يمكن النشر — أصلح هذي المشاكل:\n• ${validation.errors.join("\n• ")}`,
      };
    }

    // SEO score gate — block publish below minimum
    const seoResult = analyzeArticleSEO(formData);
    if (seoResult.percentage < MIN_SEO_SCORE) {
      // Show breakdown so admin knows WHICH category is dragging the score down
      const weakCategories = Object.entries(seoResult.categories)
        .filter(([, cat]) => cat.percentage < 60)
        .map(([name, cat]) => `${name} ${cat.percentage}%`)
        .join(" · ");
      return {
        success: false,
        error: `نقاط SEO ${seoResult.percentage}% — الحد الأدنى للنشر ${MIN_SEO_SCORE}%.${weakCategories ? `\nالأقسام الضعيفة: ${weakCategories}` : ""}`,
      };
    }

    // Pre-publish compliance check
    if (formData.clientId) {
      const client = await db.client.findUnique({
        where: { id: formData.clientId },
        select: { forbiddenKeywords: true, forbiddenClaims: true, intake: true },
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

