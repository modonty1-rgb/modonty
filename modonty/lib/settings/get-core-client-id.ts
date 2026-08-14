import { cacheTag, cacheLife } from "next/cache";

import { db } from "@/lib/db";
import { SETTINGS_SINGLETON_WHERE } from "@/lib/settings/settings-singleton";

/**
 * The Client row that IS Modonty itself — cached for modonty.com.
 *
 * The shared helper (`@modonty/shared/lib/core-client`) hits the DB on every call, and
 * five read paths here use it: the home feed, the core-publisher strip, trending, and both
 * article-list queries. So a single visit to the homepage asked the same question several
 * times, for a value that changes about once in the project's life — it is set by hand from
 * the admin's /settings/system screen.
 *
 * Why a modonty-local copy instead of caching the shared one: `"use cache"` needs
 * `cacheComponents`, which only modonty enables (admin and console do not). Putting it in
 * `shared/` would break their builds — which is why nothing under `shared/lib` uses it.
 *
 * Invalidated by `cacheTag("settings")`, the same tag every settings save already busts.
 */
export async function getCoreClientId(): Promise<string | null> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const settings = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: { coreClientId: true },
  });
  return settings?.coreClientId ?? null;
}
