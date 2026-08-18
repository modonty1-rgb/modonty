import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";

import { checkRateLimit } from "./check-rate-limit";
import { newConversationId } from "../helpers/new-conversation-id";

import type { ApiResponse } from "@/lib/types";

/**
 * The body every chat route accepts. Routes extend it with their own scope field.
 *
 * There is no `"system"` role on purpose: a client able to append system instructions could
 * override the trusted prompt built on the server and run the assistant on our account.
 */
export const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .min(1)
    .max(20),
  stream: z.boolean().optional().default(true),
  /** Absent on the first turn — the server mints one and returns it. */
  conversationId: z.string().regex(/^[0-9a-f]{24}$/).optional(),
});

export interface ChatTurnContext {
  userId: string;
  messages: { role: "user" | "assistant"; content: string }[];
  lastUserMessage: string;
  conversationId: string;
  turnIndex: number;
  wantStream: boolean;
  /** The parsed body, for the caller to read its own scope field off. */
  body: unknown;
}

/**
 * Everything that must be true before a question costs money: a session, room under the rate
 * limit, a well-formed body, and a non-empty question.
 *
 * Returns a `NextResponse` to send back, or the context to carry on with. Written once because
 * both routes had the same sixty lines, and an order mistake here is expensive — the rate limit
 * must come BEFORE parsing, or a flood of malformed bodies still costs a database read each.
 */
export async function guardChatRequest(
  request: Request
): Promise<{ error: NextResponse } | { ok: ChatTurnContext }> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لاستخدام مدونتي الذكية" } as ApiResponse<never>,
        { status: 401 }
      ),
    };
  }

  const limit = await checkRateLimit(session.user.id, new Date());
  if (!limit.allowed) {
    return {
      error: NextResponse.json(
        { success: false, error: limit.message } as ApiResponse<never>,
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      ),
    };
  }

  const body = await request.json().catch(() => null);
  const parsed = chatBodySchema.safeParse(body);
  if (!parsed.success) {
    return {
      error: NextResponse.json(
        { success: false, error: "Invalid request body" } as ApiResponse<never>,
        { status: 400 }
      ),
    };
  }

  const { messages, stream: wantStream } = parsed.data;
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg?.content?.trim()) {
    return {
      error: NextResponse.json(
        { success: false, error: "Message content is required" } as ApiResponse<never>,
        { status: 400 }
      ),
    };
  }

  return {
    ok: {
      userId: session.user.id,
      messages,
      lastUserMessage: lastUserMsg.content,
      conversationId: parsed.data.conversationId ?? newConversationId(Date.now(), Math.random),
      // The turn number is simply how many turns the client already holds.
      turnIndex: messages.filter((m) => m.role === "user").length - 1,
      wantStream,
      body,
    },
  };
}
