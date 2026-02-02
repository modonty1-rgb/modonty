import { Prisma } from "@prisma/client";

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: {
    client: {
      include: {
        logoMedia: {
          select: {
            id: true;
            url: true;
          };
        };
      };
    };
    category: true;
    author: true;
    tags: { include: { tag: true } };
    featuredImage: {
      select: {
        id: true;
        url: true;
        altText: true;
        width: true;
        height: true;
      };
    };
    faqs: true;
  };
}>;

export type ClientWithCount = Prisma.ClientGetPayload<{
  include: {
    _count: {
      select: {
        articles: true;
      };
    };
  };
}>;

export type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    industry: {
      select: {
        id: true;
        name: true;
      };
    };
    logoMedia: {
      select: {
        id: true;
        url: true;
        altText: true;
        width: true;
        height: true;
      };
    };
    ogImageMedia: {
      select: {
        id: true;
        url: true;
        altText: true;
        width: true;
        height: true;
      };
    };
    twitterImageMedia: {
      select: {
        id: true;
        url: true;
        altText: true;
        width: true;
        height: true;
      };
    };
    _count: {
      select: {
        articles: true;
      };
    };
  };
}>;

export type AuthorWithRelations = Prisma.AuthorGetPayload<{
  include: {
    _count: {
      select: {
        articles: true;
      };
    };
  };
}>;

export type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: {
    parent: true;
    children: true;
    _count: {
      select: {
        articles: true;
      };
    };
  };
}>;

export type ArticleListItem = Prisma.ArticleGetPayload<{
  select: {
    id: true;
    title: true;
    status: true;
    createdAt: true;
    datePublished: true;
    scheduledAt: true;
    client: {
      select: {
        name: true;
      };
    };
    category: {
      select: {
        name: true;
      };
    };
    author: {
      select: {
        name: true;
      };
    };
  };
}> & {
  views: number;
};
