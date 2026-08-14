"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { mediaSrc } from "@modonty/shared/lib/media-src";
import { generateBlurDataUrlFromUrl } from "@/app/(dashboard)/media/actions/generate-blur";
import type { MediaType } from "@prisma/client";

// The 3 platform default roles. Each is a single PLATFORM-scope media with no client.
export type DefaultRole = "LOGO" | "POST" | "HERO";

const ROLE_LABEL: Record<DefaultRole, string> = {
  LOGO: "Default client logo",
  POST: "Default article image",
  HERO: "Default client hero",
};

export interface PlatformDefaults {
  LOGO: string | null;
  POST: string | null;
  HERO: string | null;
}

/**
 * Returns the current default image URL for each role (null if not set yet).
 * Lookup key = the STABLE filename `platform-default-<role>` — NOT scope/clientId:
 * T2b claims these rows for the core client (scope→CLIENT, clientId→core), which
 * silently emptied the old `scope: PLATFORM + clientId: null` query (verified on dev
 * 2026-08-07 after T2b: old query = 0 rows while the three rows still exist).
 */
export async function getPlatformDefaults(): Promise<PlatformDefaults> {
  const rows = await db.media.findMany({
    where: { filename: { in: ["platform-default-logo", "platform-default-post", "platform-default-hero"] } },
    select: { filename: true, url: true, bunnyUrl: true, blurDataURL: true },
  });

  const result: PlatformDefaults = { LOGO: null, POST: null, HERO: null };
  for (const r of rows) {
    const role = r.filename.replace("platform-default-", "").toUpperCase();
    if (role === "LOGO" || role === "POST" || role === "HERO") {
      // Prefer the Bunny copy — these platform defaults render on the clients list.
      result[role] = mediaSrc(r);
    }
  }
  return result;
}

interface SaveResult {
  ok: boolean;
  error?: string;
}

/**
 * Upsert the platform default for one role from a Cloudinary URL.
 * Empty url clears the default (deletes the platform media for that role).
 */
export async function savePlatformDefault(
  role: DefaultRole,
  url: string
): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const trimmed = url.trim();
  const type = role as MediaType;

  try {
    // Lookup by stable filename — survives T2b ownership changes (see getPlatformDefaults).
    const existing = await db.media.findFirst({
      where: { filename: `platform-default-${role.toLowerCase()}` },
      select: { id: true },
    });

    if (!trimmed) {
      // Clear the default
      if (existing) await db.media.delete({ where: { id: existing.id } });
    } else if (existing) {
      // The url points at a different picture now — rebuild the placeholder with it.
      const blurDataURL = await generateBlurDataUrlFromUrl(trimmed);
      await db.media.update({
        where: { id: existing.id },
        data: { url: trimmed, ...(blurDataURL ? { blurDataURL } : {}) },
      });
    } else {
      await db.media.create({
        data: {
          filename: `platform-default-${role.toLowerCase()}`,
          url: trimmed,
          blurDataURL: await generateBlurDataUrlFromUrl(trimmed),
          mimeType: "image/png",
          clientId: null,
          scope: "PLATFORM",
          type,
          altText: ROLE_LABEL[role],
          title: ROLE_LABEL[role],
        },
      });
    }

    revalidatePath("/settings/defaults");
    revalidatePath("/clients");
    await revalidateModontyTag("clients");
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save default";
    return { ok: false, error: message };
  }
}
