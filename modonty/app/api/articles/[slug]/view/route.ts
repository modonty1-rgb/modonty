import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { ArticleStatus } from "@prisma/client";
import { classifyTrafficSource } from "@/lib/analytics/classify-source";
import { getGeoFromHeaders } from "@/lib/analytics/geo-headers";
import { notifyTelegram } from "@/lib/telegram/notify";
import { trackArticleView } from "@/lib/analytics/events-registry";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const article = await db.article.findFirst({
      where: { slug: decodedSlug, status: ArticleStatus.PUBLISHED },
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

    if (!article) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
    if (!sessionId) {
      sessionId = `view-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      cookieStore.set(VIEW_SESSION_COOKIE, sessionId, {
        maxAge: SESSION_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    // The truth comes from the browser: document.referrer (external source) +
    // location.href (UTM params). The request's own Referer header is always
    // our page URL — relying on it misclassified every view as ORGANIC (pre-2026-07-07).
    const body = (await request.json().catch(() => null)) as {
      referrer?: string | null;
      url?: string | null;
    } | null;
    const referrer = body?.referrer?.trim() || null;
    const pageUrl = body?.url?.trim() || null;

    const headersList = await headers();
    const host = headersList.get("host") || null;
    const userAgent = headersList.get("user-agent") || null;
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null;

    const { source, referrerDomain, searchEngine } = classifyTrafficSource(referrer, pageUrl, host);
    const { country, region, city } = getGeoFromHeaders(headersList);

    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    // Honest views: count every genuine entry; suppress only a refresh-in-place —
    // i.e. the session's most recent view is the SAME article (consecutive
    // duplicate). Returning here after visiting another article counts again.
    const lastView = await db.articleView.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: { articleId: true },
    });
    if (lastView?.articleId === article.id) {
      return NextResponse.json({ ok: true, analyticsId: null });
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
      db.article.update({
        where: { id: article.id },
        data: { viewsCount: { increment: 1 } },
        select: { id: true },
      }),
    ]);

    if (article.clientId) {
      notifyTelegram(article.clientId, "articleView", {
        title: article.title,
        ipAddress,
        headers: headersList,
      }).catch(() => {});
    }

    void trackArticleView(
      {
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
      },
      { userId },
    );

    return NextResponse.json({ ok: true, analyticsId: analytics.id });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
