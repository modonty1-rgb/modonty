"use server";

import { db } from "@/lib/db";
import { ArticleStatus, Prisma } from "@prisma/client";
import type { ClientFilters, ClientForList } from "./types";

export async function getClients(filters?: ClientFilters): Promise<ClientForList[]> {
  try {
    const where: Prisma.ClientWhereInput = {};

    if (filters?.createdFrom || filters?.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) {
        where.createdAt.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        where.createdAt.lte = filters.createdTo;
      }
    }

    if (filters?.hasArticles !== undefined) {
      if (filters.hasArticles) {
        where.articles = {
          some: {
            status: ArticleStatus.PUBLISHED,
          },
        };
      } else {
        where.articles = {
          none: {},
        };
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { slug: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // H9: Move article count filtering to DB via pre-query
    if (filters?.minArticleCount !== undefined || filters?.maxArticleCount !== undefined) {
      const articleCounts = await db.article.groupBy({
        by: ["clientId"],
        where: { status: ArticleStatus.PUBLISHED },
        _count: { id: true },
      });

      const includeZeroArticleClients =
        (filters.minArticleCount === undefined || filters.minArticleCount === 0) &&
        (filters.maxArticleCount === undefined || filters.maxArticleCount >= 0);

      const matchingClientIds = articleCounts
        .filter((group) => {
          const count = group._count.id;
          if (filters.minArticleCount !== undefined && count < filters.minArticleCount) {
            return false;
          }
          if (filters.maxArticleCount !== undefined && count > filters.maxArticleCount) {
            return false;
          }
          return true;
        })
        .map((group) => group.clientId);

      if (includeZeroArticleClients) {
        const excludedClientIds = articleCounts
          .filter((group) => !matchingClientIds.includes(group.clientId))
          .map((group) => group.clientId);

        if (excludedClientIds.length > 0) {
          where.id = { notIn: excludedClientIds };
        }
      } else {
        where.id = { in: matchingClientIds };
      }
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const clients = await db.client.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        createdAt: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        paymentStatus: true,
        subscriptionEndDate: true,
        articlesPerMonth: true,
        nextjsMetadata: true,
        jsonLdValidationReport: true,
        seoTitle: true,
        seoDescription: true,
        description: true,
        legalName: true,
        url: true,
        canonicalUrl: true,
        businessBrief: true,
        sameAs: true,
        foundingDate: true,
        gtmId: true,
        contactType: true,
        addressStreet: true,
        addressCity: true,
        addressRegion: true,
        addressCountry: true,
        addressPostalCode: true,
        addressLatitude: true,
        addressLongitude: true,
        commercialRegistrationNumber: true,
        vatID: true,
        taxID: true,
        legalForm: true,
        businessActivityCode: true,
        isicV4: true,
        numberOfEmployees: true,
        licenseNumber: true,
        organizationType: true,
        alternateName: true,
        slogan: true,
        logoMedia: {
          select: {
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        heroImageMedia: {
          select: {
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        subscriptionTierConfig: {
          select: {
            price: true,
            articlesPerMonth: true,
            tier: true,
          },
        },
        articles: {
          where: {
            status: ArticleStatus.PUBLISHED,
            datePublished: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          select: {
            id: true,
            datePublished: true,
          },
        },
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
      orderBy: { createdAt: "desc" },
    });

    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

