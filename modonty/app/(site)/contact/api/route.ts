import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { submitContactMessage } from "../actions/contact-actions";
import type { ApiResponse } from "@/lib/types";

const CONTACT_RATE_LIMIT = 3;
const CONTACT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const [session, body] = await Promise.all([auth(), request.json()]);
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

    /**
     * The identity the hourly cap is counted against, so the sender must not be able to choose
     * it. `x-forwarded-for` is a list: whatever the sender put in it stays at the FRONT and each
     * proxy appends the address it accepted the connection from, so only the LAST entry was
     * written by infrastructure we run. Reading the whole header — as this did — handed the
     * sender a fresh key on every request: `9.9.9.9, <real ip>` then `9.9.9.10, <real ip>` are
     * two different strings, the count is always 0, and the cap never bites.
     * On Vercel the platform overwrites this header and refuses to forward an external one
     * (vercel.com/docs/headers/request-headers), so today the list holds one true address; the
     * tail keeps that true the moment anything is put in front of it.
     */
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",") ?? [];
    const ipAddress = forwardedFor[forwardedFor.length - 1]?.trim() || "unknown";

    // Rate limit: max 3 messages per IP per hour (DB-based, works across instances)
    const recentCount = await db.contactMessage.count({
      where: {
        ipAddress,
        createdAt: { gt: new Date(Date.now() - CONTACT_WINDOW_MS) },
      },
    });
    if (recentCount >= CONTACT_RATE_LIMIT) {
      return NextResponse.json(
        { success: false, error: "لقد تجاوزت الحد المسموح به. يرجى المحاولة بعد ساعة." } as ApiResponse<never>,
        { status: 429 }
      );
    }
    const userAgent = request.headers.get("user-agent") || "unknown";
    const referrer = request.headers.get("referer") || request.headers.get("referrer") || null;

    const result = await submitContactMessage({
      name,
      email,
      subject,
      message,
      ipAddress,
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
