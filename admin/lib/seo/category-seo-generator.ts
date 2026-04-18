"use server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

interface SeoSettings {
  siteUrl: string;
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
  const pageUrl = category.canonicalUrl || `${s.siteUrl}/categories/${category.slug}`;
  const title = category.seoTitle || category.name;
  const description = category.seoDescription || `تصفح مقالات ${category.name}`;

  return {
    title,
    description,
    robots: s.metaRobots,
    alternates: {
      canonical: pageUrl,
      languages: { "ar-SA": pageUrl },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      siteName: s.siteName,
      locale: s.ogLocale,
      ...(category.socialImage && {
        images: [{ url: category.socialImage, alt: category.socialImageAlt || title }],
      }),
    },
    twitter: {
      card: s.twitterCard,
      title,
      description,
      ...(s.twitterSite && { site: s.twitterSite }),
      ...(s.twitterCreator && { creator: s.twitterCreator }),
      ...(category.socialImage && {
        images: [category.socialImage],
      }),
    },
  };
}

export async function buildCategoryJsonLd(category: CategoryData, s: SeoSettings) {
  const pageUrl = category.canonicalUrl || `${s.siteUrl}/categories/${category.slug}`;
  const title = category.seoTitle || category.name;
  const description = category.seoDescription || category.description || `تصفح مقالات ${category.name}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": pageUrl,
        name: title,
        description,
        url: pageUrl,
        inLanguage: s.inLanguage,
        isPartOf: { "@id": `${s.siteUrl}#website` },
        publisher: { "@id": `${s.siteUrl}#organization` },
        ...(category.socialImage && {
          image: { "@type": "ImageObject", url: category.socialImage, description: category.socialImageAlt || title },
        }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: s.siteUrl },
          { "@type": "ListItem", position: 2, name: "Categories", item: `${s.siteUrl}/categories` },
          { "@type": "ListItem", position: 3, name: category.name, item: pageUrl },
        ],
      },
      { "@type": "DefinedTerm", "@id": `${pageUrl}#term`, name: category.name, description, url: pageUrl },
      {
        "@type": "Organization",
        "@id": `${s.siteUrl}#organization`,
        name: s.siteName,
        url: s.siteUrl,
      },
      {
        "@type": "WebSite",
        "@id": `${s.siteUrl}#website`,
        name: s.siteName,
        url: s.siteUrl,
      },
    ],
  };
}

async function resolveSettings(): Promise<SeoSettings> {
  const settings = await getAllSettings();
  return {
    siteUrl: settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com",
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

    await db.category.update({
      where: { id: categoryId },
      data: {
        nextjsMetadata: JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue,
        nextjsMetadataLastGenerated: new Date(),
        jsonLdStructuredData: JSON.stringify(jsonLd),
        jsonLdLastGenerated: new Date(),
        jsonLdValidationReport: { valid: true, generatedAt: new Date().toISOString() } as Prisma.InputJsonValue,
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
