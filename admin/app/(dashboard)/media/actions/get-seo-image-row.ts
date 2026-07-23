"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  MEDIA_SELECT,
  buildSeoImageRow,
  loadImageDefaults,
  type SeoImageMediaRow,
  type SeoImageRow,
} from "@/app/(dashboard)/seo-images/helpers/load-groups";

/**
 * Load ONE image's full SEO row (score + per-check breakdown + auto-name) — the same shape
 * /seo-images builds, so the ImageSeoDialog can be opened from anywhere (e.g. the article
 * editor's Media tab) with an identical diagnosis. Reuses buildSeoImageRow — no divergence.
 */
export async function getSeoImageRow(mediaId: string): Promise<SeoImageRow | null> {
  const session = await auth();
  if (!session) return null;

  try {
    const media = await db.media.findUnique({ where: { id: mediaId }, select: MEDIA_SELECT });
    if (!media) return null;
    const defaults = await loadImageDefaults();
    return buildSeoImageRow(media as unknown as SeoImageMediaRow, defaults);
  } catch {
    return null;
  }
}
