import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export interface ArticleWithAllData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  contentFormat?: string;
  status: ArticleStatus;
  featured: boolean;
  scheduledAt: Date | null;
  datePublished: Date | null;
  dateModified?: Date;
  lastReviewed?: Date | null;
  mainEntityOfPage?: string | null;
  wordCount?: number | null;
  readingTimeMinutes?: number | null;
  contentDepth?: string | null;
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  license?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaRobots?: string | null;
  ogType?: string | null;
  ogArticleAuthor?: string | null;
  ogArticlePublishedTime?: Date | null;
  ogArticleModifiedTime?: Date | null;
  twitterCard?: string | null;
  twitterSite?: string | null;
  twitterCreator?: string | null;
  canonicalUrl?: string | null;
  alternateLanguages?: any;
  sitemapPriority?: number | null;
  sitemapChangeFreq?: string | null;
  breadcrumbPath?: any;
  articleBodyText?: string | null;
  semanticKeywords?: any;
  citations?: string[];
  jsonLdStructuredData?: string | null;
  jsonLdLastGenerated?: Date | null;
  jsonLdValidationReport?: any;
  jsonLdVersion?: number;
  jsonLdHistory?: any;
  jsonLdDiffSummary?: string | null;
  jsonLdGenerationTimeMs?: number | null;
  performanceBudgetMet?: boolean;
  nextjsMetadata?: any;
  nextjsMetadataLastGenerated?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    credentials: string[];
    qualifications: string[];
  };
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  featuredImage: {
    id: string;
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
    filename: string;
    caption: string | null;
  } | null;
  gallery: {
    id: string;
    position: number;
    caption: string | null;
    altText: string | null;
    media: {
      id: string;
      url: string;
      altText: string | null;
      width: number | null;
      height: number | null;
      filename: string;
      caption: string | null;
    };
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
    position: number;
  }[];
  relatedTo: {
    id: string;
    relationshipType: string | null;
    related: {
      id: string;
      title: string;
      slug: string;
      category: {
        id: string;
        name: string;
      } | null;
      tags: {
        tag: {
          id: string;
          name: string;
        };
      }[];
    };
  }[];
  relatedFrom: {
    id: string;
    relationshipType: string | null;
    article: {
      id: string;
      title: string;
      slug: string;
      category: {
        id: string;
        name: string;
      } | null;
      tags: {
        tag: {
          id: string;
          name: string;
        };
      }[];
    };
  }[];
  versions: {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    createdAt: Date;
  }[];
}

export async function getPendingArticles(clientId: string): Promise<ArticleWithAllData[]> {
  return db.article.findMany({
    where: {
      clientId,
      status: ArticleStatus.DRAFT,
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
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          credentials: true,
          qualifications: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      featuredImage: {
        select: {
          id: true,
          url: true,
          altText: true,
          width: true,
          height: true,
          filename: true,
          caption: true,
        },
      },
      gallery: {
        include: {
          media: {
            select: {
              id: true,
              url: true,
              altText: true,
              width: true,
              height: true,
              filename: true,
              caption: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
      faqs: {
        orderBy: {
          position: "asc",
        },
      },
      relatedTo: {
        include: {
          related: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      relatedFrom: {
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      versions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }) as Promise<ArticleWithAllData[]>;
}

export async function getPublishedArticles(clientId: string): Promise<ArticleWithAllData[]> {
  return db.article.findMany({
    where: {
      clientId,
      status: ArticleStatus.PUBLISHED,
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
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          credentials: true,
          qualifications: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      featuredImage: {
        select: {
          id: true,
          url: true,
          altText: true,
          width: true,
          height: true,
          filename: true,
          caption: true,
        },
      },
      gallery: {
        include: {
          media: {
            select: {
              id: true,
              url: true,
              altText: true,
              width: true,
              height: true,
              filename: true,
              caption: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
      faqs: {
        orderBy: {
          position: "asc",
        },
      },
      relatedTo: {
        include: {
          related: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      relatedFrom: {
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      versions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
    orderBy: {
      datePublished: "desc",
    },
  }) as Promise<ArticleWithAllData[]>;
}

export async function getAllArticles(clientId: string): Promise<ArticleWithAllData[]> {
  return db.article.findMany({
    where: {
      clientId,
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
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          credentials: true,
          qualifications: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      featuredImage: {
        select: {
          id: true,
          url: true,
          altText: true,
          width: true,
          height: true,
          filename: true,
          caption: true,
        },
      },
      gallery: {
        include: {
          media: {
            select: {
              id: true,
              url: true,
              altText: true,
              width: true,
              height: true,
              filename: true,
              caption: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
      faqs: {
        orderBy: {
          position: "asc",
        },
      },
      relatedTo: {
        include: {
          related: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      relatedFrom: {
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      versions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }) as Promise<ArticleWithAllData[]>;
}

export async function getArticleForApproval(
  articleId: string,
  clientId: string
): Promise<ArticleWithAllData | null> {
  const article = await db.article.findFirst({
    where: {
      id: articleId,
      clientId,
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
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          credentials: true,
          qualifications: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      featuredImage: {
        select: {
          id: true,
          url: true,
          altText: true,
          width: true,
          height: true,
          filename: true,
          caption: true,
        },
      },
      gallery: {
        include: {
          media: {
            select: {
              id: true,
              url: true,
              altText: true,
              width: true,
              height: true,
              filename: true,
              caption: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
      faqs: {
        orderBy: {
          position: "asc",
        },
      },
      relatedTo: {
        include: {
          related: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      relatedFrom: {
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      versions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
    },
  });

  return article as ArticleWithAllData | null;
}

export async function getPendingArticlesCount(clientId: string): Promise<number> {
  return db.article.count({
    where: {
      clientId,
      status: ArticleStatus.DRAFT,
    },
  });
}
