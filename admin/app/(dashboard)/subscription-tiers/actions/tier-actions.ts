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

/**
 * سقطت `getCatalogArticlesPerMonth` (١٧ سبتمبر ٢٠٢٦) — بصفر مستهلك.
 *
 * كانت تبحث في الكتالوج بـ`CommercialPlan.tier`، والحقلُ سقط في نفس اليوم. ومَن
 * أراد حصّةَ باقةٍ يقرؤها بالسلَق (`lib/pricing/get-tier-pricing.ts`) — وهو ما يفعله
 * كلُّ قارئٍ قائم فعلاً.
 */

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
 * سقطت `getSellableTierConfigs` (١٧ سبتمبر ٢٠٢٦) — خمسون سطراً بصفر مستهلك.
 *
 * كانت تختار باقات البيع وتُسقط ما لا `tier` له، وتُبقي **واحدةً لكل فئة** عبر
 * `new Set<SubscriptionTier>()`. وهذا هو قفصُ «أربع باقاتٍ للأبد» بعينه: الإنم أربعُ
 * قيم، فالمعروضُ أربعةٌ مهما كبر الكتالوج.
 *
 * سقط الحقلُ `CommercialPlan.tier` نفسُه في نفس اليوم، فلم يبقَ للدالّة ما تبني عليه
 * — ولا قارئَ يطلبها. فمَن احتاج قائمةَ الباقات يقرأ الكتالوج بالسلَق مباشرةً
 * (`lib/pricing/get-tier-pricing.ts`).
 */
