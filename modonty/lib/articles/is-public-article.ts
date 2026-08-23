import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * Is this article one that modonty.com actually publishes?
 *
 * Every interaction action here takes an `articleId` straight from the browser and
 * trusts it. That was harmless while every article in the database belonged to this
 * site — it is not harmless now: an article written for a CLIENT's own website lives
 * in the same collection under `PUBLISHED_ON_CLIENT_SITE`. It never renders here and
 * never gets indexed here, but nothing stopped a crafted request from attaching a
 * like or a comment to it in our database.
 *
 * So the rule is the same one the whole public site already applies: an interaction
 * is only valid against an article whose status is exactly PUBLISHED.
 */
export async function isPublicArticle(articleId: string): Promise<boolean> {
  const article = await db.article.findFirst({
    where: { id: articleId, status: ArticleStatus.PUBLISHED },
    select: { id: true },
  });
  return article !== null;
}
