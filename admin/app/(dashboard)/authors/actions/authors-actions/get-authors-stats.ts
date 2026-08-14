"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { computeReferenceSeoScore } from "@modonty/shared/lib/seo/reference/seo-score";
import type { JsonLdValidationReport } from "@modonty/shared/lib/seo/client/types";
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

    const scoreResult = computeReferenceSeoScore({
      name: modontyAuthor.name,
      nextjsMetadata: modontyAuthor.nextjsMetadata,
      jsonLdStructuredData: modontyAuthor.jsonLdStructuredData,
      jsonLdValidationReport: (modontyAuthor.jsonLdValidationReport ?? null) as JsonLdValidationReport | null,
    });

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
      averageSEO: scoreResult.score,
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
