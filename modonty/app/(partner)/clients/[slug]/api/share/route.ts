import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import type { ApiResponse } from "@/lib/types";
import { recordClientShare } from "@/lib/analytics/record-client-share";

const VIEW_SESSION_COOKIE = "modonty_view_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

/** Web door: the visit cookie names the session; the share logic lives in `recordClientShare`. */
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

    const result = await recordClientShare({
      slug,
      platform,
      sessionId,
      resolveUserId: async () => (await auth())?.user?.id ?? undefined,
      headers: request.headers,
    });

    if (result === "not_found") {
      return NextResponse.json(
        { success: false, error: "Client not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Share tracked" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("[clients/api/share]", error);
    return NextResponse.json(
      { success: false, error: "Failed to track share" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
