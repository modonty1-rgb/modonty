// أ٦ — reading a client's legacy intro-video link.
//
// Five clients still carry `introVideoUrl`: a bare link to a video sitting on somebody
// else's channel. The team follows these up by phone, and the conversation is different
// for each kind of link — so the badge says WHICH kind, not just "has one".
//
// The field clears itself the moment the client uploads a real video (the upload writes
// `introVideoMediaId` and nulls this in the same write), so the badge disappears on its
// own. Nothing here needs a cleanup pass.

export type IntroVideoHost = "youtube" | "facebook" | "drive" | "other";

export interface IntroVideoLinkInfo {
  host: IntroVideoHost;
  /** Arabic label for the badge. */
  label: string;
  /**
   * The link cannot serve as a video source at all — not "on the wrong channel", but
   * "this is a page, not a file". A share page or a Drive viewer link plays nothing
   * when fetched, so these five are the urgent calls, not the routine ones.
   */
  isUnusable: boolean;
  /** More than one link pasted into the single field — needs a human to pick one. */
  linkCount: number;
  /** The links, split out — so the admin can open each one from the row. */
  links: string[];
}

/** Anything that looks like a URL inside a free-text field (they pasted several). */
const URL_PATTERN = /https?:\/\/[^\s,]+/g;

function classifyHost(url: string): IntroVideoHost {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("facebook.com") || u.includes("fb.watch")) return "facebook";
  if (u.includes("drive.google.com")) return "drive";
  return "other";
}

const HOST_LABELS: Record<IntroVideoHost, string> = {
  youtube: "على قناة يوتيوب",
  facebook: "رابط فيسبوك",
  drive: "رابط جوجل درايف",
  other: "رابط خارجي",
};

/**
 * Null when the client has no legacy link (the normal case, and the case after they
 * upload their own video).
 */
export function readIntroVideoLink(introVideoUrl: string | null | undefined): IntroVideoLinkInfo | null {
  const raw = (introVideoUrl ?? "").trim();
  if (!raw) return null;

  const links = raw.match(URL_PATTERN) ?? [raw];
  // The badge describes the FIRST link; the count tells the admin there are more.
  const host = classifyHost(links[0]);

  return {
    host,
    label: HOST_LABELS[host],
    // A Facebook share page and a Drive viewer page are HTML, not video files — Google
    // cannot fetch either as a video source, and neither can we.
    isUnusable: host === "facebook" || host === "drive",
    linkCount: links.length,
    links,
  };
}
