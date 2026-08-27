import type { NextRequest } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

const ALLOWED_STATUSES = new Set(Object.values(ArticleStatus));

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const requested = request.nextUrl.searchParams.get("status");
  if (requested && !ALLOWED_STATUSES.has(requested as ArticleStatus)) return fail("VALIDATION_ERROR", "حالة المقال غير صالحة.");
  const articles = await db.article.findMany({
    where: { clientId: session.clientId, ...(requested ? { status: requested as ArticleStatus } : {}) },
    select: { id: true, title: true, slug: true, excerpt: true, status: true, wordCount: true, scheduledAt: true, datePublished: true, updatedAt: true, createdAt: true, isClientSiteArticle: true, canonicalUrl: true, featuredImage: { select: { url: true, bunnyUrl: true, altText: true } }, category: { select: { name: true } } },
    orderBy: { updatedAt: "desc" }, take: 100,
  });
  return ok({ articles });
}
