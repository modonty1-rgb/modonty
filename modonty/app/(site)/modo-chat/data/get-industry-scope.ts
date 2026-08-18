import "server-only";

import { ArticleStatus, SubscriptionStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { mediaSrc } from "@modonty/shared/lib/media-src";

export interface IndustryScope {
  id: string;
  name: string;
  slug: string;
  /** Articles written by partners in this industry — the corpus Modo answers from. */
  articles: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    client: { name: string; slug: string; ctaMode: string };
  }[];
  /** Every active partner in the industry, so Modo can point somewhere even with no article. */
  partners: PartnerForCard[];
}

/** What the answer card shows about a partner — a name alone does not earn a booking. */
export interface PartnerForCard {
  name: string;
  slug: string;
  ctaMode: string;
  description: string | null;
  slogan: string | null;
  logo: string | null;
  city: string | null;
  /** A named licence or accreditation, when he has one. */
  credential: string | null;
  /** He uploaded his official record image — checked, even without a named credential. */
  hasVerifiedPapers: boolean;
}

const MAX_ARTICLES = 30;

/**
 * Everything Modo needs to serve one INDUSTRY.
 *
 * Industry, not category, is the axis the business actually runs on: partners belong to an
 * industry (`Client.industryId`), and the platform's real book of business — Egyptian doctors
 * serving Gulf patients — is an industry with eleven partners and no category of its own.
 * Scoping the assistant by category meant a visitor asking for a dentist was answered out of a
 * category holding a single partner, while the real clinics sat in an industry Modo never saw.
 *
 * Articles reach the industry through their partner; `content` is deliberately not selected,
 * because chunk embeddings are cached and bodies are loaded only when that cache is cold.
 */
export async function getIndustryScope(slug: string): Promise<IndustryScope | null> {
  const industry = await db.industry.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
  if (!industry) return null;

  const [articles, partners] = await Promise.all([
    db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [{ datePublished: null }, { datePublished: { lte: new Date() } }],
        client: { industryId: industry.id, subscriptionStatus: SubscriptionStatus.ACTIVE },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        client: { select: { name: true, slug: true, ctaMode: true } },
      },
      orderBy: [{ datePublished: "desc" }, { createdAt: "desc" }],
      take: MAX_ARTICLES,
    }),
    db.client.findMany({
      where: { industryId: industry.id, subscriptionStatus: SubscriptionStatus.ACTIVE },
      // description/slogan are what a partner says they do — the only text available to rank
      // them against a question when no article covers it. The rest is what the card renders.
      select: {
        name: true,
        slug: true,
        ctaMode: true,
        description: true,
        slogan: true,
        addressCity: true,
        verificationImageUrl: true,
        logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true } },
        credentials: { select: { name: true } },
      },
      orderBy: { name: "asc" },
      take: 20,
    }),
  ]);

  return {
    ...industry,
    articles,
    partners: partners.map((p) => ({
      name: p.name,
      slug: p.slug,
      ctaMode: p.ctaMode,
      description: p.description,
      slogan: p.slogan,
      logo: mediaSrc(p.logoMedia) || null,
      city: p.addressCity,
      credential: p.credentials[0]?.name?.trim() || null,
      hasVerifiedPapers: Boolean(p.verificationImageUrl?.trim()),
    })),
  };
}
