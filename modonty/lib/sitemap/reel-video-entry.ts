import type { MetadataRoute } from "next";
import { SITE_URL } from "@/constants";
import { escapeXml } from "@/lib/seo/escape-xml";

/**
 * Next interpolates `videos` fields into the XML **raw** — verified in
 * `next/dist/build/webpack/loaders/metadata/resolve-route-data.js`, which emits
 * `` `<video:title>${video.title}</video:title>` `` with no escaping of its own. Google requires
 * the opposite: "All HTML entities must be escaped or wrapped in a CDATA block".
 *
 * The stake is the whole file, not the one reel: a single `&` typed into a reel title in the
 * console makes the XML malformed, and a malformed sitemap is rejected entirely — every article,
 * client and category in it stops being submitted. Reel titles and descriptions are the only
 * free text here; slugs and URLs are already safe by construction. Hence `escapeXml` below.
 */

/** Google's published limits for the video tags used below. */
const VIDEO_DESCRIPTION_MAX = 2048;
const VIDEO_UPLOADER_MAX = 255;
const VIDEO_DURATION_MIN = 1;
const VIDEO_DURATION_MAX = 28800;

type SitemapReel = {
  reelSlug: string | null;
  reelPublishedAt: Date | null;
  thumbnailUrl: string | null;
  title: string | null;
  description: string | null;
  bunnyVideoId: string | null;
  mp4Url: string | null;
  durationSec: number | null;
  viewsCount: number;
  client: { name: string; slug: string } | null;
};

type SitemapVideo = NonNullable<MetadataRoute.Sitemap[number]["videos"]>[number];

/**
 * The `<video:video>` block for one reel — the discovery half of what the watch page already
 * says in its `VideoObject`. Structured data is only read once Google has crawled the page;
 * the sitemap hands it the title, thumbnail and file up front, which is what shortens the gap
 * between publishing a reel and it being eligible as a video result.
 *
 * Returns `null` rather than a partial block whenever a required field is missing: Google
 * demands title + thumbnail_loc + description + one of content_loc/player_loc, and a half-formed
 * entry is an invalid entry.
 */
export function reelVideoEntry(r: SitemapReel): SitemapVideo | null {
  // An image reel is not a video. Its watch page emits `ImageObject`, and a `<video:video>` here
  // would be a false claim to the crawler about a file that does not exist.
  if (!r.bunnyVideoId) return null;

  const title = r.title?.trim();
  const description = r.description?.trim();
  // `mp4Url` is the progressive file, not the HLS playlist — the same URL the page's
  // `VideoObject.contentUrl` names, and the reason the console stores it at all. It lives on
  // Bunny's host, so it can never equal the `<loc>` URL, which Google forbids.
  if (!title || !description || !r.thumbnailUrl || !r.mp4Url) return null;

  const duration =
    r.durationSec && r.durationSec >= VIDEO_DURATION_MIN && r.durationSec <= VIDEO_DURATION_MAX
      ? r.durationSec
      : undefined;

  return {
    title: escapeXml(title),
    thumbnail_loc: r.thumbnailUrl,
    description: escapeXml(description.slice(0, VIDEO_DESCRIPTION_MAX)),
    content_loc: r.mp4Url,
    family_friendly: "yes",
    ...(duration && { duration }),
    ...(r.reelPublishedAt && { publication_date: r.reelPublishedAt.toISOString() }),
    ...(r.viewsCount > 0 && { view_count: r.viewsCount }),
    // `info` is passed WITH `content`, never without: Next builds the tag as
    // `` `<video:uploader${uploader.info && ` info="..."`}>` ``, so an absent `info` interpolates
    // the string "undefined" and emits `<video:uploaderundefined>` — measured, not assumed.
    // The client page is on our own host, which is Google's requirement for that attribute.
    ...(r.client && {
      uploader: {
        content: escapeXml(r.client.name.slice(0, VIDEO_UPLOADER_MAX)),
        info: new URL(`/clients/${r.client.slug}`, SITE_URL).href,
      },
    }),
  };
}
