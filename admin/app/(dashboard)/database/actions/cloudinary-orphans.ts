"use server";

import { db } from "@/lib/db";

// CRITICAL SAFETY: the Cloudinary account is shared across multiple projects.
// We ONLY touch assets whose public_id starts with one of Modonty's known prefixes.
// Anything outside these prefixes belongs to another project and must NEVER be deleted.
const MODONTY_PREFIXES = ["modonty/", "general/", "clients/", "admins/"] as const;

// Minimum age before considering an asset as "orphan" — protects against race with
// in-flight uploads (Cloudinary write completes before our DB write).
const MIN_AGE_HOURS = 1;

interface CloudinaryResource {
  public_id: string;
  resource_type?: "image" | "video" | "raw";
  created_at?: string;
}

interface CloudinaryListResponse {
  resources?: CloudinaryResource[];
  next_cursor?: string;
}

interface CloudinaryClient {
  config: (opts: Record<string, string>) => unknown;
  api: {
    resources: (opts: Record<string, unknown>) => Promise<CloudinaryListResponse>;
  };
  uploader: {
    destroy: (
      publicId: string,
      opts?: { resource_type?: string; invalidate?: boolean },
    ) => Promise<{ result: string }>;
  };
}

async function getCloudinary(): Promise<CloudinaryClient | null> {
  let cloudName: string | undefined;
  let apiKey: string | undefined;
  let apiSecret: string | undefined;

  const url = process.env.CLOUDINARY_URL;
  if (url?.startsWith("cloudinary://")) {
    const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) {
      apiKey = m[1];
      apiSecret = m[2];
      cloudName = m[3];
    }
  }
  cloudName = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  apiKey = apiKey || process.env.CLOUDINARY_API_KEY;
  apiSecret = apiSecret || process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;

  const mod = (await import("cloudinary")) as { v2: CloudinaryClient };
  const cloudinary = mod.v2;
  cloudinary.config({
    cloud_name: cloudName.trim(),
    api_key: apiKey.trim(),
    api_secret: apiSecret.trim(),
  });
  return cloudinary;
}

async function listAllResourcesForPrefix(
  cloudinary: CloudinaryClient,
  prefix: string,
): Promise<CloudinaryResource[]> {
  const all: CloudinaryResource[] = [];
  let nextCursor: string | undefined;
  // Cloudinary caps each list at 500. Loop until we've seen all.
  // Hard ceiling at 5000 (10 pages) to prevent runaway in pathological accounts.
  for (let i = 0; i < 10; i++) {
    const res = (await cloudinary.api.resources({
      type: "upload",
      prefix,
      max_results: 500,
      next_cursor: nextCursor,
    })) as CloudinaryListResponse;
    if (res.resources) all.push(...res.resources);
    if (!res.next_cursor) break;
    nextCursor = res.next_cursor;
  }
  return all;
}

export interface CloudinaryOrphanStats {
  scannedPrefixes: number;
  totalInScope: number;
  orphanCount: number;
  sample: Array<{ publicId: string; resourceType: string; createdAt: string | null }>;
  configured: boolean;
}

export async function getCloudinaryOrphanStats(): Promise<CloudinaryOrphanStats> {
  const cloudinary = await getCloudinary();
  if (!cloudinary) {
    return { scannedPrefixes: 0, totalInScope: 0, orphanCount: 0, sample: [], configured: false };
  }

  // Pull all in-scope assets from Cloudinary
  const allResources: CloudinaryResource[] = [];
  for (const prefix of MODONTY_PREFIXES) {
    const res = await listAllResourcesForPrefix(cloudinary, prefix);
    allResources.push(...res);
  }

  // Pull all known cloudinaryPublicIds from DB
  const dbRows = await db.media.findMany({
    where: { cloudinaryPublicId: { not: null } },
    select: { cloudinaryPublicId: true },
  });
  const knownIds = new Set(dbRows.map((r) => r.cloudinaryPublicId!).filter(Boolean));

  // Age threshold to skip in-flight uploads
  const cutoff = new Date(Date.now() - MIN_AGE_HOURS * 60 * 60 * 1000);

  // Diff: in Cloudinary AND in-scope prefix AND not in DB AND older than cutoff
  const orphans = allResources.filter((r) => {
    if (!MODONTY_PREFIXES.some((p) => r.public_id.startsWith(p))) return false; // double-check scope
    if (knownIds.has(r.public_id)) return false;
    if (r.created_at) {
      const created = new Date(r.created_at);
      if (created > cutoff) return false; // too recent — could be in-flight
    }
    return true;
  });

  return {
    scannedPrefixes: MODONTY_PREFIXES.length,
    totalInScope: allResources.length,
    orphanCount: orphans.length,
    sample: orphans.slice(0, 5).map((o) => ({
      publicId: o.public_id,
      resourceType: o.resource_type ?? "image",
      createdAt: o.created_at ?? null,
    })),
    configured: true,
  };
}

export async function sweepCloudinaryOrphans(): Promise<{
  attempted: number;
  successful: number;
  failed: number;
}> {
  const cloudinary = await getCloudinary();
  if (!cloudinary) return { attempted: 0, successful: 0, failed: 0 };

  // Re-derive the orphan list (don't trust caller-supplied data)
  const allResources: CloudinaryResource[] = [];
  for (const prefix of MODONTY_PREFIXES) {
    const res = await listAllResourcesForPrefix(cloudinary, prefix);
    allResources.push(...res);
  }
  const dbRows = await db.media.findMany({
    where: { cloudinaryPublicId: { not: null } },
    select: { cloudinaryPublicId: true },
  });
  const knownIds = new Set(dbRows.map((r) => r.cloudinaryPublicId!).filter(Boolean));
  const cutoff = new Date(Date.now() - MIN_AGE_HOURS * 60 * 60 * 1000);

  const orphans = allResources.filter((r) => {
    if (!MODONTY_PREFIXES.some((p) => r.public_id.startsWith(p))) return false;
    if (knownIds.has(r.public_id)) return false;
    if (r.created_at) {
      const created = new Date(r.created_at);
      if (created > cutoff) return false;
    }
    return true;
  });

  let successful = 0;
  let failed = 0;
  for (const orphan of orphans) {
    // FINAL safety check before destroy — confirm prefix
    if (!MODONTY_PREFIXES.some((p) => orphan.public_id.startsWith(p))) {
      failed++;
      continue;
    }
    try {
      const result = await cloudinary.uploader.destroy(orphan.public_id, {
        resource_type: orphan.resource_type ?? "image",
        invalidate: true,
      });
      if (result.result === "ok" || result.result === "not found") {
        successful++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { attempted: orphans.length, successful, failed };
}
