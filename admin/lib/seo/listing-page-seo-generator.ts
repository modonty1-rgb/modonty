"use server";

/**
 * Listing Page SEO Generator — the ONLY writer of the Settings page-SEO columns.
 *
 * Two things are generated per page and both land in Settings:
 *
 * 1. **Meta** — always built here by `buildListingMetadata`, because modonty casts the stored
 *    column straight to a Next.js `Metadata` (see modonty/lib/seo/*-page-seo.ts, no adapter).
 *    Any other shape silently drops `canonical` and the twitter image.
 * 2. **JSON-LD** — delegated to `previewPageSeo` (modonty/setting) for ALL seven pages that
 *    exist: home, clients, categories, tags, industries, trending, faq. One generator, three
 *    validators, full Organization + per-item detail. No page has a second opinion.
 *
 * Called when: items are created, updated, or deleted in that entity, and by the SEO cascade.
 */

import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { ensureSettingsId } from "@/lib/settings/settings-singleton";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import type { PageKey } from "@/app/(dashboard)/modonty/setting/actions/generate-home-and-list-page-seo";

function getSiteUrl(settings: Record<string, unknown>): string {
  // Caller fetches settings via getAllSettings() (DB-backed). Hardcoded fallback only as safety net.
  return (settings?.siteUrl as string) || "https://www.modonty.com";
}

function getSiteName(settings: Record<string, unknown>): string {
  return (settings?.siteName as string) || "Modonty";
}

// ─── Meta builder ───

interface ListingPageConfig {
  pageUrl: string;
  title: string;
  description: string;
  siteName: string;
  siteUrl: string;
  /** Kept for the JSON-LD breadcrumb built on the modonty/setting side; unused by the meta shape. */
  breadcrumbName: string;
  ogImage?: string;
  ogImageAlt?: string;
  /** The whole settings row — the directives below must come from it, never from a literal. */
  settings: Record<string, unknown>;
}

/**
 * The hreflang map, from `Settings.defaultAlternateLanguages` — the same list modonty reads.
 *
 * This used to be the literal `{ "ar-SA": url, "ar-EG": url }`. Settings holds nine locales,
 * so seven Gulf-and-default entries never reached Google, `x-default` included (measured
 * 2026-08-15). A cached blob generated here is what modonty ships, so a literal here was a
 * hardcoded value wearing a database's clothes.
 */
function buildHreflang(pageUrl: string, settings: Record<string, unknown>, siteUrl: string) {
  return buildHreflangLanguages(settings?.defaultAlternateLanguages, pageUrl, siteUrl);
}

function buildListingMetadata(config: ListingPageConfig) {
  const s = config.settings;
  // Robots comes from Settings so a change there actually reaches Google. It used to be
  // the literal "index, follow", which silently ignored defaultMetaRobots.
  const robots = (s.defaultMetaRobots as string)?.trim() || "index, follow";
  const twitterSite = (s.twitterSite as string)?.trim() || undefined;
  const twitterCreator = ((s.twitterCreator as string) || (s.twitterSite as string))?.trim() || undefined;
  const author = (s.siteAuthor as string)?.trim() || undefined;

  return {
    title: config.title,
    description: config.description,
    robots,
    ...(author && { authors: [{ name: author }] }),
    alternates: {
      canonical: config.pageUrl,
      languages: buildHreflang(config.pageUrl, s, config.siteUrl),
    },
    openGraph: {
      title: config.title,
      description: config.description,
      type: "website",
      url: config.pageUrl,
      siteName: config.siteName,
      locale: (s.defaultOgLocale as string)?.trim() || "ar_SA",
      ...(config.ogImage && {
        images: [{ url: config.ogImage, width: 1200, height: 630, alt: config.ogImageAlt || config.title }],
      }),
    },
    twitter: {
      card: (config.ogImage ? "summary_large_image" : "summary") as "summary_large_image" | "summary",
      title: config.title,
      description: config.description,
      ...(twitterSite && { site: twitterSite }),
      ...(twitterCreator && { creator: twitterCreator }),
      ...(config.ogImage && { images: [config.ogImage] }),
    },
  };
}

// ─── JSON-LD source ───

/** A serialized card plus the validation report that actually describes it. */
interface PageJsonLd {
  json: string;
  report: Prisma.InputJsonValue;
}

/**
 * Every modonty listing page now goes through `previewPageSeo` — one generator, three validators,
 * no second opinion. The thin CollectionPage builder that used to serve tags/industries/articles
 * (and hardcoded `valid: true` into the report) is gone.
 *
 * Dynamic import keeps this module cheap to load from the many entity actions that import it.
 */
async function richJsonLdFor(page: PageKey): Promise<PageJsonLd> {
  const { previewPageSeo } = await import(
    "@/app/(dashboard)/modonty/setting/actions/generate-home-and-list-page-seo"
  );
  const preview = await previewPageSeo(page);
  if (!preview.success || !preview.data) {
    throw new Error(preview.error || `${page} JSON-LD generation failed`);
  }
  return { json: preview.data.jsonLd, report: preview.data.report as Prisma.InputJsonValue };
}

// ─── Settings updater ───

async function updateSettingsPageCache(
  metaTagsField: string,
  jsonLdField: string,
  lastGeneratedField: string,
  validationField: string,
  metadata: object,
  jsonLd: PageJsonLd,
) {
  const id = await ensureSettingsId();

  await db.settings.update({
    where: { id },
    data: {
      [metaTagsField]: JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue,
      [jsonLdField]: jsonLd.json,
      [lastGeneratedField]: new Date(),
      [validationField]: jsonLd.report,
    },
  });

  // Bust modonty's "settings"-tagged cache so a per-page "Regenerate cache" click
  // actually reflects on modonty.com. Without this the metaTags update to the DB but
  // modonty keeps serving the cached (stale) title/description/hero image.
  await revalidateModontyTag("settings");
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

    // Per-page hero image (also the og:image) falls back to the global site image.
    const ogImage = (s.categoriesPageImage as string) || (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.categoriesPageImageAlt as string) || (s.altImage as string) || undefined;

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "التصنيفات",
      ogImage, ogImageAlt, settings: s,
    };

    await updateSettingsPageCache("categoriesPageMetaTags", "categoriesPageJsonLdStructuredData", "categoriesPageJsonLdLastGenerated", "categoriesPageJsonLdValidationReport", buildListingMetadata(config), await richJsonLdFor("categories"));
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

    // Per-page hero image (also the og:image) falls back to the global site image.
    const ogImage = (s.tagsPageImage as string) || (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.tagsPageImageAlt as string) || (s.altImage as string) || undefined;

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "التاجات",
      ogImage, ogImageAlt, settings: s,
    };

    await updateSettingsPageCache("tagsPageMetaTags", "tagsPageJsonLdStructuredData", "tagsPageJsonLdLastGenerated", "tagsPageJsonLdValidationReport", buildListingMetadata(config), await richJsonLdFor("tags"));
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

    // Per-page hero image (also the og:image) falls back to the global site image.
    const ogImage = (s.industriesPageImage as string) || (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.industriesPageImageAlt as string) || (s.altImage as string) || undefined;

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "القطاعات",
      ogImage, ogImageAlt, settings: s,
    };

    await updateSettingsPageCache("industriesPageMetaTags", "industriesPageJsonLdStructuredData", "industriesPageJsonLdLastGenerated", "industriesPageJsonLdValidationReport", buildListingMetadata(config), await richJsonLdFor("industries"));
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

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "العملاء",
      ogImage, ogImageAlt, settings: s,
    };

    await updateSettingsPageCache("clientsPageMetaTags", "clientsPageJsonLdStructuredData", "clientsPageJsonLdLastGenerated", "clientsPageJsonLdValidationReport", buildListingMetadata(config), await richJsonLdFor("clients"));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: ARTICLES LISTING — deliberately absent
//
// There is no /articles listing route on modonty and there must not be one: next.config.ts
// documents that Vercel's URL normalizer corrupts Arabic article slugs, so any rule matching
// `/articles` redirected real article URLs to the homepage and Google read the chain as a
// soft 404 (17+ articles at de-indexing risk). The path is left to 404 cleanly on purpose.
//
// So this file used to regenerate SEO for a page that does not exist — on every article
// create/update/delete plus every cascade — and stored a canonical pointing at that 404.
// Removed 2026-08-02. The Settings columns (articlesPage*) are stale leftovers nothing reads.
// ═══════════════════════════════════════════════════════════════════

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
    const twitterCreator = ((s.twitterCreator as string) || twitterSite)?.trim();
    if (twitterCreator) twMeta.creator = twitterCreator;
    if (ogImageUrl) twMeta.images = [ogImageUrl];
    const author = (s.siteAuthor as string)?.trim();
    const metadata = {
      title,
      description,
      robots: (s.defaultMetaRobots as string)?.trim() || "index, follow",
      ...(author && { authors: [{ name: author }] }),
      alternates: { canonical: siteUrl, languages: buildHreflang(siteUrl, s, siteUrl) },
      openGraph: ogMeta,
      twitter: twMeta,
    };

    // JSON-LD from the rich, validated home builder (Organization + WebSite + CollectionPage +
    // ItemList of latest articles). sameAs (incl. WhatsApp/Telegram) flows in via getSameAsFromSettings.
    const jsonLd = await richJsonLdFor("home");

    // Home keeps its own update because its columns are unprefixed (jsonLdStructuredData, not homePage…).
    const id = await ensureSettingsId();
    await db.settings.update({
      where: { id },
      data: {
        homeMetaTags: JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue,
        jsonLdStructuredData: jsonLd.json,
        jsonLdLastGenerated: new Date(),
        jsonLdValidationReport: jsonLd.report,
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

    const ogImage = (s.ogImageUrl as string) || undefined;
    const ogImageAlt = (s.altImage as string) || undefined;

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "الرائج",
      ogImage, ogImageAlt, settings: s,
    };

    await updateSettingsPageCache("trendingPageMetaTags", "trendingPageJsonLdStructuredData", "trendingPageJsonLdLastGenerated", "trendingPageJsonLdValidationReport", buildListingMetadata(config), await richJsonLdFor("trending"));
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: FAQ
// ═══════════════════════════════════════════════════════════════════

export async function regenerateFaqPageCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const s = settings as unknown as Record<string, unknown>;
    const siteUrl = getSiteUrl(s);
    const siteName = getSiteName(s);
    const title = (s.faqSeoTitle as string) || "الأسئلة الشائعة";
    const description = (s.faqSeoDescription as string) || "إجابات على الأسئلة الأكثر شيوعاً حول مدونتي";
    const pageUrl = `${siteUrl}/help/faq`;

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "الأسئلة الشائعة",
      ogImage: (s.ogImageUrl as string) || undefined,
      ogImageAlt: (s.altImage as string) || undefined,
      settings: s,
    };

    await updateSettingsPageCache("faqPageMetaTags", "faqPageJsonLdStructuredData", "faqPageJsonLdLastGenerated", "faqPageJsonLdValidationReport", buildListingMetadata(config), await richJsonLdFor("faq"));
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
    { name: "trending", fn: regenerateTrendingPageCache },
    { name: "faq", fn: regenerateFaqPageCache },
  ];

  for (const page of pages) {
    const r = await page.fn();
    results[page.name] = r.success;
  }
  // Bust modonty cache once after ALL pages regenerated
  await revalidateModontyTag("settings");
  return { results };
}
