import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

import { ARTICLE_PAYLOAD_SELECT, toArticlePayload, type ArticleRow } from "../../../_lib/article-payload";
import { checkRateLimit, jsonError, jsonWithEtag } from "../../../_lib/respond";
import { resolveSite } from "../../../_lib/resolve-site";

/**
 * GET /api/v1/sites/{siteId}/articles — every article this site publishes on its own domain.
 *
 * Read only. The id in the path is the ONLY thing that decides whose articles come back,
 * and it is used inside the query rather than checked after it, so there is no branch
 * where another client's row could be returned. The status filter is the second wall: an
 * article that is not PUBLISHED_ON_CLIENT_SITE has no page on their domain yet, and
 * shipping it would put a draft on a live site.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  const resolved = await resolveSite(siteId);
  if (!resolved.ok) return jsonError(resolved.status, resolved.error);

  const limit = checkRateLimit(resolved.site.id);
  if (!limit.ok) {
    return jsonError(429, "Too many requests", { "Retry-After": String(limit.retryAfter) });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");
  const sinceDate = since ? new Date(since) : null;
  const validSince = sinceDate && !Number.isNaN(sinceDate.getTime()) ? sinceDate : null;

  const rows = (await db.article.findMany({
    where: {
      clientId: resolved.site.id,
      isClientSiteArticle: true,
      status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
      ...(validSince ? { updatedAt: { gt: validSince } } : {}),
    },
    select: ARTICLE_PAYLOAD_SELECT,
    orderBy: { updatedAt: "desc" },
    take: 200,
  })) as unknown as ArticleRow[];

  const articles = rows.map(toArticlePayload);

  return jsonWithEtag(request, {
    client: { name: resolved.site.name, articlesBaseUrl: resolved.site.articlesBaseUrl },
    count: articles.length,
    articles,
  });
}
