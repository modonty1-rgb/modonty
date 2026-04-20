"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ChatbotQuestionGroup {
  question: string;
  count: number;
  lastAsked: Date;
  scopeType: string;
  articleSlug: string | null;
  articleId: string | null;
  categorySlug: string | null;
  bestAnswer: string | null;
  bestMessageId: string;
  source: string | null;
}

export async function getChatbotQuestions() {
  const session = await auth();
  if (!session) return [];

  const messages = await db.chatbotMessage.findMany({
    select: {
      id: true,
      userQuery: true,
      assistantResponse: true,
      scopeType: true,
      articleSlug: true,
      articleId: true,
      categorySlug: true,
      source: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });

  const map = new Map<string, ChatbotQuestionGroup>();
  for (const msg of messages) {
    const key = msg.userQuery.trim().toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.count++;
      if (msg.createdAt > existing.lastAsked) existing.lastAsked = msg.createdAt;
    } else {
      map.set(key, {
        question: msg.userQuery,
        count: 1,
        lastAsked: msg.createdAt,
        scopeType: msg.scopeType ?? "article",
        articleSlug: msg.articleSlug,
        articleId: msg.articleId,
        categorySlug: msg.categorySlug,
        bestAnswer: msg.assistantResponse,
        bestMessageId: msg.id,
        source: msg.source,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export async function getChatbotStats() {
  const session = await auth();
  if (!session) return { total: 0, converted: 0 };

  const [total, converted] = await Promise.all([
    db.chatbotMessage.count(),
    db.articleFAQ.count({ where: { source: "chatbot" } }),
  ]);

  return { total, converted };
}

export async function convertToArticleFaq(data: {
  articleId: string;
  question: string;
  answer: string;
}) {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  if (!data.question.trim()) return { success: false, error: "Question is required" };
  if (!data.answer.trim()) return { success: false, error: "Answer is required" };

  try {
    const maxPos = await db.articleFAQ.findFirst({
      where: { articleId: data.articleId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    await db.articleFAQ.create({
      data: {
        articleId: data.articleId,
        question: data.question,
        answer: data.answer,
        position: (maxPos?.position ?? -1) + 1,
        status: "PENDING",
        source: "chatbot",
      },
    });

    revalidatePath("/chatbot-questions");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create FAQ";
    return { success: false, error: message };
  }
}
