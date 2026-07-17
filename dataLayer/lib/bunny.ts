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
