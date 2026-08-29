import { ArticleFAQStatus } from "@prisma/client";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

export async function POST(request: NextRequest, { params }: { params: Promise<{ articleId: string; faqId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { articleId, faqId } = await params;
  const faq = await db.articleFAQ.findFirst({
    where: { id: faqId, articleId, article: { clientId: session.clientId }, OR: [{ source: "manual" }, { source: null }, { source: { isSet: false } }] },
    select: { id: true },
  });
  if (!faq) return fail("NOT_FOUND", "سؤال فريق المحتوى غير موجود.");
  await db.articleFAQ.update({ where: { id: faq.id }, data: { status: ArticleFAQStatus.REJECTED } });
  return ok({ faq: { id: faq.id, status: "REJECTED" } });
}
