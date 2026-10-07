import { type NextRequest, NextResponse } from "next/server";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { getArticleForChat } from "../../../data/get-article-for-chat";
import { getArticlesForOutOfScopeSearch } from "../../../data/get-articles-for-out-of-scope-search";
import { getSiblingArticles } from "../../../data/get-sibling-articles";
import { guardChatRequest } from "../../../data/guard-chat-request";
import { getEmbeddedChunks } from "../../../data/get-embedded-chunks";
import { retrieveFromEmbedded } from "../../../data/retrieve-from-embedded";
import { rerankDocuments } from "../../../data/rerank-documents";
import { streamAnswerResponse } from "../../../data/stream-answer-response";
import { saveChatbotMessage } from "../../../data/save-chatbot-message";
import { isOutOfScope } from "../../../data/is-out-of-scope";
import { isGreetingOrShortPleasantry } from "../../../helpers/is-greeting-or-short-pleasantry";
import { resolveModoPrompt } from "../../../helpers/resolve-modo-prompt";
import { makeSaveStreamedTurn } from "../../../helpers/make-save-streamed-turn";
import { toRelatedArticleCards } from "../../../helpers/to-related-article-cards";

import type { ChatMessage } from "../../../data/cohere-client";
import type { ApiResponse } from "@/lib/types";

export const maxDuration = 60;

/** Below this the article itself is not answering the question, so we look at its siblings. */
const RELEVANCE_THRESHOLD = 0.35;
const CONTEXT_TURNS = 6;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const guarded = await guardChatRequest(request);
    if ("error" in guarded) return guarded.error;
    const { userId, messages, lastUserMessage, conversationId, turnIndex, wantStream } = guarded.ok;

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const article = await getArticleForChat(decodedSlug);
    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const scopeColumns = {
      scopeType: "article" as const,
      articleSlug: decodedSlug,
      articleId: article.id,
      categoryId: article.categoryId ?? undefined,
    };
    const categoryName = article.category?.name ?? "";

    /**
     * The scope gate stays HERE, unlike the industry route where it was deleted. An article is a
     * single document with a stated subject, so "is this question about this article" is a real
     * question with a cheap answer. A whole industry is not — there the gate refused legitimate
     * follow-ups, and retrieval decides instead.
     */
    const isIdentityQuestion = isGreetingOrShortPleasantry(lastUserMessage);
    const outOfScope =
      !isIdentityQuestion &&
      (await isOutOfScope(lastUserMessage, {
        categoryName,
        articleTitle: article.title,
        articleExcerpt: article.excerpt ?? undefined,
      }));

    /**
     * The dead end, said out loud. With the relevance floor in place a question far from the
     * article matches nothing, and the client rendered the empty list as a single grey line —
     * «لا توجد مقالات ذات صلة» — with no apology and nowhere to go. Measured live 2026-08-18
     * asking about flight prices inside a herniated-disc article.
     */
    const offTopicReply = () => {
      const message =
        "سؤالك بعيد عن موضوع هذا المقال، وما لقيت له مقالاً عندنا. افتح مودو واختر المجال اللي يخصّك وأنا أساعدك فيه.";
      saveChatbotMessage({
        userId,
        conversationId,
        turnIndex,
        userQuery: lastUserMessage,
        assistantResponse: message,
        ...scopeColumns,
        outcome: "outOfScope",
      }).catch(() => {});
      return NextResponse.json({ conversationId, type: "outOfScope", message });
    };

    if (outOfScope) {
      const message = "اختر مقالاً وابدأ المحادثة هناك";
      const candidates = await getArticlesForOutOfScopeSearch(article.categoryId, 20);
      if (candidates.length === 0) return offTopicReply();

      const reranked = await rerankDocuments(
        lastUserMessage,
        candidates.map((a) => `${a.title}\n${a.excerpt ?? a.content?.slice(0, 500) ?? ""}`),
        5
      );
      const articles = toRelatedArticleCards(candidates, reranked);
      // Everything the reranker returned fell under the floor — no card is better than a wrong one.
      if (articles.length === 0) return offTopicReply();

      // One row, not two. The old code saved an `outOfScope` row AND a `redirect` row for the
      // same turn, so the history showed the question twice and every metric double-counted it.
      saveChatbotMessage({
        userId,
        conversationId,
        turnIndex,
        userQuery: lastUserMessage,
        assistantResponse: message,
        ...scopeColumns,
        outcome: "redirect",
        redirectArticles: articles,
      }).catch(() => {});
      return NextResponse.json({ conversationId, type: "redirect", articles, message });
    }

    const { docs: dbDocs, topScore } = isIdentityQuestion
      ? { docs: [], topScore: 0 }
      : await retrieveFromEmbedded(
          lastUserMessage,
          await getEmbeddedChunks([{ id: article.id, title: article.title }])
        );

    if (process.env.NODE_ENV === "development") {
      console.debug("[article-chat]", {
        article: decodedSlug,
        topScore,
        docsCount: dbDocs.length,
        threshold: RELEVANCE_THRESHOLD,
        query: lastUserMessage.slice(0, 60),
      });
    }

    // The article does not answer it, but a sibling in the same category might.
    if (!isIdentityQuestion && (dbDocs.length === 0 || topScore < RELEVANCE_THRESHOLD)) {
      const siblings = article.categoryId ? await getSiblingArticles(article.categoryId, article.id) : [];

      if (siblings.length > 0) {
        const reranked = await rerankDocuments(
          lastUserMessage,
          siblings.map((a) => `${a.title}\n${a.excerpt ?? a.content?.slice(0, 500) ?? ""}`),
          5
        );
        const articles = toRelatedArticleCards(siblings, reranked);
        if (articles.length > 0) {
          const message = "عثرنا على مقالات ذات صلة في موضوعك";
          saveChatbotMessage({
            userId,
            conversationId,
            turnIndex,
            userQuery: lastUserMessage,
            assistantResponse: message,
            ...scopeColumns,
            outcome: "redirect",
            redirectArticles: articles,
          }).catch(() => {});
          return NextResponse.json({ conversationId, type: "redirect", articles, message });
        }
      }
    }

    const docs = dbDocs;

    /**
     * The partner behind the article the visitor is reading, as a bookable card.
     *
     * Modo ends medical answers with «راجع الطبيب المتخصص» — and the specialist is right
     * there: he wrote the article the visitor came from. Measured live 2026-08-18, that
     * sentence was the last thing on screen with nothing to click, so the answer sent the
     * visitor to look for a doctor somewhere else. Khalid's rule holds here too: «الشريك أولى».
     */
    const partners = isIdentityQuestion
      ? []
      : [{
          name: article.client.name,
          slug: article.client.slug,
          canBook: article.client.ctaMode !== "NONE",
          whyRecommended: "صاحب المقال اللي تقراه",
          logo: mediaSrc(article.client.logoMedia) || null,
          city: article.client.addressCity,
          credential: article.client.credentials[0]?.name?.trim() || null,
          isVerified: article.client.isVerified,
        }];

    /**
     * ق٤ (Khalid, 2026-08-19): no web fallback. Answering a visitor who is reading OUR article
     * with clinics found on Google is the failure that got Expedia's assistant pulled — it
     * recommends without our data, and the trust the article earned pays for it. Silence plus the
     * article's own author beats a confident answer we cannot stand behind.
     *
     * The turn is logged as `outOfScope`, which is what makes the gap findable later: an
     * unanswered question is the cheapest signal for what to write next.
     */
    if (!isIdentityQuestion && docs.length === 0) {
      const message =
        "ما لقيت في المقال جواباً دقيقاً لسؤالك، وما أبغى أخمّن. سجّلت سؤالك، وصاحب المقال أقدر واحد يجاوبك.";
      saveChatbotMessage({
        userId,
        conversationId,
        turnIndex,
        userQuery: lastUserMessage,
        assistantResponse: message,
        ...scopeColumns,
        outcome: "outOfScope",
      }).catch(() => {});
      return NextResponse.json({
        conversationId,
        type: "noSources",
        message,
        ...(partners.length > 0 && { partners }),
      });
    }

    const systemPrompt = isIdentityQuestion
      ? await resolveModoPrompt("modo.identity")
      : await resolveModoPrompt("modo.article", { articleTitle: article.title, categoryName });

    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.content.trim().length > 0).slice(-CONTEXT_TURNS),
    ];

    const save = makeSaveStreamedTurn({
      userId,
      conversationId,
      turnIndex,
      userQuery: lastUserMessage,
      ...scopeColumns,
    });

    if (!wantStream) {
      const { askCohere } = await import("../../../data/ask-cohere");
      const response = await askCohere(chatMessages, docs.length > 0 ? docs : undefined);
      const msg = response as { text?: string; message?: { content?: Array<{ text?: string }> } };
      const text = msg.text ?? msg.message?.content?.[0]?.text ?? "";
      save(text, "stream");
      // conversationId was missing here, so a non-streaming client could never group its turns.
      return NextResponse.json({
        conversationId,
        type: "message",
        text,
        ...(partners.length > 0 && { partners }),
      });
    }

    return streamAnswerResponse({
      chatMessages,
      docs,
      conversationId,
      doneExtras: {
        ...(partners.length > 0 && { partners }),
      },
      onFinish: save,
    });
  } catch (error) {
    console.error("[modo-chat/api/article]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ. حاول مرة أخرى." } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
