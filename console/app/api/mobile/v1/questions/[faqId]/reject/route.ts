import type { NextRequest } from "next/server";
import { ArticleFAQStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function POST(request: NextRequest, { params }: { params: Promise<{ faqId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { faqId } = await params;
  const question = await db.articleFAQ.findFirst({
    where: { id: faqId, article: { clientId: session.clientId }, OR: [{ source: "user" }, { source: "chatbot" }] },
    select: { id: true },
  });
  if (!question) return fail("NOT_FOUND", "السؤال غير موجود.");
  await db.articleFAQ.update({ where: { id: question.id }, data: { status: ArticleFAQStatus.REJECTED } });
  return ok({ question: { id: question.id, status: "REJECTED" } });
}
