import { LIVE_SECTORS } from "@modonty/shared/lib/sectors/live-sectors";

import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";

/**
 * V3 — GET /api/mobile/v1/sectors · public.
 * The sector pages live on modonty — `LIVE_SECTORS` (`shared/lib/sectors/live-sectors.ts`), the
 * list modonty's sitemap and the admin read; each is a page at `/modonty/<key>`. A paused one
 * shows «قريباً» on the web (`paused: true`). The `/modonty` grid's other doors (القرآن · عجلة
 * الحظ · مودو لينك, `modonty/helpers/sectors.ts`) are pages of their own, not sector feeds.
 */
export const GET = handle("sectors", async () => {
  const items = LIVE_SECTORS.map((s) => ({
    key: s.slug,
    label: s.label,
    paused: "paused" in s && s.paused === true,
  }));
  return ok({ items }, PUBLIC_CACHE);
});
