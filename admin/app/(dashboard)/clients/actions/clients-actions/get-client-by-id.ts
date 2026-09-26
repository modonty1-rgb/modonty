"use server";

import { db } from "@/lib/db";

export async function getClientById(id: string) {
  try {
    const client = await db.client.findUnique({
      where: { id },
      include: {
        logoMedia: {
          select: {
            id: true,
            url: true,
            bunnyUrl: true, blurDataURL: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        heroImageMedia: {
          select: {
            id: true,
            url: true,
            bunnyUrl: true, blurDataURL: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        // The phone image (26 Sep 2026) — the header's «Mobile» door reads it.
        mobileHeroImageMedia: {
          select: { id: true, url: true, bunnyUrl: true, blurDataURL: true, altText: true },
        },
        industry: {
          select: {
            id: true,
            name: true,
          },
        },
        // (سقط جلبُ `subscriptionTierConfig` — ١٩ سبتمبر ٢٠٢٦: بلا قارئ.)
        parentOrganization: {
          select: {
            id: true,
            name: true,
            url: true,
            slug: true,
          },
        },
        _count: {
          select: {
            articles: true,
            // عددُ وثائقه — تعرضه بطاقةُ «من الكونسول» بلا جلب الصفوف نفسِها.
            documents: true,
          },
        },
      },
    });
    if (!client) return null;

    /**
     * **الباقةُ من الطلب الساري** — باستعلامٍ ثانٍ، لا `include`.
     *
     * `Client.activeOrderId` معرّفٌ مجرَّدٌ بلا علاقةٍ في السكيما (`schema.prisma:164`)،
     * وهذا مقصود: الطلبُ يُحذف أو يُؤرشَف بلا أن يتسلسل الحذفُ إلى كرت العميل. فالقراءةُ
     * استعلامٌ مستقلّ.
     *
     * ولماذا أصلاً: صار الطلبُ مصدرَ الحقيقة للباقة والمبلغ والمدّة، و`subscriptionTierConfig`
     * بقيّةُ عالمٍ قديم لا يُكتب فيه أحد — فمن فُعِّل اليوم لا صفَّ له هناك، وكانت شاشتُه
     * تقول «بلا باقة» وهو اشترى ودفع.
     */
    const activeOrder = client.activeOrderId
      ? await db.checkoutOrder.findUnique({
          where: { id: client.activeOrderId },
          select: {
            id: true, number: true, status: true, market: true, country: true,
            planName: true, articlesPerMonth: true,
            paidMonths: true, bonusServiceMonths: true,
            monthlyBaseMinor: true, subtotalMinor: true, vatRateBp: true, vatMinor: true,
            totalMinor: true, currency: true,
            paidAt: true, activatedAt: true, serviceStartedAt: true,
            salesRepId: true, isInternal: true,
            transactions: {
              select: { provider: true, providerReference: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        })
      : null;

    // اسمُ المندوب — `salesRepId` معرّفٌ مجرَّدٌ بلا علاقةٍ كذلك، فاستعلامٌ ثالثٌ لا `include`.
    const salesRep = activeOrder?.salesRepId
      ? await db.staff.findUnique({ where: { id: activeOrder.salesRepId }, select: { name: true } })
      : null;

    return { ...client, activeOrder: activeOrder ? { ...activeOrder, salesRepName: salesRep?.name ?? null } : null };
  } catch (error) {
    console.error("Error fetching client:", error);
    return null;
  }
}

