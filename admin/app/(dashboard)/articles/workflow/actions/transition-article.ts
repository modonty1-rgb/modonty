"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { submitToIndexNow } from "@/lib/indexnow";
import { ArticleStatus } from "@prisma/client";

const MIN_SEO_SCORE = 60;

export interface TransitionResult {
  success: boolean;
  error?: string;
}

/**
 * Transition an article from one status to another.
 * Validates: caller is authenticated + current status === expectedFrom (prevents accidental skips).
 *
 * This is the SOLE publish gate. Transitions TO PUBLISHED run full quality gates
 * (SEO score, compliance check) + side effects (JSON-LD regen, IndexNow, revalidate).
 */
export async function transitionArticleAction(
  articleId: string,
  expectedFrom: ArticleStatus,
  toStatus: ArticleStatus
): Promise<TransitionResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const article = await db.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        status: true,
        slug: true,
        title: true,
        content: true,
        excerpt: true,
        seoTitle: true,
        seoDescription: true,
        clientId: true,
        featuredImageId: true,
      },
    });

    if (!article) {
      return { success: false, error: "Article not found" };
    }

    if (article.status !== expectedFrom) {
      return {
        success: false,
        error: `Article is in ${article.status} state, not ${expectedFrom}. Refresh the page.`,
      };
    }

    // Transition-to-PUBLISHED gates — quality checks that must pass before going live.
    if (toStatus === ArticleStatus.PUBLISHED) {
      const { analyzeArticleSEO } = await import("../../analyzer");
      const seoResult = analyzeArticleSEO(article as never);
      if (seoResult.percentage < MIN_SEO_SCORE) {
        const weakCategories = Object.entries(seoResult.categories)
          .filter(([, cat]) => cat.percentage < 60)
          .map(([name, cat]) => `${name} ${cat.percentage}%`)
          .join(" · ");
        return {
          success: false,
          error: `نقاط SEO ${seoResult.percentage}% — الحد الأدنى للنشر ${MIN_SEO_SCORE}%.${weakCategories ? `\nالأقسام الضعيفة: ${weakCategories}` : ""}`,
        };
      }

      if (article.clientId) {
        const { checkCompliance } = await import("@/lib/seo/pre-publish-audit");
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
    }

    // Auto-set datePublished when moving directly to PUBLISHED.
    // Clear revisionNotes when admin re-submits a NEEDS_REVISION article — the
    // notes were already addressed; lingering them would clutter future cycles.
    const data: { status: ArticleStatus; datePublished?: Date; revisionNotes?: null } = {
      status: toStatus,
    };
    if (toStatus === ArticleStatus.PUBLISHED) {
      data.datePublished = new Date();
    }
    if (expectedFrom === ArticleStatus.NEEDS_REVISION && toStatus === ArticleStatus.DRAFT) {
      data.revisionNotes = null;
    }

    await db.article.update({
      where: { id: articleId },
      data,
    });

    // PUBLISHED side effects: regenerate fresh JSON-LD + metadata, then notify search engines.
    // Best-effort: each step is wrapped so failure of one doesn't block the others.
    if (toStatus === ArticleStatus.PUBLISHED) {
      try {
        const { generateAndSaveJsonLd } = await import("@/lib/seo/jsonld-storage");
        const { generateAndSaveNextjsMetadata } = await import("@/lib/seo/metadata-storage");
        await generateAndSaveJsonLd(articleId);
        await generateAndSaveNextjsMetadata(articleId);
      } catch (error) {
        console.error("transitionArticleAction: JSON-LD/metadata regen failed", error);
      }

      try {
        const articleUrl = `https://www.modonty.com/articles/${article.slug}`;
        const indexNowResult = await submitToIndexNow([articleUrl]);
        if (!indexNowResult.ok) {
          console.warn("transitionArticleAction: IndexNow not ok", indexNowResult);
        }
      } catch (error) {
        console.error("transitionArticleAction: IndexNow failed", error);
      }
    }

    revalidatePath("/articles");
    revalidatePath("/articles/workflow");
    revalidatePath(`/articles/${article.slug}`);
    revalidateTag("article-status-counts", "max");
    if (toStatus === ArticleStatus.PUBLISHED) {
      await revalidateModontyTag("articles");
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transition failed";
    return { success: false, error: message };
  }
}
