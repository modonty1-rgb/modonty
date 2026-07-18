"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { submitToIndexNow } from "@/lib/indexnow";
import { ArticleStatus } from "@prisma/client";
import { isValidTransition } from "../../helpers/article-status-machine";
import { logAction } from "@/lib/audit/log-action";
import { assertArticlePublishable } from "@/lib/seo/assert-article-publishable";

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

    // Server-side gate: the transition must be allowed by the state machine.
    // This is the hard backstop that enforces "client approval is mandatory" even
    // if a UI ever passes an illegal jump (e.g. AWAITING_APPROVAL → SCHEDULED/PUBLISHED).
    if (!isValidTransition(expectedFrom, toStatus)) {
      return {
        success: false,
        error: `Transition ${expectedFrom} → ${toStatus} is not allowed.`,
      };
    }

    // Transition-to-PUBLISHED gates — quality checks that must pass before going live.
    if (toStatus === ArticleStatus.PUBLISHED) {
      // Single publish gate: generate the live JSON-LD + metadata, then score THAT with the
      // shared scorer (real SEO) — blocks a page whose real SEO fails, not just empty fields.
      const gate = await assertArticlePublishable(articleId);
      if (!gate.ok) {
        return { success: false, error: gate.error };
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
    // datePublished is set by the publish gate (assertArticlePublishable) before it generates,
    // so the stored JSON-LD carries the exact same publish date. Nothing to set here.
    if (expectedFrom === ArticleStatus.NEEDS_REVISION && toStatus === ArticleStatus.DRAFT) {
      data.revisionNotes = null;
    }

    await db.article.update({
      where: { id: articleId },
      data,
    });

    // Publishing sends an article out to the world; every other move decides whose desk it
    // sits on. Both are worth a name — log the move, not just the fact that it moved.
    await logAction(toStatus === ArticleStatus.PUBLISHED ? "article.publish" : "article.transition", {
      entity: "Article",
      entityId: articleId,
      summary: article.title,
      metadata: { from: expectedFrom, to: toStatus },
    });

    // PUBLISHED side effects: regenerate fresh JSON-LD + metadata, then notify search engines.
    // Best-effort: each step is wrapped so failure of one doesn't block the others.
    if (toStatus === ArticleStatus.PUBLISHED) {
      // JSON-LD + metadata were already generated (indexable, with publish date) by the
      // publish gate above — no need to regenerate here.
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
