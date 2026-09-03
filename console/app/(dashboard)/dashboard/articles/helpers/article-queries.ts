import { db } from "@/lib/db";
import { ArticleStatus, type Prisma } from "@prisma/client";
import { CLIENT_READABLE_STATUSES, CLIENT_VISIBLE_STATUSES } from "@/lib/articles/client-visible-statuses";

/**
 * Every list on this screen renders the same card, so every list must load the same
 * shape. Written once: the four queries below drifted apart the moment a field was
 * added to one of them, and a card missing its image or its tags looks like a data bug.
 */
const ARTICLE_LIST_INCLUDE = {
  client: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
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
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
  featuredImage: {
    select: {
      id: true,
      url: true,
      bunnyUrl: true,
      blurDataURL: true,
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
          bunnyUrl: true,
          blurDataURL: true,
          altText: true,
          width: true,
          height: true,
          filename: true,
          caption: true,
        },
      },
    },
    orderBy: { position: "asc" },
  },
  faqs: { orderBy: { position: "asc" } },
  relatedTo: {
    include: {
      related: {
        select: {
          id: true,
          title: true,
          slug: true,
          category: { select: { id: true, name: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
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
          category: { select: { id: true, name: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
        },
      },
    },
  },
  versions: { orderBy: { createdAt: "desc" }, take: 10 },
} satisfies Prisma.ArticleInclude;

export interface ArticleWithAllData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  contentFormat?: string;
  status: ArticleStatus;
  featured: boolean;
  /** Written for the client's OWN website — it never appears on modonty.com. */
  isClientSiteArticle: boolean;
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
    bunnyUrl: string | null;
    blurDataURL: string | null;
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
      bunnyUrl: string | null;
      blurDataURL: string | null;
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
      status: ArticleStatus.AWAITING_APPROVAL,
    },
    include: ARTICLE_LIST_INCLUDE,
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
    include: ARTICLE_LIST_INCLUDE,
    orderBy: {
      datePublished: "desc",
    },
  }) as Promise<ArticleWithAllData[]>;
}

/**
 * «كل المقالات» — everything this client has ON MODONTY.
 *
 * Articles written for the client's OWN website are deliberately excluded: this list
 * renders a modonty.com link for every row, which would be the wrong address for
 * them, and mixing two destinations in one undifferentiated list is how a client
 * ends up thinking an article is missing. They have their own tab («مقالاتك على
 * موقعك»), where the link points at their own domain.
 */
export async function getAllArticles(clientId: string): Promise<ArticleWithAllData[]> {
  return db.article.findMany({
    where: {
      clientId,
      // قائمة سماحٍ لا استثناء — انظر `CLIENT_VISIBLE_STATUSES` أعلاه. وكانت
      // `{ not: PUBLISHED_ON_CLIENT_SITE }` فتُظهر كلَّ ما عداها.
      status: { in: [...CLIENT_VISIBLE_STATUSES] },
    },
    include: ARTICLE_LIST_INCLUDE,
    orderBy: {
      createdAt: "desc",
    },
  }) as Promise<ArticleWithAllData[]>;
}

/**
 * «مقالاتك على موقعك» — the pieces we write for the client's OWN website.
 *
 * Same card, same data shape as the other tabs (Khalid 2026-08-11): the old standalone
 * screen showed a bare title-and-link row, so the client could not see the image, the
 * category or the tags of an article that is just as much theirs as the rest.
 * `isClientSiteArticle` is checked as well as the status — the flag is what the card
 * reads to mark the row, and a status without the flag would render as a modonty piece.
 */
export async function getSiteArticles(clientId: string): Promise<ArticleWithAllData[]> {
  return db.article.findMany({
    where: {
      clientId,
      isClientSiteArticle: true,
      status: ArticleStatus.PUBLISHED_ON_CLIENT_SITE,
    },
    include: ARTICLE_LIST_INCLUDE,
    orderBy: {
      datePublished: "desc",
    },
    take: 200,
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
      // الحالة تُفحص هنا أيضاً لا في القائمة وحدها. `clientId` يمنع قراءة مقال عميلٍ
      // آخر، ولا يمنع العميلَ من فتح مقاله هو وهو `WRITING` — ورابط الصفحة يحمل
      // المعرّف، فيكفي أن يُعدَّل في شريط العنوان أو يبقى في السجلّ بعد نشرٍ سابق.
      // إخفاؤه من القائمة وحدها يخفيه عن العين لا عن الطلب.
      //
      // ويشمل هذا مقالات موقع العميل: لها تبويبها، وليست حالةً مخفيّة.
      status: { in: [...CLIENT_READABLE_STATUSES] },
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
          bunnyUrl: true,
          blurDataURL: true,
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
              bunnyUrl: true,
              blurDataURL: true,
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

/**
 * Whether publishing to the client's own website is switched on. It no longer decides a
 * tab — every client sees «مقالاتك على موقعك», and a client without it gets the offer —
 * but the plan block in the sidebar still marks the feature as live from this flag.
 */
export async function canSeeSiteArticles(clientId: string): Promise<boolean> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { canPublishToOwnSite: true },
  });
  return client?.canPublishToOwnSite ?? false;
}

/**
 * How much of this month's contracted quota is already out. It moved here with the strip
 * that shows it (Khalid 2026-08-11): «نشاط المحتوى» was a whole screen for one number
 * the client wants while looking at their articles, not instead of them.
 */
export async function getMonthlyPublishedCount(clientId: string): Promise<number> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  return db.article.count({
    where: {
      clientId,
      createdAt: { gte: start },
      status: ArticleStatus.PUBLISHED,
    },
  });
}

export async function getPendingArticlesCount(clientId: string): Promise<number> {
  return db.article.count({
    where: {
      clientId,
      status: ArticleStatus.AWAITING_APPROVAL,
    },
  });
}
