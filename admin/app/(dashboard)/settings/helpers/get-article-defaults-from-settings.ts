import type { AllSettings } from "../actions/settings-actions";

/** Article defaults from Settings (SOT). Use for new/edit form display and merged view. */
export function getArticleDefaultsFromSettings(settings: AllSettings): {
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
  alternateLanguages: Array<{ hreflang?: string; url?: string }> | undefined;
  contentFormat: string;
} {
  const raw = settings.defaultAlternateLanguages;
  const alternateLanguages = Array.isArray(raw)
    ? (raw as Array<{ hreflang?: string; url?: string }>)
    : undefined;
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
    alternateLanguages,
    contentFormat: settings.defaultContentFormat?.trim() || "rich_text",
  };
}
