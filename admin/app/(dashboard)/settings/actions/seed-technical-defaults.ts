"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

// Business defaults — stable for 6+ months, editable via Apply Defaults
const BUSINESS_DEFAULTS: Record<string, unknown> = {
  siteUrl: "https://modonty.com",
  siteName: "Modonty",
  siteAuthor: "Modonty Team",
  inLanguage: "ar-SA",
  orgAddressCountry: "SA",
  orgAreaServed: "SA",
  orgContactType: "customer service",
  orgContactAvailableLanguage: "ar, en",
  orgSearchUrlTemplate: "https://modonty.com/search?q={search_term_string}",
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
  defaultNotranslate: true,
  defaultReferrerPolicy: "origin-when-cross-origin",
  defaultSitemapPriority: 0.7,
  defaultSitemapChangeFreq: "weekly",
  articleDefaultSitemapPriority: 0.8,
  articleDefaultSitemapChangeFreq: "daily",
  defaultLicense: "https://creativecommons.org/licenses/by/4.0/",
  defaultIsAccessibleForFree: true,
  defaultPathname: "/",
  defaultTruncationSuffix: "…",
};

export async function applyTechnicalDefaults(): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    const allDefaults = { ...SEO_RULES, ...TECHNICAL_DEFAULTS, ...BUSINESS_DEFAULTS };
    const settings = await db.settings.findFirst();

    if (!settings) {
      await db.settings.create({ data: allDefaults });
      revalidatePath("/settings");
      return { success: true, updated: Object.keys(allDefaults).length };
    }

    const updates: Record<string, unknown> = {};
    for (const [key, correct] of Object.entries(allDefaults)) {
      const current = (settings as Record<string, unknown>)[key];
      if (current !== correct) {
        updates[key] = correct;
      }
    }

    if (Object.keys(updates).length === 0) {
      return { success: true, updated: 0 };
    }

    await db.settings.update({
      where: { id: settings.id },
      data: updates,
    });

    revalidatePath("/settings");
    return { success: true, updated: Object.keys(updates).length };
  } catch (error) {
    return { success: false, updated: 0, error: error instanceof Error ? error.message : "Failed to apply defaults" };
  }
}
