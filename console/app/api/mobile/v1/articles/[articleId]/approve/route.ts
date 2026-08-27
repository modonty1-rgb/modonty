import { after } from "next/server";
import type { NextRequest } from "next/server";
import { approveAwaitingArticle } from "@/lib/mobile-api/article-decisions";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { notifyArticleDecision } from "@/app/(dashboard)/dashboard/articles/actions/notify-article-decision";
import { sendPushToClient } from "@/lib/mobile-api/push";

export async function POST(request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const { articleId } = await params;
  const result = await approveAwaitingArticle(articleId, session.clientId);
  if (!result.ok) return fail("CONFLICT", "هذا المقال لم يعد بانتظار موافقتك.");
  after(() => Promise.allSettled([
    notifyArticleDecision({ kind: "approved", articleId, articleTitle: result.articleTitle, clientName: result.clientName, editorName: result.editorName }),
    sendPushToClient({ clientId: session.clientId, event: "ARTICLE_APPROVED", title: "تمت الموافقة على المقال", body: "سيحدد فريق مُدَوَّنَتِي موعد النشر قريبًا.", data: { articleId } }),
  ]));
  return ok({ articleId, status: "SCHEDULED", message: "تمت الموافقة. سيحدد فريق مُدَوَّنَتِي موعد النشر." });
}
