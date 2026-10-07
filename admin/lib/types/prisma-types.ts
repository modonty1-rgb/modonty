import { Prisma } from "@prisma/client";

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
        bunnyUrl: true, blurDataURL: true;
        altText: true;
        width: true;
        height: true;
      };
    };
    heroImageMedia: {
      select: {
        id: true;
        url: true;
        bunnyUrl: true, blurDataURL: true;
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
