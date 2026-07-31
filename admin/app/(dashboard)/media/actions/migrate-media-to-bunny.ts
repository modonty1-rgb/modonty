"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { mirrorImageToBunny } from "./bunny-mirror-core";

// A row still needs migrating when bunnyUrl is null OR the field is absent.
// (Mongo trap: `{ bunnyUrl: null }` alone misses rows created before the field existed.)
const PENDING_WHERE = {
  OR: [{ bunnyUrl: null }, { bunnyUrl: { isSet: false } }],
};

export interface BunnyMigrationStats {
  total: number;
  migrated: number;
  pending: number;
}

export async function getBunnyMigrationStats(): Promise<BunnyMigrationStats> {
  const [total, migrated] = await Promise.all([
    db.media.count(),
    db.media.count({ where: { bunnyUrl: { not: null } } }),
  ]);
  return { total, migrated, pending: total - migrated };
}

export interface BunnyMigrationResult {
  attempted: number;
  migrated: number;
  failed: number;
  errors: Array<{ id: string; filename: string; error: string }>;
}

/**
 * Additive migration (P3-3): copy up to `limit` un-migrated media to Bunny and write
 * `bunnyUrl` only — never touches `url` (Cloudinary, which production reads). Idempotent
 * (skips rows that already have bunnyUrl), best-effort per row (one failure never stops
 * the batch), and run in small batches to stay well under the shared Cloudinary bandwidth.
 */
export async function migrateMediaBatch(limit = 10): Promise<BunnyMigrationResult | { error: string }> {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const rows = await db.media.findMany({
    where: PENDING_WHERE,
    select: {
      id: true,
      url: true,
      filename: true,
      type: true,
      scope: true,
      clientId: true,
      cloudinaryPublicId: true,
    },
    orderBy: { createdAt: "asc" },
    take: Math.min(Math.max(limit, 1), 50),
  });

  // Batch-resolve client slugs (avoid N+1).
  const clientIds = [...new Set(rows.map((r) => r.clientId).filter(Boolean))] as string[];
  const clients = clientIds.length
    ? await db.client.findMany({ where: { id: { in: clientIds } }, select: { id: true, slug: true } })
    : [];
  const slugById = new Map(clients.map((c) => [c.id, c.slug]));

  const result: BunnyMigrationResult = { attempted: rows.length, migrated: 0, failed: 0, errors: [] };

  for (const row of rows) {
    try {
      const { bunnyUrl } = await mirrorImageToBunny({
        sourceUrl: row.url,
        filename: row.filename,
        type: row.type,
        scope: row.scope,
        clientSlug: row.clientId ? slugById.get(row.clientId) ?? null : null,
        cloudinaryPublicId: row.cloudinaryPublicId,
      });
      await db.media.update({ where: { id: row.id }, data: { bunnyUrl } });
      result.migrated++;
    } catch (e) {
      result.failed++;
      result.errors.push({ id: row.id, filename: row.filename, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return result;
}
