import { db } from "@/lib/db";

export type WebSource = { title: string; link: string };

type SaveParams = {
  userId: string;
  userQuery: string;
  assistantResponse: string;
  scopeType: "article" | "category";
  articleSlug?: string | null;
  categorySlug?: string | null;
  articleId?: string | null;
  categoryId?: string | null;
  outcome: "outOfScope" | "redirect" | "stream" | "error";
  source?: "web" | "db" | null;
  webSources?: WebSource[] | null;
};

export async function saveChatbotMessage(params: SaveParams): Promise<void> {
  try {
    await db.chatbotMessage.create({
      data: {
        userId: params.userId,
        userQuery: params.userQuery,
        assistantResponse: params.assistantResponse,
        scopeType: params.scopeType,
        articleSlug: params.articleSlug ?? undefined,
        categorySlug: params.categorySlug ?? undefined,
        articleId: params.articleId ?? undefined,
        categoryId: params.categoryId ?? undefined,
        outcome: params.outcome,
        source: params.source ?? undefined,
        webSources: params.webSources?.length ? params.webSources : undefined,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[saveChatbotMessage]", err);
    }
  }
}
