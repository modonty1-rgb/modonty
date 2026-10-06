import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";
import { recordArticleShare } from "@/lib/analytics/record-article-share";

// Web door: the rate-limit key is the `modonty_view_sid` cookie. The share logic lives in
// lib/analytics/record-article-share.ts, shared with the mobile API (keyed on X-Device-Id).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { platform } = body;

    const result = await recordArticleShare({
      slug,
      platform,
      sessionId: request.cookies.get("modonty_view_sid")?.value,
      resolveUserId: async () => (await auth())?.user?.id ?? undefined,
      headers: request.headers,
    });

    if (result === "not_found") {
      return NextResponse.json(
        { success: false, error: "Article not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }
    if (result === "rate_limited") {
      return NextResponse.json(
        { success: false, error: "Too many shares" } as ApiResponse<never>,
        { status: 429 }
      );
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
