import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ArticleStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { chunkArticleContent } from "@/lib/rag/chunk";
import { retrieveFromChunks } from "@/lib/rag/retrieve";
import { isOutOfScope, isGreetingOrShortPleasantry } from "@/lib/rag/scope";
import { buildCategoryDbPrompt, buildCategoryWebPrompt, hasTrustedContent } from "@/lib/rag/prompts";
import { chatStream, type ChatMessage } from "@/lib/cohere";
import { searchSerper } from "@/lib/serper";
import { saveChatbotMessage } from "@/lib/chat/save-chatbot-message";
import type { ApiResponse } from "@/lib/types";

const bodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().max(2000),
    })
  ),
  categorySlug: z.string().min(1),
  stream: z.boolean().optional().default(true),
});

/** Rerank relevance threshold: use rerank score for redirect. Cohere: 0–1, higher = more relevant. */
const RERANK_REDIRECT_THRESHOLD = 0.6;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لاستخدام مدونتي الذكية" } as ApiResponse<never>,
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const { messages, categorySlug, stream: wantStream } = parsed.data;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg?.content?.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const category = await db.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true, name: true },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" } as ApiResponse<never>,
        { status: 404 }
      );
    }

    const scopeArticles = await db.article.findMany({
      where: {
        categoryId: category.id,
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
      take: 30,
    });

    const scopeParts = scopeArticles
      .slice(0, 5)
      .flatMap((a) => [a.title, a.excerpt ?? a.content?.slice(0, 150) ?? ""].filter(Boolean));
    const scopeExcerpt = scopeParts.join(" ").slice(0, 600);

    if (process.env.NODE_ENV === "development") {
      console.debug("[chatbot-scope]", {
        categorySlug,
        categoryName: category.name,
        scopeExcerptLen: scopeExcerpt.length,
        scopeExcerptSample: scopeExcerpt.slice(0, 200),
        query: lastUserMsg.content.slice(0, 80),
      });
    }

    const outOfScope = await isOutOfScope(lastUserMsg.content, {
      categoryName: category.name,
      articleExcerpt: scopeExcerpt || undefined,
    });

    if (outOfScope) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[chatbot] outOfScope=true, returning early");
      }
      saveChatbotMessage({
        userId: session.user.id,
        userQuery: lastUserMsg.content,
        assistantResponse: "سؤالك خارج نطاق هذا الموضوع. يمكنك اختيار موضوع آخر.",
        scopeType: "category",
        categorySlug,
        categoryId: category.id,
        outcome: "outOfScope",
      }).catch(() => {});
      return NextResponse.json({
        type: "outOfScope",
        message: "سؤالك خارج نطاق هذا الموضوع. يمكنك اختيار موضوع آخر.",
      });
    }

    const allChunks: string[] = [];
    for (const a of scopeArticles) {
      const chunks = chunkArticleContent(a.content ?? "");
      for (const c of chunks) {
        allChunks.push(`${a.title}\n\n${c}`);
      }
    }

    // Identity/greeting questions — skip RAG, let Cohere answer from system prompt
    const isIdentityQuestion = isGreetingOrShortPleasantry(lastUserMsg.content);

    let { docs, topScore, topRerankScore } = isIdentityQuestion
      ? { docs: [], topScore: 0, topRerankScore: 0 }
      : await retrieveFromChunks(lastUserMsg.content, allChunks);

    if (process.env.NODE_ENV === "development") {
      console.debug("[chatbot-rag]", {
        source: "DB",
        topScore,
        topRerankScore,
        docsCount: docs.length,
        threshold: RERANK_REDIRECT_THRESHOLD,
        dbMatch: docs.length > 0 && topRerankScore >= RERANK_REDIRECT_THRESHOLD,
        query: lastUserMsg.content.slice(0, 60),
      });
    }

    if (!isIdentityQuestion && docs.length > 0 && topRerankScore >= RERANK_REDIRECT_THRESHOLD) {
      const titleToArticle = new Map(scopeArticles.map((a) => [a.title, a]));
      const matchedArticles: { id: string; title: string; slug: string; excerpt: string | null; client: { name: string; slug: string } }[] = [];
      const seen = new Set<string>();
      for (const d of docs) {
        const firstLine = d.text.split("\n\n")[0]?.trim();
        const article = firstLine ? titleToArticle.get(firstLine) : undefined;
        if (article && !seen.has(article.id)) {
          seen.add(article.id);
          matchedArticles.push({
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt ?? null,
            client: article.client,
          });
        }
      }
      if (matchedArticles.length > 0) {
        if (process.env.NODE_ENV === "development") {
          console.debug("[chatbot-flow] source=DB, outcome=redirect", { articlesCount: matchedArticles.length });
        }
        saveChatbotMessage({
          userId: session.user.id,
          userQuery: lastUserMsg.content,
          assistantResponse: "",
          scopeType: "category",
          categorySlug,
          categoryId: category.id,
          outcome: "redirect",
        }).catch(() => {});
        return NextResponse.json({
          type: "redirect",
          articles: matchedArticles,
          message: "عثرنا على مقالات ذات صلة في موضوعك",
        });
      }
    }

    let serperSources: { title: string; link: string }[] = [];
    let suggestedArticle: { id: string; title: string; slug: string; excerpt: string | null; client: { name: string; slug: string } } | null = null;

    if (!isIdentityQuestion && (docs.length === 0 || topRerankScore < RERANK_REDIRECT_THRESHOLD)) {
      try {
        const serperQuery = `${lastUserMsg.content} ${category.name}`.trim();
        const serperResults = await searchSerper(serperQuery, 8);

        // CHAT-4: trusted sources check — require at least 2 meaningful snippets
        if (!hasTrustedContent(serperResults)) {
          saveChatbotMessage({
            userId: session.user.id,
            userQuery: lastUserMsg.content,
            assistantResponse: "لم أعثر على مصادر موثوقة كافية للإجابة على هذا السؤال.",
            scopeType: "category",
            categorySlug,
            categoryId: category.id,
            outcome: "outOfScope",
          }).catch(() => {});
          return NextResponse.json({
            type: "noSources",
            message: "لم أعثر على مصادر موثوقة كافية للإجابة على هذا السؤال.",
          });
        }

        serperSources = serperResults.map((r) => ({ title: r.title, link: r.link }));
        docs = serperResults.map((r, i) => ({
          id: `doc-web-${i}`,
          text: `${r.title}\n${r.snippet}\n${r.link}`,
        }));

        // CHAT-3: fetch most-viewed article in this category to suggest after web answer
        suggestedArticle = await db.article.findFirst({
          where: {
            categoryId: category.id,
            status: ArticleStatus.PUBLISHED,
            OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            client: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { views: { _count: "desc" } },
        });

        if (process.env.NODE_ENV === "development") {
          console.debug("[chatbot-flow] source=Serper, outcome=stream", {
            serperCount: docs.length,
            sourcesCount: serperSources.length,
            suggestedArticle: suggestedArticle?.slug,
            query: serperQuery.slice(0, 60),
          });
        }
      } catch (serperErr) {
        docs = [];
        if (process.env.NODE_ENV === "development") {
          console.debug("[chatbot-flow] source=Serper, outcome=error", { error: String(serperErr) });
        }
      }
    } else if (process.env.NODE_ENV === "development") {
      console.debug("[chatbot-flow] source=DB, outcome=stream", { docsCount: docs.length });
    }

    const usedWebSource = docs.some((d) => d.id.startsWith("doc-web-"));
    const systemPrompt = usedWebSource
      ? buildCategoryWebPrompt(category.name)
      : buildCategoryDbPrompt(category.name);

    const chatMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.content.trim().length > 0),
    ];

    if (!wantStream) {
      const { chat } = await import("@/lib/cohere");
      const response = await chat(chatMessages, docs.length > 0 ? docs : undefined);
      const msg = response as { text?: string; message?: { content?: Array<{ text?: string }> } };
      const text = msg.text ?? msg.message?.content?.[0]?.text ?? "";
      saveChatbotMessage({
        userId: session.user.id,
        userQuery: lastUserMsg.content,
        assistantResponse: text,
        scopeType: "category",
        categorySlug,
        categoryId: category.id,
        outcome: "stream",
        source: usedWebSource ? "web" : "db",
        webSources: usedWebSource ? serperSources : undefined,
      }).catch(() => {});
      return NextResponse.json({
        type: "message",
        text,
        ...(usedWebSource && suggestedArticle && { suggestedArticle }),
      });
    }

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
                ...(usedWebSource && suggestedArticle && { suggestedArticle }),
              }) + "\n"
            )
          );
          saveChatbotMessage({
            userId: session.user.id,
            userQuery: lastUserMsg.content,
            assistantResponse: fullText,
            scopeType: "category",
            categorySlug,
            categoryId: category.id,
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
    console.error("Chatbot chat API error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ. حاول مرة أخرى." } as ApiResponse<never>,
      { status: 500 }
    );
  }
}
