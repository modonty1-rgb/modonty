import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { SharePlatform } from "@prisma/client";
import type { ApiResponse } from "@/lib/types";
import { notifyTelegram } from "@/lib/telegram/notify";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

const PLATFORM_MAP: Record<string, SharePlatform> = {
  TWITTER: SharePlatform.TWITTER,
  LINKEDIN: SharePlatform.LINKEDIN,
  FACEBOOK: SharePlatform.FACEBOOK,
  WHATSAPP: SharePlatform.WHATSAPP,
  EMAIL: SharePlatform.EMAIL,
  COPY_LINK: SharePlatform.COPY_LINK,
  OTHER: SharePlatform.OTHER,
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const platform = typeof body?.platform === "string" ? body.platform : undefined;

    if (!platform) {
      return NextResponse.json(
        { success: false, error: "Missing platform" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const client = await db.client.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get(VIEW_SESSION_COOKIE)?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set(VIEW_SESSION_COOKIE, sessionId, {
        maxAge: SESSION_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    const sharePlatform = PLATFORM_MAP[platform] ?? SharePlatform.OTHER;

    await db.share.create({
      data: {
        clientId: client.id,
        platform: sharePlatform,
        sessionId,
      },
    });

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      null;
    notifyTelegram(client.id, "clientShare", {
      meta: { المنصة: sharePlatform },
      ipAddress: ip,
      headers: request.headers,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: { message: "Share tracked" },
    } as ApiResponse<{ message: string }>);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to track share" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
