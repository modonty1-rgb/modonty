import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

import { ARTICLE_PAYLOAD_SELECT, toArticlePayload, type ArticleRow } from "../../../../_lib/article-payload";
import { checkRateLimit, jsonError, jsonWithEtag } from "../../../../_lib/respond";
import { resolveSite } from "../../../../_lib/resolve-site";

/**
 * GET /api/v1/sites/{siteId}/articles/{slug} — one article, and only if it is this site's.
 *
 * The slug is scoped by the site id in the same query, not checked after the fetch: a
 * wrong slug and another site's slug are the same 404, and there is no path through this
 * handler that can hand back a row belonging to a different client.
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string; slug: string }> },
) {
  const { siteId, slug } = await params;

  const resolved = await resolveSite(siteId);
  if (!resolved.ok) return jsonError(resolved.status, resolved.error);

  const limit = checkRateLimit(resolved.site.id);
  if (!limit.ok) {
    return jsonError(429, "Too many requests", { "Retry-After": String(limit.retryAfter) });
  }

  const row = (await db.article.findFirst({
    where: {
      slug,
      clientId: resolved.site.id,
      isClientSiteArticle: true,
      status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
    },
    select: ARTICLE_PAYLOAD_SELECT,
  })) as unknown as ArticleRow | null;

  if (!row) return jsonError(404, "Article not found");

  return jsonWithEtag(request, { article: toArticlePayload(row) });
}
