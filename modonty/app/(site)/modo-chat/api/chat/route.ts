import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { guardChatRequest } from "../../data/guard-chat-request";
import { getEmbeddedChunks } from "../../data/get-embedded-chunks";
import { getEmbeddedFaqs } from "../../data/get-embedded-faqs";
import { getIndustryScope } from "../../data/get-industry-scope";
import { getCategoryScopeArticles } from "../../data/get-category-scope-articles";
import { getSuggestedArticle } from "../../data/get-suggested-article";
import { retrieveFromEmbedded } from "../../data/retrieve-from-embedded";
import { rankPartners } from "../../data/rank-partners";
import { streamAnswerResponse } from "../../data/stream-answer-response";
import { saveChatbotMessage } from "../../data/save-chatbot-message";
import { buildAnswerSources } from "../../helpers/build-answer-sources";
import { makeSaveStreamedTurn } from "../../helpers/make-save-streamed-turn";
import { toPartnerCard } from "../../helpers/to-partner-card";
import { isGreetingOrShortPleasantry } from "../../helpers/is-greeting-or-short-pleasantry";
import { isPriceOrAppointmentQuestion } from "../../helpers/is-price-or-appointment-question";
import { resolveModoPrompt } from "../../helpers/resolve-modo-prompt";

import type { ChatMessage } from "../../data/cohere-client";
import type { ApiResponse } from "@/lib/types";

// Worst path is several upstream calls before the first token; the default limit cuts the stream.
export const maxDuration = 60;

/** Either scope works; industry is the axis the business runs on. */
const scopeSchema = z.object({
  categorySlug: z.string().min(1).optional(),
  industrySlug: z.string().min(1).optional(),
});

/**
 * Floor for offering an article as further reading under a web answer — deliberately looser
 * than retrieval's answering floor, since "related enough to read" is a weaker claim than
 * "good enough to answer from". PROVISIONAL, like every reranker number here.
 */
const SUGGEST_MIN_SCORE = 0.15;

/**
 * Only the last few turns travel to the model. Input tokens are billed every turn, so resending
 * the whole thread made a long session cost quadratically for context the answer rarely needs.
 */
const CONTEXT_TURNS = 6;

export async function POST(request: NextRequest) {
  try {
    const guarded = await guardChatRequest(request);
    if ("error" in guarded) return guarded.error;
    const { userId, messages, lastUserMessage, conversationId, turnIndex, wantStream, body } = guarded.ok;

    const scope = scopeSchema.safeParse(body);
    const { categorySlug, industrySlug } = scope.success ? scope.data : {};

    /**
     * INDUSTRY is the axis the business runs on — partners belong to an industry, and the
     * platform's real book of business (Egyptian doctors serving Gulf patients) is an industry
     * with twenty-one partners and no category of its own. Category is still accepted so older
     * callers keep working.
     */
    const industry = industrySlug ? await getIndustryScope(industrySlug) : null;
    if (industrySlug && !industry) {
      return NextResponse.json(
        { success: false, error: "المجال غير موجود" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const category =
      !industry && categorySlug
        ? await db.category.findUnique({
            where: { slug: categorySlug },
            select: { id: true, name: true },
          })
        : null;

    if (!industry && !category) {
      return NextResponse.json(
        { success: false, error: "لازم تحدّد مجالاً أو موضوعاً" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const scopeName = industry?.name ?? category!.name;
    /** Partners in the industry — Modo's answer when no article covers the question. */
    const scopePartners = industry?.partners ?? [];
    /**
     * What every saved turn records about its scope. Before this the log hardcoded
     * `scopeType:"category"` with a null slug on every industry answer, so the table meant to
     * tell us which industry a campaign converted said nothing at all.
     */
    const scopeColumns = industry
      ? { scopeType: "industry" as const, industrySlug: industry.slug, industryId: industry.id }
      : { scopeType: "category" as const, categorySlug, categoryId: category!.id };

    const scopeArticles = industry ? industry.articles : await getCategoryScopeArticles(category!.id);

    /**
     * The out-of-scope decision is derived from retrieval — it is NOT a gate in front of it.
     * The old gate refused anything under 0.52 on a 600-character proxy of the corpus, stricter
     * than retrieval's own floor and paid for before a single chunk was read. Measured live on
     * 2026-08-18: a legitimate follow-up scored 0.4565 and was refused, having already cost money.
     */
    const isIdentityQuestion = isGreetingOrShortPleasantry(lastUserMessage);

    const tChunks = Date.now();
    // Partner answers are retrieved alongside article text: a doctor answering one visitor
    // in their own words is the strongest material we have, and it used to serve that visitor only.
    const chunks = isIdentityQuestion
      ? []
      : (await Promise.all([
          getEmbeddedChunks(scopeArticles),
          industry ? getEmbeddedFaqs(industry.id) : Promise.resolve([]),
        ])).flat();
    const tRetrieve = Date.now();
    const { docs: dbDocs, topRerankScore, bestArticleId, bestArticleScore } = isIdentityQuestion
      ? { docs: [], topRerankScore: 0, bestArticleId: null, bestArticleScore: 0 }
      : await retrieveFromEmbedded(lastUserMessage, chunks);

    if (process.env.NODE_ENV === "development") {
      console.debug("[chatbot-scope]", {
        scope: industry ? `industry:${industry.slug}` : `category:${categorySlug}`,
        scopeName,
        articles: scopeArticles.length,
        partners: scopePartners.length,
        chunksMs: tRetrieve - tChunks,
        retrieveMs: Date.now() - tRetrieve,
        chunks: chunks.length,
        topRerankScore,
        docsCount: dbDocs.length,
        query: lastUserMessage.slice(0, 60),
      });
    }

    const { sourceArticles, partners } = buildAnswerSources(dbDocs, scopeArticles, scopePartners);

    /**
     * No article covers the question — but the industry may have partners who do that work.
     * Khalid's rule (2026-08-18): «الشريك أولى». Partners come BEFORE any web search, and the
     * web is never a silent fallback that sends the visitor to a competitor we found on Google.
     */
    const relevantPartners =
      !isIdentityQuestion && dbDocs.length === 0 && scopePartners.length > 0
        ? await rankPartners(lastUserMessage, scopePartners, 3)
        : [];

    if (relevantPartners.length > 0) {
      const answer = `ما عندي مقال يغطّي سؤالك بالضبط، لكن عندي شركاء في ${scopeName} يقدرون يخدمونك:`;
      saveChatbotMessage({
        userId,
        conversationId,
        turnIndex,
        userQuery: lastUserMessage,
        assistantResponse: answer,
        ...scopeColumns,
        outcome: "redirect",
      }).catch(() => {});
      return NextResponse.json({
        conversationId,
        type: "message",
        text: answer,
        partners: relevantPartners.map((p) => toPartnerCard(p, scopeName)),
      });
    }

    const docs = dbDocs;

    /**
     * ق٤ (Khalid, 2026-08-19): the web search is gone. Measured live the same day — asked about
     * the cost of a rhinoplasty inside السياحة العلاجية, where we have 21 partners, Modo answered
     * with Turkish clinics found on Google and cited eight sites that are not ours. That is the
     * failure that got Expedia's assistant pulled: it recommends without your data, and the
     * platform's own trust pays the bill.
     *
     * Silence is the correct answer here, and it is not a dead end — the partner branch above
     * runs first, and the closest article is still offered underneath. The turn is logged as
     * `outOfScope`, which is what turns an unanswered question into the next article.
     */
    if (!isIdentityQuestion && docs.length === 0) {
      /**
       * «هل تريد قراءة أعمق؟» — the article CLOSEST to the question, not the most-read one.
       * Ordering by views put a herniated-disc article under a rhinoplasty answer, measured
       * live on 2026-08-18. Below the floor nothing is offered: an unrelated card is worse
       * than no card.
       */
      const suggestedArticle =
        bestArticleId && bestArticleScore >= SUGGEST_MIN_SCORE
          ? await getSuggestedArticle(bestArticleId)
          : null;

      /**
       * ق١٩ (Khalid, 2026-08-19): a price or an appointment is a question Modo can never answer —
       * only the partner sets either. Retrieval returning nothing here is CORRECT, and stopping
       * there wastes the highest-intent question the visitor will ever ask.
       *
       * The floor is dropped for this handoff on purpose: the ranker's ORDER is right (dental
       * clinics came 1-2-3 for «كم سعر زراعة الأسنان») while its magnitude is near zero, because
       * it is answering "does this text answer the question" — and no clinic's description holds
       * a price. We are asking a different question: who is the right person to ask.
       */
      const handoff =
        isPriceOrAppointmentQuestion(lastUserMessage) && scopePartners.length > 0
          ? await rankPartners(lastUserMessage, scopePartners, 1, 0)
          : [];

      const message = handoff.length > 0
        ? `السعر والموعد يحدّدهما الشريك نفسه، وما أبغى أخمّن عليك. تقدر توصّل سؤالك له من تحت.`
        : `ما عندي جواب موثّق لسؤالك في محتوى ${scopeName}، وما أبغى أخمّن عليك. سجّلت سؤالك عندنا.`;

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
        ...(suggestedArticle && { suggestedArticle }),
        ...(handoff.length > 0 && {
          partners: handoff.map((p) => toPartnerCard(p, scopeName)),
        }),
      });
    }

    // Two cases — an identity question has no documents by design, and the documents-only
    // prompt turns that into a refusal.
    const systemPrompt = isIdentityQuestion
      ? await resolveModoPrompt("modo.identity")
      : await resolveModoPrompt("modo.category", { categoryName: scopeName });

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
      const { askCohere } = await import("../../data/ask-cohere");
      const response = await askCohere(chatMessages, docs.length > 0 ? docs : undefined);
      const msg = response as { text?: string; message?: { content?: Array<{ text?: string }> } };
      const text = msg.text ?? msg.message?.content?.[0]?.text ?? "";
      save(text, "stream");
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
        // The platform articles the answer was grounded in — proof, not a replacement.
        ...(sourceArticles.length > 0 && { sourceArticles }),
        ...(partners.length > 0 && { partners }),
      },
      onFinish: save,
    });
  } catch (error) {
    console.error("[modo-chat/api/chat]", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ. حاول مرة أخرى." } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
