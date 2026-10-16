import "server-only";

/** Visitor-facing wait is never paid for this: the send gives up after 2.5 s and never throws. */
const TIMEOUT_MS = 2_500;

const OUTCOME_LABEL: Record<string, string> = {
  stream: "جاوب",
  redirect: "حوّله لمقالات",
  outOfScope: "خارج النطاق",
  error: "صار خطأ",
};

type Question = {
  userQuery: string;
  assistantResponse: string;
  outcome: string;
  scopeType: "article" | "industry" | "category";
  articleSlug?: string | null;
  industrySlug?: string | null;
  categorySlug?: string | null;
  userId: string | null;
};

/**
 * كل سؤال يسأله زائر لمودو ← مجموعة «مدونتي — أسئلة مودو» في تليجرام (خالد ١٦ أكتوبر ٢٠٢٦: «الناس
 * اللي بتسأل تجيني برضو نوتيفيكيشن عليها»)، عبر بوت مستقل `@modonty_modo_bot` — لا بوت الأدمن، فما
 * يختلط سؤال زائر برموز التحقق. بلا مفتاح أو مجموعة ← لا شيء (هكذا في أي بيئة ما انضبطت فيها).
 */
export async function notifyModoQuestion(q: Question): Promise<void> {
  const token = process.env.MODO_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.MODO_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const where =
    q.scopeType === "article" && q.articleSlug
      ? `مقالة: https://www.modonty.com/articles/${q.articleSlug}`
      : q.scopeType === "industry" && q.industrySlug
        ? `صناعة: ${q.industrySlug}`
        : q.scopeType === "category" && q.categorySlug
          ? `تصنيف: ${q.categorySlug}`
          : `النطاق: ${q.scopeType}`;
  const answer = q.assistantResponse.trim();
  const text = [
    "سؤال جديد لمودو",
    "",
    `السؤال: ${q.userQuery.trim().slice(0, 800)}`,
    "",
    where,
    `النتيجة: ${OUTCOME_LABEL[q.outcome] ?? q.outcome}`,
    `السائل: ${q.userId ? "عضو مسجّل" : "زائر بلا حساب"}`,
    ...(answer ? ["", `رد مودو: ${answer.slice(0, 600)}${answer.length > 600 ? "…" : ""}`] : []),
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    // A missed notification must never break or slow the visitor's answer.
    console.error("[modo-chat] telegram notify failed", err instanceof Error ? err.message : err);
  }
}
