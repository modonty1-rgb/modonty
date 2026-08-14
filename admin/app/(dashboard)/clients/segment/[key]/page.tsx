import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

import { db } from "@/lib/db";
import { computeClientSeoScore } from "@modonty/shared/lib/seo/client/seo-score";
import { clientToSeoInput } from "@modonty/shared/lib/seo/client/from-client";
import { hasStoredOgImage } from "@modonty/shared/lib/seo/client/meta-score";
import { getSegment } from "../segments";
import { SegmentTable, type SegmentClient } from "./components/segment-table";
import { MoneySegmentTable, type MoneySegmentClient } from "./components/money-segment-table";

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
  // and let the one adapter in shared decide what it needs.
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

  // Score-based segments keep only their side of 100 — same split as the dashboard count.
  const shown: SegmentClient[] = segment.scoreFilter
    ? clients.filter((c) =>
        segment.scoreFilter === "perfect" ? c.seoScore >= 100 : c.seoScore < 100,
      )
    : clients;

  // A money segment is a billing question, so it gets a billing table — how much is owed,
  // across how many invoices, and when the subscription ends — not the SEO/reach columns
  // that answer a completely different question (Khalid 2026-07-24). The account statement
  // is where each row is resolved, so the action already points there.
  const isMoney = segment.action?.path === "account";

  if (isMoney) {
    const ids = shown.map((c) => c.id);
    // Outstanding = unpaid AND not archived. `archivedAt: null` alone matches nothing on
    // Mongo for rows written before that field existed, so both forms are asked for.
    const openInvoices = ids.length
      ? await db.invoice.findMany({
          where: {
            clientId: { in: ids },
            NOT: { paymentStatus: "PAID" },
            OR: [{ archivedAt: null }, { archivedAt: { isSet: false } }],
          },
          select: { clientId: true, amount: true, currency: true },
          take: 1000,
        })
      : [];

    const owed = new Map<string, { count: number; amount: number; currency: string }>();
    for (const inv of openInvoices) {
      const cur = owed.get(inv.clientId) ?? { count: 0, amount: 0, currency: inv.currency };
      cur.count += 1;
      cur.amount += inv.amount;
      owed.set(inv.clientId, cur);
    }

    const moneyClients: MoneySegmentClient[] = shown.map((c) => {
      const o = owed.get(c.id);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        isYmyl: c.isYmyl,
        subscriptionStatus: c.subscriptionStatus,
        subscriptionEndDate: c.subscriptionEndDate,
        unpaidCount: o?.count ?? 0,
        unpaidAmount: o?.amount ?? 0,
        currency: o?.currency ?? null,
      };
    });

    return (
      <div className="mx-auto max-w-[1200px] space-y-6">
        <SegmentHeader title={segment.title} description={segment.description} />
        <Card>
          <CardContent className="pt-4">
            <MoneySegmentTable clients={moneyClients} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <SegmentHeader title={segment.title} description={segment.description} />
      <Card>
        <CardContent className="pt-4">
          <SegmentTable clients={shown} action={segment.action ?? { label: "Open", path: "edit" }} />
        </CardContent>
      </Card>
    </div>
  );
}

function SegmentHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      <Link
        href="/"
        className="shrink-0 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
