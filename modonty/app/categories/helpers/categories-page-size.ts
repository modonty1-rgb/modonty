import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { Prisma, ArticleStatus, SubscriptionStatus } from "@prisma/client";
import { unstable_cache, cacheTag, cacheLife } from "next/cache";
import { getClientsGA4Stats } from "@/lib/analytics/ga4";
import type { CategoryResponse, CategoryAnalytics, CategoryQueryOptions, CategoryArticleQueryOptions, ArticleResponse } from "@/lib/types";

export const CATEGORIES_PAGE_SIZE = 20;

export type CategoryWithArticles = Prisma.CategoryGetPayload<{
  include: {
    articles: {
      include: {
        client: {
          select: {
            id: true;
            name: true;
            slug: true;
          };
        };
        category: {
          select: {
            id: true;
            name: true;
            slug: true;
          };
        };
        featuredImage: {
          select: {
            url: true, bunnyUrl: true, blurDataURL: true;
            altText: true;
          };
        };
      };
    };
    _count: {
      select: {
        articles: true;
      };
    };
  };
}>;

export type ArticleWithClientLogo = Prisma.ArticleGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        name: true;
        image: true;
      };
    };
    client: {
      include: {
        logoMedia: {
          select: {
            url: true, bunnyUrl: true, blurDataURL: true;
          };
        };
      };
    };
    category: {
      select: {
        id: true;
        name: true;
        slug: true;
      };
    };
    featuredImage: {
      select: {
        url: true, bunnyUrl: true, blurDataURL: true;
        altText: true;
      };
    };
  };
}>;
