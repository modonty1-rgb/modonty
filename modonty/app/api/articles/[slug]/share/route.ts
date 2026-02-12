import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SharePlatform } from "@prisma/client";
import type { ApiResponse } from "@/lib/types";

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

    // Track share
    await db.share.create({
      data: {
        articleId: article.id,
        clientId: article.clientId,
        platform: sharePlatform,
      },
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
