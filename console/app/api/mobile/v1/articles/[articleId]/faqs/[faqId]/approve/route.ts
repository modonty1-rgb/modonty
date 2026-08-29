import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { publishFaqAnswer } from "@/lib/faq/publish-faq-answer";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function POST(request: NextRequest, { params }: { params: Promise<{ articleId: string; faqId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { articleId, faqId } = await params;
  const faq = await db.articleFAQ.findFirst({
    where: { id: faqId, articleId, article: { clientId: session.clientId }, OR: [{ source: "manual" }, { source: null }, { source: { isSet: false } }] },
    select: { id: true, answer: true },
  });
  if (!faq) return fail("NOT_FOUND", "سؤال فريق المحتوى غير موجود.");
  if (!faq.answer?.trim()) return fail("CONFLICT", "لا يمكن اعتماد سؤال بلا إجابة.");
  const result = await publishFaqAnswer(faq.id, session.clientId, faq.answer);
  if (!result.success) return fail("INTERNAL_ERROR", result.error);
  return ok({ faq: { id: faq.id, status: "PUBLISHED" } });
}
