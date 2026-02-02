/**
 * Category database query helpers
 * Used by API routes and Server Components
 */

import { db } from "@/lib/db";
import { Prisma, ArticleStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import type { CategoryResponse, CategoryAnalytics, CategoryQueryOptions, CategoryArticleQueryOptions, ArticleResponse } from "./types";

type CategoryWithArticles = Prisma.CategoryGetPayload<{
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
            url: true;
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

type ArticleWithClientLogo = Prisma.ArticleGetPayload<{
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
            url: true;
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
        url: true;
        altText: true;
      };
    };
    _count: {
      select: {
        likes: true;
        comments: true;
        favorites: true;
        views: true;
      };
    };
  };
}>;

export async function getCategoriesWithCounts(): Promise<CategoryResponse[]> {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
              OR: [
                { datePublished: null },
                { datePublished: { lte: new Date() } },
              ],
            },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
    seoTitle: category.seoTitle || undefined,
    seoDescription: category.seoDescription || undefined,
    articleCount: category._count?.articles || 0,
  }));
}

export async function getCategoryBySlug(slug: string) {
  const category: CategoryWithArticles | null = await db.category.findUnique({
    where: { slug },
    include: {
      articles: {
        where: {
          status: ArticleStatus.PUBLISHED,
          datePublished: { lte: new Date() },
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          featuredImage: {
            select: {
              url: true,
              altText: true,
            },
          },
        },
        orderBy: {
          datePublished: "desc",
        },
      },
      _count: {
        select: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
              OR: [
                { datePublished: null },
                { datePublished: { lte: new Date() } },
              ],
            },
          },
        },
      },
    },
  });

  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
    seoTitle: category.seoTitle || undefined,
    seoDescription: category.seoDescription || undefined,
    articleCount: category._count?.articles || 0,
    articles: category.articles || [],
  };
}

export async function getCategoryAnalytics(categoryId: string): Promise<CategoryAnalytics> {
  const articles = await db.article.findMany({
    where: {
      categoryId,
      status: ArticleStatus.PUBLISHED,
      datePublished: { lte: new Date() },
    },
    include: {
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  const totalBlogs = articles.length;
  const totalReactions = articles.reduce((sum, article) => {
    return sum + (article._count?.likes || 0) + (article._count?.comments || 0);
  }, 0);
  const averageEngagement = totalBlogs > 0 ? Math.round(totalReactions / totalBlogs) : 0;

  return {
    totalBlogs,
    totalReactions,
    averageEngagement,
  };
}

export const getCategoriesEnhanced = unstable_cache(
  async (options: CategoryQueryOptions = {}): Promise<CategoryResponse[]> => {
    const { search, sortBy = 'articles', featured } = options;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const categories = await db.category.findMany({
      include: {
        _count: {
          select: {
            articles: {
              where: {
                status: ArticleStatus.PUBLISHED,
                OR: [
                  { datePublished: null },
                  { datePublished: { lte: new Date() } },
                ],
              },
            },
          },
        },
        articles: {
          where: {
            status: ArticleStatus.PUBLISHED,
            datePublished: { 
              gte: sevenDaysAgo,
              lte: new Date() 
            },
          },
          select: {
            _count: {
              select: {
                likes: true,
                comments: true,
                favorites: true,
              },
            },
          },
        },
      },
    });

    let results: CategoryResponse[] = categories.map((category) => {
      const articleCount = category._count?.articles || 0;
      const recentArticleCount = category.articles?.length || 0;
      
      const totalEngagement = category.articles?.reduce((sum, article) => {
        return sum + 
          (article._count?.likes || 0) + 
          (article._count?.comments || 0) + 
          (article._count?.favorites || 0);
      }, 0) || 0;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
        seoTitle: category.seoTitle || undefined,
        seoDescription: category.seoDescription || undefined,
        socialImage: category.socialImage || undefined,
        socialImageAlt: category.socialImageAlt || undefined,
        articleCount,
        recentArticleCount,
        totalEngagement,
        isFeatured: false,
      };
    });

    results.sort((a, b) => b.articleCount - a.articleCount);
    results.forEach((cat, index) => {
      cat.isFeatured = index < 4;
    });

    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower)
      );
    }

    if (featured) {
      results = results.filter((cat) => cat.isFeatured);
    }

    switch (sortBy) {
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'articles':
        results.sort((a, b) => b.articleCount - a.articleCount);
        break;
      case 'trending':
        results.sort((a, b) => (b.recentArticleCount || 0) - (a.recentArticleCount || 0));
        break;
      case 'recent':
        results.sort((a, b) => (b.totalEngagement || 0) - (a.totalEngagement || 0));
        break;
      default:
        results.sort((a, b) => b.articleCount - a.articleCount);
    }

    return results;
  },
  ['categories-enhanced'],
  {
    revalidate: 3600,
    tags: ['categories'],
  }
);

export const getCategoryArticlesEnhanced = unstable_cache(
  async (categorySlug: string, options: CategoryArticleQueryOptions = {}): Promise<ArticleResponse[]> => {
    const { search, sortBy = 'latest', clientId, limit } = options;

    const category = await db.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });

    if (!category) {
      return [];
    }

    const whereClause: Prisma.ArticleWhereInput = {
      categoryId: category.id,
      status: ArticleStatus.PUBLISHED,
      datePublished: { lte: new Date() },
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(clientId && { clientId }),
    };

    let orderBy: Prisma.ArticleOrderByWithRelationInput = { datePublished: 'desc' };

    if (sortBy === 'oldest') {
      orderBy = { datePublished: 'asc' };
    } else if (sortBy === 'popular') {
      orderBy = { views: { _count: 'desc' } };
    }

    const articles: ArticleWithClientLogo[] = await db.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        client: {
          include: {
            logoMedia: {
              select: {
                url: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        featuredImage: {
          select: {
            url: true,
            altText: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            favorites: true,
            views: true,
          },
        },
      },
      orderBy,
      take: limit,
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || undefined,
      image: article.featuredImage?.url,
      publishedAt: article.datePublished?.toISOString() || new Date().toISOString(),
      author: {
        id: article.author.id,
        name: article.author.name || 'Unknown',
        image: article.author.image || undefined,
      },
      client: {
        id: article.client.id,
        name: article.client.name,
        slug: article.client.slug,
        logo: article.client.logoMedia?.url || undefined,
      },
      category: article.category ? {
        id: article.category.id,
        name: article.category.name,
        slug: article.category.slug,
      } : undefined,
      featuredImage: article.featuredImage ? {
        url: article.featuredImage.url,
        altText: article.featuredImage.altText || undefined,
      } : undefined,
      interactions: {
        likes: article._count.likes,
        dislikes: 0,
        comments: article._count.comments,
        favorites: article._count.favorites,
        views: article._count.views,
      },
      readingTimeMinutes: article.readingTimeMinutes || undefined,
      wordCount: article.wordCount || undefined,
    }));
  },
  ['category-articles-enhanced'],
  {
    revalidate: 1800,
    tags: ['category-articles'],
  }
);
