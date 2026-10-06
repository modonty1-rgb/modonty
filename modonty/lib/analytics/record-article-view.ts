import "server-only";

import { db } from "@/lib/db";
import { incrementCounters } from "@/lib/counters/increment-counters";
import { ArticleStatus } from "@prisma/client";
import { classifyTrafficSource } from "@/lib/analytics/classify-source";
import { getGeoFromHeaders } from "@/lib/analytics/geo-headers";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";

export interface ArticleViewInput {
  /** Decoded slug. */
  slug: string;
  /**
   * The visit's dedupe key, resolved only once the article is known to exist — the web reads
   * (or sets) the `modonty_view_sid` cookie, the app passes its `X-Device-Id`.
   */
  resolveSessionId: () => Promise<string>;
  /** The signed-in reader, if any — resolved at the same point the web route did. */
  resolveUserId: () => Promise<string | undefined>;
  referrer: string | null;
  pageUrl: string | null;
  headers: Headers;
}

export type ArticleViewResult =
  | { found: false }
  | {
      found: true;
      analyticsId: string | null;
      clarity: { client: string | undefined; author: string | undefined };
      ga4?: Record<string, string | undefined>;
    };

/**
 * One article view — the body of `POST /articles/[slug]/api/view`, shared by the web route and
 * the mobile API so there is ONE counting rule: count every genuine entry, suppress only a
 * refresh-in-place (this session's most recent view is the same article).
 */
export async function recordArticleView(input: ArticleViewInput): Promise<ArticleViewResult> {
  const article = await db.article.findFirst({
    where: { slug: input.slug, status: ArticleStatus.PUBLISHED },
    select: {
      id: true,
      clientId: true,
      title: true,
      slug: true,
      client: { select: { slug: true, name: true, industry: { select: { name: true } } } },
      author: { select: { id: true, name: true } },
      category: { select: { slug: true, name: true } },
      tags: { select: { tag: { select: { name: true } } }, take: 1 },
    },
  });

  if (!article) return { found: false };

  const sessionId = await input.resolveSessionId();

  const { referrer, pageUrl } = input;
  const headersList = input.headers;
  const host = headersList.get("host") || null;
  const userAgent = headersList.get("user-agent") || null;
  const forwarded = headersList.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null;

  const { source, referrerDomain, searchEngine } = classifyTrafficSource(referrer, pageUrl, host);
  const { country, region, city } = getGeoFromHeaders(headersList);

  const userId = await input.resolveUserId();

  // Honest views: count every genuine entry; suppress only a refresh-in-place —
  // i.e. the session's most recent view is the SAME article (consecutive
  // duplicate). Returning here after visiting another article counts again.
  const lastView = await db.articleView.findFirst({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    select: { articleId: true },
  });
  // Clarity session tags (plan ج٦) go back on EVERY visit — a refresh is not a new view, but
  // it is still a recording that needs its client and writer.
  const clarity = { client: article.client?.slug, author: article.author?.name ?? undefined };

  if (lastView?.articleId === article.id) {
    return { found: true, analyticsId: null, clarity };
  }

  const [, analytics] = await Promise.all([
    db.articleView.create({
      data: { articleId: article.id, userId, sessionId, referrer, userAgent, ipAddress },
    }),
    db.analytics.create({
      data: {
        articleId: article.id,
        clientId: article.clientId ?? undefined,
        sessionId,
        userId,
        source,
        referrerDomain,
        searchEngine,
        userAgent,
        ipAddress,
        country,
        region,
        city,
      },
    }),
    // Atomic `$inc` outside a transaction — 50 readers opening one article at once made the
    // transactional update abort 49 times on write conflicts (29 Sep 2026). See incrementCounters.
    incrementCounters("articles", article.id, { viewsCount: 1 }),
  ]);

  if (article.clientId) {
    notifyTelegram(article.clientId, "articleView", {
      title: article.title,
      ipAddress,
      headers: headersList,
    }).catch(() => {});
  }

  // GA4 article_view is sent by the CLIENT (browser: ViewTracker → GTM; app: its own SDK), not
  // from here: a server-sent event with no matching client session became a phantom session
  // (see lib/analytics/ga4-browser.ts). The params come from here because only the server
  // has the article's client, author and category.
  const ga4 = {
    article_id: article.id,
    article_slug: article.slug,
    article_title: article.title,
    author_id: article.author?.id,
    author_name: article.author?.name ?? undefined,
    category_slug: article.category?.slug,
    category_name: article.category?.name,
    tag_primary: article.tags[0]?.tag?.name,
    client_id: article.clientId ?? undefined,
    client_slug: article.client?.slug,
    client_name: article.client?.name,
    client_industry: article.client?.industry?.name,
  };

  return { found: true, analyticsId: analytics.id, ga4, clarity };
}
