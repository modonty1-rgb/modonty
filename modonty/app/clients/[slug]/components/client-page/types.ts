/**
 * Minimal client shape for client page column components.
 * The page passes the full client from getClientPageData.
 */
export interface ClientPageClient {
  id: string;
  name: string;
  slug: string;
  businessBrief?: string | null;
  description?: string | null;
  seoDescription?: string | null;
  slogan?: string | null;
  legalName?: string | null;
  alternateName?: string | null;
  industry?: { name: string } | null;
  foundingDate?: Date | null;
  numberOfEmployees?: string | null;
  addressLatitude?: number | null;
  addressLongitude?: number | null;
  url?: string | null;
  email?: string | null;
  phone?: string | null;
  contactType?: string | null;
  // Primary CTA («احجز الآن» / «تسوّق الآن») — admin-controlled
  ctaMode?: "NONE" | "FORM" | "LINK" | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  // YMYL verified credentials (admin-controlled flag + client-entered data).
  // ymylData is Prisma Json (JsonValue) — kept as unknown; the consumer narrows it.
  isYmyl?: boolean | null;
  ymylCategory?: string | null;
  ymylData?: unknown;
  articles?: Array<{
    id: string;
    slug: string;
    title?: string;
    // `bunnyUrl` is required (value may be null) — omitting it narrows the Bunny copy away
    // before `mediaSrc()` can see it. No consumer renders this today; the key keeps it that way.
    featuredImage?: { url: string; bunnyUrl: string | null; altText?: string | null } | null;
  }>;
}

export interface ClientPageStats {
  articlesCount: number;
  followers: number;
  totalViews: number;
}

export interface ClientPageRelatedClient {
  id: string;
  name: string;
  slug: string;
  legalName?: string | null;
  logoMedia?: { url: string; bunnyUrl: string | null } | null;
  _count: { articles: number };
}
