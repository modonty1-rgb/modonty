import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateSessionId } from "@/lib/analytics/conversion-tracking";
import { acceptContactMessage } from "@/lib/contact/accept-contact-message";
import type { ApiResponse } from "@/lib/types";

/** Web door: identity from the session cookie; validation, cap and save live in `acceptContactMessage`. */
export async function POST(request: NextRequest) {
  try {
    const [session, body] = await Promise.all([auth(), request.json()]);

    const result = await acceptContactMessage({
      body: body && typeof body === "object" ? (body as Record<string, unknown>) : {},
      headers: request.headers,
      userId: session?.user?.id ?? null,
      resolveSessionId: getOrCreateSessionId,
    });

    if (result.kind === "invalid") {
      return NextResponse.json({ success: false, error: result.error } as ApiResponse<never>, { status: 400 });
    }
    if (result.kind === "rate_limited") {
      return NextResponse.json({ success: false, error: result.error } as ApiResponse<never>, { status: 429 });
    }
    if (result.kind === "sent") {
      return NextResponse.json({
        success: true,
        data: { message: result.message },
      } as ApiResponse<{ message: string }>);
    }
    return NextResponse.json({ success: false, error: result.error } as ApiResponse<never>, { status: 500 });
  } catch (error) {
    console.error("Error in contact API:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إرسال الرسالة" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
