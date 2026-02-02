"use server";

import { generateComprehensiveArticleData } from "@/lib/openai-article-generator";

export interface GenerateArticleAIRequest {
  keywords: string;
  length: "short" | "medium" | "long";
  clientId?: string;
  categoryId?: string;
}

export interface GenerateArticleAIResponse {
  success: boolean;
  data?: {
    title: string;
    content: string;
    excerpt: string;
    seoTitle: string;
    seoDescription: string;
    keywords: string[];
    faqs: Array<{ question: string; answer: string }>;
    wordCount: number;
    readingTimeMinutes: number;
    contentDepth: "short" | "medium" | "long";
  };
  error?: string;
}

export async function generateArticleAI(
  request: GenerateArticleAIRequest
): Promise<GenerateArticleAIResponse> {
  try {
    // Input validation
    if (!request.keywords || request.keywords.trim().length === 0) {
      return {
        success: false,
        error: "الكلمات المفتاحية مطلوبة",
      };
    }

    if (!["short", "medium", "long"].includes(request.length)) {
      return {
        success: false,
        error: "طول المقال غير صحيح",
      };
    }

    // Fetch client and category names if IDs provided
    let clientName: string | undefined;
    let categoryName: string | undefined;

    if (request.clientId) {
      try {
        const { db } = await import("@/lib/db");
        const client = await db.client.findUnique({
          where: { id: request.clientId },
          select: { name: true },
        });
        clientName = client?.name;
      } catch (error) {
        // Continue without client name if fetch fails
        console.warn("Failed to fetch client name:", error);
      }
    }

    if (request.categoryId) {
      try {
        const { db } = await import("@/lib/db");
        const category = await db.category.findUnique({
          where: { id: request.categoryId },
          select: { name: true },
        });
        categoryName = category?.name;
      } catch (error) {
        // Continue without category name if fetch fails
        console.warn("Failed to fetch category name:", error);
      }
    }

    // Generate article
    const articleData = await generateComprehensiveArticleData({
      keywords: request.keywords.trim(),
      length: request.length,
      clientName,
      categoryName,
    });

    return {
      success: true,
      data: articleData,
    };
  } catch (error) {
    console.error("Error generating article with AI:", error);

    // User-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        return {
          success: false,
          error: "مفتاح OpenAI API غير مُكوّن",
        };
      }
      if (error.message.includes("rate limit") || error.message.includes("429")) {
        return {
          success: false,
          error: "تم تجاوز الحد المسموح. يرجى الانتظار قليلاً والمحاولة مرة أخرى",
        };
      }
      if (error.message.includes("network") || error.message.includes("fetch")) {
        return {
          success: false,
          error: "فشل الاتصال بخدمة AI. يرجى المحاولة مرة أخرى",
        };
      }
      if (error.message.includes("parse") || error.message.includes("JSON")) {
        return {
          success: false,
          error: "استجابة AI غير صحيحة. يرجى المحاولة مرة أخرى",
        };
      }
      return {
        success: false,
        error: error.message || "حدث خطأ أثناء توليد المقال",
      };
    }

    return {
      success: false,
      error: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى",
    };
  }
}
