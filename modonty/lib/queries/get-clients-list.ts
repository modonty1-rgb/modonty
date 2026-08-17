import { cacheTag, cacheLife } from "next/cache";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { db } from "@/lib/db";
import { ArticleStatus, CommentStatus, SubscriptionStatus } from "@prisma/client";
import type { ClientCtaMode } from "@prisma/client";

/** One row of the partners list — only what the card and the rail show. */
export interface ClientListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  /** Cover image — drawn only for featured partners, who paid for the spotlight. */
  heroImage: string | null;
  industry: { name: string; slug: string } | null;
  city: string | null;
  /** What the partner actually does, in their own words — the first thing a visitor needs. */
  services: string[];
  /** Approved reviews only; null when nobody has rated this partner yet. */
  rating: { average: number; count: number } | null;
  /** Full years since the business was founded — «١٠ سنوات خبرة». */
  yearsInBusiness: number | null;
  /** Strongest paper he holds: a licence or accreditation, already checked by us. */
  credential: string | null;
  /** He uploaded his official record/licence image — checked, even without a named credential. */
  hasVerifiedPapers: boolean;
  articleCount: number;
  reelCount: number;
  /** Curated portfolio images (Media type=GALLERY) waiting on his page. */
  galleryCount: number;
  /** He published a phone number, so his page carries a direct WhatsApp button. */
  hasWhatsapp: boolean;
  /** An intro video plays on his page — ours on Bunny, or a legacy external link. */
  hasVideo: boolean;
  /** Newest published article, or null for a partner with no articles yet. */
  lastPublishedAt: Date | null;
  isFeatured: boolean;
  ctaMode: ClientCtaMode;
  ctaLabel: string | null;
  ctaUrl: string | null;
  createdAt: Date;
}

/** Whole years only — «٩ سنوات ونصف» is not something a partner card should claim. */
function yearsSince(date: Date): number | null {
  const years = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return years >= 1 ? years : null;
}

/**
 * Every active partner, cached once for all visitors. Search and the industry filter
 * happen in memory on the page — the list is small (tens of rows), and keying the cache
 * by a free-text query would create one entry per keystroke.
 */
export async function getClientsList(): Promise<ClientListItem[]> {
  "use cache";
  cacheTag("clients");
  cacheLife("hours");

  const publishedArticles = { status: ArticleStatus.PUBLISHED, datePublished: { lte: new Date() } };
  // A reel is a media file with the switch on (2026-08-05) — same three conditions the
  // reels feed itself uses, so the number on the card matches what /reels shows.
  const publishedReels = {
    inReels: true,
    reelStatus: "PUBLISHED",
    mimeType: { startsWith: "image/" },
  } as const;

  const clients = await db.client.findMany({
    where: { subscriptionStatus: SubscriptionStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      seoDescription: true,
      addressCity: true,
      isFeatured: true,
      ctaMode: true,
      ctaLabel: true,
      ctaUrl: true,
      createdAt: true,
      logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
      industry: { select: { name: true, slug: true } },
      foundingDate: true,
      verificationImageUrl: true,
      phone: true,
      introVideoMediaId: true,
      introVideoUrl: true,
      // Embedded arrays on the client document — no extra query.
      services: { select: { title: true } },
      credentials: { select: { name: true } },
      // Ratings are averaged here rather than in Mongo: Prisma cannot aggregate inside a
      // nested select, and an active partner has tens of reviews, not thousands.
      reviews: { where: { status: CommentStatus.APPROVED }, select: { rating: true } },
      _count: { select: { articles: { where: publishedArticles } } },
      // Reels and gallery are both Media rows, so one narrow read serves both counters —
      // `_count` cannot carry two different filters for the same relation.
      media: {
        where: { OR: [{ type: "GALLERY" }, publishedReels] },
        select: { type: true, inReels: true },
        take: 60,
      },
      articles: {
        where: publishedArticles,
        select: { datePublished: true },
        orderBy: { datePublished: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
    take: 500,
  });

  return clients.map((client) => ({
    id: client.id,
    services: client.services.map((service) => service.title).filter(Boolean),
    yearsInBusiness: client.foundingDate ? yearsSince(client.foundingDate) : null,
    credential: client.credentials[0]?.name?.trim() || null,
    hasVerifiedPapers: Boolean(client.verificationImageUrl?.trim()),
    rating: client.reviews.length
      ? {
          average: client.reviews.reduce((sum, review) => sum + review.rating, 0) / client.reviews.length,
          count: client.reviews.length,
        }
      : null,
    name: client.name,
    slug: client.slug,
    description: client.description || client.seoDescription || null,
    logo: mediaSrc(client.logoMedia) || null,
    heroImage: client.isFeatured ? mediaSrc(client.heroImageMedia) || null : null,
    industry: client.industry,
    city: client.addressCity,
    articleCount: client._count.articles,
    reelCount: client.media.filter((file) => file.inReels).length,
    galleryCount: client.media.filter((file) => file.type === "GALLERY").length,
    hasWhatsapp: Boolean(client.phone?.trim()),
    hasVideo: Boolean(client.introVideoMediaId || client.introVideoUrl?.trim()),
    lastPublishedAt: client.articles[0]?.datePublished ?? null,
    isFeatured: client.isFeatured,
    ctaMode: client.ctaMode,
    ctaLabel: client.ctaLabel,
    ctaUrl: client.ctaUrl,
    createdAt: client.createdAt,
  }));
}
