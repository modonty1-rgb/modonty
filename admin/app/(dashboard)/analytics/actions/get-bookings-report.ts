"use server";

import { db } from "@/lib/db";
import { getBookPageOpens, getBookingFunnel, type BookingFunnel } from "@/lib/analytics/book-funnel";

/**
 * Bookings report — the drill-down behind the Bookings card.
 *
 * Two sources, deliberately: our DB owns the bookings that were actually saved
 * (name, phone, status), and GA4 owns how many people opened the booking page
 * in the first place. Together they are a funnel — and the gap between them is
 * the finding: a client with many opens and no bookings is losing real money.
 */

const WINDOW_DAYS = 90;

/** The four surfaces a booking can start from (BookingRequest.source).
 *  Stays unexported — a "use server" file may only export async functions. */
const BOOKING_SOURCES = ["article_dock", "article_card", "client_page", "client_list"] as const;

export interface BookingRow {
  id: string;
  name: string | null; // null for whatsapp / legacy leads
  email: string | null;
  phone: string | null;
  clientName: string;
  articleTitle: string | null;
  source: string;
  preferredAt: string | null;
  message: string | null;
  isMember: boolean;
  status: string;
  createdAt: string;
}

export interface BookingsReport {
  rows: BookingRow[];
  kpi: {
    total: number;
    newCount: number;
    contacted: number;
    done: number;
    guest: number;
    member: number;
    /** GA4: opens of /clients/<slug>/book across all clients. 0 when GA4 is unreachable. */
    pageOpens: number;
  };
  /** `opened` is null when GA4 gave us nothing for that client — null ≠ zero. */
  byClient: Array<{ name: string; total: number; newCount: number; opened: number | null }>;
  bySource: Array<{ source: string; count: number }>;
  /** Book-page views GA4 reported that belong to no live client. Never hidden. */
  unaccountedOpens: Array<{ path: string; views: number }>;
  /** opened → tried → booked, plus why the tries died. */
  funnel: BookingFunnel;
}

export async function getBookingsReport(): Promise<BookingsReport> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const opensPromise = getBookPageOpens();

  const bookings = await db.bookingRequest.findMany({
    where: { createdAt: { gte: since } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      source: true,
      message: true,
      status: true,
      userId: true,
      preferredAt: true,
      createdAt: true,
      client: { select: { name: true } },
      article: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const rows: BookingRow[] = bookings.map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email,
    phone: b.phone,
    clientName: b.client?.name ?? "—",
    articleTitle: b.article?.title ?? null,
    source: b.source,
    preferredAt: b.preferredAt ? b.preferredAt.toISOString() : null,
    message: b.message,
    isMember: b.userId !== null,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));

  const byClientMap = new Map<string, { total: number; newCount: number; opened: number | null }>();
  const bySourceMap = new Map<string, number>();
  for (const r of rows) {
    const c = byClientMap.get(r.clientName) ?? { total: 0, newCount: 0, opened: null };
    c.total += 1;
    if (r.status === "new") c.newCount += 1;
    byClientMap.set(r.clientName, c);
    bySourceMap.set(r.source, (bySourceMap.get(r.source) ?? 0) + 1);
  }

  // Fold in the GA4 funnel. A client can have opens and ZERO bookings — that
  // client never appears in the bookings query, and it is exactly the one we
  // most need to see, so it gets its own row.
  const opens = await opensPromise;
  const openedSlugs = [...opens.bySlug.keys()];
  const clientsWithOpens = openedSlugs.length
    ? await db.client.findMany({
        where: { slug: { in: openedSlugs } },
        select: { slug: true, name: true },
        take: 200,
      })
    : [];

  const knownSlugs = new Set(clientsWithOpens.map((c) => c.slug));
  for (const c of clientsWithOpens) {
    const opened = opens.bySlug.get(c.slug) ?? 0;
    const existing = byClientMap.get(c.name);
    if (existing) existing.opened = opened;
    else byClientMap.set(c.name, { total: 0, newCount: 0, opened });
  }

  // A booking page whose slug is not a client any more (renamed, deleted) still
  // got real traffic. Surface it instead of quietly dropping the views.
  const orphanOpens = [...opens.bySlug.entries()]
    .filter(([slug]) => !knownSlugs.has(slug))
    .map(([slug, views]) => ({ path: `/clients/${slug}/book`, views }));

  return {
    rows,
    kpi: {
      total: rows.length,
      newCount: rows.filter((r) => r.status === "new").length,
      contacted: rows.filter((r) => r.status === "contacted").length,
      done: rows.filter((r) => r.status === "done").length,
      guest: rows.filter((r) => !r.isMember).length,
      member: rows.filter((r) => r.isMember).length,
      pageOpens: opens.matched,
    },
    // Everything GA4 returned that we could not tie to a live client — shown so
    // the totals always reconcile and nothing is dropped in silence.
    unaccountedOpens: [...opens.unmatched, ...orphanOpens].sort((a, b) => b.views - a.views),
    funnel: await getBookingFunnel(opens.matched),
    byClient: [...byClientMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      // Biggest leak first: the client with the most opens and nothing to show.
      .sort((a, b) => (b.opened ?? 0) - b.total - ((a.opened ?? 0) - a.total) || b.total - a.total),
    // Every surface is listed, including the ones nobody used — a zero here is
    // the finding ("client_list converts nothing"), not missing data.
    bySource: BOOKING_SOURCES.map((source) => ({ source, count: bySourceMap.get(source) ?? 0 })).sort(
      (a, b) => b.count - a.count
    ),
  };
}
