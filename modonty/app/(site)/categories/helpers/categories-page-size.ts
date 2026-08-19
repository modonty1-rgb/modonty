import { Prisma } from "@prisma/client";

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
