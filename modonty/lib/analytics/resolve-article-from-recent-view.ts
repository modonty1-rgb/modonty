import "server-only";

import { cookies } from "next/headers";
import { db } from "@/lib/db";

/** Same cookie the article view route records under (`/articles/[slug]/api/view`). */
const VIEW_SESSION_COOKIE = "modonty_view_sid";

/**
 * How far back an article read still earns the credit for a contact. Seven days — a reader who
 * read the article this week and wrote to the clinic from its page is that article's lead.
 */
const ATTRIBUTION_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The last article OF THIS CLIENT this visitor read in the window — or null.
 *
 * Why (Khalid, 7 Oct 2026): every client lead of the last month landed «من صفحة العميل», none
 * «من مقال», though readers reach the client page FROM an article (article → client page →
 * WhatsApp). The click on the client page carried no article, so «Article Conversions» showed 0
 * for every client. The view row already holds the answer: the same cookie, the article, the time.
 *
 * Last-touch on purpose: the article that brought the reader most recently is the one the team
 * should write more of. Another client's article never counts. Never throws — attribution is a
 * bonus on the lead, and a lead must not fail because of it.
 */
export async function resolveArticleFromRecentView(clientId: string, sessionId?: string | null): Promise<string | null> {
  try {
    const sid = sessionId ?? (await cookies()).get(VIEW_SESSION_COOKIE)?.value;
    if (!sid) return null;
    const view = await db.articleView.findFirst({
      where: { sessionId: sid, createdAt: { gte: new Date(Date.now() - ATTRIBUTION_WINDOW_MS) }, article: { clientId } },
      orderBy: { createdAt: "desc" },
      select: { articleId: true },
    });
    return view?.articleId ?? null;
  } catch {
    return null;
  }
}
