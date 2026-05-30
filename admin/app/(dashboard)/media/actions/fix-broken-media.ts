"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

export interface FixBrokenMediaResult {
  ok: boolean;
  scanned: number;
  broken: number;
  fixed: number;
  skipped: number;
  error?: string;
  details?: { filename: string; type: string; reason: string }[];
}

// Map any media type to the platform-default role that should replace it.
// LOGO → LOGO default · HERO → HERO default · everything else (POST/OG/…) → POST default.
function roleForType(type: string): "LOGO" | "POST" | "HERO" {
  if (type === "LOGO") return "LOGO";
  if (type === "HERO") return "HERO";
  return "POST";
}

// A HEAD request is the cheapest way to learn whether the asset still exists.
async function isBroken(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.status === 404 || res.status === 410;
  } catch {
    // Network error ≠ confirmed missing — don't touch it.
    return false;
  }
}

/**
 * Scan every NON-platform media row. If its Cloudinary asset is gone (404),
 * swap the row's url to the matching platform default so the public site shows
 * the placeholder instead of a broken image. The creative can re-upload later.
 */
export async function fixBrokenMedia(): Promise<FixBrokenMediaResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, scanned: 0, broken: 0, fixed: 0, skipped: 0, error: "Unauthorized" };
  }

  try {
    // Platform defaults (the replacement URLs).
    const defaults = await db.media.findMany({
      where: { scope: "PLATFORM", clientId: null, type: { in: ["LOGO", "POST", "HERO"] } },
      select: { type: true, url: true },
    });
    const defaultUrl: Record<string, string | null> = { LOGO: null, POST: null, HERO: null };
    for (const d of defaults) {
      if (d.type === "LOGO" || d.type === "POST" || d.type === "HERO") defaultUrl[d.type] = d.url;
    }

    // All real media (exclude the platform defaults themselves).
    const rows = await db.media.findMany({
      where: { scope: { not: "PLATFORM" }, url: { contains: "res.cloudinary.com" } },
      select: { id: true, url: true, type: true, filename: true },
    });

    let broken = 0;
    let fixed = 0;
    let skipped = 0;
    const details: { filename: string; type: string; reason: string }[] = [];

    // Bounded concurrency so we don't fire thousands of requests at once.
    const BATCH = 10;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const checks = await Promise.all(
        batch.map(async (m) => ({ m, broken: await isBroken(m.url) }))
      );
      for (const { m, broken: isGone } of checks) {
        if (!isGone) continue;
        broken++;
        const role = roleForType(m.type);
        const replacement = defaultUrl[role];
        if (!replacement) {
          skipped++;
          details.push({ filename: m.filename, type: m.type, reason: `no ${role} default set` });
          continue;
        }
        if (m.url === replacement) {
          skipped++;
          continue;
        }
        await db.media.update({ where: { id: m.id }, data: { url: replacement } });
        fixed++;
        details.push({ filename: m.filename, type: m.type, reason: `replaced with ${role} default` });
      }
    }

    if (fixed > 0) {
      revalidatePath("/media");
      await revalidateModontyTag("articles");
      await revalidateModontyTag("clients");
    }

    return { ok: true, scanned: rows.length, broken, fixed, skipped, details };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to scan media";
    return { ok: false, scanned: 0, broken: 0, fixed: 0, skipped: 0, error: message };
  }
}
