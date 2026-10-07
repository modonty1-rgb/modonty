import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";
import { getChatHistory } from "@/app/(site)/modo-chat/data/get-chat-history";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/** Web door: identity from the session cookie; the read lives in `getChatHistory`. */
export async function GET(request: NextRequest) {
  await connection();
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const cursorParam = searchParams.get("cursor");

    const { messages, nextCursor } = await getChatHistory(
      session.user.id,
      limit,
      cursorParam && cursorParam.trim() ? cursorParam : null
    );

    return NextResponse.json({
      success: true,
      messages,
      nextCursor,
    });
  } catch (error) {
    console.error("Chatbot history API error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ. حاول مرة أخرى." } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
