import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitContactMessage } from "@/app/contact/actions/contact-actions";
import type { ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { name, email, subject, message, clientId } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "جميع الحقول مطلوبة" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني غير صحيح" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Capture metadata
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referrer = request.headers.get("referer") || request.headers.get("referrer") || null;

    const result = await submitContactMessage({
      name,
      email,
      subject,
      message,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      userAgent,
      referrer,
      clientId: typeof clientId === "string" ? clientId : undefined,
      userId: session?.user?.id ?? undefined,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: { message: result.message },
      } as ApiResponse<{ message: string }>);
    }

    return NextResponse.json(
      { success: false, error: result.error || "فشل إرسال الرسالة" } as ApiResponse<never>,
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in contact API:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إرسال الرسالة" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
