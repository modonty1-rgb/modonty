import { after } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { requestAwaitingArticleChanges } from "@/lib/mobile-api/article-decisions";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";
import { notifyArticleDecision } from "@/app/(dashboard)/dashboard/articles/actions/notify-article-decision";
import { sendPushToClient } from "@/lib/mobile-api/push";

const input = z.object({ feedback: z.string().trim().min(1, "اكتب ملاحظتك أولًا.").max(1000) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const parsed = await readBody(request, input);
  if ("response" in parsed) return parsed.response;
  const { articleId } = await params;
  const result = await requestAwaitingArticleChanges(articleId, session.clientId, parsed.value.feedback);
  if (!result.ok) return fail(result.reason === "FEEDBACK_REQUIRED" ? "VALIDATION_ERROR" : "CONFLICT", result.reason === "FEEDBACK_REQUIRED" ? "اكتب ملاحظتك أولًا." : "هذا المقال لم يعد بانتظار موافقتك.");
  after(() => Promise.allSettled([
    notifyArticleDecision({ kind: "changes", articleId, articleTitle: result.articleTitle, clientName: result.clientName, editorName: result.editorName, feedback: parsed.value.feedback }),
    sendPushToClient({ clientId: session.clientId, event: "ARTICLE_CHANGED", title: "أُرسلت ملاحظاتك", body: "استلم فريق المحتوى طلب التعديلات على المقال.", data: { articleId } }),
  ]));
  return ok({ articleId, status: "NEEDS_REVISION", message: "أُرسلت ملاحظتك لفريق المحتوى." });
}
