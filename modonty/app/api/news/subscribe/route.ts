import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني غير صحيح" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const existing = await db.newsSubscriber.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: { message: "تم الاشتراك مسبقاً" },
      } as ApiResponse<{ message: string }>);
    }

    await db.newsSubscriber.create({
      data: {
        email: email.trim().toLowerCase(),
        subscribed: true,
        subscribedAt: new Date(),
        consentGiven: true,
        consentDate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: "تم الاشتراك بنجاح" },
    } as ApiResponse<{ message: string }>);
  } catch (error) {
    console.error("[news/subscribe] Error:", error);
    return NextResponse.json(
      { success: false, error: "فشل الاشتراك" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
