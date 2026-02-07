"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { generateCompleteOrganizationJsonLd } from "@/lib/seo/generate-complete-organization-jsonld";
import { normalizeJsonLd } from "@/lib/seo/jsonld-processor";
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
        twitterCard: true,
        twitterTitle: true,
        twitterDescription: true,
        twitterSite: true,
        canonicalUrl: true,
        metaRobots: true,
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
        ogImageMedia: {
          select: {
            url: true,
            altText: true,
            width: true,
            height: true,
          },
        },
        twitterImageMedia: {
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
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
    const effectiveMetaRobots = client.metaRobots?.trim() || "index, follow";

    // Validate and ensure absolute canonical URL
    const canonicalUrl = ensureAbsoluteUrl(clientPageUrl) || clientPageUrl;

    const metaTags: MetaTagsObject = {
      title: title.length > 60 ? title.substring(0, 57) + "..." : title,
      description: description.length > 160 ? description.substring(0, 157) + "..." : description,
      robots: effectiveMetaRobots,
      author: client.name,
      language: "ar",
      charset: "UTF-8",
      viewport: "width=device-width, initial-scale=1.0",
      openGraph: {
        title: title,
        description: description,
        type: "website",
        url: canonicalUrl,
        siteName: "Modonty",
        locale: "ar_SA",
      },
      twitter: {
        card: client.twitterCard || (client.twitterImageMedia?.url ? "summary_large_image" : "summary"),
        title: client.twitterTitle || title,
        description: client.twitterDescription || description,
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

    // OG image: ogImageMedia else logo fallback (ogp.me requires og:image; Facebook best practices)
    if (client.ogImageMedia?.url) {
      metaTags.openGraph.images = [
        makeOgImage(
          client.ogImageMedia.url,
          client.ogImageMedia.altText || defaultAlt,
          client.ogImageMedia.width,
          client.ogImageMedia.height
        ),
      ];
    } else if (client.logoMedia?.url) {
      metaTags.openGraph.images = [
        makeOgImage(
          client.logoMedia.url,
          client.logoMedia.altText || defaultAlt,
          client.logoMedia.width,
          client.logoMedia.height
        ),
      ];
    }

    // Twitter: image + imageAlt; fallback OG → logo when summary_large_image (X Developer Docs)
    const ogImageUrl = metaTags.openGraph.images?.[0]?.secure_url || metaTags.openGraph.images?.[0]?.url;
    const ogImageAlt = metaTags.openGraph.images?.[0]?.alt;
    const hasAnyImage = !!(client.twitterImageMedia?.url || ogImageUrl);
    metaTags.twitter.card = client.twitterCard || (hasAnyImage ? "summary_large_image" : "summary");

    if (client.twitterImageMedia?.url) {
      const twitterImageUrl = ensureAbsoluteUrl(client.twitterImageMedia.url) || client.twitterImageMedia.url;
      metaTags.twitter.image = twitterImageUrl.startsWith("https") ? twitterImageUrl : twitterImageUrl.replace("http://", "https://");
      metaTags.twitter.imageAlt = client.twitterImageMedia.altText || defaultAlt;
    } else if (metaTags.twitter.card === "summary_large_image" && ogImageUrl) {
      metaTags.twitter.image = ogImageUrl;
      metaTags.twitter.imageAlt = ogImageAlt || defaultAlt;
    }

    if (client.twitterSite) {
      metaTags.twitter.site = client.twitterSite;
      metaTags.twitter.creator = client.twitterSite;
    }

    const jsonLdGraph = generateCompleteOrganizationJsonLd(client as any, clientPageUrl);
    
    // Normalize JSON-LD structure (ensures consistency)
    const normalizedGraph = await normalizeJsonLd(jsonLdGraph);

    // Validate (Adobe + Ajv + business rules)
    const validationReport = await validateClientJsonLdComplete(normalizedGraph, {
      requireLogo: true, // Require logo for Organization rich results
      requireAddress: false, // Address optional but validated if present
      requireContactPoint: false, // ContactPoint optional but validated if present
      minNameLength: 2,
      maxNameLength: 100,
    });

    // Stringify normalized graph for storage
    const jsonLdString = JSON.stringify(normalizedGraph, null, 2);

    // Ensure metaTags is properly serialized as JSON to avoid MongoDB pipeline issues
    const metaTagsJson = JSON.parse(JSON.stringify(metaTags)) as Record<string, unknown>;

    await db.client.update({
      where: { id: clientId },
      data: {
        metaRobots: effectiveMetaRobots,
        metaTags: metaTagsJson as any,
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
