import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";
import { BRAND_AR } from "@/constants";

export interface PageSeoDefaults {
  siteName: string;
  inLanguage: string;
  metaRobots: string;
  ogType: string;
  ogLocale: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  /** `[{ hreflang, url? }]` — an entry with no url points at the page's own canonical. */
  alternateLanguages: unknown;
}

/**
 * The Settings-level SEO defaults every editable page falls back to.
 *
 * The article route has read these for a long time (`get-article-defaults-from-settings.ts`);
 * the other pages never did. They fell straight from their own column to a literal in the
 * file — `page.metaRobots || "index,follow"` — so the Settings layer between them was
 * skipped entirely. The visible cost: Settings lists nine hreflang locales (SA, EG, AE, KW,
 * QA, BH, OM, ar, x-default) and those pages declared four, so five Gulf markets never
 * reached Google (measured 2026-08-15).
 *
 * One cached read, invalidated on the same `settings` tag every admin save already busts.
 */
export async function getPageSeoDefaults(): Promise<PageSeoDefaults> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      siteName: true,
      inLanguage: true,
      defaultMetaRobots: true,
      defaultOgType: true,
      defaultOgLocale: true,
      defaultTwitterCard: true,
      twitterSite: true,
      twitterCreator: true,
      defaultAlternateLanguages: true,
    },
  });

  return {
    siteName: settings?.siteName?.trim() || BRAND_AR,
    inLanguage: settings?.inLanguage?.trim() || "ar",
    metaRobots: settings?.defaultMetaRobots?.trim() || "index, follow",
    ogType: settings?.defaultOgType?.trim() || "website",
    ogLocale: settings?.defaultOgLocale?.trim() || "ar_SA",
    twitterCard: settings?.defaultTwitterCard?.trim() || "summary_large_image",
    twitterSite: settings?.twitterSite?.trim() || "",
    twitterCreator: settings?.twitterCreator?.trim() || "",
    alternateLanguages: settings?.defaultAlternateLanguages ?? undefined,
  };
}
