"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { auth } from "@/lib/auth";
import { messages } from "@/lib/messages";
import { approveAwaitingArticle, requestAwaitingArticleChanges } from "@/lib/mobile-api/article-decisions";

import { notifyArticleDecision } from "./notify-article-decision";

/**
 * العميل من الجلسة، لا من المتصفّح. كانت الدالّتان تأخذان `clientId` من الواجهة، فأيّ
 * مستخدم مسجّل يقدر يرسل معرّف عميل آخر ومعرّف مقاله فيعتمده باسمه. والملكية تُحسم بعدها
 * في `approveAwaitingArticle` / `requestAwaitingArticleChanges` (شرط `clientId` في الاستعلام).
 */
async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

// TODO: Add compliance check (forbidden keywords/claims) before publishing.
// Console app cannot import admin's @/lib/seo/pre-publish-audit.
// Options: (1) shared package in workspace, or (2) admin API endpoint for compliance.
export async function approveArticle(articleId: string) {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  try {
    const article = await approveAwaitingArticle(articleId, clientId);
    if (!article.ok) {
      return {
        success: false,
        error: messages.error.notFound,
      };
    }

    // NOTE: Console app does not have access to admin's @/lib/seo modules.
    // SEO regeneration (JSON-LD + metadata) is NOT performed here.
    // The admin app's scheduled SEO jobs or manual re-publish will handle it.
    // TODO: Add an admin API endpoint for cross-app SEO regeneration.

    // TODO: add revalidateModontyTag to console app when needed

    // Registered synchronously, INSIDE the request — a bare unawaited promise here would
    // be killed when the response closes and the editor would never hear about it
    // (the exact failure OBS-216 traced on the GA4 events).
    // لا إشعار جوّال للعميل هنا: هو من ضغط الزر، وإشعارٌ عن فعله هو صدى لا خبر.
    after(async () => {
      await notifyArticleDecision({
        kind: "approved",
        articleId,
        articleTitle: article.articleTitle,
        clientName: article.clientName,
        editorName: article.editorName,
      }).catch(() => undefined);
    });

    revalidatePath("/dashboard/articles");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}

export async function requestChanges(articleId: string, feedback: string) {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };
  try {
    const article = await requestAwaitingArticleChanges(articleId, clientId, feedback);
    if (!article.ok && article.reason === "FEEDBACK_REQUIRED") {
      return {
        success: false,
        error: messages.error.feedback_required,
      };
    }

    if (!article.ok) return { success: false, error: messages.error.notFound };

    // لا إشعار جوّال للعميل عن طلبه هو (صدى) — المحرّر وحده يُبلَّغ.
    after(async () => {
      await notifyArticleDecision({
        kind: "changes",
        articleId,
        articleTitle: article.articleTitle,
        clientName: article.clientName,
        editorName: article.editorName,
        // The client's own words — an editor acts on these, so they travel with the
        // notice instead of forcing a trip into the dashboard to find out what to fix.
        feedback: feedback.trim(),
      }).catch(() => undefined);
    });

    revalidatePath("/dashboard/articles");
    revalidatePath(`/dashboard/articles/${articleId}/preview`);

    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
