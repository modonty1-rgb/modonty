import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { loadPartnerHome } from "@/lib/mobile-api/load-partner-home";

/**
 * C13 — GET /api/mobile/v1/partners/:slug/gallery · public.
 * What `/clients/[slug]/photos` renders: the «gallery» block of `getCachedHomeData` — GALLERY
 * media the partner kept in his gallery (`inGallery`), newest first, up to 40, alt text filled.
 * Not `getClientGallery`: that read ignores `inGallery` and only feeds the home page's
 * «not ready» check, so it would show photos the partner took off his page.
 */
export const GET = handle("partner-gallery", async (_request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const loaded = await loadPartnerHome((await params).ref);
  if ("response" in loaded) return loaded.response;
  return ok({ items: loaded.value.home.gallery }, PUBLIC_CACHE);
});
