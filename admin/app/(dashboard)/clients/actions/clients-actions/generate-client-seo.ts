"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { generateCompleteOrganizationJsonLd } from "@/lib/seo/generate-complete-organization-jsonld";
import { validateClientJsonLdComplete } from "../../helpers/client-seo-config/client-jsonld-validator";
import type { Prisma } from "@prisma/client";

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

export async function generateClientSEO(clientId: string) {
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
        licenseNumber: true,
        licenseAuthority: true,
        // Additional Properties
        slogan: true,
        keywords: true,
        knowsLanguage: true,
        organizationType: true,
        openingHoursSpecification: true,
        priceRange: true,
        gbpProfileUrl: true,
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

    const settings = await (await import("@/app/(dashboard)/settings/actions/settings-actions")).getAllSettings();
    const siteUrl = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
    const siteName = settings.siteName || "Modonty";
    const inLanguage = settings.inLanguage || "ar";
    const ogLocale = settings.defaultOgLocale || "ar_SA";
    const metaRobots = settings.defaultMetaRobots || "index, follow";
    const twitterCard = settings.defaultTwitterCard || "summary_large_image";
    const twitterSite = settings.twitterSite || undefined;
    const twitterCreator = settings.twitterCreator || undefined;
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

    // Get supported languages from client data
    const supportedLanguages = Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0
      ? client.knowsLanguage.map(lang => {
          // Map language names to locale codes
          if (lang.toLowerCase().includes("arabic") || lang.toLowerCase().includes("ar")) return "ar_SA";
          if (lang.toLowerCase().includes("english") || lang.toLowerCase().includes("en")) return "en_US";
          return "ar_SA"; // Default
        })
      : ["ar_SA"];

    // og:locale:alternate when multi-language (ogp.me)
    const uniqueLocales = [...new Set(supportedLanguages)];
    if (uniqueLocales.length > 1) {
      metaTags.openGraph.localeAlternate = uniqueLocales.filter((l) => l !== "ar_SA");
    }

    // alternates.languages for hreflang (Google i18n SEO)
    if (Array.isArray(client.knowsLanguage) && client.knowsLanguage.length > 0) {
      const hreflangMap: Record<string, string> = {};
      for (const lang of client.knowsLanguage) {
        const lower = lang.toLowerCase();
        if (lower.includes("arabic") || lower.includes("ar")) {
          hreflangMap["ar-SA"] = canonicalUrl;
        } else if (lower.includes("english") || lower.includes("en")) {
          hreflangMap["en"] = canonicalUrl;
        }
      }
      if (Object.keys(hreflangMap).length > 0) {
        metaTags.alternates = { languages: hreflangMap };
      }
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

    const jsonLdGraph = generateCompleteOrganizationJsonLd(
      client as unknown as Parameters<typeof generateCompleteOrganizationJsonLd>[0],
      clientPageUrl,
      { siteUrl, siteName },
    );

    // Validate (Adobe + Ajv + business rules)
    const validationReport = await validateClientJsonLdComplete(jsonLdGraph, {
      requireLogo: true, // Require logo for Organization rich results
      requireAddress: false, // Address optional but validated if present
      requireContactPoint: false, // ContactPoint optional but validated if present
      minNameLength: 2,
      maxNameLength: 100,
    });

    // Stringify graph for storage
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
        jsonLdValidationReport: JSON.parse(
          JSON.stringify(validationReport)
        ) as Prisma.InputJsonValue,
      },
    });

    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/clients");

    return { success: true };
  } catch (error) {
    console.error("Error generating client SEO:", error);
    const message = error instanceof Error ? error.message : "Failed to generate SEO data";
    return { success: false, error: message };
  }
}
