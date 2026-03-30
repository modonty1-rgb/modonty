"use server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function buildCategoryMetadata(category: {
  name: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  socialImage?: string | null;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  const pageUrl = category.canonicalUrl || `${siteUrl}/categories/${category.slug}`;
  const title = category.seoTitle || category.name;
  const description = category.seoDescription || `تصفح مقالات ${category.name}`;
  return {
    title,
    description,
    robots: "index, follow",
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      siteName: "Modonty",
      locale: "ar_SA",
      ...(category.socialImage && {
        images: [{ url: category.socialImage, alt: title }],
      }),
    },
    twitter: {
      card: category.socialImage ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export async function buildCategoryJsonLd(category: {
  name: string;
  slug: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  const pageUrl = category.canonicalUrl || `${siteUrl}/categories/${category.slug}`;
  const title = category.seoTitle || category.name;
  const description = category.seoDescription || category.description || `تصفح مقالات ${category.name}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": pageUrl, name: title, description, url: pageUrl, inLanguage: "ar" },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "التصنيفات", item: `${siteUrl}/categories` },
          { "@type": "ListItem", position: 3, name: category.name, item: pageUrl },
        ],
      },
      { "@type": "DefinedTerm", "@id": `${pageUrl}#term`, name: category.name, description, url: pageUrl },
    ],
  };
}

export async function generateAndSaveCategorySeo(categoryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const category = await db.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true, description: true, seoTitle: true, seoDescription: true, canonicalUrl: true, socialImage: true },
    });
    if (!category) return { success: false, error: "Category not found" };
    const metadata = await buildCategoryMetadata(category);
    const jsonLd = await buildCategoryJsonLd(category);
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
