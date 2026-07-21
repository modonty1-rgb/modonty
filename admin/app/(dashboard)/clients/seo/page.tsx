import { db } from "@/lib/db";
import { computeClientSeoScore } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";

import { SeoClientList, type SeoClientRow } from "./components/seo-client-list";

// The writer-owned "SEO Client" surface: every client with its shared SEO readiness
// number, worst-first, editing the two fields the content writer owns (title + description).
export const dynamic = "force-dynamic";

// Every field the shared client scorer reads — omitting one silently drags the number down.
const SCORE_SELECT = {
  id: true,
  name: true,
  slug: true,
  seoTitle: true,
  seoDescription: true,
  nextjsMetadata: true,
  jsonLdStructuredData: true,
  jsonLdValidationReport: true,
  url: true,
  logoMediaId: true,
  heroImageMediaId: true,
  description: true,
  businessBrief: true,
  alternateName: true,
  slogan: true,
  phone: true,
  email: true,
  contactType: true,
  addressStreet: true,
  addressCity: true,
  addressRegion: true,
  addressPostalCode: true,
  addressCountry: true,
  sameAs: true,
  legalName: true,
  foundingDate: true,
  vatID: true,
  taxID: true,
  commercialRegistrationNumber: true,
  businessActivityCode: true,
  numberOfEmployees: true,
  addressLatitude: true,
  addressLongitude: true,
  openingHoursSpecification: true,
  priceRange: true,
  gbpPlaceId: true,
  organizationType: true,
  industry: { select: { name: true } },
} as const;

export default async function SeoClientPage() {
  const clients = await db.client.findMany({ select: SCORE_SELECT, orderBy: { name: "asc" } });

  const rows: SeoClientRow[] = clients
    .map((c) => {
      const { score } = computeClientSeoScore(clientToSeoInput(c as Record<string, unknown>));
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        score,
        industryName: c.industry?.name ?? null,
        businessBrief: c.businessBrief ?? c.description ?? null,
        addressCity: c.addressCity ?? null,
        isYmyl: (c as { organizationType?: string | null }).organizationType ?? null,
      };
    })
    // Worst first — the client who needs a writer's attention leads the list.
    .sort((a, b) => a.score - b.score);

  return (
    <div className="max-w-[1000px] mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold">SEO Client</h1>
        <p className="text-sm text-muted-foreground mt-1">
          العنوان والوصف لكل عميل — يكتبهما الكاتب (خبير السيو). الناقص أولاً.
        </p>
      </div>
      <SeoClientList clients={rows} />
    </div>
  );
}
