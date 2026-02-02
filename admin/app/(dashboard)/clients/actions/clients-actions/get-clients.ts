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
        metaTags: true,
        jsonLdStructuredData: true,
        jsonLdValidationReport: true,
        // SEO fields needed for score calculation
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
        twitterCard: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterSite: true,
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
        ogImageMedia: {
          select: {
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        twitterImageMedia: {
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

    let filteredClients = clients;

    if (filters?.minArticleCount !== undefined || filters?.maxArticleCount !== undefined) {
      filteredClients = clients.filter((client) => {
        const articleCount = client._count.articles;
        if (filters.minArticleCount !== undefined && articleCount < filters.minArticleCount) {
          return false;
        }
        if (filters.maxArticleCount !== undefined && articleCount > filters.maxArticleCount) {
          return false;
        }
        return true;
      });
    }

    return filteredClients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

