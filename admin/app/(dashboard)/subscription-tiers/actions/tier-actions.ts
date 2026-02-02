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
