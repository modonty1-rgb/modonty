import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SharePlatform } from "@prisma/client";
import type { ApiResponse } from "@/lib/types";
import { notifyTelegram } from "@/lib/telegram/notify";

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
      select: { id: true, clientId: true },
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
