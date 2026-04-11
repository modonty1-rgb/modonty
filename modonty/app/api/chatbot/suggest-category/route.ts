import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ArticleStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { embed } from "@/lib/cohere";

const bodySchema = z.object({
  message: z.string().min(1).max(500),
});

const SUGGESTION_THRESHOLD = 0.35;

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    const { message } = parsed.data;

    const categories = await db.category.findMany({
      where: {
        articles: {
          some: {
            status: ArticleStatus.PUBLISHED,
            OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
          },
        },
      },
      select: { id: true, name: true, slug: true, description: true, socialImage: true, socialImageAlt: true },
    });

    if (categories.length === 0) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    const categoryTexts = categories.map(
      (c) => `${c.name}${c.description ? `. ${c.description}` : ""}`
    );

    const [queryEmbs, catEmbs] = await Promise.all([
      embed([message], "search_query"),
      embed(categoryTexts, "search_document"),
    ]);

    if (!queryEmbs?.[0] || !catEmbs?.length) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    const queryEmb = queryEmbs[0];
    const scores = catEmbs.map((emb, i) => ({
      category: categories[i]!,
      score: cosineSimilarity(queryEmb, emb),
    }));
    scores.sort((a, b) => b.score - a.score);
    const top = scores[0];

    if (!top || top.score < SUGGESTION_THRESHOLD) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    return NextResponse.json({
      success: true,
      suggestion: {
        slug: top.category.slug,
        name: top.category.name,
        socialImage: top.category.socialImage,
        socialImageAlt: top.category.socialImageAlt,
        confidence: top.score,
      },
    });
  } catch (error) {
    console.error("Suggest category error:", error);
    return NextResponse.json({ success: true, suggestion: null });
  }
}
