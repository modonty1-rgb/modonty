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
  const pageUrl = industry.canonicalUrl || `${s.siteUrl}/industries/${industry.slug}`;
  const title = industry.seoTitle || industry.name;
  const description = industry.seoDescription || `شركات ومقالات في قطاع ${industry.name}`;

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
      ...(industry.socialImage && {
        images: [{ url: industry.socialImage, alt: industry.socialImageAlt || title }],
      }),
    },
    twitter: {
      card: s.twitterCard,
      title,
      description,
      ...(s.twitterSite && { site: s.twitterSite }),
      ...(s.twitterCreator && { creator: s.twitterCreator }),
      ...(industry.socialImage && {
        images: [industry.socialImage],
      }),
    },
  };
}

export async function buildIndustryJsonLd(industry: IndustryData, s: SeoSettings) {
  const pageUrl = industry.canonicalUrl || `${s.siteUrl}/industries/${industry.slug}`;
  const title = industry.seoTitle || industry.name;
  const description = industry.seoDescription || industry.description || `شركات ومقالات في قطاع ${industry.name}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": pageUrl, name: title, description, url: pageUrl, inLanguage: s.inLanguage },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: s.siteUrl },
          { "@type": "ListItem", position: 2, name: "القطاعات", item: `${s.siteUrl}/industries` },
          { "@type": "ListItem", position: 3, name: industry.name, item: pageUrl },
        ],
      },
      { "@type": "DefinedTerm", "@id": `${pageUrl}#term`, name: industry.name, description, url: pageUrl },
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
  let successful = 0; let failed = 0;
  for (const { id } of industries) {
    const result = await generateAndSaveIndustrySeo(id);
    if (result.success) successful++; else failed++;
  }
  return { successful, failed, total: industries.length };
}
