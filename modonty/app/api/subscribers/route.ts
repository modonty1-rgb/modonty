import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/types";
import { getOrCreateSessionId } from "@/lib/analytics/conversion-tracking";
import { subscribeToClientNewsletter } from "@/lib/newsletter/subscribe-to-client-newsletter";

/** Web door: the visit cookie names the conversion; the logic lives in `subscribeToClientNewsletter`. */
export async function POST(request: NextRequest) {
  try {
    const result = await subscribeToClientNewsletter({
      body: await request.json(),
      headers: request.headers,
      resolveSessionId: getOrCreateSessionId,
    });

    if (result === "invalid") {
      return NextResponse.json(
        { success: false, error: "Invalid request" } as ApiResponse<never>,
        { status: 400 }
      );
    }
    if (result === "rate_limited") {
      return NextResponse.json(
        { success: false, error: "حاول مرة أخرى لاحقاً" } as ApiResponse<never>,
        { status: 429 }
      );
    }
    return NextResponse.json({
      success: true,
      data: { message: result === "exists" ? "Already subscribed to this client" : "Subscribed successfully" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("Error subscribing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
