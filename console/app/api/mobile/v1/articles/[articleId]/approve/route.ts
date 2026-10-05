import { after } from "next/server";
import type { NextRequest } from "next/server";
import { approveAwaitingArticle } from "@/lib/mobile-api/article-decisions";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { notifyArticleDecision } from "@/app/(dashboard)/dashboard/articles/actions/notify-article-decision";

export async function POST(request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { articleId } = await params;
  const malformed = rejectMalformedIds([articleId], "المقال غير موجود.");
  if (malformed) return malformed;
  const result = await approveAwaitingArticle(articleId, session.clientId);
  if (!result.ok) return fail("CONFLICT", "هذا المقال لم يعد بانتظار موافقتك.");
  // المحرّر وحده يُبلَّغ. لا دفع لجوال العميل: هو من ضغط «اعتماد»، والدفعة عن فعله صدى (بند التدقيق ٢).
  after(() => notifyArticleDecision({ kind: "approved", articleId, articleTitle: result.articleTitle, clientName: result.clientName, editorName: result.editorName }).catch(() => undefined));
  return ok({ articleId, status: "APPROVED", message: "تمت الموافقة. سيحدد فريق مدونتي موعد النشر." });
}
