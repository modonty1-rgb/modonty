"use server";

/**
 * Live file counts on both storage providers, plus the Bunny wipe.
 *
 * Lives inside the temporary `bunny-migration` route on purpose — deleting that folder
 * removes the wipe capability with it. Nothing outside imports from here.
 *
 * The Bunny storage API has no "count" endpoint: listing a directory returns its entries,
 * and directories must be walked. Both are therefore recursive walks and can take a few
 * seconds, which is why they are on-demand buttons rather than page-load work.
 */

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const STORAGE_HOST = process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com";

/** The two zones this migration touches. `reels` is unrelated work and never listed here. */
export type MigrationZone = "clients" | "assets";

function zoneCfg(zone: MigrationZone): { name: string; key: string } {
  const name = zone === "clients" ? process.env.BUNNY_STORAGE_ZONE_NAME : process.env.BUNNY_ASSETS_STORAGE_ZONE_NAME;
  const key = zone === "clients" ? process.env.BUNNY_STORAGE_PASSWORD : process.env.BUNNY_ASSETS_STORAGE_PASSWORD;
  if (!name || !key) throw new Error(`Bunny env missing for zone "${zone}"`);
  return { name, key };
}

interface BunnyEntry {
  ObjectName: string;
  IsDirectory: boolean;
  Length: number;
  Path: string;
}

async function listDir(cfg: { name: string; key: string }, path: string): Promise<BunnyEntry[]> {
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  const url = `https://${STORAGE_HOST}/${cfg.name}/${clean ? clean + "/" : ""}`;
  const res = await fetch(url, { headers: { AccessKey: cfg.key, Accept: "application/json" }, cache: "no-store" });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`Bunny list failed (${res.status}) at "${clean || "/"}"`);
  return (await res.json()) as BunnyEntry[];
}

/** Walk a zone and return every file path plus the total byte size. */
async function walkZone(cfg: { name: string; key: string }): Promise<{ files: string[]; bytes: number }> {
  const files: string[] = [];
  let bytes = 0;
  const queue: string[] = [""];
  // Depth is small (type/owner/file) but the guard keeps a mis-shaped tree from spinning forever.
  let visited = 0;
  while (queue.length && visited < 5000) {
    const dir = queue.shift() as string;
    visited++;
    const entries = await listDir(cfg, dir);
    for (const e of entries) {
      const full = `${dir ? dir + "/" : ""}${e.ObjectName}`;
      if (e.IsDirectory) queue.push(full);
      else {
        files.push(full);
        bytes += e.Length ?? 0;
      }
    }
  }
  return { files, bytes };
}

export interface ProviderCounts {
  /** Rows in the `Media` table — the DB's own view, instant and always available. */
  dbTotal: number;
  dbOnCloudinary: number;
  dbOnBunny: number;
  dbMissingBunny: number;
}

/** DB-side counts. Cheap — safe to run on every page load. */
export async function getMediaCounts(): Promise<ProviderCounts | { error: string }> {
  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const rows = await db.media.findMany({ select: { url: true, bunnyUrl: true, blurDataURL: true } });
  let onCloud = 0;
  let onBunny = 0;
  for (const r of rows) {
    if (typeof r.url === "string" && /cloudinary\.com/i.test(r.url)) onCloud++;
    if (r.bunnyUrl) onBunny++;
  }
  return {
    dbTotal: rows.length,
    dbOnCloudinary: onCloud,
    dbOnBunny: onBunny,
    dbMissingBunny: rows.length - onBunny,
  };
}

export interface ZoneInventory {
  zone: MigrationZone;
  files: number;
  megabytes: number;
  /** assets zone only: files under `migrated/` (re-hosted orphans) — NOT platform identity. */
  migrated?: number;
}

/** Live file count per Bunny zone. On-demand: walks the whole tree. */
export async function getBunnyInventory(): Promise<{ zones: ZoneInventory[] } | { error: string }> {
  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const zones: ZoneInventory[] = [];
  for (const zone of ["clients", "assets"] as const) {
    try {
      const { files, bytes } = await walkZone(zoneCfg(zone));
      zones.push({
        zone,
        files: files.length,
        megabytes: Math.round((bytes / 1048576) * 10) / 10,
        ...(zone === "assets" ? { migrated: files.filter((f) => f.startsWith("migrated/")).length } : {}),
      });
    } catch (e) {
      zones.push({ zone, files: -1, megabytes: -1 });
      void e;
    }
  }
  return { zones };
}

/**
 * Live asset count on Cloudinary, restricted to Modonty's own files:
 * - `folders`: files inside Modonty's folders (listed from Cloudinary).
 * - `rootReferenced`: DISTINCT root-level files (no folder — pre-folders-era uploads) that
 *   media cards actually reference. Attributed via the DB because the account root is
 *   shared with other projects and cannot be attributed by listing alone.
 */
export async function getCloudinaryCount(): Promise<
  { folders: number; rootReferenced: number; assets: number } | { error: string }
> {
  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  // The account is shared with other projects — count ONLY Modonty's folders.
  const PREFIXES = ["modonty/", "general/", "clients/", "admins/", "post/", "assets/"] as const;
  try {
    const mod = await import("cloudinary");
    const cloudinary = (mod as unknown as { v2: CloudinaryApi }).v2;
    let folders = 0;
    for (const prefix of PREFIXES) {
      let cursor: string | undefined;
      do {
        const res = await cloudinary.api.resources({
          type: "upload",
          prefix,
          max_results: 500,
          next_cursor: cursor,
        });
        folders += res.resources?.length ?? 0;
        cursor = res.next_cursor;
      } while (cursor);
    }

    const rows = await db.media.findMany({ select: { url: true } });
    const rootIds = new Set<string>();
    for (const r of rows) {
      const u = String(r.url ?? "");
      if (!u.includes("res.cloudinary.com")) continue;
      const m = u.match(/\/upload\/(?:[^/]*[,_][^/]*\/)?(?:v\d+\/)?(.+)$/);
      if (m && !m[1].includes("/")) rootIds.add(m[1].replace(/\.[a-z]+$/i, ""));
    }

    return { folders, rootReferenced: rootIds.size, assets: folders + rootIds.size };
  } catch (e) {
    return { error: e instanceof Error ? e.message.split("\n")[0] : String(e) };
  }
}

interface CloudinaryApi {
  api: {
    resources: (opts: Record<string, unknown>) => Promise<{
      resources?: unknown[];
      next_cursor?: string;
    }>;
  };
}

/**
 * Delete EVERY file in a Bunny zone.
 *
 * Guarded three ways because it is unrecoverable:
 *  1. admin session,
 *  2. the caller must echo the exact zone name as `confirm`,
 *  3. the `assets` zone is refused outright until the platform's own assets are real `Media`
 *     rows — today they are hardcoded in `brand-assets.ts` and `Settings`, so nothing could
 *     rebuild them (this is exactly what task T2 fixes).
 */
/**
 * Batched wipe step — deletes up to `batch` files per call so the client can loop
 * and render LIVE progress instead of waiting minutes on one blind call (Khalid's
 * UX requirement 2026-08-01). Same triple guard as the full wipe.
 */
export async function wipeBunnyZoneStep(
  zone: MigrationZone,
  confirm: string,
  batch = 60,
): Promise<{ deleted: number; failed: number; remaining: number; total: number; errors: string[] } | { error: string }> {
  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };
  if (confirm !== zone) return { error: `Confirmation mismatch — type "${zone}" exactly.` };
  if (zone === "assets") return { error: "Refused: the `assets` zone holds the platform's identity (see wipeBunnyZone)." };

  const cfg = zoneCfg(zone);
  const { files } = await walkZone(cfg);
  const total = files.length;
  const slice = files.slice(0, batch);

  let deleted = 0;
  let failed = 0;
  const errors: string[] = [];
  // Parallel groups of 10 — fast without hammering the storage API.
  for (let i = 0; i < slice.length; i += 10) {
    await Promise.all(
      slice.slice(i, i + 10).map(async (path) => {
        try {
          const res = await fetch(`https://${STORAGE_HOST}/${cfg.name}/${path}`, {
            method: "DELETE",
            headers: { AccessKey: cfg.key },
          });
          if (res.ok || res.status === 404) deleted++;
          else {
            failed++;
            if (errors.length < 5) errors.push(`${path}: ${res.status}`);
          }
        } catch (e) {
          failed++;
          if (errors.length < 5) errors.push(`${path}: ${e instanceof Error ? e.message : String(e)}`);
        }
      })
    );
  }
  return { deleted, failed, remaining: total - deleted, total, errors };
}

export async function wipeBunnyZone(
  zone: MigrationZone,
  confirm: string,
): Promise<{ deleted: number; failed: number; errors: string[] } | { error: string }> {
  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  if (confirm !== zone) return { error: `Confirmation mismatch — type "${zone}" exactly.` };

  if (zone === "assets") {
    return {
      error:
        "Refused: the `assets` zone holds the platform's identity (logo, wordmark, icon, avatar, OG image) " +
        "which is hardcoded in brand-assets.ts and Settings, not stored as Media rows. Nothing could rebuild it. " +
        "Unlocked only after task T2 moves those assets into the Media library.",
    };
  }

  const cfg = zoneCfg(zone);
  const { files } = await walkZone(cfg);

  let deleted = 0;
  let failed = 0;
  const errors: string[] = [];
  for (const path of files) {
    try {
      const res = await fetch(`https://${STORAGE_HOST}/${cfg.name}/${path}`, {
        method: "DELETE",
        headers: { AccessKey: cfg.key },
      });
      if (res.ok || res.status === 404) deleted++;
      else {
        failed++;
        if (errors.length < 5) errors.push(`${path}: ${res.status}`);
      }
    } catch (e) {
      failed++;
      if (errors.length < 5) errors.push(`${path}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { deleted, failed, errors };
}
