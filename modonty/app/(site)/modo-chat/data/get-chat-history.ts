import "server-only";

import { db } from "@/lib/db";

/**
 * One reader's past Modo turns, newest first, cursor-paged by row id — the read behind
 * `GET /modo-chat/api/history`, shared with the mobile API. `scopeLabel` names the article,
 * industry or category the turn was asked in.
 */
export async function getChatHistory(userId: string, limit: number, cursorId: string | null) {
  const cursor = cursorId ? { id: cursorId } : undefined;

  const messages = await db.chatbotMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor, skip: 1 }),
    select: {
      id: true,
      conversationId: true,
      userQuery: true,
      assistantResponse: true,
      scopeType: true,
      articleSlug: true,
      categorySlug: true,
      industrySlug: true,
      outcome: true,
      source: true,
      webSources: true,
      createdAt: true,
    },
  });

  const hasMore = messages.length > limit;
  const items = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  const articleSlugs = [...new Set(items.map((m) => m.articleSlug).filter(Boolean))] as string[];
  const categorySlugs = [...new Set(items.map((m) => m.categorySlug).filter(Boolean))] as string[];
  const industrySlugs = [...new Set(items.map((m) => m.industrySlug).filter(Boolean))] as string[];

  const [articles, categories, industries] = await Promise.all([
    articleSlugs.length > 0
      ? db.article.findMany({
          where: { slug: { in: articleSlugs } },
          select: { slug: true, title: true },
        })
      : [],
    categorySlugs.length > 0
      ? db.category.findMany({
          where: { slug: { in: categorySlugs } },
          select: { slug: true, name: true },
        })
      : [],
    industrySlugs.length > 0
      ? db.industry.findMany({
          where: { slug: { in: industrySlugs } },
          select: { slug: true, name: true },
        })
      : [],
  ]);

  const articleMap = new Map(articles.map((a) => [a.slug, a.title]));
  const categoryMap = new Map(categories.map((c) => [c.slug, c.name]));
  const industryMap = new Map(industries.map((i) => [i.slug, i.name]));

  const result = items.map((m) => ({
    id: m.id,
    // Lets the history row hand the chat tab a thread to reopen.
    conversationId: m.conversationId,
    userQuery: m.userQuery,
    assistantResponse: m.assistantResponse,
    scopeType: m.scopeType,
    scopeLabel:
      m.scopeType === "article" && m.articleSlug
        ? articleMap.get(m.articleSlug) ?? m.articleSlug
        : m.scopeType === "industry" && m.industrySlug
          ? industryMap.get(m.industrySlug) ?? m.industrySlug
          : m.scopeType === "category" && m.categorySlug
            ? categoryMap.get(m.categorySlug) ?? m.categorySlug
            : null,
    articleSlug: m.articleSlug,
    categorySlug: m.categorySlug,
    industrySlug: m.industrySlug,
    outcome: m.outcome,
    source: m.source,
    webSources: Array.isArray(m.webSources) ? m.webSources : undefined,
    createdAt: m.createdAt.toISOString(),
  }));

  return { messages: result, nextCursor };
}
