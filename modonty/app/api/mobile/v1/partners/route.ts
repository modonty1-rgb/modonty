import { z } from "zod";

import { getClientsList } from "@/lib/queries/get-clients-list";
import { getCoreClientId } from "@/lib/settings/get-core-client-id";
import { filterPartners } from "@/app/(site)/clients/helpers/filter-partners";
import { sortPartners } from "@/app/(site)/clients/helpers/sort-partners";
import { PARTNERS_PAGE_SIZE } from "@/app/(site)/clients/helpers/partners-page-size";
import { handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { PAGE_MAX, readQuery } from "@/lib/mobile-api/request";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAGE_MAX).default(1),
  q: z.string().trim().max(100).default(""),
  industry: z.string().trim().max(200).default(""),
  featured: z.enum(["1"]).optional(),
});

/**
 * C11 — GET /api/mobile/v1/partners?q&industry&featured&page · public.
 * The `/clients` directory: `getClientsList` minus Modonty's own row (as `clients/page.tsx`),
 * then `filterPartners` → `sortPartners` (as `PageLayout`), sliced by `PARTNERS_PAGE_SIZE`
 * (as `PartnersList`). One fixed order, no sort control — same as the web.
 */
export const GET = handle("partners", async (request: Request) => {
  const query = readQuery(request, querySchema);
  if ("response" in query) return query.response;
  const { page, q, industry, featured } = query.value;

  const [allPartners, coreClientId] = await Promise.all([getClientsList(), getCoreClientId()]);
  const partners = coreClientId ? allPartners.filter((p) => p.id !== coreClientId) : allPartners;
  const visible = sortPartners(filterPartners(partners, { q, industry, featuredOnly: featured === "1", page }));

  const start = (page - 1) * PARTNERS_PAGE_SIZE;
  const items = visible.slice(start, start + PARTNERS_PAGE_SIZE);
  return ok({ items, page, hasMore: visible.length > start + PARTNERS_PAGE_SIZE, total: visible.length }, PUBLIC_CACHE);
});
