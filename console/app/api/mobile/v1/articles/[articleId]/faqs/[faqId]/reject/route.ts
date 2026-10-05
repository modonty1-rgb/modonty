import { ArticleFAQStatus } from "@prisma/client";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";

export async function POST(request: NextRequest, { params }: { params: Promise<{ articleId: string; faqId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { articleId, faqId } = await params;
  const malformed = rejectMalformedIds([articleId, faqId], "سؤال فريق المحتوى غير موجود.");
  if (malformed) return malformed;
  const faq = await db.articleFAQ.findFirst({
    where: { id: faqId, articleId, article: { clientId: session.clientId }, OR: [{ source: "manual" }, { source: null }, { source: { isSet: false } }] },
    select: { id: true },
  });
  if (!faq) return fail("NOT_FOUND", "سؤال فريق المحتوى غير موجود.");
  // الرفض للسؤال المنتظر وحده (بند التدقيق ١٠) — كان يرفض سؤالاً منشوراً أيضاً.
  const rejected = await db.articleFAQ.updateMany({ where: { id: faq.id, status: ArticleFAQStatus.PENDING }, data: { status: ArticleFAQStatus.REJECTED } });
  if (rejected.count === 0) return fail("CONFLICT", "قرّرت في هذا السؤال من قبل. حدّث الصفحة.");
  return ok({ faq: { id: faq.id, status: "REJECTED" } });
}
