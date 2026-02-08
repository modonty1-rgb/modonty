import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ArticleStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getArticleForChat, getArticlesForOutOfScopeSearch } from "@/app/articles/[slug]/helpers/article-data";
import { chunkArticleContent } from "@/lib/rag/chunk";
import { retrieveFromChunks } from "@/lib/rag/retrieve";
import { isOutOfScope } from "@/lib/rag/scope";
import { chatStream, rerank, type ChatMessage } from "@/lib/cohere";
import { searchSerper } from "@/lib/serper";
import { saveChatbotMessage } from "@/lib/chat/save-chatbot-message";
import type { ApiResponse } from "@/app/api/helpers/types";

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().max(2000),
    })
  ),
  stream: z.boolean().optional().default(true),
});

const RELEVANCE_THRESHOLD = 0.35;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لاستخدام مدونتي الذكية" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const { messages, stream: wantStream } = parsed.data;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg?.content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const article = await getArticleForChat(decodedSlug);
    if (!article) {
      return NextResponse.json(
        { success: false, error: "Article not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const outOfScope = await isOutOfScope(lastUserMsg.content, {
      categoryName: article.category?.name ?? "",
      articleTitle: article.title,
      articleExcerpt: article.excerpt ?? undefined,
    });

    if (outOfScope) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[article-chat-flow] source=outOfScope, outcome=redirect");
      }
      saveChatbotMessage({
        userId: session.user.id,
        userQuery: lastUserMsg.content,
        assistantResponse: "اختر مقالاً وابدأ المحادثة هناك",
        scopeType: "article",
        articleSlug: decodedSlug,
        articleId: article.id,
        categoryId: article.categoryId ?? undefined,
        outcome: "outOfScope",
      }).catch(() => {});
      const candidates = await getArticlesForOutOfScopeSearch(
        article.categoryId,
        20
      );
      const docStrings = candidates.map(
        (a) => `${a.title}\n${a.excerpt ?? a.content?.slice(0, 500) ?? ""}`
      );
      const reranked = await rerank(lastUserMsg.content, docStrings, 5);
      const articles = reranked.map((r) => {
        const a = candidates[r.index];
        return a
          ? {
              id: a.id,
              title: a.title,
              slug: a.slug,
              excerpt: a.excerpt ?? null,
              client: a.client,
            }
          : null;
      }).filter(Boolean);

      saveChatbotMessage({
        userId: session.user.id,
        userQuery: lastUserMsg.content,
        assistantResponse: "",
        scopeType: "article",
        articleSlug: decodedSlug,
        articleId: article.id,
        categoryId: article.categoryId ?? undefined,
        outcome: "redirect",
      }).catch(() => {});
      return NextResponse.json({
        type: "redirect",
        articles,
        message: "اختر مقالاً وابدأ المحادثة هناك",
      });
    }

    // In-scope: RAG
    const chunks = chunkArticleContent(article.content);
    let { docs, topScore } = await retrieveFromChunks(lastUserMsg.content, chunks);

    if (process.env.NODE_ENV === "development") {
      console.debug("[article-chat-rag]", {
        source: "DB",
        topScore,
        docsCount: docs.length,
        threshold: RELEVANCE_THRESHOLD,
        dbMatch: docs.length > 0 && topScore >= RELEVANCE_THRESHOLD,
        query: lastUserMsg.content.slice(0, 60),
      });
    }

    if (docs.length === 0 || topScore < RELEVANCE_THRESHOLD) {
      const sameCategory = article.categoryId
        ? await db.article.findMany({
            where: {
              categoryId: article.categoryId,
              id: { not: article.id },
              status: ArticleStatus.PUBLISHED,
              OR: [
                { datePublished: null },
                { datePublished: { lte: new Date() } },
              ],
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
            take: 15,
          })
        : [];
      const candidateDocs = sameCategory.map(
        (a) => `${a.title}\n${a.excerpt ?? a.content?.slice(0, 500) ?? ""}`
      );
      if (candidateDocs.length > 0) {
        const rerankedSame = await rerank(lastUserMsg.content, candidateDocs, 5);
        const matchedArticles = rerankedSame
          .map((r) => sameCategory[r.index])
          .filter(Boolean)
          .map((a) => ({
            id: a!.id,
            title: a!.title,
            slug: a!.slug,
            excerpt: a!.excerpt ?? null,
            client: a!.client,
          }));
        if (matchedArticles.length > 0) {
          if (process.env.NODE_ENV === "development") {
            console.debug("[article-chat-flow] source=DB, outcome=redirect (same-category)", {
              articlesCount: matchedArticles.length,
            });
          }
          saveChatbotMessage({
            userId: session.user.id,
            userQuery: lastUserMsg.content,
            assistantResponse: "",
            scopeType: "article",
            articleSlug: decodedSlug,
            articleId: article.id,
            categoryId: article.categoryId ?? undefined,
            outcome: "redirect",
          }).catch(() => {});
          return NextResponse.json({
            type: "redirect",
            articles: matchedArticles,
            message: "عثرنا على مقالات ذات صلة في موضوعك",
          });
        }
      }
    }

    let serperSources: { title: string; link: string }[] = [];
    if (docs.length === 0) {
      try {
        const serperResults = await searchSerper(lastUserMsg.content, 8);
        serperSources = serperResults.map((r) => ({ title: r.title, link: r.link }));
        docs = serperResults.map((r, i) => ({
          id: `doc-web-${i}`,
          text: `${r.title}\n${r.snippet}\n${r.link}`,
        }));
        if (process.env.NODE_ENV === "development") {
          console.debug("[article-chat-flow] source=Serper, outcome=stream", { serperCount: docs.length });
        }
      } catch (err) {
        docs = [];
        if (process.env.NODE_ENV === "development") {
          console.debug("[article-chat-flow] source=Serper, outcome=error", { error: String(err) });
        }
      }
    } else if (process.env.NODE_ENV === "development") {
      console.debug("[article-chat-flow] source=DB, outcome=stream", { docsCount: docs.length });
    }

    const systemPrompt =
      docs.some((d) => d.id.startsWith("doc-web-"))
        ? "أنت مساعد يتحدث العربية. أجب بناءً على المستندات المقدمة فقط. في نهاية الإجابة أضف: المصدر: نتائج البحث على الويب"
        : "أنت مساعد يتحدث العربية. أجب بناءً على المستندات المقدمة فقط. إذا لم تجد إجابة في المستندات، قل ذلك بوضوح.";

    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    if (!wantStream) {
      const { chat } = await import("@/lib/cohere");
      const response = await chat(chatMessages, docs.length > 0 ? docs : undefined);
      const msg = response as { text?: string; message?: { content?: Array<{ text?: string }> } };
      const text =
        msg.text ??
        msg.message?.content?.[0]?.text ??
        "";
      const usedWebSource = docs.some((d) => d.id.startsWith("doc-web-"));
      saveChatbotMessage({
        userId: session.user.id,
        userQuery: lastUserMsg.content,
        assistantResponse: text,
        scopeType: "article",
        articleSlug: decodedSlug,
        articleId: article.id,
        categoryId: article.categoryId ?? undefined,
        outcome: "stream",
        source: usedWebSource ? "web" : "db",
        webSources: usedWebSource ? serperSources : undefined,
      }).catch(() => {});
      return NextResponse.json({ type: "message", text });
    }

    const usedWebSource = docs.some((d) => d.id.startsWith("doc-web-"));
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullText = "";
        try {
          for await (const chunk of chatStream(chatMessages, docs.length > 0 ? docs : undefined)) {
            fullText += chunk;
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: "delta", text: chunk }) + "\n")
            );
          }
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "done",
                ...(usedWebSource && { source: "web", sources: serperSources }),
              }) + "\n"
            )
          );
          saveChatbotMessage({
            userId: session.user.id,
            userQuery: lastUserMsg.content,
            assistantResponse: fullText,
            scopeType: "article",
            articleSlug: decodedSlug,
            articleId: article.id,
            categoryId: article.categoryId ?? undefined,
            outcome: "stream",
            source: usedWebSource ? "web" : "db",
            webSources: usedWebSource ? serperSources : undefined,
          }).catch(() => {});
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "حدث خطأ. حاول مرة أخرى.";
          console.error("Chat stream error:", err);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                error: process.env.NODE_ENV === "development" ? errMsg : "حدث خطأ. حاول مرة أخرى.",
              }) + "\n"
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حدث خطأ. حاول مرة أخرى.",
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
