import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

export interface BrandMedia {
  /** Default Open Graph share image (1200×630). null when admin hasn't set it. */
  ogImageUrl: string | null;
  /** Wide wordmark logo — desktop navbar. null when admin hasn't set it. */
  logoUrl: string | null;
  /** Small icon/mark logo — mobile navbar. null when admin hasn't set it (falls back to logoUrl). */
  logoIconUrl: string | null;
  /** Default alt text for logo / OG image. */
  altImage: string | null;
  /** X/Twitter site @handle (without @) — twitter:site. null when unset. */
  twitterSite: string | null;
  /** X/Twitter creator @handle (without @) — twitter:creator. null when unset. */
  twitterCreator: string | null;
}

/**
 * Brand media (logo + OG image) — SINGLE SOURCE OF TRUTH is the Settings DB (admin-managed).
 * No static fallback: when a field is empty, callers OMIT it (no og:image) and the admin is
 * alerted via the EssentialSeoDialog in the admin app. Cached + tagged "settings" so it's
 * deduped per render and invalidated on admin save (revalidateTag("settings", "max")).
 */
export async function getBrandMedia(): Promise<BrandMedia> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      ogImageUrl: true,
      logoUrl: true,
      logoIconUrl: true,
      altImage: true,
      twitterSite: true,
      twitterCreator: true,
    },
  });

  return {
    ogImageUrl: settings?.ogImageUrl?.trim() || null,
    logoUrl: settings?.logoUrl?.trim() || null,
    logoIconUrl: settings?.logoIconUrl?.trim() || null,
    altImage: settings?.altImage?.trim() || null,
    twitterSite: settings?.twitterSite?.trim() || null,
    twitterCreator: settings?.twitterCreator?.trim() || null,
  };
}
