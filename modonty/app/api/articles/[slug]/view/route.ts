import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { ArticleStatus, TrafficSource } from "@prisma/client";
import { notifyTelegram } from "@/lib/telegram/notify";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

function getSourceAndReferrerDomain(
  referrer: string | null,
  host: string | null
): { source: TrafficSource; referrerDomain: string | null; searchEngine: string | null } {
  if (!referrer || !referrer.startsWith("http")) {
    return { source: TrafficSource.DIRECT, referrerDomain: null, searchEngine: null };
  }
  try {
    const refUrl = new URL(referrer);
    const refHost = refUrl.hostname.toLowerCase();
    if (host && refHost === host.toLowerCase()) {
      return { source: TrafficSource.ORGANIC, referrerDomain: refHost, searchEngine: null };
    }
    const searchEngines: Record<string, string> = {
      "www.google.com": "Google",
      "google.com": "Google",
      "www.bing.com": "Bing",
      "bing.com": "Bing",
      "duckduckgo.com": "DuckDuckGo",
    };
    const searchEngine = searchEngines[refHost] ?? null;
    if (searchEngine) {
      return { source: TrafficSource.ORGANIC, referrerDomain: refHost, searchEngine };
    }
    return { source: TrafficSource.REFERRAL, referrerDomain: refHost, searchEngine: null };
  } catch {
    return { source: TrafficSource.DIRECT, referrerDomain: null, searchEngine: null };
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const article = await db.article.findFirst({
      where: { slug: decodedSlug, status: ArticleStatus.PUBLISHED },
      select: { id: true, clientId: true, title: true },
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

    const headersList = await headers();
    const referrer = headersList.get("referer") || headersList.get("referrer") || null;
    const host = headersList.get("host") || null;
    const userAgent = headersList.get("user-agent") || null;
    const forwarded = headersList.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || null;

    const { source, referrerDomain, searchEngine } = getSourceAndReferrerDomain(referrer, host);

    const session = await auth();
    const userId = session?.user?.id ?? undefined;

    // Deduplicate: one view per (articleId, sessionId) per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alreadyViewed = await db.articleView.findFirst({
      where: { articleId: article.id, sessionId, createdAt: { gte: today } },
      select: { id: true },
    });
    if (alreadyViewed) {
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

    return NextResponse.json({ ok: true, analyticsId: analytics.id });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
