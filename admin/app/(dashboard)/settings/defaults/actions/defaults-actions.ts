"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
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
 * Source of truth = PLATFORM-scope media with clientId null, keyed by type.
 */
export async function getPlatformDefaults(): Promise<PlatformDefaults> {
  const rows = await db.media.findMany({
    where: { scope: "PLATFORM", clientId: null, type: { in: ["LOGO", "POST", "HERO"] } },
    select: { type: true, url: true },
  });

  const result: PlatformDefaults = { LOGO: null, POST: null, HERO: null };
  for (const r of rows) {
    if (r.type === "LOGO" || r.type === "POST" || r.type === "HERO") {
      result[r.type] = r.url;
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
    const existing = await db.media.findFirst({
      where: { scope: "PLATFORM", clientId: null, type },
      select: { id: true },
    });

    if (!trimmed) {
      // Clear the default
      if (existing) await db.media.delete({ where: { id: existing.id } });
    } else if (existing) {
      await db.media.update({ where: { id: existing.id }, data: { url: trimmed } });
    } else {
      await db.media.create({
        data: {
          filename: `platform-default-${role.toLowerCase()}`,
          url: trimmed,
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
