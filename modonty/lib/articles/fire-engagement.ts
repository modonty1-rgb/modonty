import { after } from "next/server";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import {
  trackArticleLike,
  trackArticleDislike,
  trackArticleFavorite,
} from "@/lib/analytics/events-registry";

import type { TelegramEventKey } from "@/lib/telegram/telegram-events";

type ArticleGA4EventName = "article_like" | "article_dislike" | "article_favorite";

export function fireEngagement(
  articleId: string,
  telegramKey: TelegramEventKey,
  ga4EventName: ArticleGA4EventName,
  actor: { id?: string; name: string | null },
): void {
  // Wrap the entire DB lookup + dispatch chain in after() so Vercel keeps the
  // lambda alive past the response. Without after() the .then() callback runs
  // after the request closes and sendGA4Event never gets registered.
  after(async () => {
    try {
      const art = await db.article.findUnique({
        where: { id: articleId },
        select: {
          clientId: true,
          title: true,
          slug: true,
          client: { select: { slug: true, name: true, industry: { select: { name: true } } } },
          author: { select: { id: true, name: true } },
          category: { select: { slug: true, name: true } },
          tags: { select: { tag: { select: { name: true } } }, take: 1 },
        },
      });
      if (!art) return;
      if (art.clientId) {
        notifyTelegram(art.clientId, telegramKey, {
          title: art.title,
          meta: actor.name ? { الزائر: actor.name } : undefined,
        }).catch(() => {});
      }
      const params = {
        article_id: articleId,
        article_slug: art.slug,
        article_title: art.title.slice(0, 100),
        author_id: art.author?.id,
        author_name: art.author?.name ?? undefined,
        category_slug: art.category?.slug,
        category_name: art.category?.name,
        tag_primary: art.tags[0]?.tag?.name,
        client_id: art.clientId ?? undefined,
        client_slug: art.client?.slug,
        client_name: art.client?.name,
        client_industry: art.client?.industry?.name,
      };
      const options = actor.id ? { userId: actor.id } : undefined;
      if (ga4EventName === "article_like") await trackArticleLike(params, options);
      else if (ga4EventName === "article_dislike") await trackArticleDislike(params, options);
      else await trackArticleFavorite(params, options);
    } catch {}
  });
}
