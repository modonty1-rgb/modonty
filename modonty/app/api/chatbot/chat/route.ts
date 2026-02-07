import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ArticleStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getArticlesForOutOfScopeSearch } from "@/app/articles/[slug]/helpers/article-data";
import { chunkArticleContent } from "@/lib/rag/chunk";
import { retrieveFromChunks } from "@/lib/rag/retrieve";
import { isOutOfScope } from "@/lib/rag/scope";
import { chatStream, rerank, type ChatMessage } from "@/lib/cohere";
import { searchSerper } from "@/lib/serper";
import type { ApiResponse } from "@/app/api/helpers/types";

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

const RELEVANCE_THRESHOLD = 0.28;

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
      select: { id: true, title: true, slug: true, excerpt: true, content: true },
      orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
      take: 30,
    });

    const allChunks: string[] = [];
    for (const a of scopeArticles) {
      const chunks = chunkArticleContent(a.content ?? "");
      for (const c of chunks) {
        allChunks.push(`${a.title}\n\n${c}`);
      }
    }

    let { docs, topScore } = await retrieveFromChunks(lastUserMsg.content, allChunks);

    if (docs.length === 0 || topScore < RELEVANCE_THRESHOLD) {
      const scopeExcerpt = scopeArticles
        .slice(0, 3)
        .map((a) => a.excerpt ?? a.content?.slice(0, 200) ?? "")
        .filter(Boolean)
        .join(" ")
        .slice(0, 500);
      const outOfScope = await isOutOfScope(lastUserMsg.content, {
        categoryName: category.name,
        articleExcerpt: scopeExcerpt || undefined,
      });

      if (outOfScope) {
        const otherArticles = await getArticlesForOutOfScopeSearch(category.id, 20);
        const docStrings = otherArticles.map(
          (a) => `${a.title}\n${a.excerpt ?? a.content?.slice(0, 500) ?? ""}`
        );
        if (docStrings.length > 0) {
          const reranked = await rerank(lastUserMsg.content, docStrings, 5);
          const articles = reranked
            .map((r) => {
              const a = otherArticles[r.index];
              return a
                ? {
                    id: a.id,
                    title: a.title,
                    slug: a.slug,
                    excerpt: a.excerpt ?? null,
                    client: a.client,
                  }
                : null;
            })
            .filter(Boolean);

          return NextResponse.json({
            type: "redirect",
            articles,
            message: "لم نجد إجابة في مقالات هذا الموضوع. جرّب هذه المقالات من مواضيع أخرى",
          });
        }
      }

      try {
        const serperResults = await searchSerper(lastUserMsg.content, 8);
        docs = serperResults.map((r, i) => ({
          id: `doc-web-${i}`,
          text: `${r.title}\n${r.snippet}\n${r.link}`,
        }));
      } catch (serperErr) {
        docs = [];
      }
    }

    const systemPrompt = docs.some((d) => d.id.startsWith("doc-web-"))
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
      const text = msg.text ?? msg.message?.content?.[0]?.text ?? "";
      return NextResponse.json({ type: "message", text });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatStream(chatMessages, docs.length > 0 ? docs : undefined)) {
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: "delta", text: chunk }) + "\n")
            );
          }
          controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
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
