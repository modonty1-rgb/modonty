// SHARED client SEO generator — the single source of truth for a client's cached
// SEO bundle (Next.js metaTags + JSON-LD @graph). Admin (generateClientSEO) and
// console (regenerateClientSeo) BOTH call this so output is byte-identical no matter
// which app saved the client. ALL platform-level values come from Settings (no
// hardcoded constants). Callers only differ in: validation (admin), the DB write,
// and revalidation paths.
//
// Pure-ish: takes the caller's PrismaClient (correct DATABASE_URL per app), reads
// everything it needs, and RETURNS the bundle. It does NOT validate, write, or
// revalidate — that's the caller's job.

import type { PrismaClient } from "@prisma/client";
import { generateCompleteOrganizationJsonLd } from "./generate-organization-jsonld";
import { resolveOrganizationType } from "./organization-schema-types";
import { YMYL_CATEGORIES, isYmylCategory } from "./ymyl-config";

/** The fields any derivation source may read. Grows as sources are added. */
interface DerivableClient {
  isYmyl?: boolean | null;
  ymylCategory?: string | null;
  ymylData?: unknown;
}

/**
 * What we can work out about this client, independent of whatever type someone typed
 * into the record. Returns the most specific schema.org type we can justify, or null.
 *
 * ONE source today (YMYL). To support a new industry tomorrow, add a source below and
 * return its type — nothing else in the platform changes, because every write path
 * (admin create, admin update, console save, Regenerate) already flows through here.
 */
function deriveClientType(client: DerivableClient): string | null {
  // Source 1 — YMYL config: the specialty is more specific than the category, so it wins.
  if (client.isYmyl && isYmylCategory(client.ymylCategory)) {
    const cfg = YMYL_CATEGORIES[client.ymylCategory];
    const specialty = (client.ymylData as Record<string, unknown> | null)?.specialty;

    if (typeof specialty === "string") {
      const field = cfg.fields.find((f) => f.type === "specialty");
      const match = field?.specialties?.find((s) => s.value === specialty);
      if (match?.schemaSubType) return match.schemaSubType;
    }

    return cfg.schemaType;
  }

  // Source 2 — (industry map: FurnitureStore, OnlineStore, …) — add here.

  return null;
}

export interface ClientMetaTags {
  title: string;
  description: string;
  robots: string;
  author: string;
  language: string;
  charset: string;
  openGraph: {
    title: string;
    description: string;
    type: string;
    url: string;
    siteName: string;
    locale: string;
    localeAlternate?: string[];
    images?: Array<{
      url: string;
      secure_url: string;
      type: string;
      width: number;
      height: number;
      alt: string;
    }>;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image?: string;
    imageAlt?: string;
    site?: string;
    creator?: string;
  };
  canonical: string;
  alternates?: {
    languages: Record<string, string>;
  };
  formatDetection: {
    telephone: boolean;
    email: boolean;
    address: boolean;
  };
}

// The exact client fields the metaTags builder + JSON-LD generator need. ONE place
// — adding a JSON-LD field means editing this select once (both apps inherit it).
const CLIENT_SEO_SELECT = {
  id: true,
  name: true,
  slug: true,
  legalName: true,
  alternateName: true,
  url: true,
  email: true,
  phone: true,
  seoTitle: true,
  seoDescription: true,
  description: true,
  businessBrief: true,
  targetAudience: true,
  contentPriorities: true,
  contactType: true,
  addressStreet: true,
  addressCity: true,
  addressCountry: true,
  addressPostalCode: true,
  addressRegion: true,
  addressNeighborhood: true,
  addressBuildingNumber: true,
  addressAdditionalNumber: true,
  addressLatitude: true,
  addressLongitude: true,
  sameAs: true,
  canonicalUrl: true,
  foundingDate: true,
  createdAt: true,
  updatedAt: true,
  commercialRegistrationNumber: true,
  vatID: true,
  taxID: true,
  legalForm: true,
  businessActivityCode: true,
  isicV4: true,
  numberOfEmployees: true,
  slogan: true,
  keywords: true,
  knowsLanguage: true,
  services: true,
  teamMembers: true,
  credentials: true,
  introVideoUrl: true,
  organizationType: true,
  isYmyl: true,
  ymylCategory: true,
  ymylData: true,
  openingHoursSpecification: true,
  priceRange: true,
  gbpProfileUrl: true,
  gbpPlaceId: true,
  parentOrganizationId: true,
  logoMedia: { select: { url: true, altText: true, width: true, height: true } },
  heroImageMedia: { select: { url: true, altText: true, width: true, height: true } },
  industry: { select: { id: true, name: true } },
  parentOrganization: { select: { id: true, name: true, url: true, slug: true } },
} as const;

const SETTINGS_SEO_SELECT = {
  siteUrl: true,
  siteName: true,
  inLanguage: true,
  defaultOgLocale: true,
  defaultMetaRobots: true,
  defaultTwitterCard: true,
  twitterSite: true,
  twitterCreator: true,
  defaultAlternateLanguages: true,
  defaultHreflang: true,
} as const;

type JsonLdGraph = ReturnType<typeof generateCompleteOrganizationJsonLd>;

export interface ClientSeoBundle {
  client: Record<string, unknown> & { slug: string };
  metaTags: ClientMetaTags;
  jsonLdGraph: JsonLdGraph;
  jsonLdString: string;
}

/**
 * Build the full client SEO bundle (metaTags + JSON-LD) from the DB. Returns null
 * if the client doesn't exist. NEVER writes — the caller persists + revalidates.
 */
export async function generateClientSeoBundle(
  db: PrismaClient,
  clientId: string
): Promise<ClientSeoBundle | null> {
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: CLIENT_SEO_SELECT,
  });
  if (!client) return null;

  // ── Platform-level values: ALL from Settings (single source of truth) ──
  const settings = await db.settings.findFirst({ select: SETTINGS_SEO_SELECT });
  const siteUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
  const siteName = settings?.siteName || "Modonty";
  const inLanguage = settings?.inLanguage || "ar";
  const ogLocale = settings?.defaultOgLocale || "ar_SA";
  const metaRobots = settings?.defaultMetaRobots || "index, follow";
  const twitterCard = settings?.defaultTwitterCard || "summary_large_image";
  const twitterSite = settings?.twitterSite || undefined;
  const twitterCreator = settings?.twitterCreator || undefined;
  const clientPageUrl = client.canonicalUrl || `${siteUrl}/clients/${client.slug}`;

  const ensureAbsoluteUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url.replace("http://", "https://");
    }
    if (url.startsWith("/")) return `${siteUrl}${url}`;
    return `https://${url}`;
  };

  const title = client.seoTitle || client.name;
  const description = client.seoDescription || client.description || "";
  const canonicalUrl = ensureAbsoluteUrl(clientPageUrl) || clientPageUrl;

  const metaTags: ClientMetaTags = {
    title:
      title.length > 60
        ? (() => {
            const lastSpace = title.lastIndexOf(" ", 57);
            return lastSpace > 0 ? title.substring(0, lastSpace) + "..." : title.substring(0, 57) + "...";
          })()
        : title,
    description:
      description.length > 160
        ? (() => {
            const lastSpace = description.lastIndexOf(" ", 157);
            return lastSpace > 0
              ? description.substring(0, lastSpace) + "..."
              : description.substring(0, 157) + "...";
          })()
        : description,
    robots: metaRobots,
    author: client.name,
    language: inLanguage,
    charset: "UTF-8",
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName,
      locale: ogLocale,
    },
    twitter: {
      card: client.heroImageMedia?.url ? "summary_large_image" : twitterCard,
      title,
      description,
      ...(twitterSite && { site: twitterSite }),
      ...(twitterCreator && { creator: twitterCreator }),
    },
    canonical: canonicalUrl,
    formatDetection: {
      telephone: !!client.phone,
      email: !!client.email,
      address: !!(client.addressStreet || client.addressCity),
    },
  };

  // og:locale:alternate when multi-language (ogp.me)
  const supportedLanguages =
    Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0
      ? client.knowsLanguage.map((lang) => {
          if (lang.toLowerCase().includes("arabic") || lang.toLowerCase().includes("ar")) return "ar_SA";
          if (lang.toLowerCase().includes("english") || lang.toLowerCase().includes("en")) return "en_US";
          return "ar_SA";
        })
      : ["ar_SA"];
  const uniqueLocales = [...new Set(supportedLanguages)];
  if (uniqueLocales.length > 1) {
    metaTags.openGraph.localeAlternate = uniqueLocales.filter((l) => l !== "ar_SA");
  }

  // alternates.languages for hreflang. Client languages win; else fall back to the
  // PLATFORM defaults from Settings (defaultAlternateLanguages / defaultHreflang).
  const hreflangMap: Record<string, string> = {};
  if (Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0) {
    for (const lang of client.knowsLanguage) {
      const lower = lang.toLowerCase();
      if (lower.includes("arabic") || lower.includes("ar")) hreflangMap["ar-SA"] = canonicalUrl;
      else if (lower.includes("english") || lower.includes("en")) hreflangMap["en"] = canonicalUrl;
    }
  }
  if (Object.keys(hreflangMap).length === 0) {
    const altList = Array.isArray(settings?.defaultAlternateLanguages)
      ? (settings!.defaultAlternateLanguages as Array<{ hreflang?: unknown }>)
      : [];
    for (const entry of altList) {
      const code = typeof entry?.hreflang === "string" ? entry.hreflang.trim() : "";
      if (code) hreflangMap[code] = canonicalUrl;
    }
    const primary = (settings?.defaultHreflang || inLanguage || "ar-SA").trim();
    if (primary && !hreflangMap[primary]) hreflangMap[primary] = canonicalUrl;
  }
  if (Object.keys(hreflangMap).length > 0) {
    metaTags.alternates = { languages: hreflangMap };
  }

  // OG image: heroImageMedia
  const orgName = client.name;
  const defaultAlt = `${orgName} - Organization`;
  const makeOgImage = (url: string, alt: string, w?: number | null, h?: number | null) => {
    const u = ensureAbsoluteUrl(url) || url;
    const secure = u.startsWith("https") ? u : u.replace("http://", "https://");
    return {
      url: u,
      secure_url: secure,
      type: "image/jpeg",
      width: w && w >= 1200 ? w : 1200,
      height: h && h >= 630 ? h : 630,
      alt: alt || defaultAlt,
    };
  };
  if (client.heroImageMedia?.url) {
    metaTags.openGraph.images = [
      makeOgImage(
        client.heroImageMedia.url,
        client.heroImageMedia.altText || defaultAlt,
        client.heroImageMedia.width,
        client.heroImageMedia.height
      ),
    ];
  }
  const ogImageUrl = metaTags.openGraph.images?.[0]?.secure_url || metaTags.openGraph.images?.[0]?.url;
  const ogImageAlt = metaTags.openGraph.images?.[0]?.alt;
  metaTags.twitter.card = ogImageUrl ? "summary_large_image" : "summary";
  if (ogImageUrl) {
    metaTags.twitter.image = ogImageUrl;
    metaTags.twitter.imageAlt = ogImageAlt || defaultAlt;
  }

  // Reviews (ClientReview, APPROVED) → AggregateRating + Review[].
  // Gallery (Media type=GALLERY) → Organization.image[].
  const [approvedReviews, reviewAgg, galleryMedia] = await Promise.all([
    db.clientReview.findMany({
      where: { clientId, status: "APPROVED" },
      select: { rating: true, comment: true, createdAt: true, author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.clientReview.aggregate({
      where: { clientId, status: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    }),
    db.media.findMany({
      where: { clientId, type: "GALLERY" },
      select: { url: true, altText: true, width: true, height: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);
  const reviewOptions =
    reviewAgg._count > 0
      ? {
          aggregateRating: {
            ratingValue: reviewAgg._avg.rating ?? 0,
            reviewCount: reviewAgg._count,
          },
          reviews: approvedReviews.map((r) => ({
            author: r.author?.name ?? "زائر",
            rating: r.rating,
            body: r.comment,
            datePublished: r.createdAt.toISOString().slice(0, 10),
          })),
        }
      : {};
  const galleryImages = galleryMedia.map((m) => ({
    url: m.url,
    altText: m.altText,
    width: m.width,
    height: m.height,
  }));

  // ── The client's schema.org @type ────────────────────────────────────────────
  //
  // Google's rule, applied literally: the MOST SPECIFIC valid type wins. That rule is
  // industry-agnostic, and so is the code — resolveOrganizationType knows nothing about
  // medicine. It compares what is STORED on the client with what we can DERIVE about it,
  // and keeps whichever says more.
  //
  // Today the only derivation we have is the YMYL config (specialty → Dentist, category →
  // MedicalClinic / LegalService / FinancialService). The day a furniture shop should
  // derive FurnitureStore, this block grows ONE more source below — the rule above it,
  // and every caller of this generator, stay exactly as they are.
  //
  // Live audit 2026-07-14: 12 of 17 medical clients were carrying a type that said nothing
  // about them — LocalBusiness (6), Organization (3), Corporation, NGO. The last two are the
  // real damage: they hang off Organization, NOT LocalBusiness, so they carry no geo and no
  // opening hours and can never produce a local result.
  const derivedType = deriveClientType(client);
  const clientForJsonLd = {
    ...client,
    organizationType: resolveOrganizationType(client.organizationType, derivedType) ?? client.organizationType,
  };

  const jsonLdGraph = generateCompleteOrganizationJsonLd(
    clientForJsonLd as unknown as Parameters<typeof generateCompleteOrganizationJsonLd>[0],
    clientPageUrl,
    { siteUrl, siteName, ...reviewOptions, galleryImages }
  );
  const jsonLdString = JSON.stringify(jsonLdGraph, null, 2);

  return {
    client: client as Record<string, unknown> & { slug: string },
    metaTags,
    jsonLdGraph,
    jsonLdString,
  };
}
