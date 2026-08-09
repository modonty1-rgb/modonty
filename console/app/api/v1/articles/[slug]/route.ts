import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

import { authenticateClient } from "../../_lib/authenticate-client";
import { ARTICLE_PAYLOAD_SELECT, toArticlePayload, type ArticleRow } from "../../_lib/article-payload";
import { checkRateLimit, jsonError, jsonWithEtag } from "../../_lib/respond";

/**
 * GET /api/v1/articles/{slug} — one article, and only if it belongs to this key.
 *
 * The slug is scoped by the key's client in the same query, not checked after the fetch:
 * a wrong slug and someone else's slug are the same 404, and there is no branch where a
 * row from another client could be returned.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await authenticateClient(request);
  if (!auth.ok) return jsonError(auth.status, auth.error);

  const limit = checkRateLimit(auth.client.id);
  if (!limit.ok) {
    return jsonError(429, "Too many requests", { "Retry-After": String(limit.retryAfter) });
  }

  const { slug } = await params;

  const row = (await db.article.findFirst({
    where: {
      slug,
      clientId: auth.client.id,
      isClientSiteArticle: true,
      status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
    },
    select: ARTICLE_PAYLOAD_SELECT,
  })) as unknown as ArticleRow | null;

  if (!row) return jsonError(404, "Article not found");

  return jsonWithEtag(request, { article: toArticlePayload(row) });
}
