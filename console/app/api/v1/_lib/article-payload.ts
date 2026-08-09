import { mediaSrc } from "@modonty/database/lib/media-src";

/**
 * What the client's website receives.
 *
 * The rule is «they print, they do not think»: every field a page needs to render and
 * to be indexed properly is already here, in its final form — the structured-data card
 * built on their own domain, the meta description, the body, the image with its real
 * width, height and alt text, the author, the dates. Nothing here asks their developer
 * to compute anything, because the moment it does, our SEO quality becomes their
 * implementation quality.
 */
export interface ArticlePayload {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  url: string | null;
  canonicalUrl: string | null;
  seo: {
    title: string | null;
    description: string | null;
    robots: string | null;
  };
  /** Ready to print inside <script type="application/ld+json">. */
  jsonLd: string | null;
  image: {
    url: string;
    alt: string | null;
    width: number | null;
    height: number | null;
    blurDataURL: string | null;
  } | null;
  author: { name: string; url: string | null } | null;
  category: { name: string; slug: string } | null;
  tags: string[];
  readingTimeMinutes: number | null;
  wordCount: number | null;
  publishedAt: string | null;
  updatedAt: string;
  isMainArticle: boolean;
}

type MediaLike = {
  url: string;
  bunnyUrl: string | null;
  blurDataURL: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
} | null;

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  canonicalUrl: string | null;
  mainEntityOfPage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  nextjsMetadata: unknown;
  jsonLdStructuredData: string | null;
  readingTimeMinutes: number | null;
  wordCount: number | null;
  datePublished: Date | null;
  updatedAt: Date;
  isMainArticle: boolean;
  featuredImage: MediaLike;
  author: { name: string | null; slug: string | null } | null;
  category: { name: string; slug: string } | null;
  tags: { tag: { name: string } }[];
}

/**
 * Robots lives inside the stored Next.js metadata blob, not in its own column — read it
 * from there rather than inventing a second source that can disagree with the page.
 */
function readRobots(meta: unknown): string | null {
  const robots = (meta as { robots?: unknown } | null)?.robots;
  if (typeof robots === "string") return robots;
  if (robots && typeof robots === "object") {
    const r = robots as { index?: boolean; follow?: boolean };
    if (typeof r.index === "boolean" || typeof r.follow === "boolean") {
      return `${r.index === false ? "noindex" : "index"}, ${r.follow === false ? "nofollow" : "follow"}`;
    }
  }
  return null;
}

/** The one link back to us, and the only one — see the board, «سطر الكاتب». */
const MODONTY_URL = "https://www.modonty.com";

export function toArticlePayload(row: ArticleRow): ArticlePayload {
  const imageUrl = mediaSrc(row.featuredImage);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    // Their own address, baked when the article was saved — not rebuilt here, so the
    // payload can never disagree with the canonical stored in the row.
    url: row.canonicalUrl ?? row.mainEntityOfPage,
    canonicalUrl: row.canonicalUrl ?? row.mainEntityOfPage,
    seo: {
      title: row.seoTitle,
      description: row.seoDescription,
      robots: readRobots(row.nextjsMetadata),
    },
    jsonLd: row.jsonLdStructuredData,
    image: imageUrl
      ? {
          url: imageUrl,
          alt: row.featuredImage?.altText ?? null,
          width: row.featuredImage?.width ?? null,
          height: row.featuredImage?.height ?? null,
          blurDataURL: row.featuredImage?.blurDataURL ?? null,
        }
      : null,
    author: row.author?.name ? { name: row.author.name, url: MODONTY_URL } : null,
    category: row.category ? { name: row.category.name, slug: row.category.slug } : null,
    tags: row.tags.map((t) => t.tag.name),
    readingTimeMinutes: row.readingTimeMinutes,
    wordCount: row.wordCount,
    publishedAt: row.datePublished ? row.datePublished.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
    isMainArticle: row.isMainArticle,
  };
}

/** Everything `toArticlePayload` needs, and nothing else. */
export const ARTICLE_PAYLOAD_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  canonicalUrl: true,
  mainEntityOfPage: true,
  seoTitle: true,
  seoDescription: true,
  nextjsMetadata: true,
  jsonLdStructuredData: true,
  readingTimeMinutes: true,
  wordCount: true,
  datePublished: true,
  updatedAt: true,
  isMainArticle: true,
  featuredImage: {
    select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true, width: true, height: true },
  },
  author: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;
