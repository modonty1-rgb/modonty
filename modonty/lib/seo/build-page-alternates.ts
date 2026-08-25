import type { Metadata } from "next";

import { buildHreflangLanguages } from "@modonty/shared/lib/seo/build-hreflang-languages";

import { SITE_URL } from "@/constants";
import { getPageSeoDefaults } from "@/lib/settings/get-page-seo-defaults";

/**
 * A page's `alternates`: its own canonical, plus every locale Settings lists — each pointing
 * at THIS page.
 *
 * For the handful of pages whose metadata is a plain object with no stored blob to read
 * (`/news`, `/analytics`, `/booking`, `/shop`). They used to inherit the root layout's four
 * hardcoded locales, all of which pointed at "/" — so each of them told Google that its Saudi
 * version was the homepage. Google: "Each language version must list itself as well as all
 * other language versions."
 *
 * Nothing is written here: the list is `Settings.defaultAlternateLanguages`, the same column
 * the listing and content pages read through their stored blobs.
 */
export async function buildPageAlternates(path: string): Promise<Metadata["alternates"]> {
  const canonical = `${SITE_URL}${path}`;
  const { alternateLanguages } = await getPageSeoDefaults();
  return {
    canonical,
    languages: buildHreflangLanguages(alternateLanguages, canonical, SITE_URL),
  };
}
