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
 * The tiers a client can actually be put on — the SAME set the Subscription Tiers page
 * sells: the VISIBLE rows of the jbrseo `Plan` collection (the trusted source). The
 * `subscriptionTierConfig` table carries an extra internal «مجاني» (BASIC) tier that the
 * Plan source hides, which is why the client selector must not read `subscriptionTierConfig`
 * directly (Khalid 2026-07-25). The two are joined by their canonical Arabic name — the one
 * key they share (Plan uses slug, config uses the SubscriptionTier enum). Ordered to match
 * the page (Plan.displayOrder).
 */
export const getSellableTierConfigs = cache(async () => {
  try {
    const [configs, planRes] = await Promise.all([
      db.subscriptionTierConfig.findMany({ where: { isActive: true } }),
      db.$runCommandRaw({ find: "Plan", filter: {}, batchSize: 1000 }),
    ]);

    const planDocs =
      ((planRes as unknown as { cursor?: { firstBatch?: Array<{ name: string; visible?: boolean; displayOrder?: number }> } })
        .cursor?.firstBatch ?? []).filter((p) => p.visible !== false);

    // name → displayOrder, from the visible plans (the sellable set).
    const order = new Map<string, number>();
    for (const p of planDocs) {
      if (!order.has(p.name)) order.set(p.name, p.displayOrder ?? 999);
    }

    return configs
      .filter((c) => order.has(c.name))
      .sort((a, b) => (order.get(a.name) ?? 999) - (order.get(b.name) ?? 999));
  } catch (error) {
    console.error("Error fetching sellable tier configs:", error);
    return [];
  }
});

export async function updateTierConfig(
  id: string,
  data: {
    name?: string;
    articlesPerMonth?: number;
    price?: number;
    isActive?: boolean;
    isPopular?: boolean;
    description?: string | null;
  }
) {
  try {
    const updated = await db.subscriptionTierConfig.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    revalidatePath("/subscription-tiers");
    revalidatePath("/clients");
    return { success: true, config: updated };
  } catch (error) {
    console.error("Error updating tier config:", error);
    const message = error instanceof Error ? error.message : "Failed to update tier config";
    return { success: false, error: message };
  }
}

export async function createTierConfig(data: {
  tier: SubscriptionTier;
  name: string;
  articlesPerMonth: number;
  price: number;
  isActive?: boolean;
  isPopular?: boolean;
  description?: string | null;
}) {
  try {
    const created = await db.subscriptionTierConfig.create({
      data: {
        tier: data.tier,
        name: data.name,
        articlesPerMonth: data.articlesPerMonth,
        price: data.price,
        isActive: data.isActive ?? true,
        isPopular: data.isPopular ?? false,
        description: data.description,
      },
    });
    revalidatePath("/subscription-tiers");
    revalidatePath("/clients");
    return { success: true, config: created };
  } catch (error) {
    console.error("Error creating tier config:", error);
    const message = error instanceof Error ? error.message : "Failed to create tier config";
    return { success: false, error: message };
  }
}

export async function deleteTierConfig(id: string) {
  try {
    const updated = await db.subscriptionTierConfig.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
    revalidatePath("/subscription-tiers");
    revalidatePath("/clients");
    return { success: true, config: updated };
  } catch (error) {
    console.error("Error deleting tier config:", error);
    const message = error instanceof Error ? error.message : "Failed to delete tier config";
    return { success: false, error: message };
  }
}
