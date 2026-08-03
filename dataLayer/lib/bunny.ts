import "server-only";

/**
 * Bunny Edge Storage client — SHARED (console uploads + admin migration/cleanup).
 * Ported from the proven JBRSEO content app implementation (2026-07-06).
 * The storage passwords are server-only and must NEVER reach the browser;
 * all uploads are proxied through an app server route/action.
 *
 * Three named zones (locked naming, 2026-07-06/07):
 *   reels   → modonty-reels-media  — ALL reels files incl. client-gallery images (unified source)
 *   clients → modonty-clients      — future client profile assets (logo/hero/verification)
 *   assets  → modonty-asset        — Modonty platform assets (OG, tags, industry heroes)
 */

export type BunnyZone = "reels" | "clients" | "assets";

interface ZoneConfig {
  zone: string | undefined;
  key: string | undefined;
  cdn: string | undefined;
}

function zoneConfig(zone: BunnyZone): { zone: string; key: string; cdn: string } {
  const map: Record<BunnyZone, ZoneConfig> = {
    reels: {
      zone: process.env.BUNNY_REELS_STORAGE_ZONE_NAME,
      key: process.env.BUNNY_REELS_STORAGE_PASSWORD,
      cdn: process.env.BUNNY_REELS_PULL_ZONE_HOSTNAME,
    },
    clients: {
      zone: process.env.BUNNY_STORAGE_ZONE_NAME,
      key: process.env.BUNNY_STORAGE_PASSWORD,
      cdn: process.env.BUNNY_PULL_ZONE_HOSTNAME,
    },
    assets: {
      zone: process.env.BUNNY_ASSETS_STORAGE_ZONE_NAME,
      key: process.env.BUNNY_ASSETS_STORAGE_PASSWORD,
      cdn: process.env.BUNNY_ASSETS_PULL_ZONE_HOSTNAME,
    },
  };
  const cfg = map[zone];
  if (!cfg.zone || !cfg.key || !cfg.cdn) {
    throw new Error(`Bunny env missing for zone "${zone}" — check BUNNY_* keys in .env.shared`);
  }
  return { zone: cfg.zone, key: cfg.key, cdn: cfg.cdn };
}

const STORAGE_HOST = process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com";

function normalizePath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+/g, "/");
}

/**
 * Media-library folder per MediaType (locked structure, Khalid 2026-07-28):
 * `/{typeFolder}/{owner}/{filename}` so a whole type reads as one folder.
 * `owner` = client slug, or `_platform` / `_general` for client-less media.
 */
const MEDIA_TYPE_FOLDER: Record<string, string> = {
  LOGO: "logo",
  POST: "post",
  OGIMAGE: "og",
  TWITTER_IMAGE: "twitter",
  HERO: "hero",
  GENERAL: "general",
  GALLERY: "gallery",
  CLIENT_MINI: "client-mini",
};

function fileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0 || dot === filename.length - 1) return "";
  return filename.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "");
}

/**
 * Filename-safe suffixes for Google's 3 article aspect ratios (JSON-LD crops).
 * Bunny is storage-only (no on-the-fly crop like Cloudinary) → the 3 crops are
 * pre-generated at upload and stored next to the base image with these suffixes.
 */
export const BUNNY_ASPECT_SUFFIX = { "1:1": "1x1", "4:3": "4x3", "16:9": "16x9" } as const;

/**
 * Derive an aspect-crop url/path from a base image: `a/b.jpg` + `16x9` → `a/b__16x9.webp`.
 * Crops are ALWAYS WebP (sharp output) → force the `.webp` extension so the CDN serves the
 * correct `image/webp` content-type regardless of the base image's format. Works on urls or paths.
 */
export function bunnyAspectUrl(baseUrlOrPath: string, suffix: string): string {
  const q = baseUrlOrPath.indexOf("?");
  const main = q === -1 ? baseUrlOrPath : baseUrlOrPath.slice(0, q);
  const query = q === -1 ? "" : baseUrlOrPath.slice(q);
  const slash = main.lastIndexOf("/");
  const dot = main.lastIndexOf(".");
  const stem = dot > slash ? main.slice(0, dot) : main;
  return `${stem}__${suffix}.webp${query}`;
}

/** Build the Bunny remote path for a media file — used by dual-write, migration, and move. */
export function buildBunnyMediaPath(opts: {
  type?: string | null;
  scope?: string | null;
  clientSlug?: string | null;
  filename: string;
  publicId?: string | null;
}): string {
  const typeFolder = MEDIA_TYPE_FOLDER[opts.type ?? "GENERAL"] ?? "general";
  const owner = opts.clientSlug
    ? opts.clientSlug.trim().replace(/\/+/g, "-")
    : opts.scope === "PLATFORM"
      ? "_platform"
      : "_general";
  const ext = fileExtension(opts.filename);
  // Cloudinary public_id is globally unique → its last segment is a collision-free basename.
  const rawBase = opts.publicId
    ? opts.publicId.split("/").pop() || opts.publicId
    : opts.filename.replace(/\.[^.]+$/, "");
  const base = rawBase.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
  return normalizePath(`${typeFolder}/${owner}/${base}${ext}`);
}

export function getBunnyPublicUrl(zone: BunnyZone, path: string): string {
  const { cdn } = zoneConfig(zone);
  return `https://${cdn}/${normalizePath(path)}`;
}

export function extractBunnyPath(zone: BunnyZone, url: string): string | null {
  if (!url) return null;
  const { cdn } = zoneConfig(zone);
  const prefix = `https://${cdn}/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length).split("?")[0] ?? null;
}

export function isBunnyUrl(zone: BunnyZone, url: string | null | undefined): boolean {
  if (!url) return false;
  const { cdn } = zoneConfig(zone);
  return url.startsWith(`https://${cdn}/`);
}

export async function uploadToBunny(
  zone: BunnyZone,
  body: Buffer | Uint8Array | ArrayBuffer | Blob,
  remotePath: string,
  contentType?: string,
): Promise<{ url: string; path: string }> {
  const cfg = zoneConfig(zone);
  const path = normalizePath(remotePath);
  const storageUrl = `https://${STORAGE_HOST}/${cfg.zone}/${path}`;

  const res = await fetch(storageUrl, {
    method: "PUT",
    headers: {
      AccessKey: cfg.key,
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body: body as BodyInit,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Bunny upload failed (${res.status}): ${txt || res.statusText}`);
  }

  return { url: getBunnyPublicUrl(zone, path), path };
}

export async function deleteFromBunny(zone: BunnyZone, remotePath: string): Promise<void> {
  const cfg = zoneConfig(zone);
  const path = normalizePath(remotePath);
  const storageUrl = `https://${STORAGE_HOST}/${cfg.zone}/${path}`;

  const res = await fetch(storageUrl, {
    method: "DELETE",
    headers: { AccessKey: cfg.key },
  });

  if (!res.ok && res.status !== 404) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Bunny delete failed (${res.status}): ${txt || res.statusText}`);
  }
}

export async function deleteBunnyUrl(zone: BunnyZone, url: string): Promise<boolean> {
  const path = extractBunnyPath(zone, url);
  if (!path) return false;
  await deleteFromBunny(zone, path);
  return true;
}

/**
 * Physically move a stored file to a new remote path (Bunny has no native move):
 * download the source → upload at the new path → delete the old one.
 * `from` accepts a public CDN url or a raw storage path. Returns the new public url.
 * Throws on failure — callers that must not break should wrap in try/catch.
 */
export async function moveBunnyMedia(
  zone: BunnyZone,
  from: string,
  toPath: string,
): Promise<{ url: string; path: string }> {
  const fromPath = from.startsWith("http") ? extractBunnyPath(zone, from) : normalizePath(from);
  if (!fromPath) throw new Error(`moveBunnyMedia: cannot resolve source path from "${from}"`);
  const to = normalizePath(toPath);
  if (fromPath === to) return { url: getBunnyPublicUrl(zone, to), path: to }; // no-op

  const res = await fetch(getBunnyPublicUrl(zone, fromPath));
  if (!res.ok) throw new Error(`moveBunnyMedia: source fetch failed (${res.status})`);
  const contentType = res.headers.get("content-type") ?? undefined;
  const buffer = Buffer.from(await res.arrayBuffer());

  const uploaded = await uploadToBunny(zone, buffer, to, contentType);
  await deleteFromBunny(zone, fromPath); // remove old copy only after the new one is up
  return uploaded;
}
