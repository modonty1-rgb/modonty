import "server-only";

import { ArticleStatus, LinkType } from "@prisma/client";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";

export type ArticleLinkClickResult = "invalid" | "not_found" | "recorded";

/**
 * A reader followed a link inside an article body — the body of
 * `POST /articles/api/track/article-link-click` with the visit passed in (web: the
 * `modonty_view_sid` cookie · app: `app:<X-Device-Id>`). Published articles only; the partner
 * gets a Telegram line.
 */
export async function recordArticleLinkClick(input: {
  body: { articleId?: unknown; linkUrl?: unknown; linkText?: unknown; isExternal?: unknown };
  resolveSessionId: () => Promise<string>;
  resolveUserId: () => Promise<string | undefined>;
  headers: Headers;
}): Promise<ArticleLinkClickResult> {
  const { articleId, linkUrl, linkText, isExternal } = input.body;

  if (typeof articleId !== "string" || typeof linkUrl !== "string") return "invalid";

  const article = await db.article.findFirst({
    where: { id: articleId, status: ArticleStatus.PUBLISHED },
    select: { id: true, clientId: true, title: true },
  });
  if (!article) return "not_found";

  const sessionId = await input.resolveSessionId();
  const userId = await input.resolveUserId();

  const linkType = isExternal === true ? LinkType.EXTERNAL : LinkType.INTERNAL;
  let linkDomain: string | undefined;
  try {
    linkDomain = new URL(linkUrl).hostname;
  } catch {
    // A relative or malformed href has no domain — the raw URL is kept below.
    linkDomain = undefined;
  }

  await db.articleLinkClick.create({
    data: {
      articleId: article.id,
      linkUrl,
      linkText: typeof linkText === "string" ? linkText.slice(0, 500) : null,
      linkType,
      isExternal: isExternal === true,
      linkDomain,
      sessionId,
      userId,
    },
  });

  if (article.clientId) {
    const ip =
      input.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      input.headers.get("x-real-ip") ||
      input.headers.get("cf-connecting-ip") ||
      null;
    notifyTelegram(article.clientId, "articleLinkClick", {
      title: article.title,
      meta: {
        الرابط: linkDomain ?? linkUrl,
        النص: typeof linkText === "string" ? linkText.slice(0, 100) : undefined,
      },
      ipAddress: ip,
      headers: input.headers,
    }).catch((e: unknown) => console.error("[recordArticleLinkClick] telegram", e));
  }

  return "recorded";
}
