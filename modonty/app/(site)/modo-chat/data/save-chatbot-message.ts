import { db } from "@/lib/db";

export type WebSource = { title: string; link: string };
export type RedirectArticle = { id: string; title: string; slug: string; excerpt: string | null };

type SaveParams = {
  /** Null for a visitor on the free trial — that turn is deliberately not logged. */
  userId: string | null;
  /** Ties this turn to its conversation — without it the log is a flat pile of questions. */
  conversationId: string;
  /** Position in the conversation, so a restored thread replays in order. */
  turnIndex: number;
  userQuery: string;
  assistantResponse: string;
  scopeType: "article" | "industry" | "category";
  articleSlug?: string | null;
  categorySlug?: string | null;
  industrySlug?: string | null;
  articleId?: string | null;
  categoryId?: string | null;
  industryId?: string | null;
  outcome: "outOfScope" | "redirect" | "stream" | "error";
  source?: "web" | "db" | null;
  webSources?: WebSource[] | null;
  /** A redirect turn has an empty answer; without these the history row renders blank. */
  redirectArticles?: RedirectArticle[] | null;
};

/** Returns the saved row id so the answer can be rated, or null when nothing was saved. */
export async function saveChatbotMessage(params: SaveParams): Promise<string | null> {
  // The log has a required relation to User, so an anonymous trial turn has nothing to hang on.
  // Guarding here rather than at six call sites keeps every caller honest by construction.
  if (!params.userId) return null;

  try {
    const row = await db.chatbotMessage.create({
      select: { id: true },
      data: {
        userId: params.userId,
        conversationId: params.conversationId,
        turnIndex: params.turnIndex,
        userQuery: params.userQuery,
        assistantResponse: params.assistantResponse,
        scopeType: params.scopeType,
        articleSlug: params.articleSlug ?? undefined,
        categorySlug: params.categorySlug ?? undefined,
        industrySlug: params.industrySlug ?? undefined,
        articleId: params.articleId ?? undefined,
        categoryId: params.categoryId ?? undefined,
        industryId: params.industryId ?? undefined,
        outcome: params.outcome,
        source: params.source ?? undefined,
        webSources: params.webSources?.length ? params.webSources : undefined,
        redirectArticles: params.redirectArticles?.length ? params.redirectArticles : undefined,
      },
    });
    return row.id;
  } catch (err) {
    // Always logged: a silent write failure means the conversation log — and every metric
    // built on it, including the rate limiter — is quietly wrong.
    console.error("[saveChatbotMessage] failed to persist a turn", err);
    return null;
  }
}
