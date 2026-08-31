"use server";

import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { computeReferenceSeoScore } from "@modonty/shared/lib/seo/reference/seo-score";
import { hreflangCodes } from "@modonty/shared/lib/seo/hreflang-codes";
import type { SeoCheck, JsonLdValidationReport } from "@modonty/shared/lib/seo/client/types";

/**
 * The seven modonty listing pages whose SEO lives on the Settings singleton — scored by
 * the SAME scorer the reference entities use (shared/lib/seo/reference), so a page and a
 * category can never be graded on two different contracts.
 *
 * Nobody was grading these seven before: the dashboard scored categories, tags,
 * industries and authors, while the pages Google actually lands on went unmeasured.
 * SEO is the business model (Khalid 2026-08-14), so they get the same 16 checks.
 *
 * One read of the Settings row feeds all seven — no query per page.
 */

/** Page key → its Settings column quartet. `home` is the odd one: its columns are unprefixed. */
const PAGES = [
  { key: "home", label: "الرئيسية", path: "/", prefix: null, copy: "modonty" },
  { key: "clients", label: "الشركاء", path: "/clients", prefix: "clientsPage", copy: "clients" },
  { key: "categories", label: "الفئات", path: "/categories", prefix: "categoriesPage", copy: "categories" },
  { key: "tags", label: "الوسوم", path: "/tags", prefix: "tagsPage", copy: "tags" },
  { key: "industries", label: "الصناعات", path: "/industries", prefix: "industriesPage", copy: "industries" },
  { key: "trending", label: "الرائج", path: "/trending", prefix: "trendingPage", copy: "trending" },
  { key: "faq", label: "الأسئلة الشائعة", path: "/help/faq", prefix: "faqPage", copy: "faq" },
  { key: "articles", label: "المقالات", path: "/articles", prefix: "articlesPage", copy: "articles" },
] as const;

export type ListingPageKey = (typeof PAGES)[number]["key"];

export interface ListingPageAudit {
  /** Listing pages use their Settings key; content pages use their Modonty slug. */
  key: string;
  label: string;
  path: string;
  /** Absolute URL on modonty — a relative href here would open the ADMIN domain. */
  publicUrl: string;
  score: number;
  checks: SeoCheck[];
  /** Checks that are not "good" — what the fix has to close. */
  problems: number;
}

/** Selecting `true` on every column the scorer reads. Miss one and every page scores low. */
const SETTINGS_SELECT = {
  // The public host — the row's «open page» link must leave the admin domain.
  siteUrl: true,
  // الأسواق التي يُقاس نقص hreflang عليها — من الإعدادات لا من قائمة داخل المقياس.
  defaultAlternateLanguages: true,
  // home (unprefixed)
  homeMetaTags: true,
  jsonLdStructuredData: true,
  jsonLdValidationReport: true,
  jsonLdLastGenerated: true,
  modontySeoTitle: true,
  modontySeoDescription: true,
  // the six prefixed pages
  clientsPageMetaTags: true,
  clientsPageJsonLdStructuredData: true,
  clientsPageJsonLdValidationReport: true,
  clientsPageJsonLdLastGenerated: true,
  clientsSeoTitle: true,
  clientsSeoDescription: true,
  categoriesPageMetaTags: true,
  categoriesPageJsonLdStructuredData: true,
  categoriesPageJsonLdValidationReport: true,
  categoriesPageJsonLdLastGenerated: true,
  categoriesSeoTitle: true,
  categoriesSeoDescription: true,
  tagsPageMetaTags: true,
  tagsPageJsonLdStructuredData: true,
  tagsPageJsonLdValidationReport: true,
  tagsPageJsonLdLastGenerated: true,
  tagsSeoTitle: true,
  tagsSeoDescription: true,
  industriesPageMetaTags: true,
  industriesPageJsonLdStructuredData: true,
  industriesPageJsonLdValidationReport: true,
  industriesPageJsonLdLastGenerated: true,
  industriesSeoTitle: true,
  industriesSeoDescription: true,
  trendingPageMetaTags: true,
  trendingPageJsonLdStructuredData: true,
  trendingPageJsonLdValidationReport: true,
  trendingPageJsonLdLastGenerated: true,
  trendingSeoTitle: true,
  trendingSeoDescription: true,
  articlesPageMetaTags: true,
  articlesPageJsonLdStructuredData: true,
  articlesPageJsonLdValidationReport: true,
  articlesPageJsonLdLastGenerated: true,
  articlesSeoTitle: true,
  articlesSeoDescription: true,
  faqPageMetaTags: true,
  faqPageJsonLdStructuredData: true,
  faqPageJsonLdValidationReport: true,
  faqPageJsonLdLastGenerated: true,
  faqSeoTitle: true,
  faqSeoDescription: true,
} as const;

/**
 * The six editable content pages — /about, /terms and the four legal ones. Their SEO
 * lives on the `Modonty` model (one row per slug), not on Settings, so they need their
 * own read. Same scorer, same 16 checks: a page is a page.
 */
const CONTENT_PAGES = [
  { slug: "about", label: "من نحن", path: "/about" },
  { slug: "contact", label: "تواصل معنا", path: "/contact" },
  { slug: "terms", label: "الشروط", path: "/terms" },
  { slug: "user-agreement", label: "اتفاقية الاستخدام", path: "/legal/user-agreement" },
  { slug: "privacy-policy", label: "الخصوصية", path: "/legal/privacy-policy" },
  { slug: "cookie-policy", label: "ملفات الارتباط", path: "/legal/cookie-policy" },
  { slug: "copyright-policy", label: "حقوق النشر", path: "/legal/copyright-policy" },
  // SEO-only rows: the page body is built in code, but the tags are edited here like the rest.
  { slug: "trust", label: "الموثوقية", path: "/trust" },
  { slug: "story", label: "قصتنا", path: "/story" },
] as const;

export type ContentPageSlug = (typeof CONTENT_PAGES)[number]["slug"];

export async function getContentPagesSeoAudit(): Promise<ListingPageAudit[]> {
  const [rows, settings] = await Promise.all([
    db.modonty.findMany({
      where: { slug: { in: CONTENT_PAGES.map((p) => p.slug) } },
      select: {
        slug: true,
        title: true,
        seoTitle: true,
        seoDescription: true,
        // البلوب الذي تخدم منه مدونتي فعلاً (build-metadata-from-page-row.ts:72).
        // `metaTags` عمودٌ آخر بشكل مختلف (organizationSeo/ogLocaleAlternate) — قياسه
        // يعطي درجةً لا يراها الزائر: الفرق المقيس ٥ إلى ١٣ نقطة على الإحدى عشرة كلّها.
        nextjsMetadata: true,
        jsonLdStructuredData: true,
        jsonLdValidationReport: true,
        jsonLdLastGenerated: true,
      },
      take: CONTENT_PAGES.length,
    }),
    db.settings.findUnique({ where: SETTINGS_SINGLETON_WHERE, select: { siteUrl: true, defaultAlternateLanguages: true } }),
  ]);

  const siteUrl = (settings?.siteUrl || "https://www.modonty.com").replace(/\/$/, "");
  // الأسواق من الإعدادات لا من قائمة مكتوبة في المقياس — إضافة سوق تصل الفحص وحدها.
  const requiredHreflangs = hreflangCodes(settings?.defaultAlternateLanguages);
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  return CONTENT_PAGES.map((page) => {
    const row = bySlug.get(page.slug);
    const { score, checks } = computeReferenceSeoScore({
      name: page.label,
      requiredHreflangs,
      nextjsMetadata: row?.nextjsMetadata,
      jsonLdStructuredData: row?.jsonLdStructuredData ?? null,
      jsonLdValidationReport: (row?.jsonLdValidationReport as JsonLdValidationReport | null) ?? null,
      sourceTitle: row?.seoTitle ?? null,
      sourceDescription: row?.seoDescription ?? null,
      lastGenerated: row?.jsonLdLastGenerated ?? null,
      // No sourceUpdatedAt: same reason as the listing pages — saving the SEO cache is
      // itself a write to the row, so the row's own updatedAt can never look "older".
    });

    return {
      key: page.slug,
      label: page.label,
      path: page.path,
      publicUrl: `${siteUrl}${page.path}`,
      score,
      checks,
      problems: checks.filter((c) => c.status !== "good").length,
    };
  });
}

export async function getListingPagesSeoAudit(): Promise<ListingPageAudit[]> {
  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: SETTINGS_SELECT,
  });

  const s = (settings ?? {}) as Record<string, unknown>;
  const siteUrl = ((s.siteUrl as string) || "https://www.modonty.com").replace(/\/$/, "");
  const requiredHreflangs = hreflangCodes(s.defaultAlternateLanguages);

  return PAGES.map((page) => {
    const meta = page.prefix ? s[`${page.prefix}MetaTags`] : s.homeMetaTags;
    const jsonLd = page.prefix ? s[`${page.prefix}JsonLdStructuredData`] : s.jsonLdStructuredData;
    const report = page.prefix ? s[`${page.prefix}JsonLdValidationReport`] : s.jsonLdValidationReport;
    const generated = page.prefix ? s[`${page.prefix}JsonLdLastGenerated`] : s.jsonLdLastGenerated;

    const { score, checks } = computeReferenceSeoScore({
      name: page.label,
      requiredHreflangs,
      nextjsMetadata: meta,
      jsonLdStructuredData: (jsonLd as string | null) ?? null,
      jsonLdValidationReport: (report as JsonLdValidationReport | null) ?? null,
      sourceTitle: (s[`${page.copy}SeoTitle`] as string | null) ?? null,
      sourceDescription: (s[`${page.copy}SeoDescription`] as string | null) ?? null,
      lastGenerated: (generated as Date | null) ?? null,
      // Deliberately NOT passing sourceUpdatedAt. All seven pages share ONE Settings
      // row, and writing any page's SEO is a write to that row — so regenerating the
      // clients page re-stamps `updatedAt` and would mark the other six stale. Measured
      // live: fixing «الشركاء» dropped «الرئيسية» from 97 to 93 without touching it.
      // The staleness signal a shared singleton can honestly give is "generated or not".
    });

    return {
      key: page.key,
      label: page.label,
      path: page.path,
      publicUrl: page.path === "/" ? `${siteUrl}/` : `${siteUrl}${page.path}`,
      score,
      checks,
      problems: checks.filter((c) => c.status !== "good").length,
    };
  });
}

/** Page key → the regenerator that rebuilds its meta + JSON-LD from Settings. */
const REGENERATORS: Record<ListingPageKey, string> = {
  home: "regenerateHomePageCache",
  clients: "regenerateClientsListingCache",
  categories: "regenerateCategoriesListingCache",
  tags: "regenerateTagsListingCache",
  industries: "regenerateIndustriesListingCache",
  trending: "regenerateTrendingPageCache",
  faq: "regenerateFaqPageCache",
  articles: "regenerateArticlesListingCache",
};

/**
 * The «Fix» button. Rebuilds one page's stored SEO from the current Settings and
 * revalidates modonty's cache — the same path the settings screen's "Regenerate" runs,
 * reached from the dashboard so a low score can be closed where it is seen.
 */
export async function fixListingPageSeo(
  key: ListingPageKey,
): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    const gen = await import("@/lib/seo/listing-page-seo-generator");
    const fn = (gen as unknown as Record<string, () => Promise<{ success: boolean; error?: string }>>)[
      REGENERATORS[key]
    ];
    if (!fn) return { success: false, error: `Regenerator for ${key} not found` };

    const result = await fn();
    if (!result.success) return { success: false, error: result.error || "فشل التوليد" };

    // Report the score the fix actually achieved — the button must not claim success
    // while the page is still below 100.
    const audit = await getListingPagesSeoAudit();
    return { success: true, score: audit.find((a) => a.key === key)?.score };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * The «Fix» button for a content page. Reuses the exact generator the page's own edit
 * screen runs on save — so the dashboard and the editor can never produce different SEO.
 */
export async function fixContentPageSeo(
  slug: string,
): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    const { generateModontyPageSEO } = await import(
      "@/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo"
    );
    const result = await generateModontyPageSEO(slug);
    if (!result.success) return { success: false, error: result.error || "فشل التوليد" };

    const audit = await getContentPagesSeoAudit();
    return { success: true, score: audit.find((a) => a.key === slug)?.score };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
