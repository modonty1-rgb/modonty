import "server-only";

import { mediaSrc } from "@modonty/shared/lib/media-src";

import type { getArticlePageData } from "@/app/(site)/articles/[slug]/helpers/get-article-page-data";
import { resolveArticleCta } from "@/app/(site)/articles/[slug]/helpers/resolve-article-cta";

type ArticlePageData = Awaited<ReturnType<typeof getArticlePageData>>;

/**
 * What the article screen receives — a PROJECTION of `getArticlePageData` (the web page's own
 * read), never a second query. Every text is the web's: title, excerpt, author, dates, body
 * (`safeHtml`, the same sanitized HTML the page renders), FAQ, «اقرأ أيضاً», CTA.
 *
 * Projected, not passed whole: the page's `article.client` is the full partner row (every column,
 * internal ones included) and the JSON-LD builders are functions — neither belongs on the wire.
 */
export function articleDetailShape(data: ArticlePageData) {
  const { article } = data;
  const client = article.client;
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? null,
    seoTitle: article.seoTitle ?? null,
    seoDescription: article.seoDescription ?? null,
    // The header shows `datePublished ?? createdAt` (ArticleHeader.tsx) — both travel.
    datePublished: article.datePublished ?? null,
    dateModified: article.dateModified ?? null,
    createdAt: article.createdAt,
    readingTimeMinutes: article.readingTimeMinutes ?? null,
    wordCount: article.wordCount ?? null,
    audioUrl: article.audioUrl ?? null,
    audioDurationSeconds: article.audioDurationSeconds ?? null,
    html: data.safeHtml,
    headings: data.outline.headings,
    keyPoints: data.keyPoints,
    featuredImage: data.featuredImage
      ? {
          url: mediaSrc(data.featuredImage) ?? data.featuredImage.url,
          blurDataURL: data.featuredImage.blurDataURL ?? null,
          altText: data.featuredImage.altText ?? null,
        }
      : null,
    gallery: data.galleryImages.map((g) => ({
      url: mediaSrc(g.media) ?? g.media.url,
      blurDataURL: g.media.blurDataURL ?? null,
      width: g.media.width ?? null,
      height: g.media.height ?? null,
      alt: g.alt,
      caption: g.caption,
    })),
    category: article.category ? { id: article.category.id, name: article.category.name, slug: article.category.slug } : null,
    tags: data.allTags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    author: article.author
      ? {
          id: article.author.id,
          name: article.author.name,
          slug: article.author.slug,
          bio: article.author.bio ?? null,
          image: article.author.image ?? null,
          jobTitle: article.author.jobTitle ?? null,
        }
      : null,
    partner: client
      ? {
          id: client.id,
          name: client.name,
          slug: client.slug,
          logo: mediaSrc(client.logoMedia) ?? null,
          isVerified: client.isVerified,
          // Same line the web's partner sheet shows under the name (page.tsx ClientSheetButton).
          credential: client.description?.trim() || client.businessBrief?.trim() || client.slogan?.trim() || null,
          city: client.addressCity ?? null,
          phone: client.phone ?? null,
        }
      : null,
    cta: client ? resolveArticleCta(article) : null,
    faqs: data.articleFaqsForJsonLd.map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    readMore: data.readMoreTop.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      image: r.featuredImage ? (mediaSrc(r.featuredImage) ?? r.featuredImage.url) : null,
      imageBlur: r.featuredImage?.blurDataURL ?? null,
      clientName: r.clientName ?? null,
    })),
    // The cached row's own counters, as the page's first paint shows them; live numbers: /counts.
    counts: {
      likes: article._count.likes,
      favorites: article._count.favorites,
      comments: article._count.comments,
      views: article._count.views,
      questions: article._count.faqs,
    },
  };
}
