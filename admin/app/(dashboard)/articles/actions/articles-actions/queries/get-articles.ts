"use server";

import { db } from "@/lib/db";
import { ArticleStatus, Prisma } from "@prisma/client";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { getArticleDefaultsFromSettings } from "@/app/(dashboard)/settings/helpers/get-article-defaults-from-settings";

export interface ArticleFilters {
  status?: ArticleStatus;
  clientId?: string;
  categoryId?: string;
  authorId?: string;
  createdFrom?: Date;
  createdTo?: Date;
  publishedFrom?: Date;
  publishedTo?: Date;
}

export async function getArticles(filters?: ArticleFilters) {
  try {
    const validStatuses: ArticleStatus[] = [
      ArticleStatus.WRITING,
      ArticleStatus.DRAFT,
      ArticleStatus.SCHEDULED,
      ArticleStatus.PUBLISHED,
      ArticleStatus.ARCHIVED,
    ];

    const where: Prisma.ArticleWhereInput = {};

    if (filters?.status && validStatuses.includes(filters.status)) {
      where.status = filters.status;
    } else {
      const filteredStatuses = validStatuses.filter(
        (status): status is ArticleStatus => status !== undefined
      );
      where.status = { in: filteredStatuses };
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters?.createdFrom || filters?.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) {
        where.createdAt.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        where.createdAt.lte = filters.createdTo;
      }
    }

    if (filters?.publishedFrom || filters?.publishedTo) {
      where.datePublished = {};
      if (filters.publishedFrom) {
        where.datePublished.gte = filters.publishedFrom;
      }
      if (filters.publishedTo) {
        where.datePublished.lte = filters.publishedTo;
      }
    }

    const cleanWhere = {} as Prisma.ArticleWhereInput;
    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined) {
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof Date) &&
          !("in" in value)
        ) {
          const cleaned = Object.fromEntries(
            Object.entries(value).filter(([_, v]) => v !== undefined)
          );
          if (Object.keys(cleaned).length > 0) {
            (cleanWhere as Record<string, unknown>)[key] = cleaned;
          }
        } else {
          (cleanWhere as Record<string, unknown>)[key] = value;
        }
      }
    }

    const articles = await db.article.findMany({
      where: cleanWhere,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        datePublished: true,
        scheduledAt: true,
        wordCount: true,
        contentDepth: true,
        seoTitle: true,
        seoDescription: true,
        canonicalUrl: true,
        jsonLdStructuredData: true,
        featuredImageId: true,
        authorId: true,
        client: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            url: true,
            altText: true,
            width: true,
            height: true,
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
      orderBy: { createdAt: "desc" },
    });

    const settings = await getAllSettings();
    const articleDefaults = getArticleDefaultsFromSettings(settings);

    const articleIds = articles
      .map((article) => article.id)
      .filter((id): id is string => id !== undefined);

    if (articleIds.length > 0) {
      const viewsCounts = await db.analytics.groupBy({
        by: ["articleId"],
        where: {
          articleId: { in: articleIds },
        },
        _count: {
          id: true,
        },
      });

      const viewsMap = new Map<string, number>(
        viewsCounts.map((view) => [view.articleId, view._count.id])
      );

      return articles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        status: article.status,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        datePublished: article.datePublished,
        scheduledAt: article.scheduledAt,
        wordCount: article.wordCount,
        contentDepth: article.contentDepth,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        canonicalUrl: article.canonicalUrl,
        jsonLdStructuredData: article.jsonLdStructuredData,
        featuredImageId: article.featuredImageId,
        featuredImage: article.featuredImage,
        authorId: article.authorId,
        author: article.author,
        client: article.client,
        category: article.category,
        faqs: article.faqs,
        views: viewsMap.get(article.id) || 0,
        ...articleDefaults,
      }));
    }

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      status: article.status,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      datePublished: article.datePublished,
      scheduledAt: article.scheduledAt,
      wordCount: article.wordCount,
      contentDepth: article.contentDepth,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      canonicalUrl: article.canonicalUrl,
      jsonLdStructuredData: article.jsonLdStructuredData,
      featuredImageId: article.featuredImageId,
      featuredImage: article.featuredImage,
      authorId: article.authorId,
      author: article.author,
      client: article.client,
      category: article.category,
      faqs: article.faqs,
      views: 0,
      ...articleDefaults,
    }));
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

