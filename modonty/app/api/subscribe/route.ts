import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ApiResponse } from "../helpers/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني غير صحيح" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // TODO: Implement newsletter subscription with proper client association
    // For now, we'll just return success without database save
    // The Subscriber model requires a clientId, so we need to either:
    // 1. Create a default "platform" client for general subscriptions
    // 2. Require client context in the subscription
    // 3. Use a different model for platform-wide subscriptions
    
    // Simulating subscription success
    // In production, this should integrate with an email service or CRM

    return NextResponse.json({
      success: true,
      data: { message: "تم الاشتراك بنجاح" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("Error subscribing:", error);
    return NextResponse.json(
      { success: false, error: "فشل الاشتراك" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
