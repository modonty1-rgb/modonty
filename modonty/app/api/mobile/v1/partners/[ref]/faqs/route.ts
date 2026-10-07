import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { loadPartnerHome } from "@/lib/mobile-api/load-partner-home";

/**
 * C13 — GET /api/mobile/v1/partners/:slug/faqs · public.
 * What `/clients/[slug]/faq` renders and declares in its FAQPage JSON-LD: the «faqs» block of
 * `getCachedHomeData` — the partner's own published questions first, then the approved ones
 * under his articles, duplicates dropped. (`getClientPageFaqs` is the page-only subset the home
 * page's JSON-LD uses.)
 */
export const GET = handle("partner-faqs", async (_request: Request, { params }: { params: Promise<{ ref: string }> }) => {
  const loaded = await loadPartnerHome((await params).ref);
  if ("response" in loaded) return loaded.response;
  return ok({ items: loaded.value.home.faqs }, PUBLIC_CACHE);
});
