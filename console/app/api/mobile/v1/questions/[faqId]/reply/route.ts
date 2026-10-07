import type { NextRequest } from "next/server";
import { ArticleFAQStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { publishFaqAnswer } from "@/lib/faq/publish-faq-answer";
import { updateClientPageFaqForClient } from "@/lib/page-faq/update-client-page-faq";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "../../../helpers/request";

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
  const malformed = rejectMalformedIds([faqId], "السؤال غير موجود.");
  if (malformed) return malformed;
  const question = await db.articleFAQ.findFirst({
    where: { id: faqId, article: { clientId: session.clientId }, OR: [{ source: "user" }, { source: "chatbot" }] },
    select: { id: true, status: true },
  });
  if (!question) {
    // سؤال على صفحة العميل — نفس قاعدة صفحة «أسئلة صفحتي» على الويب: الردّ ينشره.
    const page = await db.clientFAQ.findFirst({ where: { id: faqId, clientId: session.clientId, source: "user" }, select: { id: true, status: true } });
    if (!page) return fail("NOT_FOUND", "السؤال غير موجود.");
    if (page.status !== ArticleFAQStatus.PENDING) return fail("CONFLICT", "هذا السؤال اتردّ عليه أو انرفض من قبل. حدّث الصفحة.");
    const saved = await updateClientPageFaqForClient(session.clientId, page.id, { status: ArticleFAQStatus.PUBLISHED, answer: parsed.value.answer });
    if (!saved.success) return fail("INTERNAL_ERROR", saved.error);
    return ok({ question: { id: page.id, status: "PUBLISHED" } });
  }
  // شاشة قديمة مفتوحة كانت تكتب فوق ردّ منشور: الردّ للسؤال المنتظر وحده.
  if (question.status !== ArticleFAQStatus.PENDING) return fail("CONFLICT", "هذا السؤال اتردّ عليه أو انرفض من قبل. حدّث الصفحة.");
  const result = await publishFaqAnswer(question.id, session.clientId, parsed.value.answer);
  if (!result.success) return fail("INTERNAL_ERROR", result.error);
  return ok({ question: { id: question.id, status: "PUBLISHED" } });
}
