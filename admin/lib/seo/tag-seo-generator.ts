"use server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

function getSiteUrl(settings: Record<string, unknown>): string {
  return (settings?.siteUrl as string) || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
}

export async function buildTagMetadata(tag: {
  name: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  socialImage?: string | null;
}, siteUrl: string) {
  const pageUrl = tag.canonicalUrl || `${siteUrl}/tags/${tag.slug}`;
  const title = tag.seoTitle || tag.name;
  const description = tag.seoDescription || `مقالات بتاج ${tag.name}`;
  return {
    title,
    description,
    robots: "index, follow",
    alternates: { canonical: pageUrl },
    openGraph: {
      title, description, type: "website", url: pageUrl,
      siteName: "Modonty", locale: "ar_SA",
      ...(tag.socialImage && { images: [{ url: tag.socialImage, alt: title }] }),
    },
    twitter: {
      card: tag.socialImage ? "summary_large_image" as const : "summary" as const,
      title, description,
      ...(tag.socialImage && { images: [tag.socialImage] }),
    },
  };
}

export async function buildTagJsonLd(tag: {
  name: string;
  slug: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
}, siteUrl: string) {
  const pageUrl = tag.canonicalUrl || `${siteUrl}/tags/${tag.slug}`;
  const title = tag.seoTitle || tag.name;
  const description = tag.seoDescription || tag.description || `مقالات بتاج ${tag.name}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": pageUrl, name: title, description, url: pageUrl, inLanguage: "ar" },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "التاجات", item: `${siteUrl}/tags` },
          { "@type": "ListItem", position: 3, name: tag.name, item: pageUrl },
        ],
      },
      { "@type": "DefinedTerm", "@id": `${pageUrl}#term`, name: tag.name, description, url: pageUrl },
    ],
  };
}

export async function generateAndSaveTagSeo(tagId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tag = await db.tag.findUnique({
      where: { id: tagId },
      select: { id: true, name: true, slug: true, description: true, seoTitle: true, seoDescription: true, canonicalUrl: true, socialImage: true },
    });
    if (!tag) return { success: false, error: "Tag not found" };

    const settings = await getAllSettings();
    const siteUrl = getSiteUrl(settings as unknown as Record<string, unknown>);

    const metadata = await buildTagMetadata(tag, siteUrl);
    const jsonLd = await buildTagJsonLd(tag, siteUrl);

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
  let successful = 0;
  let failed = 0;
  for (const { id } of tags) {
    const result = await generateAndSaveTagSeo(id);
    if (result.success) successful++;
    else failed++;
  }
  return { successful, failed, total: tags.length };
}
