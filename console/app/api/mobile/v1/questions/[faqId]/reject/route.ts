import type { NextRequest } from "next/server";
import { ArticleFAQStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";

export async function POST(request: NextRequest, { params }: { params: Promise<{ faqId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { faqId } = await params;
  const malformed = rejectMalformedIds([faqId], "السؤال غير موجود.");
  if (malformed) return malformed;
  const question = await db.articleFAQ.findFirst({
    where: { id: faqId, article: { clientId: session.clientId }, OR: [{ source: "user" }, { source: "chatbot" }] },
    select: { id: true },
  });
  if (!question) return fail("NOT_FOUND", "السؤال غير موجود.");
  // الرفض للسؤال المنتظر وحده — والشرط داخل التحديث نفسه، فلا يسبقه قرار آخر بين القراءة والكتابة.
  const rejected = await db.articleFAQ.updateMany({ where: { id: question.id, status: ArticleFAQStatus.PENDING }, data: { status: ArticleFAQStatus.REJECTED } });
  if (rejected.count === 0) return fail("CONFLICT", "هذا السؤال اتردّ عليه أو انرفض من قبل. حدّث الصفحة.");
  return ok({ question: { id: question.id, status: "REJECTED" } });
}
