import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { publishFaqAnswer } from "@/lib/faq/publish-faq-answer";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

/** Mirrors the character counter the reply screen shows — the client must not be able to
 *  type past a limit the server would then reject silently. */
const ANSWER_MAX_LENGTH = 1000;
const input = z.object({ answer: z.string().trim().min(1).max(ANSWER_MAX_LENGTH) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ faqId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const parsed = await readBody(request, input);
  if ("response" in parsed) return parsed.response;
  const { faqId } = await params;
  const question = await db.articleFAQ.findFirst({
    where: { id: faqId, article: { clientId: session.clientId }, OR: [{ source: "user" }, { source: "chatbot" }] },
    select: { id: true },
  });
  if (!question) return fail("NOT_FOUND", "السؤال غير موجود.");
  const result = await publishFaqAnswer(question.id, session.clientId, parsed.value.answer);
  if (!result.success) return fail("INTERNAL_ERROR", result.error);
  return ok({ question: { id: question.id, status: "PUBLISHED" } });
}
