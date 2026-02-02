/**
 * Seed Database Utilities
 * Database clearing and management functions
 */

"use server";

import { db } from "@/lib/db";

export async function clearDatabase(logCallback?: (message: string, level?: "info" | "success" | "error") => void) {
  const log = logCallback || console.log;
  const logError = logCallback || console.error;

  log("Clearing existing data...", "info");

  try {
    log("  [1/6] Deleting related articles...", "info");
    const relatedCount = await db.relatedArticle.count();
    if (relatedCount > 0) {
      await db.relatedArticle.deleteMany({});
      log(`    Deleted ${relatedCount} related articles`, "success");
    }

    log("  [2/6] Deleting FAQs...", "info");
    const faqCount = await db.articleFAQ.count();
    if (faqCount > 0) {
      await db.articleFAQ.deleteMany({});
      log(`    Deleted ${faqCount} FAQs`, "success");
    }

    log("  [3/6] Deleting analytics...", "info");
    const analyticsCount = await db.analytics.count();
    if (analyticsCount > 0) {
      await db.analytics.deleteMany({});
      log(`    Deleted ${analyticsCount} analytics records`, "success");
    }

    log("  [4/6] Deleting article media gallery...", "info");
    const mediaCount = await db.articleMedia.count();
    if (mediaCount > 0) {
      await db.articleMedia.deleteMany({});
      log(`    Deleted ${mediaCount} article media records`, "success");
    }

    log("  [5/6] Deleting article tags...", "info");
    const tagCount = await db.articleTag.count();
    if (tagCount > 0) {
      await db.articleTag.deleteMany({});
      log(`    Deleted ${tagCount} article tags`, "success");
    }

    log("  [6/6] Deleting article versions...", "info");
    const versionCount = await db.articleVersion.count();
    if (versionCount > 0) {
      await db.articleVersion.deleteMany({});
      log(`    Deleted ${versionCount} article versions`, "success");
    }

    log("  [7/7] Deleting article link clicks...", "info");
    const linkClickCount = await db.articleLinkClick.count();
    if (linkClickCount > 0) {
      await db.articleLinkClick.deleteMany({});
      log(`    Deleted ${linkClickCount} article link clicks`, "success");
    }

    log("  Deleting engagement duration...", "info");
    const engagementCount = await db.engagementDuration.count();
    if (engagementCount > 0) {
      await db.engagementDuration.deleteMany({});
      log(`    Deleted ${engagementCount} engagement duration records`, "success");
    }

    log("  Deleting lead scoring...", "info");
    const leadScoringCount = await db.leadScoring.count();
    if (leadScoringCount > 0) {
      await db.leadScoring.deleteMany({});
      log(`    Deleted ${leadScoringCount} lead scoring records`, "success");
    }

    log("  Deleting campaign tracking...", "info");
    const campaignCount = await db.campaignTracking.count();
    if (campaignCount > 0) {
      await db.campaignTracking.deleteMany({});
      log(`    Deleted ${campaignCount} campaign tracking records`, "success");
    }

    log("  Deleting CTA clicks...", "info");
    const ctaClickCount = await db.cTAClick.count();
    if (ctaClickCount > 0) {
      await db.cTAClick.deleteMany({});
      log(`    Deleted ${ctaClickCount} CTA clicks`, "success");
    }

    log("  Deleting conversions...", "info");
    const conversionCount = await db.conversion.count();
    if (conversionCount > 0) {
      await db.conversion.deleteMany({});
      log(`    Deleted ${conversionCount} conversions`, "success");
    }

    log("  Deleting shares...", "info");
    const shareCount = await db.share.count();
    if (shareCount > 0) {
      await db.share.deleteMany({});
      log(`    Deleted ${shareCount} shares`, "success");
    }

    log("  Deleting client views...", "info");
    const clientViewCount = await db.clientView.count();
    if (clientViewCount > 0) {
      await db.clientView.deleteMany({});
      log(`    Deleted ${clientViewCount} client views`, "success");
    }

    log("  Deleting article views...", "info");
    const articleViewCount = await db.articleView.count();
    if (articleViewCount > 0) {
      await db.articleView.deleteMany({});
      log(`    Deleted ${articleViewCount} article views`, "success");
    }

    log("  Deleting client comment dislikes...", "info");
    const clientCommentDislikeCount = await db.clientCommentDislike.count();
    if (clientCommentDislikeCount > 0) {
      await db.clientCommentDislike.deleteMany({});
      log(`    Deleted ${clientCommentDislikeCount} client comment dislikes`, "success");
    }

    log("  Deleting client comment likes...", "info");
    const clientCommentLikeCount = await db.clientCommentLike.count();
    if (clientCommentLikeCount > 0) {
      await db.clientCommentLike.deleteMany({});
      log(`    Deleted ${clientCommentLikeCount} client comment likes`, "success");
    }

    log("  Deleting client favorites...", "info");
    const clientFavoriteCount = await db.clientFavorite.count();
    if (clientFavoriteCount > 0) {
      await db.clientFavorite.deleteMany({});
      log(`    Deleted ${clientFavoriteCount} client favorites`, "success");
    }

    log("  Deleting client dislikes...", "info");
    const clientDislikeCount = await db.clientDislike.count();
    if (clientDislikeCount > 0) {
      await db.clientDislike.deleteMany({});
      log(`    Deleted ${clientDislikeCount} client dislikes`, "success");
    }

    log("  Deleting client likes...", "info");
    const clientLikeCount = await db.clientLike.count();
    if (clientLikeCount > 0) {
      await db.clientLike.deleteMany({});
      log(`    Deleted ${clientLikeCount} client likes`, "success");
    }

    log("  Clearing parent references from client comments...", "info");
    await db.clientComment.updateMany({
      data: { parentId: null },
    });

    log("  Deleting client comments...", "info");
    const clientCommentCount = await db.clientComment.count();
    if (clientCommentCount > 0) {
      await db.clientComment.deleteMany({});
      log(`    Deleted ${clientCommentCount} client comments`, "success");
    }

    log("  Deleting comment dislikes...", "info");
    const commentDislikeCount = await db.commentDislike.count();
    if (commentDislikeCount > 0) {
      await db.commentDislike.deleteMany({});
      log(`    Deleted ${commentDislikeCount} comment dislikes`, "success");
    }

    log("  Deleting comment likes...", "info");
    const commentLikeCount = await db.commentLike.count();
    if (commentLikeCount > 0) {
      await db.commentLike.deleteMany({});
      log(`    Deleted ${commentLikeCount} comment likes`, "success");
    }

    log("  Deleting article favorites...", "info");
    const articleFavoriteCount = await db.articleFavorite.count();
    if (articleFavoriteCount > 0) {
      await db.articleFavorite.deleteMany({});
      log(`    Deleted ${articleFavoriteCount} article favorites`, "success");
    }

    log("  Deleting article dislikes...", "info");
    const articleDislikeCount = await db.articleDislike.count();
    if (articleDislikeCount > 0) {
      await db.articleDislike.deleteMany({});
      log(`    Deleted ${articleDislikeCount} article dislikes`, "success");
    }

    log("  Deleting article likes...", "info");
    const articleLikeCount = await db.articleLike.count();
    if (articleLikeCount > 0) {
      await db.articleLike.deleteMany({});
      log(`    Deleted ${articleLikeCount} article likes`, "success");
    }

    log("  Clearing parent references from comments...", "info");
    await db.comment.updateMany({
      data: { parentId: null },
    });

    log("  Deleting comments...", "info");
    const commentCount = await db.comment.count();
    if (commentCount > 0) {
      await db.comment.deleteMany({});
      log(`    Deleted ${commentCount} comments`, "success");
    }

    log("  Deleting articles...", "info");
    const articleCount = await db.article.count();
    if (articleCount > 0) {
      await db.article.deleteMany({});
      log(`    Deleted ${articleCount} articles`, "success");
    }

    log("  Deleting article tags (before deleting tags - children first)...", "info");
    await db.articleTag.deleteMany({});
    await new Promise((resolve) => setTimeout(resolve, 200));

    log("  Deleting tags (parent)...", "info");
    await db.tag.deleteMany({});

    log("  Deleting subscribers (depend on clients - children)...", "info");
    await db.subscriber.deleteMany({});

    log("  Clearing media references from clients...", "info");
    await db.client.updateMany({
      data: {
        logoMediaId: null,
        ogImageMediaId: null,
        twitterImageMediaId: null,
      },
    });

    log("  Clearing parent organization references from clients...", "info");
    await db.client.updateMany({
      data: { parentOrganizationId: null },
    });

    log("  Deleting clients (parent)...", "info");
    await db.client.deleteMany({});

    log("  Deleting media (parent)...", "info");
    await db.media.deleteMany({});

    log("  Clearing parent references from categories...", "info");
    await db.category.updateMany({
      data: { parentId: null },
    });

    log("  Deleting categories...", "info");
    await db.category.deleteMany({});

    log("  Deleting authors...", "info");
    await db.author.deleteMany({});

    log("  Deleting industries...", "info");
    await db.industry.deleteMany({});

    log("  Deleting settings...", "info");
    await db.settings.deleteMany({});

    log("  Deleting subscription tier configs...", "info");
    await db.subscriptionTierConfig.deleteMany({});

    log("✅ Database cleared successfully.", "success");
  } catch (error) {
    logError("❌ Error during database clearing:", "error");
    if (error instanceof Error) {
      logError(`   ${error.message}`, "error");
    }
    throw error;
  }
}
