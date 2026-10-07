import { after } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { requestAwaitingArticleChanges } from "@/lib/mobile-api/article-decisions";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { rejectMalformedIds } from "@/lib/mobile-api/params";
import { readBody } from "../../../helpers/request";
import { notifyArticleDecision } from "@/lib/articles/notify-article-decision";

const input = z.object({ feedback: z.string().trim().min(1, "اكتب ملاحظتك أولًا.").max(1000) });

export async function POST(request: NextRequest, { params }: { params: Promise<{ articleId: string }> }) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const parsed = await readBody(request, input);
  if ("response" in parsed) return parsed.response;
  const { articleId } = await params;
  const malformed = rejectMalformedIds([articleId], "المقال غير موجود.");
  if (malformed) return malformed;
  const result = await requestAwaitingArticleChanges(articleId, session.clientId, parsed.value.feedback);
  if (!result.ok) return fail(result.reason === "FEEDBACK_REQUIRED" ? "VALIDATION_ERROR" : "CONFLICT", result.reason === "FEEDBACK_REQUIRED" ? "اكتب ملاحظتك أولًا." : "هذا المقال لم يعد بانتظار موافقتك.");
  // لا دفع لجوال العميل عن طلبه هو (صدى) — المحرّر وحده يُبلَّغ.
  after(() => notifyArticleDecision({ kind: "changes", articleId, articleTitle: result.articleTitle, clientName: result.clientName, editorName: result.editorName, feedback: parsed.value.feedback }).catch(() => undefined));
  return ok({ articleId, status: "NEEDS_REVISION", message: "أُرسلت ملاحظتك لفريق المحتوى." });
}
