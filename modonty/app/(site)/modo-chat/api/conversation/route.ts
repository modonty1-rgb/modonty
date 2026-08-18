import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import type { ApiResponse } from "@/lib/types";

/**
 * Returns the turns of ONE conversation, oldest first, so a reload can rebuild the transcript.
 * Before this existed the only copy lived in React state and died with the tab.
 *
 * Without `id`, returns the visitor's most recent conversation if it is still inside the window —
 * that is what makes "refresh and carry on" work without asking the user to pick anything.
 */
const RESUME_WINDOW_DAYS = 14;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const requestedId = request.nextUrl.searchParams.get("id");
    if (requestedId && !/^[0-9a-f]{24}$/.test(requestedId)) {
      return NextResponse.json(
        { success: false, error: "معرّف محادثة غير صالح" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const since = new Date(Date.now() - RESUME_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    let conversationId = requestedId;
    if (!conversationId) {
      const latest = await db.chatbotMessage.findFirst({
        where: {
          userId: session.user.id,
          conversationId: { not: null },
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
        select: { conversationId: true },
      });
      conversationId = latest?.conversationId ?? null;
    }

    if (!conversationId) {
      return NextResponse.json({ conversationId: null, turns: [] });
    }

    const turns = await db.chatbotMessage.findMany({
      // Scoped by userId as well as conversationId — an id in the URL must never expose
      // somebody else's conversation.
      where: { userId: session.user.id, conversationId },
      orderBy: [{ turnIndex: "asc" }, { createdAt: "asc" }],
      take: 40,
      select: {
        id: true,
        userQuery: true,
        assistantResponse: true,
        outcome: true,
        source: true,
        webSources: true,
        redirectArticles: true,
        scopeType: true,
        categorySlug: true,
        articleSlug: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ conversationId, turns });
  } catch (error) {
    console.error("[modo-chat/api/conversation]", error);
    return NextResponse.json(
      { success: false, error: "تعذّر جلب المحادثة" } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
