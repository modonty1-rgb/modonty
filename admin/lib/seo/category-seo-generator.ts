"use server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { absoluteUrl, entityUrl } from "@modonty/shared/lib/seo/absolute-url";
import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";
import { requireSiteUrl } from "@modonty/shared/lib/seo/require-site-url";
import { buildSiteEntityIds } from "@modonty/shared/lib/seo/site-entity-ids";

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

interface CategoryData {
  name: string;
  slug: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  socialImage?: string | null;
  socialImageAlt?: string | null;
}

export async function buildCategoryMetadata(category: CategoryData, s: SeoSettings) {
  const pageUrl = category.canonicalUrl || entityUrl("categories", category.slug, s.siteUrl);
  const title = category.seoTitle || category.name;
  // The row's own text, or none. A sentence written here becomes a meta description Google
  // reads and nobody can edit from the admin — the value this row's own field exists to hold.
  // Absent stays absent; the category's SEO screen is where it gets filled.
  const description = category.seoDescription?.trim() || category.description?.trim() || undefined;

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
      ...(category.socialImage && {
        images: [{ url: category.socialImage, alt: category.socialImageAlt?.trim() || title }],
      }),
    },
    twitter: {
      card: s.twitterCard,
      title,
      ...(description && { description }),
      ...(s.twitterSite && { site: s.twitterSite }),
      ...(s.twitterCreator && { creator: s.twitterCreator }),
      ...(category.socialImage && {
        images: [category.socialImage],
      }),
    },
  };
}

export async function buildCategoryJsonLd(category: CategoryData, s: SeoSettings) {
  const pageUrl = category.canonicalUrl || entityUrl("categories", category.slug, s.siteUrl);
  const siteIds = buildSiteEntityIds(s.siteUrl);
  const title = category.seoTitle || category.name;
  // The row's own text, or none. A sentence written here becomes a meta description Google
  // reads and nobody can edit from the admin — the value this row's own field exists to hold.
  // Absent stays absent; the category's SEO screen is where it gets filled.
  const description = category.seoDescription?.trim() || category.description?.trim() || undefined;

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
        ...(category.socialImage && {
          image: { "@type": "ImageObject", url: category.socialImage, description: category.socialImageAlt?.trim() || title },
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
            name: arabicBreadcrumbMessages.categories,
            item: absoluteUrl("/categories", s.siteUrl),
          },
          { "@type": "ListItem", position: 3, name: category.name, item: pageUrl },
        ],
      },
      { "@type": "DefinedTerm", "@id": `${pageUrl}#term`, name: category.name, ...(description && { description }), url: pageUrl },
      {
        "@type": "Organization",
        "@id": siteIds.organization,
        name: s.siteName,
        url: s.siteUrl,
      },
      {
        "@type": "WebSite",
        "@id": siteIds.website,
        name: s.siteName,
        url: s.siteUrl,
      },
    ],
  };
}

async function resolveSettings(): Promise<SeoSettings> {
  const settings = await getAllSettings();
  return {
    // No literal fallback — this becomes the canonical of every category page.
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

export async function generateAndSaveCategorySeo(categoryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const category = await db.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true, description: true, seoTitle: true, seoDescription: true, canonicalUrl: true, socialImage: true, socialImageAlt: true },
    });
    if (!category) return { success: false, error: "Category not found" };

    const s = await resolveSettings();
    const metadata = await buildCategoryMetadata(category, s);
    const jsonLd = await buildCategoryJsonLd(category, s);
    // The real three validators. This line used to be `{ valid: true, … }` — a constant that
    // told the dashboard the graph was clean before anything had looked at it.
    const validationReport = await validateReferenceJsonLd(jsonLd);

    await db.category.update({
      where: { id: categoryId },
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

export async function batchGenerateCategorySeo(): Promise<{ successful: number; failed: number; total: number }> {
  const categories = await db.category.findMany({ select: { id: true } });
  let successful = 0; let failed = 0;
  for (const { id } of categories) {
    const result = await generateAndSaveCategorySeo(id);
    if (result.success) successful++; else failed++;
  }
  return { successful, failed, total: categories.length };
}
