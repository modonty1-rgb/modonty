import "server-only";

import { db } from "@/lib/db";
import { SharePlatform, ArticleStatus } from "@prisma/client";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackArticleShare } from "@/lib/analytics/events-registry";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

const SHARE_RATE_LIMIT = 10;
const SHARE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Arabic labels for the Telegram notification (enum values are English).
const SHARE_PLATFORM_AR: Record<SharePlatform, string> = {
  [SharePlatform.TWITTER]: "إكس (تويتر)",
  [SharePlatform.LINKEDIN]: "لينكدإن",
  [SharePlatform.FACEBOOK]: "فيسبوك",
  [SharePlatform.WHATSAPP]: "واتساب",
  [SharePlatform.EMAIL]: "البريد",
  [SharePlatform.COPY_LINK]: "نسخ الرابط",
  [SharePlatform.PRINT]: "طباعة",
  [SharePlatform.OTHER]: "أخرى",
};

// Map platform string to enum
const PLATFORM_MAP: Record<string, SharePlatform> = {
  TWITTER: SharePlatform.TWITTER,
  LINKEDIN: SharePlatform.LINKEDIN,
  FACEBOOK: SharePlatform.FACEBOOK,
  WHATSAPP: SharePlatform.WHATSAPP,
  EMAIL: SharePlatform.EMAIL,
  COPY_LINK: SharePlatform.COPY_LINK,
  OTHER: SharePlatform.OTHER,
};

export type ArticleShareResult = "not_found" | "rate_limited" | "tracked";

/**
 * One article share — the body of `POST /articles/[slug]/api/share`, shared by the web route
 * (keyed on the `modonty_view_sid` cookie) and the mobile API (keyed on X-Device-Id). Same
 * limit: 10 shares per article per session per hour, counted in the DB.
 */
export async function recordArticleShare(input: {
  slug: string;
  platform: unknown;
  sessionId: string | undefined;
  resolveUserId: () => Promise<string | undefined>;
  headers: Headers;
}): Promise<ArticleShareResult> {
  const { slug, sessionId } = input;

  const article = await db.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
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

  if (!article) return "not_found";

  // Rate limit: max 10 shares per article per session per hour (DB-based)
  if (sessionId) {
    const recentShares = await db.share.count({
      where: {
        articleId: article.id,
        sessionId,
        createdAt: { gt: new Date(Date.now() - SHARE_WINDOW_MS) },
      },
    });
    if (recentShares >= SHARE_RATE_LIMIT) return "rate_limited";
  }

  const sharePlatform = (typeof input.platform === "string" && PLATFORM_MAP[input.platform]) || SharePlatform.OTHER;

  // Track share — include sessionId for rate limiting + analytics, and the reader when signed in.
  const userId = await input.resolveUserId();
  await db.share.create({
    data: {
      articleId: article.id,
      clientId: article.clientId,
      userId: userId ?? undefined,
      platform: sharePlatform,
      sessionId: sessionId ?? undefined,
    },
  });

  if (article.clientId) {
    const ip =
      input.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      input.headers.get("x-real-ip") ||
      input.headers.get("cf-connecting-ip") ||
      null;
    fireClientEvent(article.clientId, { kind: "article_share", articleId: article.id, articleTitle: article.title });
    notifyTelegram(article.clientId, "articleShare", {
      title: article.title,
      meta: { المنصة: SHARE_PLATFORM_AR[sharePlatform] },
      ipAddress: ip,
      headers: input.headers,
    }).catch(() => {});
  }

  void trackArticleShare({
    article_id: article.id,
    article_slug: article.slug,
    article_title: article.title.slice(0, 100),
    author_id: article.author?.id,
    author_name: article.author?.name ?? undefined,
    category_slug: article.category?.slug,
    category_name: article.category?.name,
    tag_primary: article.tags[0]?.tag?.name,
    client_id: article.clientId ?? undefined,
    client_slug: article.client?.slug,
    client_name: article.client?.name,
    client_industry: article.client?.industry?.name,
    share_platform: String(sharePlatform).toLowerCase(),
  });

  return "tracked";
}
