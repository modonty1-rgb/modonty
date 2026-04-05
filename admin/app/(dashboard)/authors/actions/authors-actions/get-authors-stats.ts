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
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        averageSEO: 0,
        socialProfilesCount: 0,
      };
    }

    const [publishedArticleCount, draftArticleCount] = await Promise.all([
      db.article.count({
        where: { authorId: modontyAuthor.id, status: ArticleStatus.PUBLISHED },
      }),
      db.article.count({
        where: { authorId: modontyAuthor.id, status: ArticleStatus.DRAFT },
      }),
    ]);

    const scoreResult = calculateSEOScore(modontyAuthor, authorSEOConfig);

    const socialProfilesCount = [
      modontyAuthor.linkedIn,
      modontyAuthor.twitter,
      modontyAuthor.facebook,
      ...(modontyAuthor.sameAs || []),
    ].filter(Boolean).length;

    return {
      totalArticles: modontyAuthor._count.articles,
      publishedArticles: publishedArticleCount,
      draftArticles: draftArticleCount,
      averageSEO: scoreResult.percentage,
      socialProfilesCount,
    };
  } catch (error) {
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      averageSEO: 0,
      socialProfilesCount: 0,
    };
  }
}
