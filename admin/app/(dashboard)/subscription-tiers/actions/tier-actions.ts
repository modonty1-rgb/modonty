"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { SubscriptionTier, ArticleStatus } from "@prisma/client";

export const getTierConfigs = cache(async () => {
  try {
    const configs = await db.subscriptionTierConfig.findMany({
      include: {
        clients: {
          select: {
            id: true,
            _count: {
              select: {
                articles: {
                  where: {
                    status: ArticleStatus.PUBLISHED,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            clients: true,
          },
        },
      },
      orderBy: [
        { isActive: "desc" },
        { tier: "asc" },
      ],
    });

    const configsWithArticleCount = configs.map((config) => {
      const articleCount = config.clients.reduce(
        (sum, client) => sum + client._count.articles,
        0
      );
      return {
        ...config,
        articleCount,
      };
    });

    return configsWithArticleCount;
  } catch (error) {
    console.error("Error fetching tier configs:", error);
    return [];
  }
});

export const getTierConfigByTier = cache(async (tier: SubscriptionTier) => {
  try {
    const config = await db.subscriptionTierConfig.findUnique({
      where: { tier },
    });
    return config;
  } catch (error) {
    console.error("Error fetching tier config by tier:", error);
    return null;
  }
});

export const getActiveTierConfigs = cache(async () => {
  try {
    const configs = await db.subscriptionTierConfig.findMany({
      where: { isActive: true },
      orderBy: { tier: "asc" },
    });
    return configs;
  } catch (error) {
    console.error("Error fetching active tier configs:", error);
    return [];
  }
});

/**
 * الباقات التي يُوضَع عليها العميل — **من كتالوج البيع وحده** (خالد ١٥ سبتمبر ٢٠٢٦:
 * «قراري سورس أوف ترووث واحد»).
 *
 * ── ما كانت تفعله قبل اليوم ──
 * تجمع مصدرين قديمين: `subscriptionTierConfig` ومجموعة `Plan` الخام — وهي **جدول جبر
 * سيو نفسه**، تُقرأ بـ`$runCommandRaw` وتُوصَل بالاسم العربي. فكان اختيار باقة العميل
 * يعتمد على جدولٍ يملكه موقعٌ آخر، ويطابَق بنصٍّ لا بمفتاح.
 *
 * والنتيجة مقيسة على الشاشة الحيّة: «الزخم ٨ مقالات · ١٬٠٣٩ ريال» بينما المشتري يدفع
 * ١٬١٩٩ مقابل ١٢ مقالاً. ومنها كان يُحسب **الرصيد الافتتاحي** الذي يدخل تقرير المبيعات.
 *
 * ── الوصلة `tier` ──
 * `CommercialPlan.tier` يربط باقة البيع بتصنيف العميل التشغيلي، ومقيسٌ حيّاً في
 * القاعدتين: الانطلاقة⇢STANDARD · الزخم⇢PRO · الريادة⇢PREMIUM. وباقةٌ بلا `tier` أو
 * بلا سعرٍ لسوقها تُسقَط — عرضُ باقةٍ لا تُربط بتصنيف يُنتج عميلاً بلا حدود.
 *
 * ⚠ القيد المقبول بقرار خالد: **باقة منشورة واحدة لكل تصنيف**. باقتان بنفس `tier`
 * تجعلان الاختيار غامضاً، فتُؤخَذ الأولى بـ`displayOrder`.
 *
 * ── لا سعر سنويّ ──
 * الشكل المُرجَع يبقى `{ SA: {mo,yr}, EG: {mo,yr} }` كما تتوقّعه الشاشات، لكن
 * `yr === mo`: الكتالوج لا يخزّن سعراً سنوياً مخفَّضاً — خصمُ المدّة عنده **شهور هدية**
 * في `CommercialTermPolicy`. ومن `yr` المختلف عن `mo` في الجدول القديم جاء الرقم
 * ١٬٠٣٩ الذي ناقض ١٬٢٩٩ في شاشةٍ أخرى.
 */
export const getSellableTierConfigs = cache(async () => {
  try {
    const plans = await db.commercialPlan.findMany({
      where: { isPublished: true, tier: { not: null } },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        tier: true,
        name: true,
        articlesPerMonth: true,
        featuredBadge: true,
        prices: {
          where: { isActive: true },
          select: { market: true, monthlyBase: true },
        },
      },
    });

    const seen = new Set<SubscriptionTier>();
    return plans.flatMap((plan) => {
      const tier = plan.tier;
      if (!tier || seen.has(tier)) return [];

      const sa = plan.prices.find((p) => p.market === "SA")?.monthlyBase;
      const eg = plan.prices.find((p) => p.market === "EG")?.monthlyBase;
      if (sa == null && eg == null) return [];

      seen.add(tier);
      const saMo = sa ?? 0;
      const egMo = eg ?? 0;
      return [{
        id: plan.id,
        tier,
        name: plan.name,
        articlesPerMonth: plan.articlesPerMonth ?? 0,
        price: saMo,
        isPopular: Boolean(plan.featuredBadge),
        pricing: { SA: { mo: saMo, yr: saMo }, EG: { mo: egMo, yr: egMo } },
      }];
    });
  } catch (error) {
    console.error("Error fetching sellable tier configs:", error);
    return [];
  }
});
