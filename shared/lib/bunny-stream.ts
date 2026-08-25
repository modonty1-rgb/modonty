import "server-only";

import { createHash } from "node:crypto";

/**
 * Bunny Stream client — SHARED (console uploads + admin approval/cleanup).
 *
 * Video never passes through our server. A 90-second clip is 10–50MB, past both Vercel's
 * request-body limit and the function time ceiling, so the browser uploads STRAIGHT to
 * Bunny over the tus resumable protocol (ق2, 2026-08-05). Our only job is to mint a
 * short-lived signature for one specific video id — the API key itself never leaves here.
 *
 * Protocol per Bunny's own documentation:
 *   1. POST /library/{id}/videos          → creates the video object, returns its guid
 *   2. SHA256(libraryId + apiKey + expire + guid) → the AuthorizationSignature
 *   3. browser → https://video.bunnycdn.com/tusupload with that signature
 *
 * Docs: https://bunny.net/docs/stream/tus-resumable-uploads
 *       https://bunny.net/docs/reference/video_createvideo
 */

const TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";
const API_BASE = "https://video.bunnycdn.com";

/**
 * One hour. Bunny's documented minimum recommendation — the signature has to outlive the
 * whole upload, and a client on a weak connection can spend a long time on one clip.
 */
const SIGNATURE_TTL_SECONDS = 3600;

function streamConfig(): { libraryId: string; apiKey: string; cdn: string } {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const cdn = process.env.BUNNY_STREAM_CDN_HOSTNAME;
  if (!libraryId || !apiKey || !cdn) {
    throw new Error("Bunny Stream env missing — check BUNNY_STREAM_* keys in .env.shared");
  }
  return { libraryId, apiKey, cdn };
}

/** Public playback URLs for a video. Derived from the guid — no API call needed. */
export interface StreamUrls {
  /** HLS playlist — what a player streams. */
  playbackUrl: string;
  /**
   * Plain MP4 file. Google's most effective way to fetch a video for indexing, and the
   * reason MP4 Fallback is on and token auth is off. Bunny caps this at 720p.
   */
  mp4Url: string;
  thumbnailUrl: string;
}

/**
 * Renditions Bunny can produce, best first. Used to pick the MP4 that actually exists —
 * Bunny only encodes DOWN from the source, so a 480p upload never gets a 720p file.
 */
const RENDITIONS = ["1080p", "720p", "480p", "360p", "240p"] as const;

/**
 * @param resolution Which MP4 rendition to point at. Defaults to 720p — the value used
 *   before encoding finishes, when the available set is not known yet. Once Bunny reports
 *   `availableResolutions`, callers pass the real best one: `play_720p.mp4` on a video that
 *   has no 720p rendition is a 404, which would break both the feed's `<video>` and the
 *   `contentUrl` Google fetches to verify the clip.
 */
export function streamUrls(videoId: string, resolution: string = "720p"): StreamUrls {
  const { cdn } = streamConfig();
  return {
    playbackUrl: `https://${cdn}/${videoId}/playlist.m3u8`,
    mp4Url: `https://${cdn}/${videoId}/play_${resolution}.mp4`,
    thumbnailUrl: `https://${cdn}/${videoId}/thumbnail.jpg`,
  };
}

/** The best rendition Bunny actually produced, or null while it has produced none. */
export function bestRendition(availableResolutions: string | null | undefined): string | null {
  const have = new Set(
    (availableResolutions ?? "")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean),
  );
  return RENDITIONS.find((r) => have.has(r)) ?? null;
}

/** Everything the browser needs to upload — and nothing it must never see. */
export interface TusTicket {
  endpoint: string;
  libraryId: string;
  videoId: string;
  signature: string;
  expire: number;
}

/**
 * Create the video object and sign an upload for it.
 *
 * The signature is bound to one video id, so a leaked ticket can only finish the upload
 * it was minted for — it grants no access to the library.
 */
export async function createTusTicket(title: string): Promise<TusTicket> {
  const { libraryId, apiKey } = streamConfig();

  const res = await fetch(`${API_BASE}/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    throw new Error(`Bunny Stream refused to create the video (HTTP ${res.status})`);
  }

  const created = (await res.json()) as { guid?: string };
  if (!created.guid) throw new Error("Bunny Stream returned no video id");

  const expire = Math.floor(Date.now() / 1000) + SIGNATURE_TTL_SECONDS;
  const signature = createHash("sha256")
    .update(`${libraryId}${apiKey}${expire}${created.guid}`)
    .digest("hex");

  return { endpoint: TUS_ENDPOINT, libraryId, videoId: created.guid, signature, expire };
}

/** Remove a video from the library — used when its row is deleted. */
export async function deleteStreamVideo(videoId: string): Promise<boolean> {
  const { libraryId, apiKey } = streamConfig();
  const res = await fetch(`${API_BASE}/library/${libraryId}/videos/${videoId}`, {
    method: "DELETE",
    headers: { AccessKey: apiKey, accept: "application/json" },
  });
  return res.ok;
}

export interface StreamVideoState {
  /** Bunny's own pipeline state: 0 queued … 3 finished, 4 resolution-finished, 5 failed. */
  status: number;
  encodeProgress: number;
  /** Seconds, as measured by Bunny after encoding — more trustworthy than the browser's. */
  length: number;
  width: number;
  height: number;
  /** Comma-separated, e.g. "360p,480p,720p" — Bunny encodes down only, never up. */
  availableResolutions: string;
}

/** Read the encoding state of one video. */
export async function getStreamVideo(videoId: string): Promise<StreamVideoState | null> {
  const { libraryId, apiKey } = streamConfig();
  const res = await fetch(`${API_BASE}/library/${libraryId}/videos/${videoId}`, {
    headers: { AccessKey: apiKey, accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const v = (await res.json()) as {
    status?: number;
    encodeProgress?: number;
    length?: number;
    width?: number;
    height?: number;
    availableResolutions?: string | null;
  };
  return {
    status: v.status ?? 0,
    encodeProgress: v.encodeProgress ?? 0,
    length: v.length ?? 0,
    width: v.width ?? 0,
    height: v.height ?? 0,
    availableResolutions: v.availableResolutions ?? "",
  };
}
