import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import { db } from "@/lib/db";
import { computeClientSeoScore } from "@modonty/database/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/database/lib/seo/client/from-client";
import { hasStoredOgImage } from "@modonty/database/lib/seo/client/meta-score";
import { getSegment } from "../segments";
import { SegmentTable, type SegmentClient } from "./components/segment-table";

// One dynamic page behind every clickable number on the dashboard's Clients section
// (Khalid 2026-07-13). The card gives the count; this gives the names. The `where`
// lives in segments.ts and is shared with the count, so the two can never disagree.

export default async function ClientSegmentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const segment = await getSegment(key);
  if (!segment) notFound();

  // `include`, not `select`: the shared scorer's adapter (clientToSeoInput) reads ~30
  // raw columns, and it cannot tell "not selected" from "empty" — leave one out and
  // every row quietly scores low. That exact bug shipped a table of 34%s on the article
  // side. Clients are few and carry no article-sized bodies, so we take every scalar
  // and let the one adapter in dataLayer decide what it needs.
  const rows = await db.client.findMany({
    where: segment.where,
    include: { _count: { select: { articles: true } } },
    orderBy: { name: "asc" },
    take: 300,
  });

  // Dates cross the server/client boundary as ISO strings — a Date instance would not.
  const clients: SegmentClient[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    email: c.email,
    phone: c.phone,
    ctaMode: c.ctaMode,
    isYmyl: c.isYmyl,
    subscriptionStatus: String(c.subscriptionStatus),
    paymentStatus: String(c.paymentStatus),
    subscriptionStartDate: c.subscriptionStartDate?.toISOString() ?? null,
    subscriptionEndDate: c.subscriptionEndDate?.toISOString() ?? null,
    articleCount: c._count.articles,
    // Same shared scorer the clients table, the client page and the console portal use.
    seoScore: computeClientSeoScore(clientToSeoInput(c as unknown as Record<string, unknown>)).score,
    // Which of the three pictures are missing. `hasStoredOgImage` is the exact rule the
    // OG check inside the score above uses, so the cell and the number always agree.
    missingImages: [
      !c.logoMediaId && "logo",
      !c.heroImageMediaId && "hero",
      !hasStoredOgImage(c.nextjsMetadata) && "share image",
    ].filter((v): v is string => typeof v === "string"),
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">{segment.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{segment.description}</p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted"
        >
          ← Back to dashboard
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <SegmentTable clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
