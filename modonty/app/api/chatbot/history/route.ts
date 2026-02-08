import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/app/api/helpers/types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const cursorParam = searchParams.get("cursor");
    const cursor = cursorParam && cursorParam.trim() ? { id: cursorParam } : undefined;

    const messages = await db.chatbotMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor && { cursor, skip: 1 }),
      select: {
        id: true,
        userQuery: true,
        assistantResponse: true,
        scopeType: true,
        articleSlug: true,
        categorySlug: true,
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

    const [articles, categories] = await Promise.all([
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
    ]);

    const articleMap = new Map(articles.map((a) => [a.slug, a.title]));
    const categoryMap = new Map(categories.map((c) => [c.slug, c.name]));

    const result = items.map((m) => ({
      id: m.id,
      userQuery: m.userQuery,
      assistantResponse: m.assistantResponse,
      scopeType: m.scopeType,
      scopeLabel:
        m.scopeType === "article" && m.articleSlug
          ? articleMap.get(m.articleSlug) ?? m.articleSlug
          : m.scopeType === "category" && m.categorySlug
            ? categoryMap.get(m.categorySlug) ?? m.categorySlug
            : null,
      articleSlug: m.articleSlug,
      categorySlug: m.categorySlug,
      outcome: m.outcome,
      source: m.source,
      webSources: Array.isArray(m.webSources) ? m.webSources : undefined,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      messages: result,
      nextCursor,
    });
  } catch (error) {
    console.error("Chatbot history API error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ. حاول مرة أخرى." } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
