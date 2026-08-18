import { NextRequest, NextResponse } from "next/server";
import { ArticleStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { getArticleForChat, getArticlesForOutOfScopeSearch } from "@/app/(site)/articles/[slug]/actions/article-data";
import { guardChatRequest } from "@/app/(site)/modo-chat/data/guard-chat-request";
import { getEmbeddedChunks } from "@/app/(site)/modo-chat/data/get-embedded-chunks";
import { retrieveFromEmbedded } from "@/app/(site)/modo-chat/data/retrieve-from-embedded";
import { rerankDocuments } from "@/app/(site)/modo-chat/data/rerank-documents";
import { streamAnswerResponse } from "@/app/(site)/modo-chat/data/stream-answer-response";
import { saveChatbotMessage } from "@/app/(site)/modo-chat/data/save-chatbot-message";
import { isOutOfScope } from "@/app/(site)/modo-chat/data/is-out-of-scope";
import { isGreetingOrShortPleasantry } from "@/app/(site)/modo-chat/helpers/is-greeting";
import { buildArticleDbPrompt } from "@/app/(site)/modo-chat/helpers/build-article-db-prompt";
import { buildIdentityPrompt } from "@/app/(site)/modo-chat/helpers/build-identity-prompt";

import type { ChatMessage } from "@/app/(site)/modo-chat/data/cohere-client";
import type { ApiResponse } from "@/lib/types";

export const maxDuration = 60;

/** Below this the article itself is not answering the question, so we look at its siblings. */
const RELEVANCE_THRESHOLD = 0.35;
/**
 * Floor for offering another article as «ذات صلة». PROVISIONAL like every reranker number in
 * this route — the vendor prescribes calibrating on 30–50 real questions, which has not been run.
 */
const RELATED_MIN_SCORE = 0.15;
const SIBLING_CANDIDATES = 15;
const CONTEXT_TURNS = 6;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const guarded = await guardChatRequest(request);
    if ("error" in guarded) return guarded.error;
    const { userId, messages, lastUserMessage, conversationId, turnIndex, wantStream, trialRemaining } = guarded.ok;

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
     * Turns ranked candidates into cards, dropping anything the reranker did not actually find
     * relevant.
     *
     * The reranker returns its top N whatever their scores, so with no floor every question
     * produced five "related articles". Measured live 2026-08-18: «كم مدة التعافي بعد العلاج
     * التداخلي؟» — asked inside an article about exactly that treatment — was answered with
     * سلس البول · تكميم المعدة · التهاب اللثة · التهاب سقف الحلق · الطب النفسي. Offering a
     * visitor five unrelated articles is worse than offering none: it reads as "we have nothing".
     */
    const toCards = <T extends { id: string; title: string; slug: string; excerpt: string | null; client: { name: string; slug: string } }>(
      candidates: T[],
      order: { index: number; relevanceScore?: number }[]
    ) =>
      order
        .filter((r) => (r.relevanceScore ?? 0) >= RELATED_MIN_SCORE)
        .map((r) => candidates[r.index])
        .filter((a): a is T => Boolean(a))
        .map((a) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt ?? null,
          client: a.client,
        }));

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
      const articles = toCards(candidates, reranked);
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
      const siblings = article.categoryId
        ? await db.article.findMany({
            where: {
              categoryId: article.categoryId,
              id: { not: article.id },
              status: ArticleStatus.PUBLISHED,
              OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
            },
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              content: true,
              client: { select: { name: true, slug: true } },
            },
            orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
            take: SIBLING_CANDIDATES,
          })
        : [];

      if (siblings.length > 0) {
        const reranked = await rerankDocuments(
          lastUserMessage,
          siblings.map((a) => `${a.title}\n${a.excerpt ?? a.content?.slice(0, 500) ?? ""}`),
          5
        );
        const articles = toCards(siblings, reranked);
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
          hasVerifiedPapers: Boolean(article.client.verificationImageUrl?.trim()),
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
      ? buildIdentityPrompt()
      : buildArticleDbPrompt(article.title, categoryName);

    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.content.trim().length > 0).slice(-CONTEXT_TURNS),
    ];

    const save = (fullText: string, outcome: "stream" | "error") =>
      saveChatbotMessage({
        userId,
        conversationId,
        turnIndex,
        userQuery: lastUserMessage,
        assistantResponse: fullText,
        ...scopeColumns,
        outcome,
        source: "db",
      }).catch(() => null);

    if (!wantStream) {
      const { askCohere } = await import("@/app/(site)/modo-chat/data/ask-cohere");
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
