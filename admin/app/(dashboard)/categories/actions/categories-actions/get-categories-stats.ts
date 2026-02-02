"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { calculateSEOScore } from "@/helpers/utils/seo-score-calculator";
import { categorySEOConfig } from "../../helpers/category-seo-config";

export async function getCategoriesStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, withArticles, withoutArticles, createdThisMonth, allCategories] =
      await Promise.all([
        db.category.count(),
        db.category.count({
          where: {
            articles: {
              some: {
                status: ArticleStatus.PUBLISHED,
              },
            },
          },
        }),
        db.category.count({
          where: {
            articles: {
              none: {},
            },
          },
        }),
        db.category.count({
          where: {
            createdAt: { gte: startOfMonth },
          },
        }),
        db.category.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            seoTitle: true,
            seoDescription: true,
          },
        }),
      ]);

    let averageSEO = 0;
    if (allCategories.length > 0) {
      const scores = allCategories.map((category) => {
        const scoreResult = calculateSEOScore(category, categorySEOConfig);
        return scoreResult.percentage;
      });
      averageSEO = Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length,
      );
    }

    return {
      total,
      withArticles,
      withoutArticles,
      createdThisMonth,
      averageSEO,
    };
  } catch (error) {
    console.error("Error fetching categories stats:", error);
    return {
      total: 0,
      withArticles: 0,
      withoutArticles: 0,
      createdThisMonth: 0,
      averageSEO: 0,
    };
  }
}

