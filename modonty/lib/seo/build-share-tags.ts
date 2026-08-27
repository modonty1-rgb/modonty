import type { Metadata } from "next";

import { buildMetadataFromPageRow } from "./build-metadata-from-page-row";

interface ShareTagsInput {
  /** Route path used to build `og:url`, e.g. "/news" or "/modonty?page=2". */
  path: string;
  /** The page's own title WITHOUT the brand suffix — `og:site_name` carries the brand. */
  title: string;
  description: string;
}

/**
 * `og:` + `twitter:` for the five pages that have no editable row to read.
 *
 * `/news`, `/booking`, `/shop`, `/modonty` and `/page/[n]` build their metadata as a plain
 * object in the file. They were retrofitted with `buildPageAlternates` when hreflang was
 * fixed, but nobody retrofitted the share block — so they shipped neither `og:` nor
 * `twitter:` while every other indexable route shipped both (measured 27 Aug 2026 on this
 * branch: five paths with `og:title` count 0).
 *
 * X's card processor "first checks for the Twitter-specific property, and if not present,
 * falls back to the supported Open Graph property" — every twitter tag has an og fallback
 * EXCEPT `twitter:card` itself, which the docs require you to declare
 * (developer.twitter.com/en/docs/tweets/optimize-with-cards/guides/getting-started).
 * These pages declared neither half, so a shared link rendered as bare text.
 *
 * Nothing is invented here. This is `buildMetadataFromPageRow`'s own rowless branch — the
 * one that already builds og/twitter for a page whose row was never generated — reused
 * rather than copied, so the card type, locale, site name and both handles keep coming from
 * the same `Settings` columns every other page reads, and `og:image` stays OMITTED while
 * `Settings.ogImageUrl` is empty.
 *
 * Only the share block is returned: these five own their own title, canonical, hreflang and
 * (for `/modonty`) `pagination`, and those stay exactly as they are.
 */
export async function buildShareTags({
  path,
  title,
  description,
}: ShareTagsInput): Promise<Pick<Metadata, "openGraph" | "twitter">> {
  const { openGraph, twitter } = await buildMetadataFromPageRow(null, {
    path,
    fallbackTitle: title,
    fallbackDescription: description,
  });

  return { openGraph, twitter };
}
