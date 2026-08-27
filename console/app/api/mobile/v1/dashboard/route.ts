import type { NextRequest } from "next/server";
import { ArticleStatus, ArticleFAQStatus, CommentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";

const subscriptionStatusLabels: Record<string, string> = { ACTIVE: "نشط", PENDING: "بانتظار التفعيل", EXPIRED: "منتهي", SUSPENDED: "معلّق", CANCELLED: "ملغي" };

function priceForClient(pricing: unknown, country: string | null, billingCycle: string | null) {
  if (!pricing || typeof pricing !== "object" || !("SA" in pricing) || !("EG" in pricing)) return null;
  const record = pricing as { SA?: { mo?: unknown; yr?: unknown }; EG?: { mo?: unknown; yr?: unknown } };
  const isEgypt = /مصر|egypt|\beg\b/i.test(country ?? "");
  const point = isEgypt ? record.EG : record.SA;
  const amount = billingCycle === "annual" ? point?.yr : point?.mo;
  if (typeof amount !== "number") return null;
  const currency = isEgypt ? "EGP" : "SAR";
  return { amount, currency, display: new Intl.NumberFormat(isEgypt ? "ar-EG" : "ar-SA", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount) };
}

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const clientId = session.clientId;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const [client, pendingApproval, pendingQuestions, pendingComments, pendingVideos, recentArticles, articlesPublishedThisMonth] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        articlesPerMonth: true,
        billingCycle: true,
        addressCountry: true,
        subscriptionTierConfig: { select: { name: true, pricing: true } },
      },
    }),
    db.article.count({ where: { clientId, status: ArticleStatus.AWAITING_APPROVAL } }),
    db.articleFAQ.count({ where: { article: { clientId }, status: ArticleFAQStatus.PENDING } }),
    db.comment.count({ where: { article: { clientId }, status: CommentStatus.PENDING } }),
    db.media.count({ where: { clientId, inReels: true, reelStatus: "PENDING_APPROVAL" } }),
    db.article.findMany({ where: { clientId }, orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
    db.article.count({ where: { clientId, status: ArticleStatus.PUBLISHED, createdAt: { gte: startOfMonth } } }),
  ]);
  const articleLimit = client?.articlesPerMonth ?? null;
  const today = new Date();
  const daysRemaining = client?.subscriptionEndDate ? Math.max(Math.ceil((client.subscriptionEndDate.getTime() - today.getTime()) / 86_400_000), 0) : null;
  const durationDays = client?.subscriptionStartDate && client.subscriptionEndDate
    ? Math.max(Math.ceil((client.subscriptionEndDate.getTime() - client.subscriptionStartDate.getTime()) / 86_400_000), 0)
    : null;
  const subscription = client ? {
    status: client.subscriptionStatus,
    statusLabel: subscriptionStatusLabels[client.subscriptionStatus] ?? client.subscriptionStatus,
    tier: client.subscriptionTier,
    tierName: client.subscriptionTierConfig?.name ?? client.subscriptionTier,
    startDate: client.subscriptionStartDate,
    endDate: client.subscriptionEndDate,
    daysRemaining,
    durationDays,
    articlesPerMonth: articleLimit,
    articlesPublishedThisMonth,
    articlesRemaining: articleLimit === null ? null : Math.max(articleLimit - articlesPublishedThisMonth, 0),
    price: priceForClient(client.subscriptionTierConfig?.pricing, client.addressCountry, client.billingCycle),
  } : null;
  return ok({ summary: { pendingApproval, pendingQuestions, pendingComments, pendingVideos }, recentArticles, subscription });
}
