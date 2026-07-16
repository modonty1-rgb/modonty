"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { ArticleStatus } from "@prisma/client";
import { buildArticleUrl } from "@/lib/seo/url-builders";
import { validateArticleFromDb } from "@/lib/seo/article-validator-db";
import { logAction } from "@/lib/audit/log-action";
import type { ValidationResult } from "@/lib/seo/article-validator";
import { regenerateJsonLd, needsRegeneration } from "@/lib/seo/jsonld-storage";
import { checkYmylPublishGate } from "@/lib/seo/ymyl-helpers";

export interface GatedTransitionResult {
  success: boolean;
  error?: string;
  validation?: ValidationResult;
  autoFixed?: { jsonLdRegenerated: boolean };
  ymylGate?: { canPublish: boolean; blockers: string[]; warnings: string[] };
}

/**
 * Hard-gate transition from DRAFT → AWAITING_APPROVAL.
 *
 * Pipeline:
 * 1. Auth check
 * 2. Auto-fix cache freshness (regenerate JSON-LD if stale)
 * 3. Run validateArticleFromDb (28 checks)
 * 4. If all checks pass → transition. Else → return failed checks, NO transition.
 *
 * Per project golden rule: every article must pass 100% before reaching the client.
 */
export async function gatedTransitionAction(
  articleId: string,
): Promise<GatedTransitionResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // Check article exists + is in DRAFT
    const initial = await db.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true, slug: true },
    });
    if (!initial) return { success: false, error: "Article not found" };
    if (initial.status !== ArticleStatus.DRAFT) {
      return {
        success: false,
        error: `Article is in ${initial.status} state, expected DRAFT. Refresh the page.`,
      };
    }

    // Step 1 — Auto-fix JSON-LD cache freshness BEFORE validating.
    let jsonLdRegenerated = false;
    if (await needsRegeneration(articleId)) {
      const result = await regenerateJsonLd(articleId);
      jsonLdRegenerated = result.success;
    }

    // Step 2 — Re-fetch article with full validator shape.
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        content: true,
        excerpt: true,
        seoTitle: true,
        seoDescription: true,
        wordCount: true,
        articleBodyText: true,
        canonicalUrl: true,
        datePublished: true,
        dateModified: true,
        scheduledAt: true,
        jsonLdStructuredData: true,
        jsonLdLastGenerated: true,
        jsonLdValidationReport: true,
        nextjsMetadata: true,
        nextjsMetadataLastGenerated: true,
        featuredImageId: true,
        // YMYL reviewer for publish gate
        reviewedById: true,
        client: {
          select: {
            name: true,
            logoMedia: { select: { url: true, width: true, height: true } },
            // YMYL gate inputs
            isYmyl: true,
            ymylCategory: true,
            ymylData: true,
            addressCountry: true,
          },
        },
        author: { select: { name: true } },
        featuredImage: {
          select: { altText: true, width: true, height: true },
        },
      },
    });
    if (!article) return { success: false, error: "Article not found after re-fetch" };

    // Step 3 — Run the 28-check validator.
    const articleUrl = await buildArticleUrl(article.slug);
    const validation = validateArticleFromDb({
      id: article.id,
      slug: article.slug,
      title: article.title,
      url: articleUrl,
      status: article.status,
      content: article.content,
      excerpt: article.excerpt,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      wordCount: article.wordCount,
      articleBodyText: article.articleBodyText,
      canonicalUrl: article.canonicalUrl,
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      scheduledAt: article.scheduledAt,
      jsonLdStructuredData: article.jsonLdStructuredData,
      jsonLdLastGenerated: article.jsonLdLastGenerated,
      jsonLdValidationReport: article.jsonLdValidationReport,
      nextjsMetadata: article.nextjsMetadata,
      nextjsMetadataLastGenerated: article.nextjsMetadataLastGenerated,
      featuredImageId: article.featuredImageId,
      featuredImage: article.featuredImage
        ? {
            altText: article.featuredImage.altText,
            width: article.featuredImage.width,
            height: article.featuredImage.height,
          }
        : null,
      author: article.author ? { name: article.author.name } : null,
      client: article.client
        ? {
            name: article.client.name,
            logoMedia: article.client.logoMedia
              ? {
                  url: article.client.logoMedia.url,
                  width: article.client.logoMedia.width,
                  height: article.client.logoMedia.height,
                }
              : null,
          }
        : null,
    });

    // Step 4 — Hard gate: 100% or no transition.
    if (validation.failedCount > 0) {
      return {
        success: false,
        error: `Article failed ${validation.failedCount}/${validation.totalChecks} checks — fix all issues before sending to client.`,
        validation,
        autoFixed: { jsonLdRegenerated },
      };
    }

    // Step 4b — YMYL gate: if client is YMYL, enforce reviewer + license + clean content.
    const ymylGate = checkYmylPublishGate({
      client: {
        isYmyl: article.client?.isYmyl ?? false,
        ymylCategory: article.client?.ymylCategory ?? null,
        ymylData: article.client?.ymylData ?? null,
        addressCountry: article.client?.addressCountry ?? null,
      },
      article: {
        content: article.content ?? "",
        reviewedById: article.reviewedById ?? null,
      },
    });
    if (!ymylGate.canPublish) {
      return {
        success: false,
        error: `YMYL gate blocked: ${ymylGate.blockers.join(" · ")}`,
        validation,
        autoFixed: { jsonLdRegenerated },
        ymylGate,
      };
    }

    // Step 5 — Transition.
    await db.article.update({
      where: { id: articleId },
      data: { status: ArticleStatus.AWAITING_APPROVAL },
    });

    // This one passed the SEO gate and the YMYL check — worth recording who put it through.
    await logAction("article.transition", {
      entity: "Article",
      entityId: articleId,
      summary: article.title,
      metadata: { to: ArticleStatus.AWAITING_APPROVAL, gated: true, jsonLdRegenerated },
    });

    revalidatePath("/articles");
    revalidatePath("/articles/workflow");
    revalidatePath(`/articles/${articleId}`);
    revalidateTag("article-status-counts", "max");

    return {
      success: true,
      validation,
      autoFixed: { jsonLdRegenerated },
      ymylGate,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gated transition failed";
    return { success: false, error: message };
  }
}
