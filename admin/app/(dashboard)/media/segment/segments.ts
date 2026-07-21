import type { MediaSegmentKey } from "../../actions/media-counts";

/**
 * Media segments — one key per clickable card in the dashboard's Media section.
 * Same contract as the client, article and reference segments: the key owns the title
 * and the description, and the rows come from the same function that produced the count.
 */

interface MediaSegment {
  title: string;
  description: string;
}

const SEGMENTS: Record<MediaSegmentKey, MediaSegment> = {
  unused: {
    title: "Unused files",
    description:
      "Nothing points at them — not an article's featured image, not its gallery, not a client logo or hero. They cost storage and nothing else.",
  },
  "no-alt": {
    title: "No alt text",
    description:
      "Invisible in Google Images and unreadable by a screen reader. It is 50 points of the image's SEO score and the single most valuable field to fill.",
  },
  "failing-seo": {
    title: "Failing SEO",
    description: "Below 60. Alt text, dimensions, description or filename is letting them down.",
  },
  "no-dimensions": {
    title: "No dimensions stored",
    description:
      "No width or height on the record. The browser cannot reserve space for them (layout shift), and they cannot be used as a share image.",
  },
};

export function getMediaSegment(key: string): (MediaSegment & { key: MediaSegmentKey }) | null {
  const s = SEGMENTS[key as MediaSegmentKey];
  return s ? { ...s, key: key as MediaSegmentKey } : null;
}
