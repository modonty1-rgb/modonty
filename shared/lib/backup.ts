import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

import { EJSON } from "bson";

/**
 * Backup helpers shared by the daily cron, the admin card and the restore drill.
 *
 * Lives in shared because more than one app reads it — the project rule is that any
 * helper used by two apps belongs here rather than being duplicated per app.
 *
 * Decisions behind this file: documents/tasks/BACKUP-STRATEGY-v1.html
 */

/** Private storage zone — deliberately has no Pull Zone, so nothing here is reachable by URL. */
export interface BunnyBackupConfig {
  zone: string;
  password: string;
  hostname: string;
}

export function readBunnyBackupConfig(): BunnyBackupConfig {
  const zone = process.env.BUNNY_BACKUP_STORAGE_ZONE_NAME;
  const password = process.env.BUNNY_BACKUP_STORAGE_PASSWORD;
  const hostname = process.env.BUNNY_BACKUP_STORAGE_HOSTNAME ?? "storage.bunnycdn.com";

  if (!zone || !password) {
    throw new Error(
      "Backup zone is not configured — set BUNNY_BACKUP_STORAGE_ZONE_NAME and BUNNY_BACKUP_STORAGE_PASSWORD",
    );
  }
  return { zone, password, hostname };
}

/**
 * Extended JSON, not plain JSON.
 *
 * `JSON.stringify` turns an ObjectId into `{}` and a Date into a string, so a restore
 * would silently rebuild every document with broken ids and text timestamps — the data
 * would look present and be unusable. Extended JSON round-trips BSON types intact.
 */
export function serializeDocuments(docs: unknown[]): string {
  return EJSON.stringify(docs, { relaxed: false });
}

export function deserializeDocuments(raw: string): unknown[] {
  return EJSON.parse(raw, { relaxed: false }) as unknown[];
}

async function gzipString(text: string): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const gzip = createGzip({ level: 9 });
  gzip.on("data", (c: Buffer) => chunks.push(c));
  await pipeline(Readable.from([text]), gzip);
  return Buffer.concat(chunks);
}

/** Uploads one gzipped file. Throws with the Bunny status so the caller can name the collection. */
export async function uploadToBunny(
  config: BunnyBackupConfig,
  remotePath: string,
  body: Buffer,
): Promise<void> {
  const res = await fetch(`https://${config.hostname}/${config.zone}/${remotePath}`, {
    method: "PUT",
    headers: { AccessKey: config.password, "Content-Type": "application/octet-stream" },
    body: new Uint8Array(body),
  });
  if (!res.ok) {
    throw new Error(`Bunny upload failed (${res.status}) for ${remotePath}`);
  }
}

export async function uploadCollection(
  config: BunnyBackupConfig,
  folder: string,
  collection: string,
  docs: unknown[],
): Promise<number> {
  const gz = await gzipString(serializeDocuments(docs));
  await uploadToBunny(config, `${folder}/${collection}.json.gz`, gz);
  return gz.length;
}

export interface BackupManifest {
  dbName: string;
  folder: string;
  startedAt: string;
  finishedAt: string;
  collections: { name: string; documents: number; bytes: number }[];
  totalDocuments: number;
  totalBytes: number;
}

/**
 * The manifest is what verification reads — counts per collection without downloading
 * a single archive. A backup you can only check by fully restoring it gets checked never.
 */
export async function uploadManifest(
  config: BunnyBackupConfig,
  manifest: BackupManifest,
): Promise<void> {
  const body = Buffer.from(JSON.stringify(manifest, null, 2), "utf8");
  await uploadToBunny(config, `${manifest.folder}/_manifest.json`, body);
}

export async function listBunnyFolder(
  config: BunnyBackupConfig,
  folder: string,
): Promise<{ ObjectName: string; Length: number }[]> {
  const res = await fetch(`https://${config.hostname}/${config.zone}/${folder}/`, {
    headers: { AccessKey: config.password, Accept: "application/json" },
  });
  if (!res.ok) return [];
  return (await res.json()) as { ObjectName: string; Length: number }[];
}

export async function deleteBunnyFolder(
  config: BunnyBackupConfig,
  folder: string,
): Promise<void> {
  await fetch(`https://${config.hostname}/${config.zone}/${folder}/`, {
    method: "DELETE",
    headers: { AccessKey: config.password },
  });
}

/**
 * Grandfather-Father-Son retention.
 *
 * Recent mistakes surface within days, so dailies cover them. Silent corruption — a field
 * quietly emptied by a bad migration — often surfaces weeks later, and only an old copy
 * helps then. Total footprint at current size is under a gigabyte.
 */
export const RETENTION = { daily: 7, weekly: 4, monthly: 12 } as const;

/** ISO week key (`2026-W35`) — Thursday rule, so a week belongs to the year holding its Thursday. */
function isoWeekKey(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7; // الاثنين = 0
  d.setUTCDate(d.getUTCDate() - day + 3); // خميس ذلك الأسبوع
  const year = d.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / 604_800_000);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * Which dated backup folders may be deleted — by SELECTION, never by cutting a sorted tail.
 *
 * Only a `daily/` tier is written (one folder per day). A plain "keep the newest 7" would
 * make the archive seven days deep, and the comment above says why that is not enough: silent
 * corruption surfaces weeks later, and only an old copy helps then. So instead of copying
 * files into weekly/monthly tiers — which would cost a download+upload of the whole archive
 * every night — the same folders are KEPT under three overlapping rules:
 *
 *   • the newest `RETENTION.daily` days,
 *   • the newest folder of each of the last `RETENTION.weekly` ISO weeks,
 *   • the newest folder of each of the last `RETENTION.monthly` months.
 *
 * A folder survives if ANY rule claims it. Result at today's size: the archive holds roughly
 * 7 + 4 + 12 folders instead of one per day forever, and still reaches a year back.
 *
 * Anything that does not parse as `YYYY-MM-DD` is kept, never deleted: an unknown name is
 * not a licence to delete, it is a reason to leave it alone.
 */
export function foldersToPrune(existing: string[]): string[] {
  const dated = existing.filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f));
  const sorted = [...dated].sort().reverse(); // أسماء ISO — الترتيب المعجمي زمنيّ

  const keep = new Set<string>(sorted.slice(0, RETENTION.daily));

  const newestPer = (key: (iso: string) => string, limit: number) => {
    const seen = new Map<string, string>();
    for (const f of sorted) {
      const k = key(f);
      if (!seen.has(k)) seen.set(k, f); // `sorted` تنازليّ، فأول ما نراه هو الأحدث
    }
    for (const f of [...seen.values()].sort().reverse().slice(0, limit)) keep.add(f);
  };
  newestPer(isoWeekKey, RETENTION.weekly);
  newestPer((iso) => iso.slice(0, 7), RETENTION.monthly);

  return sorted.filter((f) => !keep.has(f));
}

/**
 * Delete one dated folder file by file.
 *
 * Not a single DELETE on the directory path: that behaviour is not something this codebase
 * has verified against Bunny's API, and an unverified delete is the wrong thing to schedule
 * nightly. Deleting the listed files is the same operation the zone wipe already uses in
 * production, so it is proven. An empty folder disappears on its own.
 *
 * Returns how many files were removed — the caller reports the number rather than claiming
 * success blindly.
 */
export async function deleteBackupFolder(
  config: BunnyBackupConfig,
  folder: string,
): Promise<{ deleted: number; failed: number }> {
  const entries = await listBunnyFolder(config, folder);
  let deleted = 0;
  let failed = 0;
  for (const e of entries) {
    const res = await fetch(`https://${config.hostname}/${config.zone}/${folder}/${e.ObjectName}`, {
      method: "DELETE",
      headers: { AccessKey: config.password },
    });
    if (res.ok || res.status === 404) deleted++;
    else failed++;
  }
  return { deleted, failed };
}

/** Collections whose contents are raw event firehoses — GA4 owns the truth, and copying
 *  them daily would multiply the archive for data nobody restores. */
export const SKIP_COLLECTIONS = new Set<string>([
  "page_views",
  "article_views",
  "client_views",
  "analytics",
  "engagement_duration",
  "article_link_clicks",
  "cta_clicks",
  "shares",
  "conversions",
  "campaign_tracking",
  "lead_scoring",
  "email_events",
]);
