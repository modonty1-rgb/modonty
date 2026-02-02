/**
 * Article defaults from Settings (SOT). Used when Article no longer stores the 12 fields.
 * Matches admin getArticleDefaultsFromSettings shape.
 */

import { db } from "@/lib/db";

export type ArticleDefaultsFromSettings = {
  inLanguage: string;
  metaRobots: string;
  ogType: string;
  ogLocale: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  sitemapPriority: number;
  sitemapChangeFreq: string;
  license: string;
  isAccessibleForFree: boolean;
  alternateLanguages: unknown;
  contentFormat: string;
};

export async function getArticleDefaultsFromSettings(): Promise<ArticleDefaultsFromSettings> {
  const settings = await db.settings.findFirst();
  if (!settings) {
    return {
      inLanguage: "ar",
      metaRobots: "index, follow",
      ogType: "article",
      ogLocale: "ar_SA",
      twitterCard: "summary_large_image",
      twitterSite: "",
      twitterCreator: "",
      sitemapPriority: 0.5,
      sitemapChangeFreq: "weekly",
      license: "none",
      isAccessibleForFree: true,
      alternateLanguages: undefined,
      contentFormat: "rich_text",
    };
  }
  return {
    inLanguage: settings.inLanguage?.trim() || "ar",
    metaRobots: settings.defaultMetaRobots?.trim() || "index, follow",
    ogType: settings.defaultOgType?.trim() || "article",
    ogLocale: settings.defaultOgLocale?.trim() || "ar_SA",
    twitterCard: settings.defaultTwitterCard?.trim() || "summary_large_image",
    twitterSite: settings.twitterSite?.trim() || "",
    twitterCreator: settings.twitterCreator?.trim() || "",
    sitemapPriority: settings.articleDefaultSitemapPriority ?? settings.defaultSitemapPriority ?? 0.5,
    sitemapChangeFreq: settings.articleDefaultSitemapChangeFreq?.trim() || settings.defaultSitemapChangeFreq?.trim() || "weekly",
    license: settings.defaultLicense?.trim() || "none",
    isAccessibleForFree: settings.defaultIsAccessibleForFree ?? true,
    alternateLanguages: settings.defaultAlternateLanguages ?? undefined,
    contentFormat: settings.defaultContentFormat?.trim() || "rich_text",
  };
}
