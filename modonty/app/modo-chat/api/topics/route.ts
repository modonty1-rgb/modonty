import { NextResponse } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";

export interface ChatbotTopic {
  categoryName: string;
  categorySlug: string;
  description: string | null;
  socialImage: string | null;
  socialImageAlt: string | null;
  suggestedQuestion: string;
}

const QUESTION_TEMPLATES = [
  "ما الذي تهمك معرفته عن {name}؟",
  "ناقش أحدث مقالات {name}",
  "اسأل عن محتوى {name}",
];

function getSuggestedQuestion(categoryName: string, index: number): string {
  const template = QUESTION_TEMPLATES[index % QUESTION_TEMPLATES.length]!;
  return template.replace("{name}", categoryName);
}

export async function GET() {
  try {
    const baseWhere = {
      articles: {
        some: {
          status: ArticleStatus.PUBLISHED,
          OR: [
            { datePublished: null },
            { datePublished: { lte: new Date() } },
          ],
        },
      },
    };

    const categories = await db.category.findMany({
      where: baseWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        socialImage: true,
        socialImageAlt: true,
      },
      orderBy: { name: "asc" },
    });

    const topics: ChatbotTopic[] = categories.map((c, i) => ({
      categoryName: c.name,
      categorySlug: c.slug,
      description: c.description,
      socialImage: c.socialImage,
      socialImageAlt: c.socialImageAlt,
      suggestedQuestion: getSuggestedQuestion(c.name, i),
    }));

    return NextResponse.json({ success: true, topics });
  } catch (error) {
    console.error("Chatbot topics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
