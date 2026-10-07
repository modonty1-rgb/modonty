import { z } from "zod";
import { isSectorPaused, LIVE_SECTORS, type LiveSectorSlug } from "@modonty/shared/lib/sectors/live-sectors";

import { getSectorArticles } from "@/app/(site)/modonty/data/get-sector-articles";
import { getSectorHero } from "@/app/(site)/modonty/data/get-sector-hero";
import { fail, handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { CONTENT_MESSAGES } from "@/lib/mobile-api/messages-content";

// Zod wants a non-empty tuple; LIVE_SECTORS is a non-empty `as const` list.
const SECTOR_KEYS = LIVE_SECTORS.map((s) => s.slug) as [LiveSectorSlug, ...LiveSectorSlug[]];
const keySchema = z.enum(SECTOR_KEYS);

/**
 * V3 — GET /api/mobile/v1/sectors/:key · public.
 * The part every sector page shares (`app/(site)/modonty/<key>/page.tsx`): the hero the editor set
 * (`getSectorHero`) and «من مدونتي» — the editor's picked Modonty articles, at most 4, in his
 * order (`getSectorArticles`). No paging: the picks are capped at `SECTOR_PICK_LIMIT`.
 * A paused sector (health today) reads nothing, as its page shows only «قريباً».
 * Each page's own open-data sections (fixtures, models, schools…) are not part of this endpoint.
 */
export const GET = handle("sector", async (_request: Request, { params }: { params: Promise<{ key: string }> }) => {
  const parsed = keySchema.safeParse((await params).key);
  if (!parsed.success) return fail("NOT_FOUND", CONTENT_MESSAGES.sectorNotFound);
  const key = parsed.data;
  const label = LIVE_SECTORS.find((s) => s.slug === key)?.label ?? key;

  if (isSectorPaused(key)) {
    return ok({ key, label, paused: true, hero: null, articles: [] }, PUBLIC_CACHE);
  }

  const [articles, hero] = await Promise.all([getSectorArticles(key), getSectorHero(key)]);
  return ok({ key, label, paused: false, hero, articles }, PUBLIC_CACHE);
});
