"use server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";

function getSiteUrl(settings: Record<string, unknown>): string {
  return (settings?.siteUrl as string) || process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
}

export async function buildIndustryMetadata(industry: {
  name: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  socialImage?: string | null;
}, siteUrl: string) {
  const pageUrl = industry.canonicalUrl || `${siteUrl}/industries/${industry.slug}`;
  const title = industry.seoTitle || industry.name;
  const description = industry.seoDescription || `شركات ومقالات في قطاع ${industry.name}`;
  return {
    title,
    description,
    robots: "index, follow",
    alternates: { canonical: pageUrl },
    openGraph: {
      title, description, type: "website", url: pageUrl,
      siteName: "Modonty", locale: "ar_SA",
      ...(industry.socialImage && { images: [{ url: industry.socialImage, alt: title }] }),
    },
    twitter: {
      card: industry.socialImage ? "summary_large_image" as const : "summary" as const,
      title, description,
      ...(industry.socialImage && { images: [industry.socialImage] }),
    },
  };
}

export async function buildIndustryJsonLd(industry: {
  name: string;
  slug: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
}, siteUrl: string) {
  const pageUrl = industry.canonicalUrl || `${siteUrl}/industries/${industry.slug}`;
  const title = industry.seoTitle || industry.name;
  const description = industry.seoDescription || industry.description || `شركات ومقالات في قطاع ${industry.name}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": pageUrl, name: title, description, url: pageUrl, inLanguage: "ar" },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "القطاعات", item: `${siteUrl}/industries` },
          { "@type": "ListItem", position: 3, name: industry.name, item: pageUrl },
        ],
      },
      { "@type": "DefinedTerm", "@id": `${pageUrl}#term`, name: industry.name, description, url: pageUrl },
    ],
  };
}

export async function generateAndSaveIndustrySeo(industryId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const industry = await db.industry.findUnique({
      where: { id: industryId },
      select: { id: true, name: true, slug: true, description: true, seoTitle: true, seoDescription: true, canonicalUrl: true, socialImage: true },
    });
    if (!industry) return { success: false, error: "Industry not found" };

    const settings = await getAllSettings();
    const siteUrl = getSiteUrl(settings as unknown as Record<string, unknown>);

    const metadata = await buildIndustryMetadata(industry, siteUrl);
    const jsonLd = await buildIndustryJsonLd(industry, siteUrl);

    await db.industry.update({
      where: { id: industryId },
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

export async function batchGenerateIndustrySeo(): Promise<{ successful: number; failed: number; total: number }> {
  const industries = await db.industry.findMany({ select: { id: true } });
  let successful = 0;
  let failed = 0;
  for (const { id } of industries) {
    const result = await generateAndSaveIndustrySeo(id);
    if (result.success) successful++;
    else failed++;
  }
  return { successful, failed, total: industries.length };
}
