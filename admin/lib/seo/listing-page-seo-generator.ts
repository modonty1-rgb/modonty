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

import { buildListingPageMetadata } from "@modonty/shared/lib/seo/build-listing-page-metadata";

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
 * Thin adapter over the ONE shared builder. Every listing page — the home page included —
 * goes through `buildListingPageMetadata`, so a default added to Settings reaches all seven
 * at once. The home page used to hand-roll its own object here, which is how its locale set
 * drifted from its sisters'.
 */
function buildListingMetadata(config: ListingPageConfig) {
  return buildListingPageMetadata({
    settings: config.settings,
    pageUrl: config.pageUrl,
    siteUrl: config.siteUrl,
    title: config.title,
    description: config.description,
    ogImage: config.ogImage,
    ogImageAlt: config.ogImageAlt,
  });
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

    // Same builder as its six sisters — the home page has no second opinion any more.
    // It used to hand-roll this object here, and that copy is how `locale` and the hreflang
    // set drifted from the shared one (measured 2026-08-25: nine locales in Settings, none on any page).
    const metadata = buildListingMetadata({
      pageUrl: siteUrl,
      title,
      description,
      siteName,
      siteUrl,
      breadcrumbName: siteName,
      ogImage: ogImageUrl,
      ogImageAlt: (s.altImage as string) || title,
      settings: s,
    });

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
// PAGE: ARTICLES ARCHIVE (/articles) — a master page like its sisters
//
// It used to be documented here as "deliberately absent". The route exists now
// (modonty/app/(site)/articles/page.tsx) and is the site's core listing, so it gets the same
// cached blob: meta from the shared builder, JSON-LD from `previewPageSeo`. The blob describes
// the BARE /articles; filtered views derive their own canonical on modonty's side.
// ═══════════════════════════════════════════════════════════════════

export async function regenerateArticlesListingCache(): Promise<{ success: boolean; error?: string }> {
  try {
    const settings = await getAllSettings();
    const s = settings as unknown as Record<string, unknown>;
    const siteUrl = getSiteUrl(s);
    const siteName = getSiteName(s);
    const title = (s.articlesSeoTitle as string) || "كل المقالات";
    const description =
      (s.articlesSeoDescription as string) ||
      "كل مقالات مدونتي في مكان واحد — صفِّ بالمجال أو التصنيف، واختر حسب الوقت اللي عندك.";
    const pageUrl = `${siteUrl}/articles`;

    const config: ListingPageConfig = {
      pageUrl, title, description, siteName, siteUrl, breadcrumbName: "المقالات",
      ogImage: (s.ogImageUrl as string) || undefined,
      ogImageAlt: (s.altImage as string) || undefined,
      settings: s,
    };

    await updateSettingsPageCache("articlesPageMetaTags", "articlesPageJsonLdStructuredData", "articlesPageJsonLdLastGenerated", "articlesPageJsonLdValidationReport", buildListingMetadata(config), await richJsonLdFor("articles"));
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

/**
 * The eight listing pages, in the order the cascade rebuilds them. Module-level and not
 * exported: a `"use server"` file may only export async functions, and the cascade panel
 * needs to name the page it is on, so it asks through `listListingPageTargets()` below.
 */
const LISTING_PAGES: { name: string; label: string; path: string; fn: () => Promise<{ success: boolean }> }[] = [
  { name: "home", label: "الرئيسية", path: "/", fn: regenerateHomePageCache },
  { name: "articles", label: "المقالات", path: "/articles", fn: regenerateArticlesListingCache },
  { name: "categories", label: "التصنيفات", path: "/categories", fn: regenerateCategoriesListingCache },
  { name: "tags", label: "الوسوم", path: "/tags", fn: regenerateTagsListingCache },
  { name: "industries", label: "القطاعات", path: "/industries", fn: regenerateIndustriesListingCache },
  { name: "clients", label: "الشركاء", path: "/clients", fn: regenerateClientsListingCache },
  { name: "trending", label: "الرائج", path: "/trending", fn: regenerateTrendingPageCache },
  { name: "faq", label: "الأسئلة الشائعة", path: "/help/faq", fn: regenerateFaqPageCache },
];

/** Names and paths only — what the panel needs to show which page is under way. */
export async function listListingPageTargets(): Promise<{ name: string; label: string; path: string }[]> {
  return LISTING_PAGES.map(({ name, label, path }) => ({ name, label, path }));
}

/** One page, so the caller can report progress per page instead of after all eight. */
export async function regenerateOneListingCache(name: string): Promise<{ success: boolean; error?: string }> {
  const page = LISTING_PAGES.find((p) => p.name === name);
  if (!page) return { success: false, error: `Unknown listing page "${name}"` };
  try {
    return await page.fn();
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function regenerateAllListingCaches(): Promise<{ results: Record<string, boolean>; error?: string }> {
  const results: Record<string, boolean> = {};
  for (const page of LISTING_PAGES) {
    const r = await page.fn();
    results[page.name] = r.success;
  }
  // Bust modonty cache once after ALL pages regenerated
  await revalidateModontyTag("settings");
  return { results };
}
