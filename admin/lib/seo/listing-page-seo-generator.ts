"use server";

/**
 * Listing Page SEO Generator
 *
 * Generates CollectionPage + ItemList JSON-LD for listing pages.
 * Stores results in Settings model (single source of truth).
 *
 * Called when: items are created, updated, or deleted in that entity.
 * Pages: articles, categories, tags, industries, clients
 */

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { ensureSettingsId } from "@/lib/settings/settings-singleton";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

function getSiteUrl(settings: Record<string, unknown>): string {
  // Caller fetches settings via getAllSettings() (DB-backed). Hardcoded fallback only as safety net.
  return (settings?.siteUrl as string) || "https://www.modonty.com";
}

function getSiteName(settings: Record<string, unknown>): string {
  return (settings?.siteName as string) || "Modonty";
}

// ─── Generic builder ───

interface ListingPageConfig {
  pageUrl: string;
  title: string;
  description: string;
  siteName: string;
  siteUrl: string;
  breadcrumbName: string;
  ogImage?: string;
  ogImageAlt?: string;
  items: Array<{ name: string; url: string; position: number; description?: string; image?: string }>;
}

function buildListingMetadata(config: ListingPageConfig) {
  return {
    title: config.title,
    description: config.description,
    robots: "index, follow",
    alternates: { canonical: config.pageUrl },
    openGraph: {
      title: config.title,
      description: config.description,
      type: "website",
      url: config.pageUrl,
      siteName: config.siteName,
      locale: "ar_SA",
      ...(config.ogImage && {
        images: [{ url: config.ogImage, width: 1200, height: 630, alt: config.ogImageAlt || config.title }],
      }),
    },
    twitter: {
      card: (config.ogImage ? "summary_large_image" : "summary") as "summary_large_image" | "summary",
      title: config.title,
      description: config.description,
      ...(config.ogImage && { images: [config.ogImage] }),
    },
  };
}

function buildListingJsonLd(config: ListingPageConfig) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": config.pageUrl,
        name: config.title,
        description: config.description,
        url: config.pageUrl,
        inLanguage: "ar",
        isPartOf: { "@type": "WebSite", "@id": `${config.siteUrl}/#website`, name: config.siteName, url: config.siteUrl },
      },
      {
        "@type": "ItemList",
        "@id": `${config.pageUrl}#itemlist`,
        name: config.title,
        numberOfItems: config.items.length,
        itemListElement: config.items.map(item => ({
          "@type": "ListItem",
          position: item.position,
          name: item.name,
          url: item.url,
          ...(item.description && { description: item.description }),
          ...(item.image && { image: item.image }),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${config.pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: config.siteUrl },
          { "@type": "ListItem", position: 2, name: config.breadcrumbName, item: config.pageUrl },
        ],
      },
    ],
  };
}

// ─── Settings updater ───

async function updateSettingsPageCache(
  metaTagsField: string,
  jsonLdField: string,
  lastGeneratedField: string,
  validationField: string,
  metadata: object,
  jsonLd: object,
) {
  const id = await ensureSettingsId();

  await db.settings.update({
    where: { id },
    data: {
      [metaTagsField]: JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue,
      [jsonLdField]: JSON.stringify(jsonLd),
      [lastGeneratedField]: new Date(),
      [validationField]: { valid: true, generatedAt: new Date().toISOString(), itemCount: (jsonLd as { "@graph": Array<{ numberOfItems?: number }> })["@graph"]?.find(g => g.numberOfItems !== undefined)?.numberOfItems || 0 } as Prisma.InputJsonValue,
    },
  });
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: CATEGORIES LISTING
// ═══════════════════════════════════════════════════════════════════

export async function regenerateCategoriesListingCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const s = settings as unknown as Record<string, unknown>;
    const siteUrl = getSiteUrl(s);
    const siteName = getSiteName(s);
    const title = (s.categoriesSeoTitle as string) || "التصنيفات";
    const description = (s.categoriesSeoDescription as string) || "تصفح جميع تصنيفات المقالات";
    const pageUrl = `${siteUrl}/categories`;

    const ogImage = (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.altImage as string) || undefined;

    const categories = await db.category.findMany({
      select: { name: true, slug: true, description: true, socialImage: true },
      orderBy: { name: "asc" },
    });

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "التصنيفات",
      ogImage, ogImageAlt,
      items: categories.map((c, i) => ({ name: c.name, url: `${siteUrl}/categories/${c.slug}`, position: i + 1, description: c.description || undefined, image: c.socialImage || undefined })),
    };

    await updateSettingsPageCache("categoriesPageMetaTags", "categoriesPageJsonLdStructuredData", "categoriesPageJsonLdLastGenerated", "categoriesPageJsonLdValidationReport", buildListingMetadata(config), buildListingJsonLd(config));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: TAGS LISTING
// ═══════════════════════════════════════════════════════════════════

export async function regenerateTagsListingCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const s = settings as unknown as Record<string, unknown>;
    const siteUrl = getSiteUrl(s);
    const siteName = getSiteName(s);
    const title = (s.tagsSeoTitle as string) || "التاجات";
    const description = (s.tagsSeoDescription as string) || "تصفح جميع التاجات";
    const pageUrl = `${siteUrl}/tags`;

    const ogImage = (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.altImage as string) || undefined;

    const tags = await db.tag.findMany({
      select: { name: true, slug: true, description: true },
      orderBy: { name: "asc" },
    });

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "التاجات",
      ogImage, ogImageAlt,
      items: tags.map((t, i) => ({ name: t.name, url: `${siteUrl}/tags/${t.slug}`, position: i + 1, description: t.description || undefined })),
    };

    await updateSettingsPageCache("tagsPageMetaTags", "tagsPageJsonLdStructuredData", "tagsPageJsonLdLastGenerated", "tagsPageJsonLdValidationReport", buildListingMetadata(config), buildListingJsonLd(config));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: INDUSTRIES LISTING
// ═══════════════════════════════════════════════════════════════════

export async function regenerateIndustriesListingCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const s = settings as unknown as Record<string, unknown>;
    const siteUrl = getSiteUrl(s);
    const siteName = getSiteName(s);
    const title = (s.industriesSeoTitle as string) || "القطاعات";
    const description = (s.industriesSeoDescription as string) || "تصفح جميع القطاعات";
    const pageUrl = `${siteUrl}/industries`;

    const ogImage = (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.altImage as string) || undefined;

    const industries = await db.industry.findMany({
      select: { name: true, slug: true, description: true },
      orderBy: { name: "asc" },
    });

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "القطاعات",
      ogImage, ogImageAlt,
      items: industries.map((ind, i) => ({ name: ind.name, url: `${siteUrl}/industries/${ind.slug}`, position: i + 1, description: ind.description || undefined })),
    };

    await updateSettingsPageCache("industriesPageMetaTags", "industriesPageJsonLdStructuredData", "industriesPageJsonLdLastGenerated", "industriesPageJsonLdValidationReport", buildListingMetadata(config), buildListingJsonLd(config));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: CLIENTS LISTING
// ═══════════════════════════════════════════════════════════════════

export async function regenerateClientsListingCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const s = settings as unknown as Record<string, unknown>;
    const siteUrl = getSiteUrl(s);
    const siteName = getSiteName(s);
    const title = (s.clientsSeoTitle as string) || "العملاء";
    const description = (s.clientsSeoDescription as string) || "تصفح جميع عملاء مدونتي";
    const pageUrl = `${siteUrl}/clients`;

    const ogImage = (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.altImage as string) || undefined;

    const clients = await db.client.findMany({
      select: { name: true, slug: true, description: true, logoMedia: { select: { url: true } } },
      orderBy: { name: "asc" },
    });

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "العملاء",
      ogImage, ogImageAlt,
      items: clients.map((c, i) => ({ name: c.name, url: `${siteUrl}/clients/${c.slug}`, position: i + 1, description: c.description || undefined, image: c.logoMedia?.url || undefined })),
    };

    await updateSettingsPageCache("clientsPageMetaTags", "clientsPageJsonLdStructuredData", "clientsPageJsonLdLastGenerated", "clientsPageJsonLdValidationReport", buildListingMetadata(config), buildListingJsonLd(config));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: ARTICLES LISTING
// ═══════════════════════════════════════════════════════════════════

export async function regenerateArticlesListingCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const s = settings as unknown as Record<string, unknown>;
    const siteUrl = getSiteUrl(s);
    const siteName = getSiteName(s);
    const title = (s.articlesSeoTitle as string) || "المقالات";
    const description = (s.articlesSeoDescription as string) || "تصفح جميع المقالات";
    const pageUrl = `${siteUrl}/articles`;

    const articles = await db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { title: true, slug: true, excerpt: true, client: { select: { slug: true } }, featuredImage: { select: { url: true } } },
      orderBy: { datePublished: "desc" },
      take: 50,
    });

    const ogImage = (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.altImage as string) || undefined;

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "المقالات",
      ogImage, ogImageAlt,
      items: articles.map((a, i) => ({ name: a.title, url: `${siteUrl}/clients/${a.client.slug}/articles/${a.slug}`, position: i + 1, description: a.excerpt || undefined, image: a.featuredImage?.url || undefined })),
    };

    await updateSettingsPageCache("articlesPageMetaTags", "articlesPageJsonLdStructuredData", "articlesPageJsonLdLastGenerated", "articlesPageJsonLdValidationReport", buildListingMetadata(config), buildListingJsonLd(config));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: HOME (أهم صفحة — meta here + JSON-LD delegated to the rich validated home builder)
// ═══════════════════════════════════════════════════════════════════

export async function regenerateHomePageCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const s = settings as unknown as Record<string, unknown>;
    const siteUrl = getSiteUrl(s);
    const siteName = getSiteName(s);
    const title = (s.modontySeoTitle as string) || siteName;
    const description = (s.modontySeoDescription as string) || (s.brandDescription as string) || "منصة محتوى عربية متخصصة";
    const ogImageUrl = (s.ogImageUrl as string) || undefined;

    // Build metadata (valid Next.js Metadata shape — consumed directly by modonty getHomePageSeo).
    const twitterSite = (s.twitterSite as string) || undefined;
    const ogMeta: Record<string, unknown> = { title, description, type: "website", url: siteUrl, siteName, locale: "ar_SA" };
    if (ogImageUrl) ogMeta.images = [{ url: ogImageUrl, width: 1200, height: 630, alt: (s.altImage as string) || title }];
    const twMeta: Record<string, unknown> = { card: ogImageUrl ? "summary_large_image" : "summary", title, description };
    if (twitterSite) twMeta.site = twitterSite;
    if (ogImageUrl) twMeta.images = [ogImageUrl];
    const metadata = { title, description, robots: "index, follow", alternates: { canonical: siteUrl }, openGraph: ogMeta, twitter: twMeta };

    // JSON-LD — SINGLE SOURCE OF TRUTH: reuse the rich, validated home builder
    // (Organization + WebSite + CollectionPage + ItemList of latest articles).
    // sameAs (incl. WhatsApp/Telegram channels) flows in via getSameAsFromSettings inside previewPageSeo.
    const { previewPageSeo } = await import("@/app/(dashboard)/modonty/setting/actions/generate-home-and-list-page-seo");
    const preview = await previewPageSeo("home");
    if (!preview.success || !preview.data) {
      return { success: false, error: preview.error || "Home JSON-LD generation failed" };
    }

    const id = await ensureSettingsId();
    await db.settings.update({
      where: { id },
      data: {
        homeMetaTags: JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue,
        jsonLdStructuredData: preview.data.jsonLd,
        jsonLdLastGenerated: new Date(),
        jsonLdValidationReport: preview.data.report as Prisma.InputJsonValue,
      },
    });
    await revalidateModontyTag("settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: TRENDING
// ═══════════════════════════════════════════════════════════════════

export async function regenerateTrendingPageCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const s = settings as unknown as Record<string, unknown>;
    const siteUrl = getSiteUrl(s);
    const siteName = getSiteName(s);
    const title = (s.trendingSeoTitle as string) || "الرائج";
    const description = (s.trendingSeoDescription as string) || "المقالات الأكثر قراءة ومشاركة";
    const pageUrl = `${siteUrl}/trending`;

    // Top articles by views in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const topArticles = await db.article.findMany({
      where: { status: "PUBLISHED", datePublished: { gte: thirtyDaysAgo } },
      select: { title: true, slug: true, excerpt: true, client: { select: { slug: true } }, featuredImage: { select: { url: true } } },
      orderBy: { datePublished: "desc" },
      take: 20,
    });

    const ogImage = (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.altImage as string) || undefined;

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "الرائج",
      ogImage, ogImageAlt,
      items: topArticles.map((a, i) => ({ name: a.title, url: `${siteUrl}/clients/${a.client.slug}/articles/${a.slug}`, position: i + 1, description: a.excerpt || undefined, image: a.featuredImage?.url || undefined })),
    };

    await updateSettingsPageCache("trendingPageMetaTags", "trendingPageJsonLdStructuredData", "trendingPageJsonLdLastGenerated", "trendingPageJsonLdValidationReport", buildListingMetadata(config), buildListingJsonLd(config));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// REGENERATE ALL LISTING CACHES
// ═══════════════════════════════════════════════════════════════════

export async function regenerateAllListingCaches(): Promise<{ results: Record<string, boolean>; error?: string }> {
  const results: Record<string, boolean> = {};
  const pages = [
    { name: "home", fn: regenerateHomePageCache },
    { name: "categories", fn: regenerateCategoriesListingCache },
    { name: "tags", fn: regenerateTagsListingCache },
    { name: "industries", fn: regenerateIndustriesListingCache },
    { name: "clients", fn: regenerateClientsListingCache },
    { name: "articles", fn: regenerateArticlesListingCache },
    { name: "trending", fn: regenerateTrendingPageCache },
  ];

  for (const page of pages) {
    const r = await page.fn();
    results[page.name] = r.success;
  }
  // Bust modonty cache once after ALL pages regenerated
  await revalidateModontyTag("settings");
  return { results };
}
