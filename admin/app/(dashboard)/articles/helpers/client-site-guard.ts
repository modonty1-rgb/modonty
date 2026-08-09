import { ArticleStatus } from "@prisma/client";

/** The three fields any guard needs to judge an article. Kept as a shape, not a
 *  Prisma type, so callers can `select` exactly these and nothing more. */
export interface ClientSiteGuardInput {
  isClientSiteArticle: boolean;
  status: ArticleStatus;
  lastFetchedAt: Date | null;
}

/**
 * Has this article already left the building?
 *
 * An article written for the client's OWN website stops being ours the moment it
 * goes live there: their pages link to it, Google has crawled it, and their sitemap
 * lists it. Deleting or archiving it from our side would silently break a live page
 * on someone else's domain — a 404 nobody decided to create.
 *
 * Two independent signals, either one is enough:
 *   - the status says it is live on their site, or
 *   - their site has actually fetched it at least once (the harder proof).
 */
export function hasLeftForClientSite(article: ClientSiteGuardInput): boolean {
  if (!article.isClientSiteArticle) return false;
  return article.status === ArticleStatus.PUBLISHED_ON_CLIENT_SITE || article.lastFetchedAt !== null;
}

/** One wording for the whole codebase — the admin must read the same sentence
 *  wherever they hit this wall. */
export const CLIENT_SITE_LOCK_MESSAGE =
  "هذا المقال منشور على موقع العميل. حذفه أو أرشفته يكسر صفحة شغّالة عنده — عدّله بدل ما تشيله.";
