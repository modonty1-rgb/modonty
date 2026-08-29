"use server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { absoluteUrl, entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";
import { requireSiteUrl } from "@modonty/shared/lib/seo/require-site-url";

import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { arabicBreadcrumbMessages } from "./arabic-breadcrumb-messages";
import { validateReferenceJsonLd } from "./validate-reference-jsonld";

interface SeoSettings {
  siteUrl: string;
  /** Settings.defaultAlternateLanguages — the one list every page declares. */
  alternateLanguages: unknown;
  siteName: string;
  inLanguage: string;
  ogLocale: string;
  metaRobots: string;
  twitterCard: string;
  twitterSite?: string;
  twitterCreator?: string;
}

interface IndustryData {
  name: string;
  slug: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  socialImage?: string | null;
  socialImageAlt?: string | null;
}

export async function buildIndustryMetadata(industry: IndustryData, s: SeoSettings) {
  const pageUrl = industry.canonicalUrl || entityUrl("industries", industry.slug, s.siteUrl);
  const title = industry.seoTitle || industry.name;
  // The row's own text, or none. A sentence written here becomes a meta description Google
  // reads and nobody can edit from the admin — the value this row's own field exists to hold.
  // Absent stays absent; the industry's SEO screen is where it gets filled.
  const description = industry.seoDescription?.trim() || industry.description?.trim() || undefined;

  return {
    title,
    ...(description && { description }),
    robots: s.metaRobots,
    alternates: {
      canonical: pageUrl,
      // Was { "ar-SA": pageUrl } — one locale typed into the file while Settings held nine,
      // so every taxonomy page shipped a single hreflang. Same source as every other page.
      languages: buildHreflangLanguages(s.alternateLanguages, pageUrl, s.siteUrl),
    },
    openGraph: {
      title,
      ...(description && { description }),
      type: "website",
      url: pageUrl,
      siteName: s.siteName,
      locale: s.ogLocale,
      ...(industry.socialImage && {
        images: [{ url: industry.socialImage, alt: industry.socialImageAlt?.trim() || title }],
      }),
    },
    twitter: {
      card: s.twitterCard,
      title,
      ...(description && { description }),
      ...(s.twitterSite && { site: s.twitterSite }),
      ...(s.twitterCreator && { creator: s.twitterCreator }),
      ...(industry.socialImage && {
        images: [industry.socialImage],
      }),
    },
  };
}

export async function buildIndustryJsonLd(industry: IndustryData, s: SeoSettings) {
  const pageUrl = industry.canonicalUrl || entityUrl("industries", industry.slug, s.siteUrl);
  const siteIds = buildSiteEntityIds(s.siteUrl);
  const title = industry.seoTitle || industry.name;
  // The row's own text, or none. A sentence written here becomes a meta description Google
  // reads and nobody can edit from the admin — the value this row's own field exists to hold.
  // Absent stays absent; the industry's SEO screen is where it gets filled.
  const description = industry.seoDescription?.trim() || industry.description?.trim() || undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": pageUrl,
        name: title,
        ...(description && { description }),
        url: pageUrl,
        inLanguage: s.inLanguage,
        isPartOf: { "@id": siteIds.website },
        publisher: { "@id": siteIds.organization },
        ...(industry.socialImage && {
          image: { "@type": "ImageObject", url: industry.socialImage, description: industry.socialImageAlt?.trim() || title },
        }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: arabicBreadcrumbMessages.home, item: s.siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: arabicBreadcrumbMessages.industries,
            item: absoluteUrl("/industries", s.siteUrl),
          },
          { "@type": "ListItem", position: 3, name: industry.name, item: pageUrl },
        ],
      },
      { "@type": "DefinedTerm", "@id": `${pageUrl}#term`, name: industry.name, ...(description && { description }), url: pageUrl },
      {
        "@type": "Organization",
        "@id": siteIds.organization,
        name: s.siteName,
        url: s.siteUrl,
      },
      // No WebSite node here on purpose. Google: "The WebSite structured data must be on the
      // home page of the site … you only need to add this markup to the home page"
      // (developers.google.com/search/docs/appearance/site-names). `isPartOf` above still
      // points at the site's WebSite `@id`, which is the correct cross-page reference — the
      // entity is DEFINED once, on the home page, and referred to from everywhere else.
      // The repo's own validator already flags a WebSite node on a list page as a defect
      // (modonty-jsonld-validator.ts). Removed 28 Aug 2026.
    ],
  };
}

async function resolveSettings(): Promise<SeoSettings> {
  const settings = await getAllSettings();
  return {
    // No literal fallback — this becomes the canonical of every industry page.
    siteUrl: requireSiteUrl(settings.siteUrl),
    alternateLanguages: (settings as { defaultAlternateLanguages?: unknown }).defaultAlternateLanguages ?? null,
    siteName: settings.siteName || "Modonty",
    inLanguage: settings.inLanguage || "ar",
    ogLocale: settings.defaultOgLocale || "ar_SA",
    metaRobots: settings.defaultMetaRobots || "index, follow",
    twitterCard: settings.defaultTwitterCard || "summary_large_image",
    twitterSite: settings.twitterSite || undefined,
    twitterCreator: settings.twitterCreator || undefined,
  };
}

export async function generateAndSaveIndustrySeo(industryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const industry = await db.industry.findUnique({
      where: { id: industryId },
      select: { id: true, name: true, slug: true, description: true, seoTitle: true, seoDescription: true, canonicalUrl: true, socialImage: true, socialImageAlt: true },
    });
    if (!industry) return { success: false, error: "Industry not found" };

    const s = await resolveSettings();
    const metadata = await buildIndustryMetadata(industry, s);
    const jsonLd = await buildIndustryJsonLd(industry, s);
    // The real three validators. This line used to be `{ valid: true, … }` — a constant that
    // told the dashboard the graph was clean before anything had looked at it.
    const validationReport = await validateReferenceJsonLd(jsonLd);

    await db.industry.update({
      where: { id: industryId },
      data: {
        nextjsMetadata: JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue,
        nextjsMetadataLastGenerated: new Date(),
        jsonLdStructuredData: JSON.stringify(jsonLd),
        jsonLdLastGenerated: new Date(),
        jsonLdValidationReport: validationReport,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function batchGenerateIndustrySeo(): Promise<{ successful: number; failed: number; total: number }> {
  const industries = await db.industry.findMany({ select: { id: true } });
  let successful = 0; let failed = 0;
  for (const { id } of industries) {
    const result = await generateAndSaveIndustrySeo(id);
    if (result.success) successful++; else failed++;
  }
  return { successful, failed, total: industries.length };
}
