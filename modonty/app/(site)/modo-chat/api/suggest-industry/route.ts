import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SubscriptionStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { embedTexts } from "@/app/(site)/modo-chat/data/embed-texts";

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

/**
 * Guesses which INDUSTRY a free-text question belongs to, so the visitor can just type.
 *
 * It used to guess a category, which quietly undid the whole scope: typing «أبغى دكتور أسنان»
 * landed in a content category holding one partner, while the twenty-one clinics sat in an
 * industry the answer never saw. Only industries with an active partner are offered — an
 * industry with none is a dead end no matter how well the words match.
 */
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

    const industries = await db.industry.findMany({
      where: { clients: { some: { subscriptionStatus: SubscriptionStatus.ACTIVE } } },
      select: { name: true, slug: true, description: true },
      take: 20,
    });

    if (industries.length === 0) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    const industryTexts = industries.map(
      (i) => `${i.name}${i.description ? `. ${i.description}` : ""}`
    );

    const [queryEmbs, industryEmbs] = await Promise.all([
      embedTexts([message], "search_query"),
      embedTexts(industryTexts, "search_document"),
    ]);

    if (!queryEmbs?.[0] || !industryEmbs?.length) {
      return NextResponse.json({ success: true, suggestion: null });
    }

    const queryEmb = queryEmbs[0];
    const scores = industryEmbs.map((emb, i) => ({
      industry: industries[i]!,
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
        slug: top.industry.slug,
        name: top.industry.name,
        confidence: top.score,
      },
    });
  } catch (error) {
    console.error("Suggest industry error:", error);
    return NextResponse.json({ success: true, suggestion: null });
  }
}
