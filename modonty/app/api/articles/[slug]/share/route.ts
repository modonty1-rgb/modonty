import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SharePlatform } from "@prisma/client";
import type { ApiResponse } from "@/lib/types";
import { notifyTelegram } from "@/lib/telegram/notify";
import { trackArticleShare } from "@/lib/analytics/events-registry";

const SHARE_RATE_LIMIT = 10;
const SHARE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { platform } = body;

    const article = await db.article.findFirst({
      where: { slug },
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
      return NextResponse.json(
        { success: false, error: "Article not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    // Rate limit: max 10 shares per article per session per hour (DB-based)
    const sessionId = request.cookies.get("modonty_view_sid")?.value;
    if (sessionId) {
      const recentShares = await db.share.count({
        where: {
          articleId: article.id,
          sessionId,
          createdAt: { gt: new Date(Date.now() - SHARE_WINDOW_MS) },
        },
      });
      if (recentShares >= SHARE_RATE_LIMIT) {
        return NextResponse.json(
          { success: false, error: "Too many shares" } as ApiResponse<never>,
          { status: 429 }
        );
      }
    }

    // Map platform string to enum
    const platformMap: Record<string, SharePlatform> = {
      TWITTER: SharePlatform.TWITTER,
      LINKEDIN: SharePlatform.LINKEDIN,
      FACEBOOK: SharePlatform.FACEBOOK,
      WHATSAPP: SharePlatform.WHATSAPP,
      EMAIL: SharePlatform.EMAIL,
      COPY_LINK: SharePlatform.COPY_LINK,
      OTHER: SharePlatform.OTHER,
    };

    const sharePlatform = platformMap[platform] || SharePlatform.OTHER;

    // Track share — include sessionId for rate limiting + analytics
    await db.share.create({
      data: {
        articleId: article.id,
        clientId: article.clientId,
        platform: sharePlatform,
        sessionId: sessionId ?? undefined,
      },
    });

    if (article.clientId) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        request.headers.get("cf-connecting-ip") ||
        null;
      notifyTelegram(article.clientId, "articleShare", {
        title: slug,
        meta: { المنصة: sharePlatform },
        ipAddress: ip,
        headers: request.headers,
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

    return NextResponse.json({
      success: true,
      data: { message: "Share tracked" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("Error tracking share:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track share" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
