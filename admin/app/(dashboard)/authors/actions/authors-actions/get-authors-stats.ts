"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { calculateSEOScore } from "@/helpers/utils/seo-score-calculator";
import { authorSEOConfig } from "../../helpers/author-seo-config";
import { getModontyAuthor } from "./get-modonty-author";

export async function getAuthorsStats() {
  try {
    const modontyAuthor = await getModontyAuthor();
    if (!modontyAuthor) {
      return {
        total: 0,
        withArticles: 0,
        withoutArticles: 0,
        createdThisMonth: 0,
        averageSEO: 0,
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        archivedArticles: 0,
        socialProfilesCount: 0,
        eetatSignalsCount: 0,
      };
    }

    const articleCount = modontyAuthor._count.articles;
    const [publishedArticleCount, draftArticleCount, archivedArticleCount] = await Promise.all([
      db.article.count({
        where: {
          authorId: modontyAuthor.id,
          status: ArticleStatus.PUBLISHED,
        },
      }),
      db.article.count({
        where: {
          authorId: modontyAuthor.id,
          status: ArticleStatus.DRAFT,
        },
      }),
      db.article.count({
        where: {
          authorId: modontyAuthor.id,
          status: ArticleStatus.ARCHIVED,
        },
      }),
    ]);

    const scoreResult = calculateSEOScore(modontyAuthor, authorSEOConfig);

    const socialProfilesCount = [
      modontyAuthor.linkedIn,
      modontyAuthor.twitter,
      modontyAuthor.facebook,
      ...(modontyAuthor.sameAs || []),
    ].filter(Boolean).length;

    const eetatSignalsCount = [
      modontyAuthor.jobTitle ? 1 : 0,
      modontyAuthor.credentials && modontyAuthor.credentials.length > 0 ? 1 : 0,
      modontyAuthor.expertiseAreas && modontyAuthor.expertiseAreas.length > 0 ? 1 : 0,
      modontyAuthor.verificationStatus ? 1 : 0,
      socialProfilesCount > 0 ? 1 : 0,
    ].reduce((sum, val) => sum + val, 0);

    return {
      total: 1,
      withArticles: publishedArticleCount > 0 ? 1 : 0,
      withoutArticles: publishedArticleCount === 0 ? 1 : 0,
      createdThisMonth: 0,
      averageSEO: scoreResult.percentage,
      totalArticles: articleCount,
      publishedArticles: publishedArticleCount,
      draftArticles: draftArticleCount,
      archivedArticles: archivedArticleCount,
      socialProfilesCount,
      eetatSignalsCount,
    };
  } catch (error) {
    console.error("Error fetching authors stats:", error);
    return {
      total: 0,
      withArticles: 0,
      withoutArticles: 0,
      createdThisMonth: 0,
      averageSEO: 0,
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      archivedArticles: 0,
      socialProfilesCount: 0,
      eetatSignalsCount: 0,
    };
  }
}

