import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

import { authenticateClient } from "../_lib/authenticate-client";
import { ARTICLE_PAYLOAD_SELECT, toArticlePayload, type ArticleRow } from "../_lib/article-payload";
import { checkRateLimit, jsonError, jsonWithEtag } from "../_lib/respond";

/**
 * GET /api/v1/articles — every article this key's owner publishes on their own website.
 *
 * Read only. The key decides whose articles come back, so there is no client id to pass
 * and none to tamper with. The status filter is the second wall: an article that is not
 * PUBLISHED_ON_CLIENT_SITE has no page on their domain yet, and shipping it would put a
 * draft on a live site.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateClient(request);
  if (!auth.ok) return jsonError(auth.status, auth.error);

  const limit = checkRateLimit(auth.client.id);
  if (!limit.ok) {
    return jsonError(429, "Too many requests", { "Retry-After": String(limit.retryAfter) });
  }

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");
  const sinceDate = since ? new Date(since) : null;
  const validSince = sinceDate && !Number.isNaN(sinceDate.getTime()) ? sinceDate : null;

  const rows = (await db.article.findMany({
    where: {
      clientId: auth.client.id,
      isClientSiteArticle: true,
      status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
      ...(validSince ? { updatedAt: { gt: validSince } } : {}),
    },
    select: ARTICLE_PAYLOAD_SELECT,
    orderBy: { updatedAt: "desc" },
    take: 200,
  })) as unknown as ArticleRow[];

  // Their site pulled — stamp it so a link that silently broke is visible to us.
  const articles = rows.map(toArticlePayload);

  return jsonWithEtag(request, {
    client: { name: auth.client.name, articlesBaseUrl: auth.client.articlesBaseUrl },
    count: articles.length,
    articles,
  });
}
