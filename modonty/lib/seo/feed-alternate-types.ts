import { SITE_URL } from "@/constants";

/**
 * The RSS auto-discovery link, in the one shape every `alternates` builder must include.
 *
 * Next.js does not merge `alternates` — it replaces it. From the framework's own resolver:
 * "complex fields like `alternates`/`openGraph` replace parent wholesale when key is present"
 * (`packages/next/src/lib/metadata/resolve-metadata.ts`, `mergeMetadata`). So the root layout
 * declaring `alternates.types` buys nothing: the moment a page sets its own canonical or
 * hreflang — which every indexable page does — the feed link is gone with it.
 *
 * Measured 25 Aug 2026: zero `application/rss+xml` links across /, /articles, /clients,
 * /terms, /about, /shop, /booking and /help, while /feed.xml itself served 200 and 48 KB of
 * real items. A feed nothing points at is a feed no reader can find.
 *
 * Absolute, not "/feed.xml": these objects are also written into stored metadata blobs, which
 * are read back raw without a `metadataBase` to resolve a relative path against.
 */
export const FEED_ALTERNATE_TYPES = {
  "application/rss+xml": `${SITE_URL}/feed.xml`,
} as const;
