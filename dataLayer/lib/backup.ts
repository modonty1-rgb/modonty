import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

import { EJSON } from "bson";

/**
 * Backup helpers shared by the daily cron, the admin card and the restore drill.
 *
 * Lives in dataLayer because more than one app reads it — the project rule is that any
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

export function foldersToPrune(
  existing: string[],
  tier: keyof typeof RETENTION,
): string[] {
  const keep = RETENTION[tier];
  const sorted = [...existing].sort().reverse(); // folder names are ISO dates — lexical sort is chronological
  return sorted.slice(keep);
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
