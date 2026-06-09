"use server";

import { revalidatePath } from "next/cache";

import { generateCompleteOrganizationJsonLd } from "@modonty/database/lib/seo/generate-organization-jsonld";
import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

// Console defaults (admin pulls these from getAllSettings; console hardcodes them
// so meta + JSON-LD come out identical to admin — single source of truth).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.modonty.com";
const SITE_NAME = "Modonty";
const IN_LANGUAGE = "ar";
const OG_LOCALE = "ar_SA";
const META_ROBOTS = "index, follow";
const TWITTER_CARD = "summary_large_image";

interface MetaTagsObject {
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

/**
 * Regenerate the client's cached SEO (Next.js metadata + JSON-LD @graph) and
 * persist it. Mirrors admin's generate-client-seo.ts EXACTLY for the metaTags +
 * JSON-LD shape so output is identical whether saved from admin or console.
 * Console skips the heavy Adobe/Ajv validation (no jsonLdValidationReport write).
 * NEVER throws — a regen failure must never break the profile save.
 */
export async function regenerateClientSeo(
  clientId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
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
        // Saudi Arabia & Gulf Identifiers
        commercialRegistrationNumber: true,
        vatID: true,
        taxID: true,
        legalForm: true,
        // Classification & Business Info
        businessActivityCode: true,
        isicV4: true,
        numberOfEmployees: true,
        // Additional Properties
        slogan: true,
        keywords: true,
        knowsLanguage: true,
        // Client-page presentation (mini-site) → JSON-LD
        services: true,
        teamMembers: true,
        credentials: true,
        introVideoUrl: true,
        organizationType: true,
        openingHoursSpecification: true,
        priceRange: true,
        gbpProfileUrl: true,
        gbpPlaceId: true,
        // Relationships
        parentOrganizationId: true,
        logoMedia: {
          select: {
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        heroImageMedia: {
          select: {
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        industry: {
          select: {
            id: true,
            name: true,
          },
        },
        parentOrganization: {
          select: {
            id: true,
            name: true,
            url: true,
            slug: true,
          },
        },
      },
    });

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    const siteUrl = SITE_URL;
    const siteName = SITE_NAME;
    const inLanguage = IN_LANGUAGE;
    const ogLocale = OG_LOCALE;
    const metaRobots = META_ROBOTS;
    const twitterCard = TWITTER_CARD;
    const clientPageUrl = client.canonicalUrl || `${siteUrl}/clients/${client.slug}`;

    // Ensure URLs are absolute and HTTPS
    const ensureAbsoluteUrl = (url: string | null | undefined): string | undefined => {
      if (!url) return undefined;
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url.replace("http://", "https://");
      }
      if (url.startsWith("/")) {
        return `${siteUrl}${url}`;
      }
      return `https://${url}`;
    };

    const title = client.seoTitle || client.name;
    const description = client.seoDescription || client.description || "";
    const effectiveMetaRobots = metaRobots;

    // Validate and ensure absolute canonical URL
    const canonicalUrl = ensureAbsoluteUrl(clientPageUrl) || clientPageUrl;

    const metaTags: MetaTagsObject = {
      title: title.length > 60
        ? (() => {
            const lastSpace = title.lastIndexOf(" ", 57);
            return lastSpace > 0
              ? title.substring(0, lastSpace) + "..."
              : title.substring(0, 57) + "...";
          })()
        : title,
      description: description.length > 160
        ? (() => {
            const lastSpace = description.lastIndexOf(" ", 157);
            return lastSpace > 0
              ? description.substring(0, lastSpace) + "..."
              : description.substring(0, 157) + "...";
          })()
        : description,
      robots: effectiveMetaRobots,
      author: client.name,
      language: inLanguage,
      charset: "UTF-8",
      openGraph: {
        title: title,
        description: description,
        type: "website",
        url: canonicalUrl,
        siteName: siteName,
        locale: ogLocale,
      },
      twitter: {
        card: client.heroImageMedia?.url ? "summary_large_image" : twitterCard,
        title: title,
        description: description,
      },
      canonical: canonicalUrl,
      formatDetection: {
        telephone: !!client.phone,
        email: !!client.email,
        address: !!(client.addressStreet || client.addressCity),
      },
    };

    // Get supported languages from client data
    const supportedLanguages = Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0
      ? client.knowsLanguage.map((lang) => {
          if (lang.toLowerCase().includes("arabic") || lang.toLowerCase().includes("ar")) return "ar_SA";
          if (lang.toLowerCase().includes("english") || lang.toLowerCase().includes("en")) return "en_US";
          return "ar_SA";
        })
      : ["ar_SA"];

    // og:locale:alternate when multi-language (ogp.me)
    const uniqueLocales = [...new Set(supportedLanguages)];
    if (uniqueLocales.length > 1) {
      metaTags.openGraph.localeAlternate = uniqueLocales.filter((l) => l !== "ar_SA");
    }

    // alternates.languages for hreflang (Google i18n SEO).
    // Client languages win; else fall back to PLATFORM defaults from Settings
    // (defaultAlternateLanguages = JSON array of {hreflang} seeded by the admin
    // hreflang-sync: GCC + Egypt + ar + x-default). MUST mirror admin's
    // generate-client-seo so a console save never wipes the hreflang admin generated.
    const hreflangMap: Record<string, string> = {};
    if (Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0) {
      for (const lang of client.knowsLanguage) {
        const lower = lang.toLowerCase();
        if (lower.includes("arabic") || lower.includes("ar")) {
          hreflangMap["ar-SA"] = canonicalUrl;
        } else if (lower.includes("english") || lower.includes("en")) {
          hreflangMap["en"] = canonicalUrl;
        }
      }
    }
    if (Object.keys(hreflangMap).length === 0) {
      const settings = await db.settings.findFirst({
        select: { defaultAlternateLanguages: true, defaultHreflang: true, inLanguage: true },
      });
      const altList = Array.isArray(settings?.defaultAlternateLanguages)
        ? (settings!.defaultAlternateLanguages as Array<{ hreflang?: unknown }>)
        : [];
      for (const entry of altList) {
        const code = typeof entry?.hreflang === "string" ? entry.hreflang.trim() : "";
        if (code) hreflangMap[code] = canonicalUrl;
      }
      const primary = (settings?.defaultHreflang || settings?.inLanguage || "ar-SA").trim();
      if (primary && !hreflangMap[primary]) hreflangMap[primary] = canonicalUrl;
    }
    if (Object.keys(hreflangMap).length > 0) {
      metaTags.alternates = { languages: hreflangMap };
    }

    const orgName = client.name;
    const defaultAlt = `${orgName} - Organization`;

    type OgImage = { url: string; secure_url: string; type: string; width: number; height: number; alt: string };
    const makeOgImage = (url: string, alt: string, w?: number | null, h?: number | null): OgImage => {
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

    // OG image: heroImageMedia (required)
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

    // Twitter: heroImageMedia (required)
    const ogImageUrl = metaTags.openGraph.images?.[0]?.secure_url || metaTags.openGraph.images?.[0]?.url;
    const ogImageAlt = metaTags.openGraph.images?.[0]?.alt;
    metaTags.twitter.card = ogImageUrl ? "summary_large_image" : "summary";

    if (ogImageUrl) {
      metaTags.twitter.image = ogImageUrl;
      metaTags.twitter.imageAlt = ogImageAlt || defaultAlt;
    }

    // Customer reviews (ClientReview, APPROVED) → AggregateRating + Review[].
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

    const jsonLdGraph = generateCompleteOrganizationJsonLd(
      client as unknown as Parameters<typeof generateCompleteOrganizationJsonLd>[0],
      clientPageUrl,
      { siteUrl, siteName, ...reviewOptions, galleryImages },
    );

    // Stringify graph for storage (no validation in console)
    const jsonLdString = JSON.stringify(jsonLdGraph, null, 2);

    // Ensure metaTags is properly serialized as JSON to avoid MongoDB pipeline issues
    const metaTagsJson = JSON.parse(JSON.stringify(metaTags)) as Record<string, unknown>;

    await db.client.update({
      where: { id: clientId },
      data: {
        nextjsMetadata: metaTagsJson as Prisma.InputJsonValue,
        nextjsMetadataLastGenerated: new Date(),
        jsonLdStructuredData: jsonLdString,
        jsonLdLastGenerated: new Date(),
      },
    });

    // Revalidate the public client page + the profile dashboard
    revalidatePath(`/clients/${client.slug}`);
    revalidatePath("/dashboard/profile");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to regenerate SEO data";
    return { success: false, error: message };
  }
}
