import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/types";
import { getOrCreateSessionId } from "@/lib/analytics/conversion-tracking";
import { subscribeToNewsletter } from "@/lib/newsletter/subscribe-to-newsletter";
import { isSubscribeRateLimited } from "./is-subscribe-rate-limited";

/** Web door: the visit cookie names the conversion; the logic lives in `subscribeToNewsletter`. */
export async function POST(request: NextRequest) {
  try {
    /**
     * The signup bucket. Vercel overwrites `x-forwarded-for` with the address it actually
     * accepted the connection from and refuses to forward an external one
     * (vercel.com/docs/headers/request-headers), so the caller cannot pick their own bucket.
     * The LAST entry is read, not the first: a forged list is prepended by the sender and
     * appended to by each proxy, so only the tail was written by infrastructure we run.
     */
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",") ?? [];
    const clientIp = forwardedFor[forwardedFor.length - 1]?.trim() || "unknown";
    if (isSubscribeRateLimited(clientIp, Date.now())) {
      return NextResponse.json(
        { success: false, error: "محاولات كثيرة. جرّب بعد شوي." } as ApiResponse<never>,
        { status: 429 }
      );
    }

    const result = await subscribeToNewsletter({
      body: await request.json().catch(() => null),
      resolveSessionId: getOrCreateSessionId,
    });

    if (result === "invalid") {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني غير صحيح" } as ApiResponse<never>,
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { message: result === "exists" ? "تم الاشتراك مسبقاً" : "تم الاشتراك بنجاح" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("[news/subscribe] Error:", error);
    return NextResponse.json(
      { success: false, error: "فشل الاشتراك" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
