import { NextRequest, NextResponse } from "next/server";

import { guardChatRequest } from "@/app/(site)/modo-chat/data/guard-chat-request";
import { answerChatTurn } from "@/app/(site)/modo-chat/data/answer-chat-turn";

import type { ApiResponse } from "@/lib/types";

// Worst path is several upstream calls before the first token; the default limit cuts the stream.
export const maxDuration = 60;

/** Web door: the guard reads the session cookie (and the anonymous trial); the answer lives in `answerChatTurn`. */
export async function POST(request: NextRequest) {
  try {
    const guarded = await guardChatRequest(request);
    if ("error" in guarded) return guarded.error;
    return await answerChatTurn(guarded.ok);
  } catch (error) {
    console.error("[modo-chat/api/chat]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ. حاول مرة أخرى." } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
