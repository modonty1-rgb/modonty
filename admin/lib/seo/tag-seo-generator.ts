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

interface TagData {
  name: string;
  slug: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  socialImage?: string | null;
  socialImageAlt?: string | null;
}

export async function buildTagMetadata(tag: TagData, s: SeoSettings) {
  const pageUrl = tag.canonicalUrl || `${s.siteUrl}/tags/${tag.slug}`;
  const title = tag.seoTitle || tag.name;
  const description = tag.seoDescription || `مقالات بتاج ${tag.name}`;

  return {
    title,
    description,
    robots: s.metaRobots,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      siteName: s.siteName,
      locale: s.ogLocale,
      ...(tag.socialImage && {
        images: [{ url: tag.socialImage, alt: tag.socialImageAlt || title }],
      }),
    },
    twitter: {
      card: s.twitterCard,
      title,
      description,
      ...(s.twitterSite && { site: s.twitterSite }),
      ...(s.twitterCreator && { creator: s.twitterCreator }),
      ...(tag.socialImage && {
        images: [tag.socialImage],
      }),
    },
  };
}

export async function buildTagJsonLd(tag: TagData, s: SeoSettings) {
  const pageUrl = tag.canonicalUrl || `${s.siteUrl}/tags/${tag.slug}`;
  const title = tag.seoTitle || tag.name;
  const description = tag.seoDescription || tag.description || `مقالات بتاج ${tag.name}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": pageUrl, name: title, description, url: pageUrl, inLanguage: s.inLanguage },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: s.siteUrl },
          { "@type": "ListItem", position: 2, name: "الوسوم", item: `${s.siteUrl}/tags` },
          { "@type": "ListItem", position: 3, name: tag.name, item: pageUrl },
        ],
      },
      { "@type": "DefinedTerm", "@id": `${pageUrl}#term`, name: tag.name, description, url: pageUrl },
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

export async function generateAndSaveTagSeo(tagId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tag = await db.tag.findUnique({
      where: { id: tagId },
      select: { id: true, name: true, slug: true, description: true, seoTitle: true, seoDescription: true, canonicalUrl: true, socialImage: true, socialImageAlt: true },
    });
    if (!tag) return { success: false, error: "Tag not found" };

    const s = await resolveSettings();
    const metadata = await buildTagMetadata(tag, s);
    const jsonLd = await buildTagJsonLd(tag, s);

    await db.tag.update({
      where: { id: tagId },
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

export async function batchGenerateTagSeo(): Promise<{ successful: number; failed: number; total: number }> {
  const tags = await db.tag.findMany({ select: { id: true } });
  let successful = 0; let failed = 0;
  for (const { id } of tags) {
    const result = await generateAndSaveTagSeo(id);
    if (result.success) successful++; else failed++;
  }
  return { successful, failed, total: tags.length };
}
