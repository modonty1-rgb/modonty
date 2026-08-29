"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ensureSettingsId } from "@/lib/settings/settings-singleton";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

/**
 * Technical defaults — fixed values based on official sources.
 * Edit values HERE, then press "Apply Defaults" in the System tab.
 *
 * Sources:
 * - WHATWG HTML Standard: charset must be UTF-8
 * - Google Search Central: robots default = index,follow; sitemap priority/changeFreq ignored
 * - Open Graph Protocol (ogp.me): og:type "website" is generic default
 * - Facebook Sharing Best Practices: OG image 1200x630
 * - X/Twitter Developer Docs: summary_large_image for content sites
 * - Google Search Central hreflang: ar-SA for Arabic Saudi
 * - OWASP: referrer-policy origin-when-cross-origin
 * - Google Chrome: notranslate = true for Arabic content
 */
// SEO Rules — industry consensus, stable for 5+ years
// Sources: Semrush, Ahrefs, Moz, X Developer Docs, Facebook/Meta
const SEO_RULES: Record<string, unknown> = {
  seoTitleMin: 30,
  seoTitleMax: 60,
  seoTitleRestrict: false,
  seoDescriptionMin: 70,
  seoDescriptionMax: 160,
  seoDescriptionRestrict: false,
  twitterTitleMax: 70,
  twitterTitleRestrict: false,
  twitterDescriptionMax: 200,
  twitterDescriptionRestrict: false,
  ogTitleMax: 60,
  ogTitleRestrict: false,
  ogDescriptionMax: 200,
  ogDescriptionRestrict: false,
};

// Business defaults — the site's own identity. It is DELIBERATE that this file is the only
// writer and that "Apply Defaults" overwrites whatever is in the DB: identity is not an
// employee-editable setting, so it is not exposed as a form field anywhere in the admin
// (Khalid, 28 Aug 2026). Change the brand here, press the button, done.
//
// The brand is written in Arabic because every public page is Arabic: this value becomes
// the <title> suffix, og:site_name, and the `name` of the Organization / WebSite nodes in
// JSON-LD. A Latin brand on an Arabic page is what Google then shows the Arabic searcher.
// Display spelling is "مدونتي" without tashkeel — the fully-vocalised "مُدَوَّنَتِي" is for
// voice scripts only (pronunciation), never for on-screen text.
const BUSINESS_DEFAULTS: Record<string, unknown> = {
  siteUrl: "https://www.modonty.com",
  siteName: "مدونتي",
  // الاسم اللاتيني له خانة واحدة، لا نصّاً مبعثراً. كان مدسوساً في `brandDescription`
  // فوصل جوجل ١٨٨ مرّة داخل جملة عربية (مقيس ٢٩ أغسطس على ١٣٤ بلوباً منشوراً).
  // Google · Site names: «Google Search only supports one site name per site» — والبدائل
  // (اختصار · صيغة أقصر · اسم النطاق) مكانها `alternateName`.
  // Google · Organization: «Use the same `name` and `alternateName` that you're using for
  // your site name» — فيُبثّ على عقدتَي WebSite وOrganization معاً.
  alternateName: "Modonty",
  siteAuthor: "فريق مدونتي",
  inLanguage: "ar-SA",
  orgAddressCountry: "SA",
  orgAreaServed: "SA",
  orgContactType: "customer service",
  orgContactAvailableLanguage: "ar, en",
  // The brand renders in ONE spelling everywhere. This field used to carry "مدوّنتي" (with
  // shadda) while titles carried "مدونتي" and article blobs carried "مودونتي" — three
  // spellings of one brand reaching Google from one site.
  // `orgSearchUrlTemplate` is deliberately absent: it is the sitelinks-search-box template,
  // and Google retired that feature ("no longer available", Search Central changelog,
  // 29 Nov 2024). No generator reads it for structured data any more.
  // Image licensing defaults for Modonty-PRODUCED images (schema.org ImageObject →
  // Google Licensable badge). LOGO/GALLERY are attributed to the owning client instead.
  // license + acquireLicensePage MUST be absolute URLs (Google requirement).
  imageOwnerName: "مدونتي",
  imageLicenseUrl: "https://www.modonty.com/legal/copyright-policy",
  imageAcquireLicensePageUrl: "https://www.modonty.com/legal/copyright-policy",
};

// Technical defaults — industry standards, never change
const TECHNICAL_DEFAULTS: Record<string, unknown> = {
  defaultCharset: "UTF-8",
  defaultMetaRobots: "index, follow",
  defaultGooglebot: "index, follow",
  defaultOgType: "website",
  defaultOgLocale: "ar_SA",
  defaultOgDeterminer: "auto",
  defaultOgImageType: "image/webp",
  defaultOgImageWidth: 1200,
  defaultOgImageHeight: 630,
  defaultTwitterCard: "summary_large_image",
  defaultHreflang: "ar-SA",
  // false: Google may offer translated versions — notranslate is reserved for
  // sensitive/payment pages, not the whole marketing site (Khalid 2026-08-02).
  defaultNotranslate: false,
  defaultReferrerPolicy: "origin-when-cross-origin",
  defaultSitemapPriority: 0.7,
  defaultSitemapChangeFreq: "weekly",
  articleDefaultSitemapPriority: 0.8,
  articleDefaultSitemapChangeFreq: "daily",
  // Modonty's own policy page — it forbids commercial reuse and AI training without
  // written permission, so a permissive CC licence would contradict it (Khalid 2026-08-02).
  defaultLicense: "https://www.modonty.com/legal/copyright-policy",
  defaultIsAccessibleForFree: true,
  defaultPathname: "/",
  defaultTruncationSuffix: "…",
};

export async function applyTechnicalDefaults(): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    const allDefaults = { ...SEO_RULES, ...TECHNICAL_DEFAULTS, ...BUSINESS_DEFAULTS };
    const id = await ensureSettingsId();
    const settings = await db.settings.findUnique({ where: { id } });
    if (!settings) {
      return { success: false, updated: 0, error: "Settings singleton missing after ensure — should never happen" };
    }

    const updates: Record<string, unknown> = {};
    for (const [key, correct] of Object.entries(allDefaults)) {
      const current = (settings as Record<string, unknown>)[key];
      if (current !== correct) {
        updates[key] = correct;
      }
    }

    // The sitelinks-search-box template is not in the defaults above, so the loop cannot
    // clear a value already sitting in the DB from before Google retired the feature.
    if (settings.orgSearchUrlTemplate !== null) {
      updates.orgSearchUrlTemplate = null;
    }

    if (Object.keys(updates).length === 0) {
      return { success: true, updated: 0 };
    }

    await db.settings.update({
      where: { id },
      data: updates,
    });

    revalidatePath("/settings");
    // The public site caches these values behind cacheTag("settings") (modonty
    // get-listing-page-seo.ts). Without this flush the button changed the DB and the visitor
    // kept seeing the old brand — measured 28 Aug 2026: siteName was already "مدونتي" in the
    // DB while every listing page still served "| Modonty" in its <title>.
    await revalidateModontyTag("settings");
    return { success: true, updated: Object.keys(updates).length };
  } catch (error) {
    return { success: false, updated: 0, error: error instanceof Error ? error.message : "Failed to apply defaults" };
  }
}
