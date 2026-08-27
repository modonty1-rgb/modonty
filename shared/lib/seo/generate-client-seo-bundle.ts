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
import { absoluteUrl, entityUrl } from "./absolute-url";
import { imageMimeFromUrl } from "./image-mime-from-url";
import { shareImageAlt } from "./share-image-alt";
import { truncateAtWordBoundary } from "./truncate-at-word-boundary";
import { requireSiteUrl } from "./require-site-url";
import { generateCompleteOrganizationJsonLd } from "./generate-organization-jsonld";
import { mediaSrc } from "../media-src";
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
  /** Optional: a partner with no description of its own ships no description tag. */ description?: string;
  robots: string;
  author: string;
  language: string;
  charset: string;
  openGraph: {
    title: string;
    /** Optional: a partner with no description of its own ships no description tag. */ description?: string;
    type: string;
    url: string;
    siteName: string;
    locale: string;
    localeAlternate?: string[];
    images?: Array<{
      url: string;
      secure_url: string;
      /** Optional: declared only when the file extension actually says what the type is. */
      type?: string;
      width?: number;
      height?: number;
      /** Optional: a real description from the database — never an invented one. */
      alt?: string;
    }>;
  };
  twitter: {
    card: string;
    title: string;
    /** Optional: a partner with no description of its own ships no description tag. */ description?: string;
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
  // The video we host — carries the name/description/thumbnail/duration that a valid
  // VideoObject needs, which the bare link never had.
  introVideoMedia: {
    select: {
      title: true,
      description: true,
      mp4Url: true,
      playbackUrl: true,
      thumbnailUrl: true,
      durationSec: true,
      createdAt: true,
    },
  },
  organizationType: true,
  isYmyl: true,
  ymylCategory: true,
  ymylData: true,
  openingHoursSpecification: true,
  priceRange: true,
  gbpProfileUrl: true,
  gbpPlaceId: true,
  parentOrganizationId: true,
  logoMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true, width: true, height: true, description: true, createdAt: true } },
  heroImageMedia: { select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true, width: true, height: true, description: true, createdAt: true } },
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
  imageOwnerName: true,
  imageLicenseUrl: true,
  imageAcquireLicensePageUrl: true,
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
  // No literal fallback — this becomes the partner page's canonical and every `@id` in its
  // stored JSON-LD bundle.
  const siteUrl = requireSiteUrl(settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL);
  const siteName = settings?.siteName || "Modonty";
  const inLanguage = settings?.inLanguage || "ar";
  const ogLocale = settings?.defaultOgLocale || "ar_SA";
  const metaRobots = settings?.defaultMetaRobots || "index, follow";
  const twitterCard = settings?.defaultTwitterCard || "summary_large_image";
  const twitterSite = settings?.twitterSite || undefined;
  const twitterCreator = settings?.twitterCreator || undefined;
  const clientPageUrl = client.canonicalUrl || entityUrl("clients", client.slug, siteUrl);

  const ensureAbsoluteUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url.replace("http://", "https://");
    }
    if (url.startsWith("/")) return absoluteUrl(url, siteUrl);
    return `https://${url}`;
  };

  const title = client.seoTitle || client.name;
  // `undefined`, never `""`. Measured on modonty_dev 27 Aug 2026: FOUR indexed partner pages
  // carried `description: ""`, `og:description: ""` and `twitter:description: ""` because their
  // row has neither field. An empty tag is not a missing tag: the missing one lets Google pick
  // text from the page, the empty one hands it a blank answer and it uses that.
  const description = client.seoDescription?.trim() || client.description?.trim() || undefined;
  const canonicalUrl = ensureAbsoluteUrl(clientPageUrl) || clientPageUrl;

  const metaTags: ClientMetaTags = {
    title: truncateAtWordBoundary(title, 60),
    ...(description && { description: truncateAtWordBoundary(description, 160) }),
    robots: metaRobots,
    author: client.name,
    language: inLanguage,
    charset: "UTF-8",
    openGraph: {
      title,
      ...(description && { description }),
      type: "website",
      url: canonicalUrl,
      siteName,
      locale: ogLocale,
    },
    twitter: {
      card: mediaSrc(client.heroImageMedia) ? "summary_large_image" : twitterCard,
      title,
      ...(description && { description }),
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
  const makeOgImage = (url: string, alt: string | undefined, w?: number | null, h?: number | null) => {
    const u = ensureAbsoluteUrl(url) || url;
    const secure = u.startsWith("https") ? u : u.replace("http://", "https://");
    return {
      url: u,
      secure_url: secure,
      // Was the literal "image/jpeg" while the seeded Settings default said "image/webp" —
      // one of the two lied on every partner card, and after the Bunny migration most files
      // are actually WebP. Read the real extension; declare nothing when it is unreadable.
      ...(imageMimeFromUrl(u) ? { type: imageMimeFromUrl(u) } : {}),
      ...(w && h ? { width: w, height: h } : {}),
      // Was `alt || `شعار ${client.name}``, and before that `${client.name} - Organization`:
      // a sentence written in the code, in English on an Arabic site, calling a HERO photo a
      // logo — this builder never runs on the logo. Open Graph asks for "A description of
      // what is in the image (not a caption)" <https://ogp.me>, and the code does not know
      // what is in the image. The team does, in altText or description; when both are empty
      // the field is left out.
      ...(alt ? { alt } : {}),
    };
  };
  const heroSrc = mediaSrc(client.heroImageMedia);
  if (client.heroImageMedia && heroSrc) {
    metaTags.openGraph.images = [
      makeOgImage(
        heroSrc,
        shareImageAlt(client.heroImageMedia.altText) || shareImageAlt(client.heroImageMedia.description),
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
    if (ogImageAlt) metaTags.twitter.imageAlt = ogImageAlt;
  }

  // Reviews (ClientReview, APPROVED) → AggregateRating + Review[].
  // Gallery (Media type=GALLERY) → Organization.image[].
  const [approvedReviews, reviewAgg, galleryMedia] = await Promise.all([
    // Select the scalar `reviewerId`, never the `reviewer` relation. MongoDB has no
    // referential integrity — Prisma only emulates `onDelete: Cascade` for its own deletes —
    // so a user removed any other way leaves an orphaned id, and joining a REQUIRED relation
    // then throws "Field reviewer is required to return data, got null". That killed SEO
    // generation for 11 clients over 2 orphan rows (2026-07-30). Names are resolved below,
    // and a review whose name cannot be resolved is dropped rather than given a stand-in.
    db.clientReview.findMany({
      where: { clientId, status: "APPROVED" },
      select: { rating: true, comment: true, createdAt: true, reviewerId: true },
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
      // `bunnyUrl` MUST be selected — without it `mediaSrc()` silently falls back to the
      // Cloudinary `url` forever, and `tsc` never complains. This one select kept 10 clients
      // emitting Cloudinary in Organization.image[] after every regeneration (2026-07-30).
      select: { url: true, bunnyUrl: true, blurDataURL: true, altText: true, width: true, height: true, description: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);
  // Resolve reviewer names separately — orphaned ids just resolve to undefined.
  const reviewerIds = [...new Set(approvedReviews.map((r) => r.reviewerId))];
  const reviewerById = new Map(
    reviewerIds.length
      ? (
          await db.user.findMany({
            where: { id: { in: reviewerIds } },
            select: { id: true, name: true },
          })
        ).map((u) => [u.id, u.name])
      : [],
  );

  // A review is published only when we can name its author. Google, Review snippet:
  // "The reviewer's name must be a valid name." The "زائر" stand-in that stood here was
  // not a name — it was the word "visitor" attached to a real person's review, and an
  // orphaned reviewerId (Mongo keeps no cascade) turned every such review into one.
  const namedReviews = approvedReviews.flatMap((r) => {
    const author = reviewerById.get(r.reviewerId)?.trim();
    if (!author) return [];
    return [
      {
        author,
        rating: r.rating,
        body: r.comment,
        datePublished: r.createdAt.toISOString().slice(0, 10),
      },
    ];
  });

  // ratingValue is published only when an average actually exists. The `?? 0` it replaces
  // emitted a 0 on the 1–5 scale Google assumes by default — below worstRating, and a
  // score no reviewer ever gave.
  const averageRating = reviewAgg._avg.rating;
  const reviewOptions = {
    ...(reviewAgg._count > 0 && typeof averageRating === "number" && averageRating > 0
      ? { aggregateRating: { ratingValue: averageRating, reviewCount: reviewAgg._count } }
      : {}),
    ...(namedReviews.length > 0 ? { reviews: namedReviews } : {}),
  };
  const galleryImages = galleryMedia.map((m) => ({
    url: mediaSrc(m) ?? m.url,
    altText: m.altText,
    width: m.width,
    height: m.height,
    description: m.description,
    createdAt: m.createdAt,
  }));

  // The client's @type is decided INSIDE generateCompleteOrganizationJsonLd — it has to
  // be, because the admin cascade builds cards through that function without ever passing
  // here. The rule used to live in this file, which meant a cascade run would have written
  // "Corporation" back onto a clinic (caught on production 2026-07-14). Pass the row as it
  // is; the builder resolves the type once, for every path.

  const jsonLdGraph = generateCompleteOrganizationJsonLd(
    client as unknown as Parameters<typeof generateCompleteOrganizationJsonLd>[0],
    clientPageUrl,
    {
      siteUrl,
      siteName,
      ...reviewOptions,
      galleryImages,
      imageLicensing: {
        ownerName: settings?.imageOwnerName ?? null,
        organizationUrl: siteUrl,
        licenseUrl: settings?.imageLicenseUrl ?? null,
        acquireLicensePageUrl: settings?.imageAcquireLicensePageUrl ?? null,
      },
    }
  );
  const jsonLdString = JSON.stringify(jsonLdGraph, null, 2);

  return {
    client: client as Record<string, unknown> & { slug: string },
    metaTags,
    jsonLdGraph,
    jsonLdString,
  };
}
