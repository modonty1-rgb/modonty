import "server-only";

import { sendContentTeamTelegram, escapeTgHtml } from "@modonty/shared/lib/telegram/client";

// The client's verdict on an article, pushed to the content team's Telegram.
//
// Direction matters: every other note in that group travels manager → team. This one
// travels CLIENT → editor, and it is the only signal the editor gets that the thing they
// wrote was accepted or sent back. Without it the article silently changes status in a
// dashboard nobody is watching at that moment.
//
// Never throws. A Telegram outage must not turn a client's approval into an error — the
// status change is already committed by the time this runs.

const ADMIN_ORIGIN = "https://admin.modonty.com";
const MAX_FEEDBACK = 1000;

interface ArticleDecision {
  kind: "approved" | "changes";
  articleId: string;
  articleTitle: string;
  clientName: string;
  /** The client's assigned editor. Null when nobody is assigned yet. */
  editorName: string | null;
  /** Only for `changes` — what the client wants fixed. */
  feedback?: string;
}

export async function notifyArticleDecision(d: ArticleDecision): Promise<void> {
  // An unassigned client has no one to address; the group still needs to see it, and
  // saying so is more useful than a blank line.
  const to = d.editorName?.trim() || "الكل";
  const link = `${ADMIN_ORIGIN}/articles/${d.articleId}`;

  const header =
    d.kind === "approved"
      ? "✅ <b>تم قبول المقال</b>"
      : "✏️ <b>طلب تعديل على المقال</b>";

  // Same labelled shape as the notes the manager sends, so both kinds of message read
  // as one system rather than two.
  let tg =
    `${header}\n` +
    `<b>مرسل:</b> ${escapeTgHtml(d.clientName)}\n` +
    `<b>مستلم:</b> ${escapeTgHtml(to)}\n` +
    `<b>المقال:</b> ${escapeTgHtml(d.articleTitle)}\n`;

  if (d.kind === "changes") {
    const body = (d.feedback ?? "").trim().slice(0, MAX_FEEDBACK);
    if (body) {
      // The client's own words, quoted — an editor acts on these, so they must be
      // visually separate from the labels around them. Long notes collapse.
      const isLong = body.length > 220 || body.split("\n").length > 3;
      tg += `<blockquote${isLong ? " expandable" : ""}>${escapeTgHtml(body)}</blockquote>`;
    }
  }

  tg += `<a href="${escapeTgHtml(link)}">افتح المقال</a>`;

  try {
    await sendContentTeamTelegram(tg);
  } catch {
    // never let a notification break the decision that already succeeded
  }
}
