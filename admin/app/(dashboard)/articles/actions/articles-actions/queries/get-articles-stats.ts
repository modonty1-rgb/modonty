"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { analyzeArticleSEO } from "../../../analyzer";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "@/app/(dashboard)/settings/helpers/get-article-defaults-from-settings";

export async function getArticlesStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, published, draft, scheduled, archived, publishedThisMonth, allArticles] =
      await Promise.all([
        db.article.count(),
        db.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
        db.article.count({ where: { status: ArticleStatus.DRAFT } }),
        db.article.count({
          where: {
            scheduledAt: { not: null },
            status: { not: ArticleStatus.PUBLISHED },
          },
        }),
        db.article.count({ where: { status: ArticleStatus.ARCHIVED } }),
        db.article.count({
          where: {
            status: ArticleStatus.PUBLISHED,
            datePublished: { gte: startOfMonth },
          },
        }),
        db.article.findMany({
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            status: true,
            wordCount: true,
            contentDepth: true,
            seoTitle: true,
            seoDescription: true,
            canonicalUrl: true,
            jsonLdStructuredData: true,
            featuredImageId: true,
            authorId: true,
            datePublished: true,
            createdAt: true,
            updatedAt: true,
            featuredImage: {
              select: {
                id: true,
                url: true,
                altText: true,
                width: true,
                height: true,
              },
            },
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            client: {
              select: {
                id: true,
                name: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            faqs: {
              select: {
                id: true,
                question: true,
                answer: true,
              },
            },
          },
        }),
      ]);

    const settings = await getAllSettings();
    const articleDefaults = getArticleDefaultsFromSettings(settings);

    const articleScores = allArticles.map((article) => {
      const articleWithDefaults = { ...article, ...articleDefaults };
      const scoreResult = analyzeArticleSEO(articleWithDefaults);
      return {
        article: articleWithDefaults,
        score: scoreResult.percentage,
      };
    });

    let averageSEO = 0;
    let averagePublishedSEO = 0;
    let averageDraftSEO = 0;
    let lowSEOCount = 0;
    let highSEOCount = 0;
    let needsImprovementCount = 0;

    if (articleScores.length > 0) {
      averageSEO = Math.round(
        articleScores.reduce((sum, item) => sum + item.score, 0) /
          articleScores.length
      );

      const publishedScores = articleScores.filter(
        (item) => item.article.status === ArticleStatus.PUBLISHED
      );
      if (publishedScores.length > 0) {
        averagePublishedSEO = Math.round(
          publishedScores.reduce((sum, item) => sum + item.score, 0) /
            publishedScores.length
        );
      }

      const draftScores = articleScores.filter(
        (item) =>
          item.article.status === ArticleStatus.DRAFT ||
          item.article.status === ArticleStatus.WRITING
      );
      if (draftScores.length > 0) {
        averageDraftSEO = Math.round(
          draftScores.reduce((sum, item) => sum + item.score, 0) /
            draftScores.length
        );
      }

      articleScores.forEach((item) => {
        if (item.score >= 80) {
          highSEOCount++;
        } else if (item.score < 60) {
          lowSEOCount++;
        } else {
          needsImprovementCount++;
        }
      });
    }

    return {
      total,
      published,
      draft,
      scheduled,
      archived,
      publishedThisMonth,
      averageSEO,
      averagePublishedSEO,
      averageDraftSEO,
      lowSEOCount,
      highSEOCount,
      needsImprovementCount,
    };
  } catch (error) {
    console.error("Error fetching articles stats:", error);
    return {
      total: 0,
      published: 0,
      draft: 0,
      scheduled: 0,
      archived: 0,
      publishedThisMonth: 0,
      averageSEO: 0,
      averagePublishedSEO: 0,
      averageDraftSEO: 0,
      lowSEOCount: 0,
      highSEOCount: 0,
      needsImprovementCount: 0,
    };
  }
}

