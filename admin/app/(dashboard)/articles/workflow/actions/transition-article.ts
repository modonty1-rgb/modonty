"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { ArticleStatus } from "@prisma/client";
import { isValidTransition } from "../../helpers/article-status-machine";
import { logAction } from "@/lib/audit/log-action";
import { publishArticle } from "@/lib/articles/publish-article";

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
  requestedStatus: ArticleStatus
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
        isClientSiteArticle: true,
        featuredImageId: true,
      },
    });

    if (!article) {
      return { success: false, error: "Article not found" };
    }

    // WHERE «publish» lands is the ARTICLE's business, not the button's.
    //
    // «Scheduled → Published» is one screen for every article and it always asks for
    // PUBLISHED. For a piece written for a client's own website that value would put it
    // live on modonty.com — the single leak this whole feature exists to prevent. Read
    // once, here, so every screen that publishes inherits it and none can forget.
    const toStatus =
      requestedStatus === ArticleStatus.PUBLISHED && article.isClientSiteArticle
        ? ArticleStatus.PUBLISHED_ON_CLIENT_SITE
        : requestedStatus;

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

    const isGoingLive =
      toStatus === ArticleStatus.PUBLISHED || toStatus === ArticleStatus.PUBLISHED_ON_CLIENT_SITE;

    /**
     * **النشرُ يخرج من هنا إلى `lib/articles/publish-article.ts`.**
     *
     * صار للنشر مناديان: هذا الزرّ، وكرونُ النشر المجدول (خالد ٢٠ سبتمبر ٢٠٢٦). ولو بقي
     * المنطقُ هنا لنسخه الكرونُ لنفسه، فصار للنشر بابان يفترقان أوّلَ تعديلٍ يُجرى على
     * أحدهما. فالدالّةُ واحدةٌ والفحوصُ فيها، وهذا الملفّ يبقى للانتقالات غير النشر.
     */
    if (isGoingLive) {
      const published = await publishArticle(articleId, "staff");
      if (!published.ok) return { success: false, error: published.error };
      return { success: true };
    }

    // Clear revisionNotes when admin re-submits a NEEDS_REVISION article — the notes
    // were already addressed; lingering them would clutter future cycles.
    const data: { status: ArticleStatus; revisionNotes?: null } = { status: toStatus };
    if (expectedFrom === ArticleStatus.NEEDS_REVISION && toStatus === ArticleStatus.DRAFT) {
      data.revisionNotes = null;
    }

    await db.article.update({ where: { id: articleId }, data });

    await logAction("article.transition", {
      entity: "Article",
      entityId: articleId,
      summary: article.title,
      metadata: { from: expectedFrom, to: toStatus },
    });

    revalidatePath("/articles");
    revalidatePath("/articles/workflow");
    revalidatePath(`/articles/${article.slug}`);
    revalidateTag("article-status-counts", "max");
    // ولا تحديثَ لكاش مدونتي هنا: النشرُ يرجع مبكّراً من `publishArticle` أعلاه، وما
    // يصل هذا السطرَ انتقالٌ داخليّ لا يراه زائر.

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transition failed";
    return { success: false, error: message };
  }
}
